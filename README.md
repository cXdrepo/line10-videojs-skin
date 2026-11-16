# Line 10

A transit-wayfinding skin for Video.js v10. The controls sit on an opaque
enamel sign, the seek bar is a route line with ten stops, and the play button
is the line's roundel. Built from the Scaffold skin source on the composable
`@videojs/html` UI components.

**Live demo:** https://line10-videojs-skin.vercel.app

## Quick start

1. **Install Video.js v10.**

   ```bash
   npm i @videojs/html@10
   ```

2. **Add the markup.** Copy `skin.html`, `skin.css` and `skin.js` into your
   project and import them once:

   ```js
   import '@videojs/html/video/player';
   import './line10/skin.js';
   import './line10/skin.css';
   ```

   Then paste the contents of `skin.html` inside `<video-player>` and replace
   its placeholder comment with your media element:

   ```html
   <video-player content-title="Northbound to the coast">
     <media-container class="line10" data-theme="line10" data-preset="video" aria-label="Video player">
       <video src="video.mp4" playsinline></video>
       <!-- ...the rest of skin.html... -->
     </media-container>
   </video-player>
   ```

   Size the player on the element that wraps `<video-player>`; the skin fills it.

3. **Theme it with CSS custom properties**, on the player or any ancestor:

   ```css
   video-player {
     --media-accent-color: #e53935;      /* route, roundel, bullets */
     --media-accent-text-color: #0c0d0f; /* text and icons on the accent */
     --media-border-radius: 12px;        /* player corners */
     --media-scale-unit: 1rem;           /* base size for spacing, icons, text */
   }
   ```

No bundler? Copy the import map from `index.html`. It maps the same
specifiers to the version-pinned CDN bundles.

## Options

| Property | Default | Changes |
| --- | --- | --- |
| `--media-accent-color` | `#ffd200` | The line colour: travelled route, roundel, bullets. |
| `--media-accent-text-color` | `#0c0d0f` | Text and icons drawn on the line colour. Set it with the accent. |
| `--media-border-radius` | `0` | Player corner radius. |
| `--media-scale-unit` | `1rem` | Base size for spacing, icons and text. Buttons never go below 48 px. |
| `--media-font-family` | Inter, Helvetica, system | Interface font. The skin does not load a webfont. |
| `--media-object-fit`, `--media-object-position` | `contain`, `center` | How media and poster fill the player. |

## What is in the skin

- **Line strip.** The seek bar has a stop every 10%; the `0`–`9` keys jump to them.
- **Scrub preview.** Frame and time under the pointer, from a storyboard track.
- **Keyboard timetable.** `?` lists every shortcut as stops on a route; `Esc` closes it.
- **Top speed badge.** Shows the playback speed whenever it changes (`<` and `>`), then fades.
- **Hold for 2×.** Press and hold the footage while it plays; let go to return to the speed you had.
- **Several players per page.** IDs are scoped per instance by `skin.js`.
- **No dependencies beyond Video.js.** No webfont, icon library or framework.

## Accessibility

- Text is 17.1:1 on the sign over pure white footage, the worst case; the
  sign's edge is 8.0:1 against black footage.
- Every button is at least 48 × 48 px. Focus is a white ring between two dark
  rings, so it shows on any footage.
- The player keeps `role="group"`, `tabindex="0"` and an `aria-label`, and
  includes the Video.js status announcer (`role="status"`).
- `prefers-contrast`, `prefers-reduced-transparency`, `prefers-reduced-motion`
  and `forced-colors` each have their own rules.

Tested in Chromium against `@videojs/html` 10.3.0: bright and dark footage, a
375 × 211 player, keyboard-only use, touch taps and several players on one
page. Not tested: a screen reader, Safari, Firefox, and the contrast,
transparency, motion and forced-colors rules, which are written but have not
been exercised.

## Files

| File | What it is |
| --- | --- |
| `skin.html` | The skin markup: a `<media-container>` of Video.js UI components, with the icon family inline as SVG. |
| `skin.css` | All styles: tokens, one section per part, then user-preference media queries. |
| `skin.js` | Registers every element the markup uses, scopes IDs per player, and wires the `?` shortcut, the speed pill and hold-for-2×. |
| `index.html`, `workbench.css` | The demo page: footage, size and line-colour switches. Not part of the skin. |

## The demo

`index.html` plays a Mux-hosted HLS stream through Video.js v10's own
`<mux-video>` component, which also supplies the storyboard for the scrub
preview. It needs a static server because it loads `skin.html` with `fetch`
and its scripts are ES modules:

```bash
npx serve .
```

## License

[Apache-2.0](LICENSE)
