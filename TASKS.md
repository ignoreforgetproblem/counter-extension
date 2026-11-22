# Tasks

## Done
- [x] Decide between userscript and extension: userscript (see AGENTS.md)
- [x] Counter overlay with increment, decrement, reset and close
- [x] Hidden behind a click-to-open launcher
- [x] Persist the count across reloads and tabs (`GM_setValue`)
- [x] Tampermonkey menu: open/close counter, hide launcher per site
- [x] Shadow DOM isolation from page CSS
- [x] Rewrite AGENTS.md and create TASKS.md
- [x] Drag the launcher or panel anywhere and remember the position (v0.2.0)
- [x] ⊘ Hide button: hides the widget until the page is reloaded (v0.3.0)

## To do
- [x] Hand-tested in Tampermonkey by the user: works (v0.3.0, 2026-11-23)
- [ ] Try it on harder sites (heavy single-page apps, pages with strict security policies)
- [ ] Decide: one global count, or a separate count per site?

## Ideas / maybe later
- [ ] Keyboard shortcut to increment (e.g. Alt+Shift+=)
- [ ] Remember a separate position for each site?
- [ ] Several named counters
- [ ] Live sync between open tabs (`GM_addValueChangeListener`)
- [ ] Turn it into a standalone browser extension (MV3) if a toolbar button or
      native shortcut is wanted
