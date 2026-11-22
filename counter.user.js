// ==UserScript==
// @name         Page Counter
// @namespace    counter-extension
// @version      0.3.0
// @description  A small counter overlay. Hidden behind a tiny launcher button until you click it.
// @match        *://*/*
// @noframes
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const KEY_COUNT = 'count';
  const KEY_HIDDEN_HOSTS = 'hiddenHosts';
  const KEY_POS = 'position'; // { x, y } = left/top in px, or null for default corner
  const DRAG_THRESHOLD = 4; // px moved before a press counts as a drag, not a click
  const host = location.hostname;

  let count = Number(GM_getValue(KEY_COUNT, 0)) || 0;
  let open = false;
  let hiddenForPage = false; // set by the ⊘ button; reset only by reloading

  // --- Tampermonkey menu commands (Tampermonkey icon → this script) ---
  GM_registerMenuCommand('Open / close counter', () => {
    if (hiddenForPage) return;
    ensureMounted();
    setOpen(!open);
  });
  GM_registerMenuCommand(
    isHiddenHere() ? `Show launcher on ${host}` : `Hide launcher on ${host}`,
    () => {
      const hosts = hiddenHosts();
      const i = hosts.indexOf(host);
      if (i >= 0) hosts.splice(i, 1); else hosts.push(host);
      GM_setValue(KEY_HIDDEN_HOSTS, hosts);
      location.reload();
    }
  );
  GM_registerMenuCommand('Reset counter position', () => {
    GM_setValue(KEY_POS, null);
    if (hostEl) applyPosition(null);
  });

  function hiddenHosts() {
    const v = GM_getValue(KEY_HIDDEN_HOSTS, []);
    return Array.isArray(v) ? v : [];
  }
  function isHiddenHere() {
    return hiddenHosts().includes(host);
  }

  // --- UI (inside a Shadow DOM so page CSS can't break it) ---
  let root, hostEl, launcher, valueEl;

  function ensureMounted() {
    if (root) return;
    hostEl = document.createElement('div');
    hostEl.id = 'tm-page-counter';
    hostEl.style.cssText = 'all: initial; position: fixed; z-index: 2147483647;';
    root = hostEl.attachShadow({ mode: 'closed' });
    root.innerHTML = `
      <style>
        * { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
        .launcher {
          width: 28px; height: 28px; border-radius: 50%; border: none; cursor: pointer;
          background: #222; color: #fff; font-size: 14px; opacity: .35;
          box-shadow: 0 2px 6px rgba(0,0,0,.3); transition: opacity .15s;
          touch-action: none;
        }
        .grip {
          cursor: grab; color: #888; font-size: 16px; padding: 0 2px; user-select: none;
          touch-action: none;
        }
        .grip:hover { color: #fff; }
        :host(.dragging), :host(.dragging) * { cursor: grabbing !important; }
        .launcher:hover { opacity: 1; }
        .panel {
          display: none; align-items: center; gap: 8px; padding: 8px 10px;
          background: #222; color: #fff; border-radius: 10px;
          box-shadow: 0 4px 14px rgba(0,0,0,.35);
        }
        :host(.open) .panel { display: flex; }
        :host(.open) .launcher { display: none; }
        .value { min-width: 3ch; text-align: center; font-size: 22px; font-weight: 600; font-variant-numeric: tabular-nums; }
        button.b {
          border: none; border-radius: 6px; cursor: pointer; color: #fff;
          background: #444; height: 32px; min-width: 32px; font-size: 16px;
        }
        button.b:hover { background: #555; }
        button.inc { background: #2e7d32; min-width: 48px; font-size: 20px; }
        button.inc:hover { background: #388e3c; }
        button.small { font-size: 12px; height: 24px; min-width: 24px; background: transparent; color: #aaa; }
        button.small:hover { color: #fff; background: #333; }
      </style>
      <button class="launcher" title="Click to open, drag to move">#</button>
      <div class="panel">
        <span class="grip" title="Drag to move">⠿</span>
        <button class="b dec" title="Decrement">−</button>
        <span class="value"></span>
        <button class="b inc" title="Increment">+</button>
        <button class="b small reset" title="Reset to 0">↺</button>
        <button class="b small close" title="Collapse to launcher">✕</button>
        <button class="b small hide" title="Hide until page reload">⊘</button>
      </div>
    `;
    launcher = root.querySelector('.launcher');
    valueEl = root.querySelector('.value');

    makeDraggable(launcher, () => setOpen(true));
    makeDraggable(root.querySelector('.grip'), null);
    window.addEventListener('resize', () => applyPosition(GM_getValue(KEY_POS, null)));
    root.querySelector('.inc').addEventListener('click', () => setCount(count + 1));
    root.querySelector('.dec').addEventListener('click', () => setCount(count - 1));
    root.querySelector('.reset').addEventListener('click', () => {
      if (count === 0 || confirm('Reset counter to 0?')) setCount(0);
    });
    root.querySelector('.close').addEventListener('click', () => setOpen(false));
    root.querySelector('.hide').addEventListener('click', hideUntilReload);

    document.documentElement.appendChild(hostEl);
    render();
  }

  // Remove the widget for the rest of this page load. Deliberately not saved:
  // a refresh is the only way to bring it back (menu commands are ignored too).
  function hideUntilReload() {
    hiddenForPage = true;
    hostEl.remove();
  }

  // --- Positioning & dragging ---
  function applyPosition(pos) {
    const s = hostEl.style;
    if (!pos) {
      s.left = s.top = 'auto';
      s.right = s.bottom = '16px';
      return;
    }
    // Keep it fully on screen (the panel is wider than the launcher).
    const r = hostEl.getBoundingClientRect();
    const x = Math.max(0, Math.min(pos.x, window.innerWidth - r.width));
    const y = Math.max(0, Math.min(pos.y, window.innerHeight - r.height));
    s.right = s.bottom = 'auto';
    s.left = x + 'px';
    s.top = y + 'px';
  }

  // Press on `handle` and move to drag the whole widget. A press without
  // movement calls `onClick` (if given), so the launcher still opens on click.
  function makeDraggable(handle, onClick) {
    let start = null;
    handle.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const r = hostEl.getBoundingClientRect();
      start = { px: e.clientX, py: e.clientY, x: r.left, y: r.top, moved: false };
      handle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    handle.addEventListener('pointermove', (e) => {
      if (!start) return;
      const dx = e.clientX - start.px, dy = e.clientY - start.py;
      if (!start.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      start.moved = true;
      hostEl.classList.add('dragging');
      applyPosition({ x: start.x + dx, y: start.y + dy });
    });
    const end = (e) => {
      if (!start) return;
      const moved = start.moved;
      start = null;
      hostEl.classList.remove('dragging');
      if (moved) {
        const r = hostEl.getBoundingClientRect();
        GM_setValue(KEY_POS, { x: r.left, y: r.top });
      } else if (onClick && e.type === 'pointerup') {
        onClick();
      }
    };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  }

  function setOpen(v) {
    open = v;
    if (open) count = Number(GM_getValue(KEY_COUNT, 0)) || 0; // pick up changes from other tabs
    render();
  }

  function setCount(v) {
    count = v;
    GM_setValue(KEY_COUNT, count);
    render();
  }

  function render() {
    if (!root) return;
    hostEl.classList.toggle('open', open);
    valueEl.textContent = String(count);
    applyPosition(GM_getValue(KEY_POS, null)); // re-clamp: panel and launcher differ in size
  }

  if (!isHiddenHere()) ensureMounted();
})();
