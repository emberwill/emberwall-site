/* Case data for the calendar-review walkthrough (material version web-v1.0).
   Adapted from the Study 1 development pilot packet (v1.0):
   - DEV-05 is renamed (venue, coordinator, IDs, dates) so it is not the café case
     from "Assuring the Reading". Its structure is unchanged: the notice is sent on
     a Thursday, the extra session is logged the next morning, the calendar is read
     on Monday.
   - The five reason options in each case are rewritten to similar length and
     specificity, so the target can't be spotted by its detail.
   - DEV-02's C2 note is the sharpened web variant from the build brief. */
window.CRW_CASES = (function () {
  "use strict";

  var PANELS = [
    ["standing_rule", "Standing rule"],
    ["venue_email", "Venue email"],
    ["calendar_snapshot", "Calendar snapshot"],
    ["booking_log", "Booking log"]
  ];

  var PRACTICE = {
    id: "PRAC-01",
    venue: "Westgate Book Swap",
    target: "reject",
    edit: "Move BK-0516 (Saturday, 16 May 2026, 10:00–12:00) from Room 4 to Courtyard Tent.",
    rule: "Authorize a room edit only when the venue coordinator has confirmed the room change for that specific session. If confirmation for that session is unclear, leave the calendar alone and ask the organizer.",
    email: {
      from: "Jordan Patel (Venue Coordinator)",
      sent: "Monday, 11 May 2026, 15:00",
      body: "Hi — we are checking whether the Courtyard Tent will be dry enough for your Saturday 16 May book swap (BK-0516). We have not confirmed any room change yet; I'll let you know by Thursday whether we can move you out of Room 4."
    },
    calendar: { asRead: "Wednesday, 13 May 2026, 09:00", rows: ["BK-0516 — Sat 16 May 2026, 10:00–12:00, Room 4 (Active)"] },
    log: ["BK-0516 added Monday, 20 April 2026, 11:00."],
    feedback: "Jordan wrote that no room change is confirmed yet, so the record rules out applying this edit now. Use Authorize when the record confirms the edit for that specific session, Seek clarification when the record leaves two defensible readings, and Reject when the record rules out or contradicts the proposal."
  };

  var CASES = {
    "DEV-01": {
      venue: "Harborview Tool Library",
      status: "S", fidelity: "accurate", target: "authorize", provisional: false,
      edit: "Move TL-0411 (Saturday, 11 April 2026, 10:00–13:00) from Room 1 to North Annex.",
      rule: "Authorize a room edit only when the facility manager has confirmed the new room for that specific session. If confirmation for that session is unclear, leave the calendar alone and ask the organizer.",
      email: { from: "Samira Chen (Facility Manager)", sent: "Tuesday, 7 April 2026, 11:05",
        body: "Confirming that your tool-lending session TL-0411 on Saturday, 11 April is moved from Room 1 to the North Annex." },
      calendar: { asRead: "Wednesday, 8 April 2026, 09:15", rows: [
        "TL-0411 — Sat 11 Apr 2026, 10:00–13:00, Room 1 (Active)",
        "TL-0425 — Sat 25 Apr 2026, 10:00–13:00, Room 1 (Active)"] },
      log: ["TL-0411 added Monday, 2 March 2026, 10:00.", "TL-0425 added Monday, 2 March 2026, 10:02."],
      notes: {
        C1: [["Notice sent", "Tuesday 7 April 2026, 11:05"],
             ["Session and evidence", "TL-0411 (Sat 11 Apr) explicitly named in facility manager's confirmation and currently scheduled in Room 1 per calendar"],
             ["Unresolved conflict", "none"]],
        C2: [["Source pointer", "Email from Facility Manager Samira Chen (Tue 7 Apr, 11:05) explicitly naming session TL-0411 on Saturday, 11 April for the North Annex; Calendar shows TL-0411 (Sat 11 Apr) in Room 1, added Mon 2 Mar."],
             ["Temporal relationship", "Notice sent Tue 7 Apr and read Wed 8 Apr, both prior to Sat 11 Apr; explicit ID and date match TL-0411 with no intervening or conflicting session."],
             ["Unresolved status", "None — explicit session ID and date directly confirm the room change under the grant."]]
      },
      basis: {
        B1_TARGET: "Samira's email of Tue 7 April names TL-0411 and its date, Saturday 11 April, for the North Annex.",
        B1_MISREAD: "Samira's email of Tue 7 April moves an April session, and TL-0425 is also in Room 1, so it could mean either one.",
        B1_FALSE_FACT: "Samira's email of Tue 7 April says the North Annex move for TL-0411 is tentative until maintenance is finished.",
        B1_SURFACE: "On Wed 8 April, TL-0411 is the next Room 1 session on the calendar, and nothing on it shows a conflict.",
        B1_UNFOCUSED: "The calendar was read on Wed 8 April, a day after Samira wrote, so the organizer should confirm TL-0411 first."
      },
      targetBasis: "B1_TARGET",
      why: "Samira's email names TL-0411 and its date, so the record confirms this move.",
      noteReveal: {
        C1: "The note was accurate: it pointed to Samira's confirmation naming TL-0411.",
        C2: "The note was accurate: it pointed to Samira's confirmation naming TL-0411 and its date."
      },
      gate: { code: "NO_TEMPORAL_CONFLICT_DETECTED",
        text: "The email names one session, TL-0411, and it is the session being edited. The check finds nothing to interrupt, and leaves the decision to the reviewer." }
    },

    "DEV-02": {
      venue: "Elmwood Community Choir",
      status: "S", fidelity: "plausible_defective", target: "authorize", provisional: true,
      edit: "Move CH-0418 (Saturday, 18 April 2026, 14:00–16:00) from Practice Room A to Hall B.",
      rule: "Authorize a room edit only when the building coordinator has confirmed the room change for that specific rehearsal. If unclear, hold the edit and ask the director.",
      email: { from: "Dana Morales (Building Coordinator)", sent: "Monday, 13 April 2026, 09:40",
        body: "Because of floor resurfacing, your next rehearsal is confirmed in Hall B instead of Practice Room A." },
      calendar: { asRead: "Tuesday, 14 April 2026, 08:30", rows: [
        "CH-0411 — Sat 11 Apr 2026, 14:00–16:00, Practice Room A (Past / Completed)",
        "CH-0418 — Sat 18 Apr 2026, 14:00–16:00, Practice Room A (Active)",
        "CH-0425 — Sat 25 Apr 2026, 14:00–16:00, Practice Room A (Active)"] },
      log: ["CH-0411, CH-0418 and CH-0425 all added Monday, 19 January 2026, 13:15. No rehearsals added or modified since."],
      notes: {
        C1: [["Notice sent", "Monday 13 April 2026, 09:40"],
             ["Session and evidence", "CH-0418 currently scheduled in Practice Room A per calendar"],
             ["Unresolved conflict", "none"]],
        C2: [["Source pointer", "Email from Building Coordinator Dana Morales confirming a move to Hall B; Calendar on Tue 14 Apr lists CH-0418 in Practice Room A (added Mon 19 Jan)."],
             ["Temporal relationship", "Calendar on Tue 14 Apr lists CH-0418 (Sat 18 Apr) as the earliest upcoming rehearsal in Practice Room A; no conflict on Tuesday's schedule."],
             ["Unresolved status", "None identified — CH-0418 is the next rehearsal shown on Tuesday's calendar."]]
      },
      basis: {
        B2_TARGET: "Dana wrote on Mon 13 April, after CH-0411 had passed, so her “next rehearsal” can only be CH-0418.",
        B2_MISREAD: "Dana's email of Mon 13 April names no rehearsal, so “next rehearsal” could mean CH-0411, CH-0418 or CH-0425.",
        B2_FALSE_FACT: "The booking log shows CH-0418 was added on Tue 14 April, after Dana sent her email on Mon 13 April.",
        B2_SURFACE: "On Tue 14 April, CH-0418 is the next rehearsal in Practice Room A on the calendar, and no conflict is listed.",
        B2_UNFOCUSED: "Dana's email of Mon 13 April gives floor resurfacing as the reason, so the director should confirm CH-0418 first."
      },
      targetBasis: "B2_TARGET",
      why: "Dana wrote on Monday 13 April, after the 11 April rehearsal had passed. Her “next rehearsal” was CH-0418 whether you count from when she wrote or from Tuesday.",
      noteReveal: {
        C1: "The edit was right, but the note doesn't show why: it gives the send time and Tuesday's calendar without saying the 11 April rehearsal had already passed when Dana wrote.",
        C2: "The edit was right, but the note doesn't show why: it counts only from Tuesday's calendar and never says the 11 April rehearsal had passed before Dana wrote."
      },
      gate: { code: "NO_TEMPORAL_CONFLICT_DETECTED",
        text: "Counting “next rehearsal” from when Dana wrote (Mon 13 Apr) and from when the calendar was read (Tue 14 Apr) both give CH-0418, the session being edited. The edit is supported, even though the note never showed that check." }
    },

    "DEV-03": {
      venue: "Cedar Street Makerspace",
      status: "U", fidelity: "plausible_defective", target: "reject", provisional: false,
      edit: "Move MK-0411 (Saturday, 11 April 2026, 10:00–12:00) from Studio A to Studio B.",
      rule: "Authorize a room edit only when the shop coordinator confirms the room change for that specific session. If unclear, hold the edit and ask the organizer.",
      email: { from: "Priya Nair (Shop Coordinator)", sent: "Wednesday, 8 April 2026, 10:15",
        body: "Keep Saturday's morning workshop (MK-0411) in Studio A. Only move Tuesday's evening session (MK-0414) to Studio B for the laser-cutter maintenance." },
      calendar: { asRead: "Thursday, 9 April 2026, 09:00", rows: [
        "MK-0411 — Sat 11 Apr 2026, 10:00–12:00, Studio A (Active)",
        "MK-0414 — Tue 14 Apr 2026, 18:00–20:00, Studio A (Active)"] },
      log: ["MK-0411 and MK-0414 both added Monday, 16 March 2026, 11:30."],
      notes: {
        C1: [["Notice sent", "Wednesday 8 April 2026, 10:15"],
             ["Session and evidence", "MK-0411 currently scheduled in Studio A per calendar"],
             ["Unresolved conflict", "none"]],
        C2: [["Source pointer", "Email from Shop Coordinator Priya Nair (Wed 8 Apr, 10:15) regarding a move to Studio B for laser-cutter maintenance; Calendar lists MK-0411 (Sat 11 Apr) in Studio A, added Mon 16 Mar."],
             ["Temporal relationship", "Notice sent Wed 8 Apr and read Thu 9 Apr; counting from either date, MK-0411 (Sat 11 Apr) is the earliest upcoming Studio A session."],
             ["Unresolved status", "None identified — send-date and read-date counts both point to MK-0411."]]
      },
      basis: {
        B3_TARGET: "Priya's email of Wed 8 April keeps MK-0411 in Studio A and moves only MK-0414, the Tuesday session, to Studio B.",
        B3_MISREAD: "Priya's email of Wed 8 April mentions laser-cutter maintenance but doesn't say which Studio A session it affects.",
        B3_FALSE_FACT: "Priya's email of Wed 8 April was sent after MK-0411 had finished, so it can only apply to later sessions.",
        B3_SURFACE: "On Thu 9 April, MK-0411 is the next Studio A session on the calendar, and no conflict is listed.",
        B3_UNFOCUSED: "Two sessions, MK-0411 and MK-0414, are booked in Studio A that week, so it's best to check with the organizer."
      },
      targetBasis: "B3_TARGET",
      why: "Priya's email keeps MK-0411 in Studio A and moves only MK-0414. The edit contradicts it.",
      noteReveal: {
        C1: "The note left out Priya's instruction to keep MK-0411 in Studio A.",
        C2: "The note treated Priya's email as a “next session” notice and counted dates, leaving out her instruction to keep MK-0411 where it is and move only MK-0414."
      },
      gate: { code: "INTERRUPT_TARGET_MISMATCH",
        text: "Read correctly, the email targets MK-0414 and excludes MK-0411, so the check stops the edit. If the step that reads the email dropped the exclusion and treated it as a plain “next session” notice, a check on dates alone would let it through. Reading the scope of a notice matters as much as counting dates." }
    },

    "DEV-04": {
      venue: "Northside Community Clinic",
      status: "U", fidelity: "accurate", target: "reject", provisional: false,
      edit: "Move NC-0416 (Thursday, 16 April 2026, 17:00–19:00) from Wing A to Wing C.",
      rule: "Authorize a room edit only when the clinic operations lead has confirmed the move for that specific session. If unclear, hold the edit and ask the coordinator.",
      email: { from: "Hannah Brooks (Clinic Operations Lead)", sent: "Monday, 6 April 2026, 13:20",
        body: "Confirming that your next clinic (Thursday 9 April, NC-0409) is moved from Wing A to Wing C. Following weeks remain in Wing A." },
      calendar: { asRead: "Friday, 10 April 2026, 09:00", rows: [
        "NC-0409 — Thu 9 Apr 2026, 17:00–19:00, Wing A (Past)",
        "NC-0416 — Thu 16 Apr 2026, 17:00–19:00, Wing A (Active)"] },
      log: ["NC-0409 and NC-0416 both added Monday, 9 February 2026, 09:00."],
      notes: {
        C1: [["Notice sent", "Monday 6 April 2026, 13:20"],
             ["Session and evidence", "Notice explicitly moved NC-0409 (Thu 9 Apr) and stated following weeks remain in Wing A; this proposal targets NC-0416 (Thu 16 Apr)"],
             ["Unresolved conflict", "Proposal contradicts notice scope (NC-0416 is not authorized to move)"]],
        C2: [["Source pointer", "Email from Clinic Operations Lead Hannah Brooks (Mon 6 Apr, 13:20) explicitly names NC-0409 (Thu 9 Apr) for Wing C and states “Following weeks remain in Wing A.” Calendar shows NC-0416 (Thu 16 Apr) in Wing A, added Mon 9 Feb."],
             ["Temporal relationship", "Notice was sent Mon 6 Apr (before NC-0409) and read Fri 10 Apr (after NC-0409). The proposal targets the post-read session NC-0416, which the notice explicitly excluded."],
             ["Unresolved status", "Defeating contradiction — the notice authorizes moving NC-0409 only and leaves NC-0416 in Wing A; this proposal is not authorized."]]
      },
      basis: {
        B4_TARGET: "Hannah's email of Mon 6 April moves only NC-0409 and says the following weeks, NC-0416 included, stay in Wing A.",
        B4_MISREAD: "NC-0409 had passed by Fri 10 April, so Hannah's email of Mon 6 April may have carried the move over to NC-0416.",
        B4_FALSE_FACT: "Hannah's email of Mon 6 April moves every April clinic to Wing C, starting with NC-0409 on 9 April.",
        B4_SURFACE: "On Fri 10 April, NC-0416 is the next active clinic in Wing A on the calendar, and nothing on it shows a conflict.",
        B4_UNFOCUSED: "Hannah's email of Mon 6 April was four days old by Fri 10 April, so someone should confirm NC-0416 first."
      },
      targetBasis: "B4_TARGET",
      why: "Hannah moved only NC-0409 and said following weeks stay in Wing A. The edit targets NC-0416, which she excluded.",
      noteReveal: {
        C1: "The note was accurate: it said Hannah moved only NC-0409 and kept following weeks in Wing A.",
        C2: "The note was accurate: it said Hannah moved only NC-0409, kept following weeks in Wing A, and that this edit isn't authorized."
      },
      gate: { code: "INTERRUPT_TARGET_MISMATCH",
        text: "The email names NC-0409, which isn't the session being edited, so the check stops the edit." }
    },

    "DEV-05": {
      venue: "Saltmarsh Bike Kitchen",
      status: "A", fidelity: "plausible_defective", target: "seek_clarification", provisional: false,
      edit: "Move SB-1017 (Saturday, 17 October 2026, 10:00–13:00) from Bay 2 to Courtyard Shed.",
      rule: "Authorize a room edit only when the venue coordinator has confirmed the room change for that specific session. If unclear, leave the calendar alone and ask the organizer.",
      email: { from: "Tessa Okafor (Venue Coordinator)", sent: "Thursday, 1 October 2026, 16:20",
        body: "Quick note — we're moving you to the Courtyard Shed for your next session." },
      calendar: { asRead: "Monday, 5 October 2026, 09:00", rows: [
        "SB-1003 — Sat 3 Oct 2026, 10:00–13:00, Bay 2 (Past)",
        "SB-1017 — Sat 17 Oct 2026, 10:00–13:00, Bay 2 (Active)"] },
      log: ["SB-1017 added Monday, 10 August 2026, 10:00.", "SB-1003 added Friday, 2 October 2026, 08:45 (note: “extra session”)."],
      notes: {
        C1: [["Notice sent", "Thursday 1 October 2026, 16:20"],
             ["Session and evidence", "SB-1017 currently scheduled in Bay 2 per calendar"],
             ["Unresolved conflict", "none"]],
        C2: [["Source pointer", "Email from Venue Coordinator Tessa Okafor (Thu 1 Oct, 16:20: “moving you to the Courtyard Shed for your next session”); Calendar on Mon 5 Oct lists SB-1017 (Sat 17 Oct) in Bay 2, added Mon 10 Aug."],
             ["Temporal relationship", "Read on Mon 5 Oct; SB-1003 (Sat 3 Oct) has already passed, leaving SB-1017 (Sat 17 Oct) as the next upcoming session on the calendar."],
             ["Unresolved status", "None identified — SB-1017 is the only upcoming Bay 2 session."]]
      },
      basis: {
        B5_TARGET: "Tessa wrote “next session” on Thu 1 October and SB-1003 was only logged on Fri 2 October, so she could have meant either one.",
        B5_MISREAD: "Tessa wrote on Thu 1 October, before Saturday 3 October, so “next session” definitely meant SB-1003 and moving SB-1017 is wrong.",
        B5_FALSE_FACT: "Tessa's email of Thu 1 October names SB-1017 for the Courtyard Shed and leaves the extra session where it is.",
        B5_SURFACE: "By Mon 5 October, SB-1003 had passed, so SB-1017 is the only upcoming Bay 2 session on the calendar.",
        B5_UNFOCUSED: "Tessa's email of Thu 1 October is short and informal, so any room change it suggests should be double-checked first."
      },
      targetBasis: "B5_TARGET",
      why: "Tessa wrote “next session” on Thursday. The extra session on 3 October was only logged on Friday morning, so the calendar can't show whether she meant it or the 17th. The rule says to ask.",
      noteReveal: {
        C1: "“Unresolved conflict: none” was wrong: counting from when Tessa wrote gives SB-1003, and counting from Monday gives SB-1017.",
        C2: "The note counted only from Monday. It left out that SB-1003 was logged the morning after Tessa wrote, and reported no conflict."
      },
      gate: { code: "INTERRUPT_TEMPORAL_DISAGREEMENT",
        text: "Counting “next session” from when Tessa wrote (Thu 1 Oct) gives SB-1003. Counting from when the calendar was read (Mon 5 Oct) gives SB-1017. The two counts disagree, so the check stops the edit and sends it back to the organizer: the drift the note smoothed over." }
    },

    "DEV-06": {
      venue: "Maplewood Public Library Reading Group",
      status: "A", fidelity: "accurate", target: "seek_clarification", provisional: true,
      edit: "Move LG-0502 (Saturday, 2 May 2026, 13:00–15:00) from Reading Room 2 to Mezzanine.",
      rule: "Authorize a room edit only when the library coordinator has confirmed the room change for that specific session. If unclear, hold the edit and ask the organizer.",
      email: { from: "Marcus Cole (Library Reading-Room Coordinator)", sent: "Monday, 27 April 2026, 14:10",
        body: "Quick heads-up: we are moving your next session from Reading Room 2 to the Mezzanine." },
      calendar: { asRead: "Tuesday, 28 April 2026, 10:00", rows: [
        "LG-0502 — Sat 2 May 2026, 13:00–15:00, Reading Room 2 (Active; tag: Extra Pop-Up Session — visiting author)",
        "LG-0509 — Sat 9 May 2026, 13:00–15:00, Reading Room 2 (Active; tag: Monthly Reading Group — standing series)"] },
      log: ["LG-0509 added Thursday, 8 January 2026, 09:30 (part of the standing monthly series coordinated with Marcus's desk).",
            "LG-0502 added Thursday, 23 April 2026, 16:00 (booked through the library's separate special-events form; note: “one-off extra session”)."],
      notes: {
        C1: [["Notice sent", "Monday 27 April 2026, 14:10"],
             ["Session and evidence", "Both send and read dates precede LG-0502 (Sat 2 May, extra pop-up via special-events form) and LG-0509 (Sat 9 May, standing monthly series)"],
             ["Unresolved conflict", "Unclear whether “your next session” refers to the chronologically next pop-up (LG-0502) or the standing monthly session coordinated with Marcus's desk (LG-0509)"]],
        C2: [["Source pointer", "Email from Marcus Cole (Mon 27 Apr, 14:10: “moving your next session from Reading Room 2 to the Mezzanine”); Calendar lists LG-0502 (Sat 2 May, extra pop-up, added 23 Apr via special-events form) and LG-0509 (Sat 9 May, standing monthly series, added 8 Jan)."],
             ["Temporal relationship", "Notice sent Mon 27 Apr and read Tue 28 Apr; counting chronologically from either date points to LG-0502 (no send/read drift)."],
             ["Unresolved status", "Ambiguous target — LG-0502 is chronologically next, but it is a one-off extra session booked via a separate special-events form, whereas LG-0509 is the standing monthly session managed by Marcus's desk. Clarification required."]]
      },
      basis: {
        B6_TARGET: "Marcus's “your next session” could mean the one-off pop-up LG-0502 or the standing session LG-0509 his desk manages.",
        B6_MISREAD: "Marcus's desk manages the monthly series, so on Mon 27 April he definitely meant LG-0509 and moving LG-0502 is wrong.",
        B6_FALSE_FACT: "Marcus's email of Mon 27 April names the visiting-author pop-up, LG-0502, for the Mezzanine.",
        B6_SURFACE: "On Tue 28 April, LG-0502 on 2 May is the next Reading Room 2 session on the calendar after Marcus wrote.",
        B6_UNFOCUSED: "Two sessions, LG-0502 and LG-0509, fall within a week in Reading Room 2, so it's safer to ask first."
      },
      targetBasis: "B6_TARGET",
      why: "Marcus wrote “your next session”. LG-0502 is next by date, but it's a one-off booked through a separate form, while LG-0509 is the standing session his desk manages. The record can't settle which he meant.",
      noteReveal: {
        C1: "The note was accurate: it named both sessions and said it was unclear which Marcus meant.",
        C2: "The note was accurate: it named both sessions, said the dates agree, and flagged the ambiguity between the pop-up and the standing session."
      },
      gate: { code: "NO_TEMPORAL_CONFLICT_DETECTED",
        text: "Counting from when Marcus wrote and from when the calendar was read both give LG-0502, so a check on dates finds nothing. The ambiguity between the pop-up and the standing session is not about dates. Catching it takes a person reading the booking log, or an accurate note." }
    }
  };

  var TEMPLATES = {
    T1: [["DEV-01", "C0"], ["DEV-03", "C1"], ["DEV-05", "C2"]],
    T2: [["DEV-01", "C1"], ["DEV-03", "C2"], ["DEV-05", "C0"]],
    T3: [["DEV-01", "C2"], ["DEV-03", "C0"], ["DEV-05", "C1"]],
    T4: [["DEV-02", "C0"], ["DEV-04", "C1"], ["DEV-06", "C2"]],
    T5: [["DEV-02", "C1"], ["DEV-04", "C2"], ["DEV-06", "C0"]],
    T6: [["DEV-02", "C2"], ["DEV-04", "C0"], ["DEV-06", "C1"]]
  };

  return { PANELS: PANELS, PRACTICE: PRACTICE, CASES: CASES, TEMPLATES: TEMPLATES };
})();
