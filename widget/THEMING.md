# Theming the kkw widget

## How the panel works

1. **Choose a type**: Bug, Idea, Praise or Other. Nothing is preselected, so every report is
   sorted on purpose.
2. **Write**: the message box adapts to the type. Praise, Idea and Other start with optional
   1–5 stars ("How would you rate Colorpage?", using `appName`; never shown for bugs). Praise
   also shows an optional "You may show my message publicly as a testimonial" box with an
   optional name.
3. **Thank you**, with "Send more feedback". Closing the panel after sending starts fresh.

Console logs are sent only for the types listed in `console.sendOn` (default `['bug']`).

## Look

The launcher button and the panel are shaped like speech bubbles: rounded, with the corner
nearest the screen corner (where the widget sits) kept sharp. The panel header, the icon circles
and the chosen type are soft tints mixed from your `accent`, so they always match your color.
A small "Powered by Kudos Kit" line sits at the bottom of the panel; `branding: false` hides it.

## Options

```js
Feedback.init({
  project: 'colorpage',
  turnstileSiteKey: '…',
  privacyUrl: 'https://colorpage.app/privacy',
  appName: 'Colorpage',    // "How would you rate Colorpage?" (default: "your experience")
  branding: true,          // "Powered by Kudos Kit" line (default: true)
  theme: {
    mode: 'auto',          // 'light' (default) | 'dark' | 'auto' (follows the OS)
    accent: '#e11d48',     // primary color
    accentText: '#ffffff', // text on the accent color (default: white)
    radius: 12,            // corner radius in px, 0–32 (default: 8)
    fontFamily: 'inherit', // default: system-ui
  },
});
```

| Option | Default | Notes |
|---|---|---|
| `branding` | `true` | `false` hides the "Powered by Kudos Kit" line. |
| `mode` | `'light'` | `'auto'` follows `prefers-color-scheme`. Also sets the Turnstile theme. |
| `accent` | near-black (light) / near-white (dark) | Launcher button, type icons and tints, submit, links, focus ring. |
| `accentText` | `#ffffff` | Only needed when the accent is a light color. `text` is accepted as an older alias. |
| `radius` | `8` | Base radius: inputs use half of it, the panel twice it and the launcher 2.5× (both capped at 24px). `0` makes everything square. |
| `fontFamily` | `system-ui` | `'inherit'` uses the host page's font. |

## Background and other colors, per mode

`light` and `dark` set the panel colors for each mode. With `mode: 'auto'`, the widget
uses whichever one matches the user's OS. Any key you leave out keeps the default.

```js
theme: {
  mode: 'auto',
  accent: '#c2410c',
  light: { background: '#fffaf0', border: '#fed7aa' },
  dark:  { background: '#1c1410', border: '#4a3426', accent: '#fb923c', accentText: '#1c1410' },
}
```

| Key | Used for |
|---|---|
| `background` | Panel background |
| `fieldBackground` | Inputs and the type choices |
| `text` | Main text |
| `mutedText` | Labels, hints, placeholders, privacy note, "Powered by" |
| `border` | Panel, input and type-choice borders |
| `accent`, `accentText` | Override the global accent in this mode only (useful when one accent doesn't read well on both backgrounds, e.g. a dark teal on the dark panel) |

## Changing the theme at runtime

If your app has a dark-mode toggle, keep the widget in sync:

```js
Feedback.setTheme({ mode: 'dark' });
Feedback.setTheme({ accent: '#0ea5e9' });   // only the given keys change
Feedback.setTheme({ light: { background: '#ecfeff' } }); // other light colors are kept
```

## Advanced: CSS variables

For anything the options above don't cover (shadow, success/error colors, tints):

All defaults have zero specificity, so a plain rule in your own stylesheet overrides them:

```css
.kkw-root {
  --kkw-bg: #fefce8;
  --kkw-border: #facc15;
}
.kkw-root[data-kkw-mode="dark"] {
  --kkw-bg: #1a1a2e;
}
```

| Variable | Used for |
|---|---|
| `--kkw-accent`, `--kkw-accent-text` | Primary color and its text |
| `--kkw-bg` | Panel background |
| `--kkw-field-bg` | Inputs and type choices |
| `--kkw-text`, `--kkw-muted` | Main and secondary text |
| `--kkw-border` | Panel, input and type-choice borders |
| `--kkw-tint`, `--kkw-tint-strong` | Header band and chosen type / icon circles (8% and 16% of the accent; plain field background in browsers without `color-mix()`) |
| `--kkw-success`, `--kkw-error` | Thank-you check mark, error message |
| `--kkw-star` | Filled rating stars (amber by default) |
| `--kkw-shadow` | Panel and button shadow |
| `--kkw-radius`, `--kkw-radius-sm` | Corner radius |
| `--kkw-font` | Font family |
