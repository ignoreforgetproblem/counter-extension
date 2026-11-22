# Page Counter — agent notes

## Goal
A small counter shown on top of any web page that the user can increment.
It must stay out of the way: nothing opens until the user clicks.

## Original request (kept for context)
> Develop a script that shows on top of the page, that I can increment a counter.
> I use TamperMonkey. It should only open if I click somewhere. (Would this be
> better as a separate extension? So I have control on whether the extension is
> on or off.) Update this AGENTS.md, use TASKS.md to write all tasks etc.

## Decision: Tampermonkey userscript (not a separate extension)
Tampermonkey already gives on/off control:
- Each script can be enabled or disabled from the Tampermonkey dashboard or toolbar popup.
- The script adds a per-site "Hide launcher on <host>" menu command.
- `@match` can be narrowed to specific sites.

A separate browser extension would only be worth it if we need a native
toolbar button or keyboard shortcut (via `commands` in the manifest), or need to
ship without Tampermonkey. That is noted as a possible follow-up in TASKS.md.

## Files
- `counter.user.js` is the userscript. To install it, open Tampermonkey, choose
  "Create a new script", paste the file in, and save.
- `TASKS.md` is the task list. Keep it current: tick finished items and add new ones.

## Behaviour
- A faint round `#` launcher sits in the bottom-right corner. Clicking it opens the panel.
- The panel has ⠿ drag grip / − / value / + / ↺ reset (asks to confirm) /
  ✕ collapse to launcher / ⊘ hide.
- ⊘ hide removes the widget for the current page load only. This is deliberately
  not persisted: refreshing the page is the only way to get it back, and the
  "Open / close counter" menu command does nothing while it is hidden.
- Dragging: drag the launcher itself, or the ⠿ grip on the open panel. A press
  that moves less than 4px counts as a click. The position is saved with
  `GM_setValue` (shared across sites) and kept on screen when the window resizes.
  The "Reset counter position" menu command puts it back in the corner.
- The count is stored with `GM_setValue`, so it is shared across all sites and
  tabs and survives reloads.
- Tampermonkey menu commands: "Open / close counter" and "Hide/Show launcher on <host>".
- The UI lives in a closed Shadow DOM at max z-index so page CSS can't affect it.
  It runs in the top frame only (`@noframes`).

## Conventions
- Plain JS with no build step. The script must stay installable as a single file.
- Bump `@version` in the header whenever behaviour changes.
- If you add a `GM_*` API, add the matching `@grant` line.
