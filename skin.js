/*
 * LINE 10 — element registrations for the skin.
 *
 * Mirrors the Scaffold skin's skin.ts: one import per UI element that
 * skin.html uses. With a bundler these resolve from the @videojs/html
 * package; without one, index.html maps the same specifiers to the CDN
 * bundles with an import map.
 *
 * Load skin.css alongside this file (a <link>, or `import './skin.css'`
 * if your bundler handles CSS).
 */
import '@videojs/html/i18n';
import '@videojs/html/ui/container';
import '@videojs/html/ui/poster';
import '@videojs/html/ui/error-dialog';
import '@videojs/html/ui/dialog-backdrop';
import '@videojs/html/ui/dialog-popup';
import '@videojs/html/ui/dialog-title';
import '@videojs/html/ui/dialog-description';
import '@videojs/html/ui/dialog-close';
import '@videojs/html/ui/controls';
import '@videojs/html/ui/controls-content';
import '@videojs/html/ui/controls-group';
import '@videojs/html/ui/buffering-indicator';
import '@videojs/html/ui/title';
import '@videojs/html/ui/tooltip-group';
import '@videojs/html/ui/tooltip';
import '@videojs/html/ui/tooltip-label';
import '@videojs/html/ui/tooltip-shortcut';
import '@videojs/html/ui/play-button';
import '@videojs/html/ui/time-group';
import '@videojs/html/ui/time';
import '@videojs/html/ui/time-separator';
import '@videojs/html/ui/time-slider';
import '@videojs/html/ui/slider-track';
import '@videojs/html/ui/slider-buffer';
import '@videojs/html/ui/slider-fill';
import '@videojs/html/ui/slider-thumb';
import '@videojs/html/ui/slider-preview';
import '@videojs/html/ui/slider-thumbnail';
import '@videojs/html/ui/slider-value';
import '@videojs/html/ui/mute-button';
import '@videojs/html/ui/volume-popover';
import '@videojs/html/ui/volume-slider';
import '@videojs/html/ui/popover';
import '@videojs/html/ui/fullscreen-button';
import '@videojs/html/ui/hotkey';
import '@videojs/html/ui/gesture';
import '@videojs/html/ui/status-announcer';
import '@videojs/html/ui/volume-indicator';
import '@videojs/html/ui/volume-indicator-fill';
import '@videojs/html/ui/volume-indicator-value';
import '@videojs/html/ui/seek-indicator';
import '@videojs/html/ui/seek-indicator-value';

/*
 * Instance-scoped ids.
 *
 * skin.html links triggers to their popups by id (commandfor, tooltip
 * trigger), so two copies of the markup on one page collide: the second
 * player's popups attach to the first player's buttons. The first player
 * keeps the ids from skin.html; every later one gets a numeric suffix
 * (l10-help-2, l10-timetable-2, ...) on its ids and on every attribute that
 * points at them.
 *
 * A component resolves its partner once, just after it connects. A player
 * added while this script is watching is renamed before that happens. A
 * player that was already on the page (the elements were registered before
 * this script loaded) has by then linked to the first player's buttons and
 * does not look again, so each element that looks one up is detached and
 * re-attached in place to resolve against the new ids.
 */
const ID_REFERENCES = ['commandfor', 'trigger', 'for', 'aria-controls', 'aria-owns', 'aria-labelledby', 'aria-describedby'];
const scopedPlayers = new WeakSet();
let playerCount = 0;

function reconnect(element) {
  const placeholder = document.createComment('');
  element.replaceWith(placeholder);
  placeholder.replaceWith(element);
}

function scopeIds(player) {
  if (scopedPlayers.has(player)) return;
  scopedPlayers.add(player);
  playerCount += 1;
  if (playerCount === 1) return;

  const suffix = `-${playerCount}`;
  const renamed = new Map();
  for (const element of player.querySelectorAll('[id^="l10-"]')) {
    renamed.set(element.id, element.id + suffix);
    element.id += suffix;
  }
  if (renamed.size === 0) return;

  for (const attribute of ID_REFERENCES) {
    for (const element of player.querySelectorAll(`[${attribute}]`)) {
      const value = element.getAttribute(attribute);
      const next = value.split(/\s+/).map((id) => renamed.get(id) ?? id).join(' ');
      if (next !== value) element.setAttribute(attribute, next);
    }
  }

  // Popups named by a commandfor, and tooltips that name their trigger.
  const lookups = new Set(player.querySelectorAll('[trigger]'));
  for (const trigger of player.querySelectorAll('[commandfor]')) {
    const popup = document.getElementById(trigger.getAttribute('commandfor'));
    if (popup && player.contains(popup)) lookups.add(popup);
  }
  lookups.forEach(reconnect);
}

// A live collection: checking it costs one pass over the players on the
// page, however large the mutation that triggered the check.
const players = document.getElementsByClassName('line10');
const scopeAllPlayers = () => {
  for (const player of players) scopeIds(player);
};

scopeAllPlayers();
// Removals and text edits cannot add a player, so only batches that add
// nodes are checked.
new MutationObserver((mutations) => {
  if (mutations.some((mutation) => mutation.addedNodes.length > 0)) scopeAllPlayers();
}).observe(document.documentElement, { childList: true, subtree: true });

/*
 * The keyboard timetable.
 *
 * <media-hotkey> only maps keys to player actions, so the one shortcut that
 * opens skin UI is wired here: "?" presses the timetable button. The button
 * and its <media-popover> do the rest (aria-expanded, Escape to close,
 * closing with the controls). Scoped to players using this skin, ignored
 * while typing, and ignored when the button is hidden on small players.
 */
const EDITABLE = 'input, textarea, select, [role="textbox"], [role="searchbox"], [role="combobox"]';

/** True for form fields and anything the browser treats as editable text. */
function isEditable(node) {
  return node instanceof HTMLElement && (node.isContentEditable || node.matches(EDITABLE));
}

// One delegated listener for every player on the page. ES modules evaluate
// once, so importing this file again never adds a second listener.
document.addEventListener('keydown', (event) => {
  if (event.defaultPrevented) return;

  // Only the character counts. Matching the physical Slash key, or "/" with
  // Shift held, fires on layouts where those type something else ("_" on the
  // Slash key, "/" on Shift+7).
  if (event.key !== '?' || event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;

  // composedPath() sees through shadow roots, where event.target and closest()
  // stop at the host. The first .line10 on the path is the player that holds
  // focus, so a second player on the page is never touched.
  const path = event.composedPath();
  const playerIndex = path.findIndex((node) => node instanceof Element && node.matches('.line10'));
  if (playerIndex === -1) return;
  if (path.slice(0, playerIndex).some(isEditable)) return;

  const trigger = path[playerIndex].querySelector('.l10-help');
  // No client rects = display: none (the button is hidden on small players).
  if (!(trigger instanceof HTMLElement) || trigger.getClientRects().length === 0) return;

  event.preventDefault();
  trigger.focus({ preventScroll: true });
  trigger.click();
});

/*
 * Playback speed: the pill, and press-and-hold for 2×.
 *
 * The pill (.l10-speed-indicator) shows the speed whenever the media fires
 * ratechange, whatever changed it: the < and > keys, a menu, or the hold
 * below. It leaves 900ms after the last change, and stays for as long as a
 * hold is playing at 2×.
 *
 * Pressing on the footage for 350ms while it is playing switches to 2×;
 * letting go restores the speed it had. A press that drifts more than 10px
 * first is a drag and never becomes a hold. Presses on the sign, a popup, a
 * dialog or any control are left alone. Taps and double-taps still belong to
 * <media-gesture>: nothing here calls preventDefault on a pointer event.
 */
const HOLD_DELAY = 350;
const HOLD_SLOP = 10;
const HOLD_RATE = 2;
const SPEED_LINGER = 900;
const HOLD_IGNORE = '.l10-controls, .l10-popup, .l10-dialog, .l10-dialog-backdrop, button, a, input, [role="button"], [role="slider"]';

const speedTimers = new WeakMap();
let hold = null;

const isPlayer = (node) => node instanceof Element && node.matches('.line10');

function showSpeed(player, rate) {
  const pill = player.querySelector('.l10-speed-indicator');
  if (!pill) return;

  pill.querySelector('.l10-speed-value').textContent = `${Number(rate.toFixed(2))}×`;
  pill.setAttribute('data-open', '');
  clearTimeout(speedTimers.get(player));

  // No timer while a hold is boosting this player. Letting go changes the
  // speed again, and that call starts the countdown.
  if (hold?.active && hold.player === player) return;
  speedTimers.set(player, setTimeout(() => pill.removeAttribute('data-open'), SPEED_LINGER));
}

// Media events do not bubble, so this listens in the capture phase.
document.addEventListener('ratechange', (event) => {
  const player = event.composedPath().find(isPlayer);
  const rate = event.target?.playbackRate;
  if (player && typeof rate === 'number') showSpeed(player, rate);
}, true);

function trackHold(event) {
  if (!hold || hold.active || event.pointerId !== hold.pointerId) return;
  if (Math.hypot(event.clientX - hold.x, event.clientY - hold.y) > HOLD_SLOP) endHold(event);
}

function endHold(event) {
  if (!hold || (event?.pointerId !== undefined && event.pointerId !== hold.pointerId)) return;

  const { player, media, active, savedRate } = hold;
  clearTimeout(hold.timer);
  document.removeEventListener('pointermove', trackHold, true);
  document.removeEventListener('pointerup', endHold, true);
  document.removeEventListener('pointercancel', endHold, true);
  window.removeEventListener('blur', endHold);
  hold = null;
  if (!active) return;

  media.playbackRate = savedRate;
  showSpeed(player, savedRate);

  // Lifting after a hold is not a click on the footage. The listener removes
  // itself if no click follows, so it cannot eat a later one.
  if (event?.type === 'pointerup') {
    const swallow = (click) => {
      click.stopPropagation();
      click.preventDefault();
    };
    document.addEventListener('click', swallow, { capture: true, once: true });
    setTimeout(() => document.removeEventListener('click', swallow, true), 400);
  }
}

document.addEventListener('pointerdown', (event) => {
  if (hold || !event.isPrimary || event.button !== 0) return;

  const path = event.composedPath();
  const playerIndex = path.findIndex(isPlayer);
  if (playerIndex === -1) return;
  if (path.slice(0, playerIndex).some((node) => node instanceof Element && node.matches(HOLD_IGNORE))) return;

  const player = path[playerIndex];
  const media = [...player.children].find((child) => 'playbackRate' in child);
  if (!media) return;

  hold = {
    player,
    media,
    pointerId: event.pointerId,
    touch: event.pointerType !== 'mouse',
    x: event.clientX,
    y: event.clientY,
    active: false,
    savedRate: 1,
    timer: setTimeout(() => {
      // Nothing to speed up while paused or finished.
      if (media.paused || media.ended) {
        endHold();
        return;
      }
      hold.savedRate = media.playbackRate;
      hold.active = true;
      media.playbackRate = HOLD_RATE;
      showSpeed(player, HOLD_RATE);
    }, HOLD_DELAY),
  };

  document.addEventListener('pointermove', trackHold, true);
  document.addEventListener('pointerup', endHold, true);
  document.addEventListener('pointercancel', endHold, true);
  window.addEventListener('blur', endHold);
});

// A long touch press also asks for the context menu; during a hold it would
// cover the footage.
document.addEventListener('contextmenu', (event) => {
  if (hold?.touch) event.preventDefault();
}, true);
