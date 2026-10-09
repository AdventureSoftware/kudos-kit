# Theming the kkw widget

## Options

```js
Feedback.init({
  project: 'colorpage',
  turnstileSiteKey: '…',
  privacyUrl: 'https://colorpage.app/privacy',
  theme: {
    mode: 'auto',          // 'light' (default) | 'dark' | 'auto' (follows the OS)
    accent: '#e11d48',     // primary color
    accentText: '#ffffff', // text on the accent color (default: white)
    radius: 12,            // panel corner radius in px, 0–32 (default: 8)
    fontFamily: 'inherit', // default: system-ui
  },
});
```

| Option | Default | Notes |
|---|---|---|
| `mode` | `'light'` | `'auto'` follows `prefers-color-scheme`. Also sets the Turnstile theme. |
| `accent` | near-black (light) / near-white (dark) | Launcher button, active chip, submit, links, focus ring. |
| `accentText` | `#ffffff` | Only needed when the accent is a light color. `text` is accepted as an older alias. |
| `radius` | `8` | Inputs and chips use half of it. |
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
| `fieldBackground` | Inputs and unselected chips |
| `text` | Main text |
| `mutedText` | Labels, placeholders, privacy note |
| `border` | Panel, input and chip borders |
| `accent`, `accentText` | Override the global accent in this mode only (useful when one accent doesn't read well on both backgrounds) |

## Changing the theme at runtime

If your app has a dark-mode toggle, keep the widget in sync:

```js
Feedback.setTheme({ mode: 'dark' });
Feedback.setTheme({ accent: '#0ea5e9' });   // only the given keys change
Feedback.setTheme({ light: { background: '#ecfeff' } }); // other light colors are kept
```

## Advanced: CSS variables

For anything the options above don't cover (shadow, success/error colors):

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
| `--kkw-field-bg` | Inputs and unselected chips |
| `--kkw-text`, `--kkw-muted` | Main and secondary text |
| `--kkw-border` | Panel, input and chip borders |
| `--kkw-success`, `--kkw-error` | Status message after submit |
| `--kkw-shadow` | Panel and button shadow |
| `--kkw-radius`, `--kkw-radius-sm` | Corner radius |
| `--kkw-font` | Font family |
