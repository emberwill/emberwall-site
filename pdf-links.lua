-- In the PDF, turn links to other pages of this site into full web addresses,
-- so they still work when the PDF is read away from the site.
local site = "https://emberwall.net/"

function Link(el)
  if not quarto.doc.is_format("typst") then return nil end
  local t = el.target
  if t:match("^%a[%w+.-]*:") or t:match("^#") then return nil end
  t = t:gsub("^/", "")
  while t:match("^%.%./") do t = t:gsub("^%.%./", "") end
  t = t:gsub("^%./", "")
  t = t:gsub("index%.qmd", ""):gsub("%.qmd", ".html")
  el.target = site .. t
  return el
end
