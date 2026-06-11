// widget/src/ui.ts
import { FeedbackConfig } from './types';

export class FeedbackUI {
  private container: HTMLDivElement | null = null;
  private button: HTMLButtonElement | null = null;
  private panel: HTMLDivElement | null = null;
  private visible = false;

  constructor(private config: FeedbackConfig) {}

  mount(): void {
    const accent = this.config.theme?.accent ?? '#111111';
    const textOnAccent = this.config.theme?.text ?? '#ffffff';
    const pos = this.config.position ?? 'bottom-right';
    const offset = this.config.offset ?? {};

    const style = document.createElement('style');
    style.textContent = `
      .kkw-btn {
        position: fixed; z-index: 2147483000;
        background: ${accent}; color: ${textOnAccent};
        border: none; cursor: pointer;
        font-family: system-ui, sans-serif; font-size: 13px; font-weight: 600;
        padding: 9px 16px; border-radius: 6px;
        ${pos.includes('bottom') ? `bottom: ${offset.bottom ?? 24}px;` : `top: ${offset.top ?? 24}px;`}
        ${pos.includes('right') ? `right: ${offset.right ?? 24}px;` : `left: ${offset.left ?? 24}px;`}
      }
      .kkw-panel {
        position: fixed; z-index: 2147483001;
        background: #fff; border: 1px solid #e5e5e5; border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        padding: 20px; width: 300px;
        font-family: system-ui, sans-serif; font-size: 13px;
        ${pos.includes('bottom') ? `bottom: ${(offset.bottom ?? 24) + 48}px;` : `top: ${(offset.top ?? 24) + 48}px;`}
        ${pos.includes('right') ? `right: ${offset.right ?? 24}px;` : `left: ${offset.left ?? 24}px;`}
      }
      .kkw-chips { display: flex; gap: 6px; margin: 10px 0; }
      .kkw-chip {
        padding: 4px 10px; border: 1px solid #ccc; border-radius: 4px;
        cursor: pointer; background: #fff; font-size: 12px; font-weight: 500;
      }
      .kkw-chip.active { background: ${accent}; color: ${textOnAccent}; border-color: ${accent}; }
      .kkw-textarea, .kkw-input {
        width: 100%; box-sizing: border-box; border: 1px solid #e5e5e5;
        border-radius: 4px; padding: 8px; font-size: 13px; font-family: inherit;
        resize: vertical; margin: 6px 0;
      }
      .kkw-textarea { min-height: 80px; }
      .kkw-submit {
        width: 100%; padding: 8px; background: ${accent}; color: ${textOnAccent};
        border: none; border-radius: 4px; font-size: 13px; font-weight: 600;
        cursor: pointer; margin-top: 8px;
      }
      .kkw-submit:disabled { opacity: 0.6; cursor: not-allowed; }
      .kkw-label { font-size: 11px; color: #666; margin-bottom: 4px; display: block; }
      .kkw-msg { font-size: 12px; margin-top: 8px; }
      .kkw-privacy { font-size: 11px; color: #999; margin-top: 8px; }
    `;
    document.head.appendChild(style);

    this.button = document.createElement('button');
    this.button.className = 'kkw-btn';
    this.button.textContent = 'Feedback';
    this.button.onclick = () => this.togglePanel();

    this.panel = this.buildPanel();
    this.container = document.createElement('div');
    this.container.appendChild(this.button);
    this.container.appendChild(this.panel);
    document.body.appendChild(this.container);

    this.panel.style.display = 'none';
  }

  private buildPanel(): HTMLDivElement {
    const panel = document.createElement('div');
    panel.className = 'kkw-panel';

    const title = document.createElement('strong');
    title.textContent = 'Send feedback';
    panel.appendChild(title);

    const chips = document.createElement('div');
    chips.className = 'kkw-chips';
    for (const [type, label] of [['bug', 'Bug'], ['idea', 'Idea'], ['other', 'Other']] as const) {
      const chip = document.createElement('button');
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
    submitBtn.className = 'kkw-submit';
    submitBtn.textContent = 'Submit';
    panel.appendChild(submitBtn);

    const msgDiv = document.createElement('div');
    msgDiv.className = 'kkw-msg';
    panel.appendChild(msgDiv);

    const privacy = document.createElement('p');
    privacy.className = 'kkw-privacy';
    privacy.textContent = 'Bug reports include technical diagnostics (console logs). ';
    const privacyLink = document.createElement('a');
    privacyLink.href = '/privacy';
    privacyLink.target = '_blank';
    privacyLink.rel = 'noopener noreferrer';
    privacyLink.textContent = 'Privacy policy';
    privacy.appendChild(privacyLink);
    privacy.appendChild(document.createTextNode('.'));
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
    if (msg) { msg.textContent = text; msg.style.color = isError ? '#c00' : '#090'; }
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

  isVisible(): boolean { return this.visible; }

  showButton(): void { if (this.button) this.button.style.display = ''; }
  hideButton(): void { if (this.button) this.button.style.display = 'none'; }

  destroy(): void {
    this.container?.remove();
    this.container = null;
    this.button = null;
    this.panel = null;
    this.visible = false;
  }
}
