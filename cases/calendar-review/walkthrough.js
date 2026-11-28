/* Calendar-review walkthrough (web-v1.0) for emberwall.net.
   Plain JavaScript, no build step, no external dependencies.
   Case data is in cases.js, which must load first. */
const COLLECTOR_URL = "https://script.google.com/macros/s/AKfycbz24ZPFuICWFHipHBf4_k-QRW1BjYeNAWp28n6zLQ5YRunb6Bsx7K1foB71SYcF7nLFfA/exec"; // Apps Script /exec URL
const MATERIAL_VERSION = "web-v1.0";

(function () {
  "use strict";

  var D = window.CRW_CASES;
  var root = document.getElementById("crw");
  if (!D || !root) return;

  var STORAGE_KEY = "rgr_study1_v1_done";
  var CONTACT = "will@emberwall.net";
  var DISPOSITIONS = [
    ["authorize", "Authorize", "Apply it now: the record confirms it."],
    ["seek_clarification", "Seek clarification", "Hold it and ask: the record can't settle it."],
    ["reject", "Reject", "Decline it: the record rules it out."]
  ];
  var ADEQUACY = [
    ["ADEQUATE", "Accurate and adequate", "It captures what the record establishes."],
    ["OMITS_KEY_LINK", "Incomplete", "It leaves out a necessary date, booking detail or restriction."],
    ["CONTRADICTS", "Misleading or wrong", "It contradicts the record, or claims no conflict when there is one."]
  ];
  var LABEL = { authorize: "Authorize", seek_clarification: "Seek clarification", reject: "Reject",
    ADEQUATE: "Accurate and adequate", OMITS_KEY_LINK: "Incomplete", CONTRADICTS: "Misleading or wrong" };

  var S; // session state
  var uid = 0;

  /* ---------- small helpers ---------- */

  function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function iso() { return new Date().toISOString(); }
  function id(prefix) { uid += 1; return "crw-" + prefix + "-" + uid; }

  function storageGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function storageSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }

  function uuid() {
    try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) { /* fall through */ }
    var b = new Uint8Array(16);
    try { crypto.getRandomValues(b); } catch (e) { for (var i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256); }
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join("");
    return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20);
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function viewportClass() {
    var w = window.innerWidth || document.documentElement.clientWidth || 1024;
    return w < 640 ? "mobile" : (w < 1024 ? "tablet" : "desktop");
  }

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
      var v = attrs[k];
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), v);
      else if (v === true) n.setAttribute(k, "");
      else if (v !== false && v != null) n.setAttribute(k, v);
    }
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }

  /* Session IDs such as TL-0411 are set in code type so they are easy to compare. */
  function fmt(text) {
    var frag = document.createDocumentFragment();
    String(text).split(/([A-Z]{2}-\d{4})/).forEach(function (part, i) {
      if (!part) return;
      frag.appendChild(i % 2 ? el("code", { text: part }) : document.createTextNode(part));
    });
    return frag;
  }
  function p(text, cls) { var n = el("p", cls ? { "class": cls } : null); n.appendChild(fmt(text)); return n; }

  function show(screen) {
    root.innerHTML = "";
    root.appendChild(screen);
    var h = screen.querySelector("h2, h3");
    if (h) { h.setAttribute("tabindex", "-1"); try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
    var top = root.getBoundingClientRect().top + (window.pageYOffset || 0) - 80;
    if ((window.pageYOffset || 0) > top) window.scrollTo(0, Math.max(0, top));
  }

  function radioGroup(name, options, onChange) {
    var fs = el("div", { "class": "crw-options", role: "radiogroup" });
    options.forEach(function (o) {
      var inputId = id(name);
      var input = el("input", { type: "radio", name: name, id: inputId, value: o[0], "class": "crw-radio" });
      input.addEventListener("change", function () { onChange(o[0]); });
      var lab = el("label", { "for": inputId, "class": "crw-option" }, [
        input,
        el("span", { "class": "crw-option-text" }, [
          el("strong", { text: o[1] }),
          o[2] ? el("span", { "class": "crw-option-hint", text: o[2] }) : null
        ])
      ]);
      fs.appendChild(lab);
    });
    return fs;
  }

  function lockGroup(container) {
    container.classList.add("crw-locked");
    Array.prototype.forEach.call(container.querySelectorAll("input, button, textarea"), function (n) { n.disabled = true; });
  }

  /* ---------- the record ---------- */

  function editCard(text) {
    return el("div", { "class": "crw-card crw-edit" }, [
      el("p", { "class": "crw-cap", text: "Queued draft edit" }),
      p(text, "crw-edit-text"),
      el("p", { "class": "crw-small", text: "Not applied yet." })
    ]);
  }

  function noteCard(lines) {
    var dl = el("dl", { "class": "crw-note-fields" });
    lines.forEach(function (l) {
      dl.appendChild(el("dt", { text: l[0] + ":" }));
      var dd = el("dd"); dd.appendChild(fmt(l[1])); dl.appendChild(dd);
    });
    return el("div", { "class": "crw-card crw-note" }, [
      el("p", { "class": "crw-cap", text: "Assistant's check note" }),
      dl
    ]);
  }

  function panelBody(c, key) {
    var b = el("div", { "class": "crw-panel-body" });
    if (key === "standing_rule") b.appendChild(p(c.rule));
    if (key === "venue_email") {
      b.appendChild(el("p", { "class": "crw-small" }, [el("strong", { text: "From: " }), c.email.from]));
      b.appendChild(el("p", { "class": "crw-small" }, [el("strong", { text: "Sent: " }), c.email.sent]));
      var q = el("blockquote", { "class": "crw-email" }); q.appendChild(fmt("“" + c.email.body + "”")); b.appendChild(q);
    }
    if (key === "calendar_snapshot") {
      b.appendChild(el("p", { "class": "crw-small", text: "As read " + c.calendar.asRead }));
      var ul = el("ul", { "class": "crw-rows" });
      c.calendar.rows.forEach(function (r) { var li = el("li"); li.appendChild(fmt(r)); ul.appendChild(li); });
      b.appendChild(ul);
    }
    if (key === "booking_log") {
      var ul2 = el("ul", { "class": "crw-rows" });
      c.log.forEach(function (r) { var li = el("li"); li.appendChild(fmt(r)); ul2.appendChild(li); });
      b.appendChild(ul2);
    }
    return b;
  }

  /* All four panels start collapsed. Every open and close is logged with ms since the trial began. */
  function panels(c, t0, events, opened) {
    var wrap = el("div", { "class": "crw-panels" });
    D.PANELS.forEach(function (pp) {
      var d = el("details", { "class": "crw-panel" }, [el("summary", { text: pp[1] }), panelBody(c, pp[0])]);
      d.addEventListener("toggle", function () {
        events.push({ panel: pp[0], action: d.open ? "open" : "close", t_ms: Math.round(now() - t0) });
        if (d.open && opened && opened.indexOf(pp[0]) < 0) opened.push(pp[0]);
      });
      wrap.appendChild(d);
    });
    return wrap;
  }

  /* ---------- assignment ---------- */

  function randomTemplate() { var k = Object.keys(D.TEMPLATES); return k[Math.floor(Math.random() * k.length)]; }

  function assign(optIn) {
    if (!optIn || !COLLECTOR_URL || typeof fetch !== "function") {
      return Promise.resolve({ template_id: randomTemplate(), assignment_source: "client_fallback" });
    }
    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    // Apps Script can take several seconds on a cold start, so allow up to 8 s.
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
    var url = COLLECTOR_URL + (COLLECTOR_URL.indexOf("?") < 0 ? "?" : "&") + "version=" + encodeURIComponent(MATERIAL_VERSION);
    return fetch(url, { method: "GET", redirect: "follow", signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.text(); })
      .then(function (txt) {
        clearTimeout(timer);
        var j = JSON.parse(txt);
        var t = j && String(j.template_id || j.template || "").toUpperCase();
        if (j && j.ok !== false && D.TEMPLATES[t]) return { template_id: t, assignment_source: "least_filled" };
        throw new Error("unexpected assignment response: " + txt.slice(0, 200));
      })
      .catch(function (e) {
        clearTimeout(timer);
        if (window.console) console.info("Calendar review: using a random set of cases (" + (e && e.name === "AbortError" ? "collector timed out" : (e && e.message)) + ")");
        return { template_id: randomTemplate(), assignment_source: "client_fallback" };
      });
  }

  function submit(payload) {
    if (!payload.opt_in_logging || !COLLECTOR_URL || typeof fetch !== "function") return;
    try {
      fetch(COLLECTOR_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        redirect: "follow",
        keepalive: true,
        body: JSON.stringify(payload)
      }).catch(function (e) { if (window.console) console.warn("Calendar review: submission failed", e); });
    } catch (e) { if (window.console) console.warn("Calendar review: submission failed", e); }
  }

  /* ---------- Screen 0: start ---------- */

  function startScreen(repeat) {
    var repeatBox = el("input", { type: "checkbox", id: "crw-repeat", "class": "form-check-input" });
    repeatBox.checked = !!repeat;
    var honey = el("input", { type: "text", name: "website_url", tabindex: "-1", autocomplete: "off", "aria-hidden": "true", "class": "crw-hp" });

    function go(optIn) {
      return function () {
        var btns = screen.querySelectorAll("button");
        Array.prototype.forEach.call(btns, function (b) { b.disabled = true; });
        status.textContent = optIn ? "Setting up your cases…" : "";
        S = {
          session_id: uuid(),
          opt_in_logging: optIn,
          is_repeat_or_test: repeatBox.checked,
          honeypot: honey.value || "",
          local_storage_prior_complete: S0.prior,
          viewport_class: viewportClass(),
          started_at_utc: iso(),
          t_start: now(),
          trials: [],
          adequacyDone: false
        };
        assign(optIn).then(function (a) {
          S.template_id = a.template_id;
          S.assignment_source = a.assignment_source;
          S.plan = shuffle(D.TEMPLATES[a.template_id]);
          practiceScreen();
        });
      };
    }

    var status = el("p", { "class": "crw-small", "aria-live": "polite" });
    var screen = el("section", { "class": "crw-screen" }, [
      el("p", { text: "A calendar assistant has prepared room changes for community organizers, and none has been applied yet. After one warm-up, you'll review three of them and decide whether each should be authorized, held for clarification, or rejected." }),
      el("p", { "class": "crw-small", text: "If you choose to share, your choices, which panels you open and how long each step takes are sent anonymously to a Google Sheet I keep, to test whether short assistant notes help or mislead reviewers. No names or email addresses are collected. Nothing is sent if you choose not to share." }),
      el("div", { "class": "form-check crw-check" }, [
        repeatBox,
        el("label", { "for": "crw-repeat", "class": "form-check-label", text: "I've tried these cases before, or I'm just testing" })
      ]),
      honey,
      el("div", { "class": "crw-actions" }, [
        el("button", { type: "button", "class": "btn btn-primary", onclick: go(true), text: "Start and share anonymous choices" }),
        el("button", { type: "button", "class": "btn btn-outline-primary", onclick: go(false), text: "Try it without sharing" })
      ]),
      el("p", { "class": "crw-small", text: "About 4 minutes. There's no going back once you lock an answer." }),
      status
    ]);
    show(screen);
  }

  /* ---------- Screen 1: warm-up ---------- */

  function practiceScreen() {
    var c = D.PRACTICE;
    var t0 = now();
    var events = [], opened = [];
    var choice = null;
    var lockBtn = el("button", { type: "button", "class": "btn btn-primary", disabled: true, text: "Lock decision" });
    var stage = el("div", { "class": "crw-stage" }, [
      el("p", { "class": "crw-q", text: "What should happen to this edit?" }),
      radioGroup("prac-disp", DISPOSITIONS, function (v) { choice = v; lockBtn.disabled = false; }),
      el("div", { "class": "crw-actions" }, [lockBtn])
    ]);
    var after = el("div", { "aria-live": "polite" });

    lockBtn.addEventListener("click", function () {
      if (!choice) return;
      lockGroup(stage);
      var correct = choice === c.target;
      S.practice = { case_id: c.id, disposition: choice, correct: correct, duration_ms: Math.round(now() - t0), panels_opened: opened.slice() };
      after.appendChild(el("div", { "class": "crw-card crw-feedback" }, [
        el("p", { "class": "crw-cap", text: correct ? "That matches the key" : "The key says Reject" }),
        p(c.feedback)
      ]));
      after.appendChild(el("div", { "class": "crw-actions" }, [
        el("button", { type: "button", "class": "btn btn-primary", onclick: function () { trialScreen(0); }, text: "Start the three cases" })
      ]));
    });

    show(el("section", { "class": "crw-screen" }, [
      el("p", { "class": "crw-progress", text: "Warm-up · not scored" }),
      el("h2", { text: c.venue }),
      el("p", { "class": "crw-small", text: "Open any of the four panels to check the record before you decide." }),
      editCard(c.edit),
      panels(c, t0, events, opened),
      stage,
      after
    ]));
  }

  /* ---------- Screens 2–4: scored trials ---------- */

  function trialScreen(i) {
    var caseId = S.plan[i][0], cond = S.plan[i][1];
    var c = D.CASES[caseId];
    var t0 = now();
    var events = [];
    var hasNote = cond !== "C0";
    var rec = {
      trial_index: i + 1, case_id: caseId, condition: cond, status: c.status,
      fidelity: hasNote ? c.fidelity : "none",
      disposition: null, confidence: null, basis_choice_id: null, j2_adequacy_choice: null,
      post_first_adequacy_q: S.adequacyDone,
      scored: {}, timing_ms: { stage_1a_disposition: null, stage_1b_basis: null, stage_2_adequacy: null },
      panel_events: events
    };
    var tLock1 = null, tLock2 = null;
    var host = el("div");

    /* Stage 1a: action and confidence */
    var disp = null, conf = null;
    var lock1 = el("button", { type: "button", "class": "btn btn-primary", disabled: true, text: "Lock decision" });
    function ready1() { lock1.disabled = !(disp && conf); }
    var confOpts = [1, 2, 3, 4, 5].map(function (n) { return [String(n), String(n), ""]; });
    var s1a = el("div", { "class": "crw-stage" }, [
      el("p", { "class": "crw-q", text: "What should happen to this edit?" }),
      radioGroup("disp-" + i, DISPOSITIONS, function (v) { disp = v; ready1(); }),
      el("p", { "class": "crw-q", text: "How confident are you?" }),
      (function () { var g = radioGroup("conf-" + i, confOpts, function (v) { conf = Number(v); ready1(); }); g.classList.add("crw-scale"); return g; })(),
      el("p", { "class": "crw-small crw-scale-legend", text: "1 = not at all confident · 5 = very confident" }),
      el("div", { "class": "crw-actions" }, [lock1])
    ]);
    host.appendChild(s1a);

    lock1.addEventListener("click", function () {
      if (!(disp && conf)) return;
      tLock1 = now();
      rec.disposition = disp; rec.confidence = conf;
      rec.timing_ms.stage_1a_disposition = Math.round(tLock1 - t0);
      lockGroup(s1a);
      stage1b();
    });

    /* Stage 1b: the reason, options in random order */
    function stage1b() {
      var basis = null;
      var lock2 = el("button", { type: "button", "class": "btn btn-primary", disabled: true, text: "Lock reason" });
      var opts = shuffle(Object.keys(c.basis)).map(function (k) { return [k, c.basis[k], ""]; });
      var g = radioGroup("basis-" + i, opts, function (v) { basis = v; lock2.disabled = false; });
      g.classList.add("crw-basis");
      // Reasons are plain text; mark session IDs as code like the rest of the record.
      Array.prototype.forEach.call(g.querySelectorAll(".crw-option-text strong"), function (s) {
        var t = s.textContent; s.textContent = ""; s.appendChild(fmt(t));
      });
      var s1b = el("div", { "class": "crw-stage" }, [
        el("p", { "class": "crw-q", text: "Which statement best matches the reason for your decision?" }),
        g,
        el("div", { "class": "crw-actions" }, [lock2])
      ]);
      host.appendChild(s1b);
      lock2.addEventListener("click", function () {
        if (!basis) return;
        tLock2 = now();
        rec.basis_choice_id = basis;
        rec.timing_ms.stage_1b_basis = Math.round(tLock2 - tLock1);
        lockGroup(s1b);
        if (hasNote) stage2(); else finish();
      });
    }

    /* Stage 2: check-note adequacy, C1 and C2 only */
    function stage2() {
      var adq = null;
      var lock3 = el("button", { type: "button", "class": "btn btn-primary", disabled: true, text: "Lock answer" });
      var s2 = el("div", { "class": "crw-stage" }, [
        el("p", { "class": "crw-q", text: "Regardless of your action decision, how well did the assistant's check note represent what the record actually establishes?" }),
        radioGroup("adq-" + i, ADEQUACY, function (v) { adq = v; lock3.disabled = false; }),
        el("div", { "class": "crw-actions" }, [lock3])
      ]);
      host.appendChild(s2);
      lock3.addEventListener("click", function () {
        if (!adq) return;
        rec.j2_adequacy_choice = adq;
        rec.timing_ms.stage_2_adequacy = Math.round(now() - tLock2);
        lockGroup(s2);
        S.adequacyDone = true;
        finish();
      });
    }

    function finish() {
      var dispOk = rec.disposition === c.target;
      var basisOk = rec.basis_choice_id === c.targetBasis;
      var j2 = null;
      if (hasNote) j2 = c.fidelity === "accurate" ? rec.j2_adequacy_choice === "ADEQUATE"
        : (rec.j2_adequacy_choice === "OMITS_KEY_LINK" || rec.j2_adequacy_choice === "CONTRADICTS");
      rec.scored = { disposition_correct: dispOk, basis_correct: basisOk, justified_decision: dispOk && basisOk, j2_correct: j2 };
      S.trials.push(rec);
      var last = i === S.plan.length - 1;
      host.appendChild(el("div", { "class": "crw-actions" }, [
        el("button", { type: "button", "class": "btn btn-primary", onclick: function () { if (last) commentScreen(); else trialScreen(i + 1); },
          text: last ? "Continue" : "Next case" })
      ]));
      var b = host.querySelector(".crw-actions:last-child button"); if (b) b.focus();
    }

    var kids = [
      el("p", { "class": "crw-progress", text: "Case " + (i + 1) + " of " + S.plan.length }),
      el("h2", { text: c.venue }),
      editCard(c.edit)
    ];
    if (hasNote) kids.push(noteCard(c.notes[cond]));
    kids.push(panels(c, t0, events, null));
    kids.push(host);
    show(el("section", { "class": "crw-screen" }, kids));
  }

  /* ---------- Screen 5: optional comment, then submit ---------- */

  function commentScreen() {
    var ta = el("textarea", { id: "crw-comment", "class": "form-control", rows: "4", maxlength: "2000" });
    var btn = el("button", { type: "button", "class": "btn btn-primary", text: "See my results" });
    btn.addEventListener("click", function () {
      btn.disabled = true;
      var done = iso();
      var payload = {
        schema_version: "1.0",
        material_version: MATERIAL_VERSION,
        session_id: S.session_id,
        template_id: S.template_id,
        assignment_source: S.assignment_source,
        is_repeat_or_test: S.is_repeat_or_test,
        local_storage_prior_complete: S.local_storage_prior_complete,
        opt_in_logging: S.opt_in_logging,
        honeypot: S.honeypot,
        viewport_class: S.viewport_class,
        started_at_utc: S.started_at_utc,
        completed_at_utc: done,
        total_duration_ms: Math.round(now() - S.t_start),
        practice: S.practice,
        trials: S.trials,
        final_comment: (ta.value || "").slice(0, 2000)
      };
      S.payload = payload;
      submit(payload);
      revealScreen();
    });
    show(el("section", { "class": "crw-screen" }, [
      el("h2", { text: "Before the breakdown" }),
      el("label", { "for": "crw-comment", "class": "crw-q", text: "Did any case feel unfair, unclear, or reasonably open to a different reading? (Optional)" }),
      ta,
      el("p", { "class": "crw-small", text: "Please don't include names or contact details." }),
      el("div", { "class": "crw-actions" }, [btn])
    ]));
  }

  /* ---------- Screen 6: reveal ---------- */

  function verdict(ok) { return el("span", { "class": "crw-badge " + (ok ? "crw-yes" : "crw-no"), text: ok ? "Matches the key" : "Differs from the key" }); }

  function revealScreen() {
    storageSet(STORAGE_KEY, "true");
    var justified = 0, j2n = 0, j2ok = 0;
    S.trials.forEach(function (t) {
      if (t.scored.justified_decision) justified++;
      if (t.scored.j2_correct !== null) { j2n++; if (t.scored.j2_correct) j2ok++; }
    });

    var cards = S.trials.map(function (t) {
      var c = D.CASES[t.case_id];
      var body = [
        el("h3", { text: "Case " + t.trial_index + " · " + c.venue }),
        c.provisional ? el("p", { "class": "crw-provisional" }, [
          el("strong", { text: "Provisional key. " }),
          "Readers may reasonably disagree with it, and disagreement tells me something about the case. If you read the record differently, ",
          el("a", { href: "mailto:" + CONTACT + "?subject=" + encodeURIComponent("Calendar review: " + c.venue), text: "I'd like to hear why" }),
          "."
        ]) : null,
        el("p", { "class": "crw-cap", text: "Your decision" }),
        el("p", null, [LABEL[t.disposition] + " (confidence " + t.confidence + " of 5). Key: " + LABEL[c.target] + ". ", verdict(t.scored.disposition_correct)]),
        (function () {
          var n = el("p");
          n.appendChild(document.createTextNode("Your reason: "));
          n.appendChild(fmt(c.basis[t.basis_choice_id]));
          n.appendChild(document.createTextNode(" "));
          n.appendChild(verdict(t.scored.basis_correct));
          return n;
        })(),
        t.scored.basis_correct ? null : p("The key's reason: " + c.basis[c.targetBasis]),
        p(c.why, "crw-why"),
        el("p", { "class": "crw-cap", text: "The check note" })
      ];
      if (t.condition === "C0") {
        body.push(el("p", { "class": "crw-small", text: "You saw no note on this case. Other visitors saw this one:" }));
        body.push(noteCard(c.notes.C1));
        body.push(p(c.noteReveal.C1));
      } else {
        body.push(p(c.noteReveal[t.condition]));
        body.push(el("p", null, ["You judged it: " + LABEL[t.j2_adequacy_choice] + ". Key: " +
          (c.fidelity === "accurate" ? "Accurate and adequate" : "Incomplete, or misleading or wrong") + ". ", verdict(t.scored.j2_correct)]));
      }
      body.push(el("p", { "class": "crw-cap", text: "What a mechanical check would return" }));
      body.push(el("p", null, [el("code", { "class": "crw-gate", text: c.gate.code })]));
      body.push(p(c.gate.text));
      return el("article", { "class": "crw-card crw-result" }, body);
    });

    var again = el("button", { type: "button", "class": "btn btn-outline-primary", text: "Try another set (marked as a repeat)",
      onclick: function () { S0.prior = storageGet(STORAGE_KEY) === "true"; startScreen(true); } });

    var kids = [
      el("h2", { text: "Your results" }),
      el("div", { "class": "crw-card crw-summary" }, [
        el("p", null, [el("strong", { text: justified + " of " + S.trials.length }), " decisions matched the key with the key's reason."]),
        j2n ? el("p", null, [el("strong", { text: j2ok + " of " + j2n }), " judgments of the check note matched the key."]) : null,
        el("p", { "class": "crw-small", text: S.opt_in_logging && COLLECTOR_URL ? "Your anonymous choices were sent. Thank you." : "Nothing was sent." })
      ]),
      el("p", { "class": "crw-small", text: "The mechanical check counts “next session” from when the notice was sent and from when the calendar is read, using the calendar as it stands, and compares the session it finds with the one being edited. It can stop an edit or find nothing to stop. It never authorizes one." })
    ].concat(cards).concat([
      el("div", { "class": "crw-card crw-footer" }, [
        // When "Assuring the Reading" is live, link its title here (/notes/assuring-the-reading/).
        p("This walkthrough is a companion to the working note Assuring the Reading, which asks what an assistant's stated reason lets a reviewer check."),
        el("p", null, ["It's a short public exercise, not a study. The ",
          el("a", { href: "/cases/study-1-protocol.html", text: "full Study 1 protocol" }),
          " is open for research groups with human-subjects review who want to test these questions properly."]),
        el("div", { "class": "crw-actions" }, [again])
      ])
    ]);
    show(el("section", { "class": "crw-screen" }, kids));
  }

  /* ---------- boot ---------- */

  var S0 = { prior: storageGet(STORAGE_KEY) === "true" };
  root.classList.add("crw-js");
  startScreen(false);

  // Exposed for automated testing only.
  window.__crw = { state: function () { return S; } };
})();
