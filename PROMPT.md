# Prompts

These are the prompts used to build this script, in the order they were given.
They are copied word for word from the Claude Code sessions. The notes in
italics say what each prompt led to.

## 0. Original request (written in AGENTS.md before the first session)

> Develop a script that shows on top of the page, that I can increment a counter.
> I use TamperMonkey. It should only open if I click somewhere. (Would this be
> better as a separate extension? So I have control on whether the extension is
> on or off.) Update this AGENTS.md, use TASKS.md to write all tasks etc.

## Session 1 (2026-11-22)

1. > Read AGENTS.md

   *Led to the first version of `counter.user.js`: a launcher that opens on click,
   a counter panel, and a decision to make it a userscript rather than an extension.*

2. > Let me grab and move somewhere.

   *Led to dragging the launcher and the panel's ⠿ grip, with the position saved
   and a "Reset counter position" menu command.*

3. > Make it hideable, making the only way to see it again is by refreshing the page.

   *Led to the ⊘ hide button, which lasts for the current page load only.*

4. > I tested it, and it worked. Thank you.

## Session 2 (2026-11-22)

5. > Commit and create a github repo with `gh` can be public

   *Led to the first commit and the public GitHub repo.*

6. > Add a PROMPT.md which shows all prompts used to create this script. Including this one.

   *Led to this file.*

7. > Yes, sir. Commit and push

   *Led to committing and pushing `PROMPT.md`.*
