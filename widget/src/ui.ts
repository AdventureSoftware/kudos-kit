// widget/src/ui.ts
import { FeedbackConfig, FeedbackTheme } from './types';
import { buildCss, mergeTheme, resolveMode } from './theme';

export class FeedbackUI {
  private container: HTMLDivElement | null = null;
  private button: HTMLButtonElement | null = null;
  private panel: HTMLDivElement | null = null;
  private styleEl: HTMLStyleElement | null = null;
  private visible = false;

  constructor(private config: FeedbackConfig) {}

  mount(): void {
    this.styleEl = document.createElement('style');
    this.styleEl.textContent = buildCss(this.config);
    document.head.appendChild(this.styleEl);

    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.className = 'kkw-btn';
    this.button.textContent = 'Feedback';
    this.button.onclick = () => this.togglePanel();

    this.panel = this.buildPanel();
    this.container = document.createElement('div');
    this.container.className = 'kkw-root';
    this.container.dataset.kkwMode = resolveMode(this.config.theme);
    this.container.appendChild(this.button);
    this.container.appendChild(this.panel);
    document.body.appendChild(this.container);

    this.panel.style.display = 'none';
  }

  private buildPanel(): HTMLDivElement {
    const panel = document.createElement('div');
    panel.className = 'kkw-panel';

    const title = document.createElement('strong');
    title.className = 'kkw-title';
    title.textContent = 'Send feedback';
    panel.appendChild(title);

    const chips = document.createElement('div');
    chips.className = 'kkw-chips';
    for (const [type, label] of [['bug', 'Bug'], ['idea', 'Idea'], ['other', 'Other']] as const) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'kkw-chip' + (type === 'bug' ? ' active' : '');
      chip.dataset.type = type;
      chip.textContent = label;
      chips.appendChild(chip);
    }
    panel.appendChild(chips);

    const msgLabel = document.createElement('span');
    msgLabel.className = 'kkw-label';
    msgLabel.textContent = 'Message *';
    panel.appendChild(msgLabel);

    const textarea = document.createElement('textarea');
    textarea.className = 'kkw-textarea';
    textarea.placeholder = 'What happened?';
    textarea.maxLength = 5000;
    panel.appendChild(textarea);

    const emailLabel = document.createElement('span');
    emailLabel.className = 'kkw-label';
    emailLabel.textContent = 'Email (optional)';
    panel.appendChild(emailLabel);

    const emailInput = document.createElement('input');
    emailInput.className = 'kkw-input';
    emailInput.type = 'email';
    emailInput.placeholder = 'you@example.com';
    panel.appendChild(emailInput);

    const hp = document.createElement('input');
    hp.className = 'kkw-hp';
    hp.type = 'text';
    hp.style.display = 'none';
    hp.tabIndex = -1;
    hp.autocomplete = 'off';
    panel.appendChild(hp);

    const turnstile = document.createElement('div');
    turnstile.id = 'kkw-turnstile';
    panel.appendChild(turnstile);

    const submitBtn = document.createElement('button');
    submitBtn.type = 'button';
    submitBtn.className = 'kkw-submit';
    submitBtn.textContent = 'Submit';
    panel.appendChild(submitBtn);

    const msgDiv = document.createElement('div');
    msgDiv.className = 'kkw-msg';
    panel.appendChild(msgDiv);

    const privacy = document.createElement('p');
    privacy.className = 'kkw-privacy';
    privacy.textContent = 'Bug reports include technical diagnostics (console logs).';
    if (this.config.privacyUrl) {
      privacy.appendChild(document.createTextNode(' '));
      const privacyLink = document.createElement('a');
      privacyLink.href = this.config.privacyUrl;
      privacyLink.target = '_blank';
      privacyLink.rel = 'noopener noreferrer';
      privacyLink.textContent = 'Privacy policy';
      privacy.appendChild(privacyLink);
      privacy.appendChild(document.createTextNode('.'));
    }
    panel.appendChild(privacy);

    panel.querySelectorAll<HTMLElement>('.kkw-chip').forEach(chip => {
      chip.onclick = () => {
        panel.querySelectorAll('.kkw-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      };
    });

    return panel;
  }

  getSelectedType(): string {
    return this.panel?.querySelector<HTMLElement>('.kkw-chip.active')?.dataset.type ?? 'bug';
  }

  getMessage(): string {
    return (this.panel?.querySelector<HTMLTextAreaElement>('.kkw-textarea')?.value ?? '').trim();
  }

  getEmail(): string {
    return (this.panel?.querySelector<HTMLInputElement>('.kkw-input')?.value ?? '').trim();
  }

  getHoneypot(): string {
    return this.panel?.querySelector<HTMLInputElement>('.kkw-hp')?.value ?? '';
  }

  setSubmitState(loading: boolean): void {
    const btn = this.panel?.querySelector<HTMLButtonElement>('.kkw-submit');
    if (btn) { btn.disabled = loading; btn.textContent = loading ? 'Sending…' : 'Submit'; }
  }

  showMessage(text: string, isError = false): void {
    const msg = this.panel?.querySelector<HTMLElement>('.kkw-msg');
    if (!msg) return;
    msg.textContent = text;
    msg.classList.toggle('kkw-err', isError);
    msg.classList.toggle('kkw-ok', !isError);
  }

  getTurnstileContainer(): HTMLElement | null {
    return this.panel?.querySelector<HTMLElement>('#kkw-turnstile') ?? null;
  }

  getSubmitButton(): HTMLButtonElement | null {
    return this.panel?.querySelector<HTMLButtonElement>('.kkw-submit') ?? null;
  }

  togglePanel(): void { this.visible ? this.hidePanel() : this.showPanel(); }

  showPanel(): void {
    if (this.panel && !this.visible) { this.panel.style.display = 'block'; this.visible = true; }
  }

  hidePanel(): void {
    if (this.panel && this.visible) { this.panel.style.display = 'none'; this.visible = false; }
  }

  /** Merge new theme values and re-apply styles without remounting. */
  setTheme(theme: FeedbackTheme): void {
    this.config = { ...this.config, theme: mergeTheme(this.config.theme, theme) };
    if (this.styleEl) this.styleEl.textContent = buildCss(this.config);
    if (this.container) this.container.dataset.kkwMode = resolveMode(this.config.theme);
  }

  getThemeMode(): string { return resolveMode(this.config.theme); }

  isVisible(): boolean { return this.visible; }

  showButton(): void { if (this.button) this.button.style.display = ''; }
  hideButton(): void { if (this.button) this.button.style.display = 'none'; }

  destroy(): void {
    this.container?.remove();
    this.container = null;
    this.button = null;
    this.panel = null;
    this.styleEl?.remove();
    this.styleEl = null;
    this.visible = false;
  }
}
