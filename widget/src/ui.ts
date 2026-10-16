import { FeedbackConfig, FeedbackKind, FeedbackTheme } from './types';
import { buildCss, mergeTheme, resolveMode } from './theme';

type Step = 'choose' | 'write' | 'done';

interface KindCopy {
  label: string;
  hint: string;
  title: string;
  field: string;
  placeholder: string;
  thanks: string;
  icon: string;
}


const KINDS: Record<FeedbackKind, KindCopy> = {
  bug: {
    label: 'Bug', hint: 'Something isn’t working',
    title: 'Report a bug', field: 'What went wrong?',
    placeholder: 'What did you do, what did you expect, and what happened instead?',
    thanks: 'We’ll look into it.',
    icon: '<path d="M8 6.5V5a4 4 0 0 1 8 0v1.5"/><rect x="6" y="6.5" width="12" height="13" rx="6"/><path d="M12 10v9.5M6 12H2.5M21.5 12H18M6.5 17l-3 2M17.5 17l3 2M6.5 8 4 6M17.5 8 20 6"/>',
  },
  idea: {
    label: 'Idea', hint: 'A suggestion',
    title: 'Share an idea', field: 'Your idea',
    placeholder: 'What would make this better for you?',
    thanks: 'Ideas like this shape what we build next.',
    icon: '<path d="M9 18h6M10 21.5h4"/><path d="M12 2.5a6.5 6.5 0 0 0-4 11.6c.6.5 1 1.3 1 2.1v.3h6v-.3c0-.8.4-1.6 1-2.1a6.5 6.5 0 0 0-4-11.6z"/>',
  },
  praise: {
    label: 'Praise', hint: 'Something you like',
    title: 'Send praise', field: 'What do you like?',
    placeholder: 'Tell us what works well for you.',
    thanks: 'That made our day.',
    icon: '<path d="M12 20.5s-8.5-4.9-8.5-11A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 8.5 2.9c0 6.1-8.5 11-8.5 11z"/>',
  },
  other: {
    label: 'Other', hint: 'Anything else',
    title: 'Send feedback', field: 'Message',
    placeholder: 'What’s on your mind?',
    thanks: 'We read every message.',
    icon: '<path d="M4 5.5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-5 4v-4H4a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1z"/><path d="M8 10.5h8M8 13.5h5"/>',
  },
};


const CHAT_ICON = '<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/>';

const BRAND_MARK =
  '<svg class="kkw-brand-mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path fill="currentColor" d="M32 6a24 24 0 1 1-12.6 44.4L8 56l4.6-11.6A24 24 0 0 1 32 6z"/></svg>';
const BRAND_URL = 'https://kudoskit.io';

const svg = (inner: string, cls: string) =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

let idCounter = 0;
const uid = (name: string) => `kkw-${name}-${++idCounter}`;

export class FeedbackUI {
  private container: HTMLDivElement | null = null;
  private button: HTMLButtonElement | null = null;
  private panel: HTMLDivElement | null = null;
  private styleEl: HTMLStyleElement | null = null;
  private visible = false;

  private step: Step = 'choose';
  private kind: FeedbackKind | null = null;
  private views = {} as Record<Step, HTMLElement>;
  private refs = {} as {
    title: HTMLElement;
    ratingBox: HTMLElement;
    ratingInputs: HTMLInputElement[];
    fieldLabel: HTMLLabelElement;
    textarea: HTMLTextAreaElement;
    email: HTMLInputElement;
    consentBox: HTMLElement;
    consent: HTMLInputElement;
    nameBox: HTMLElement;
    name: HTMLInputElement;
    hp: HTMLInputElement;
    turnstile: HTMLElement;
    submit: HTMLButtonElement;
    msg: HTMLElement;
    privacy: HTMLElement;
    privacyText: Text;
    doneText: HTMLElement;
  };

  constructor(private config: FeedbackConfig) {}

  mount(): void {
    this.styleEl = document.createElement('style');
    this.styleEl.textContent = buildCss(this.config);
    document.head.appendChild(this.styleEl);

    this.button = el('button', 'kkw-btn');
    this.button.type = 'button';
    this.button.innerHTML = svg(CHAT_ICON, 'kkw-btn-icon');
    this.button.appendChild(el('span', undefined, 'Feedback'));
    this.button.setAttribute('aria-haspopup', 'dialog');
    this.button.onclick = () => this.togglePanel();

    this.panel = this.buildPanel();
    this.container = el('div', 'kkw-root');
    this.container.dataset.kkwMode = resolveMode(this.config.theme);
    this.container.appendChild(this.button);
    this.container.appendChild(this.panel);
    document.body.appendChild(this.container);

    this.panel.style.display = 'none';
  }



  private buildPanel(): HTMLDivElement {
    const panel = el('div', 'kkw-panel');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Send feedback');
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); this.hidePanel(); this.button?.focus(); }
    });

    this.views.choose = this.buildChooseStep();
    this.views.write = this.buildWriteStep();
    this.views.done = this.buildDoneStep();
    panel.append(this.views.choose, this.views.write, this.views.done);
    if (this.config.branding !== false) panel.appendChild(this.buildBranding());
    this.showStep('choose');
    return panel;
  }

  private buildChooseStep(): HTMLElement {
    const view = el('div', 'kkw-step');
    const titleId = uid('choose-title');
    const band = el('div', 'kkw-band');
    const title = el('strong', 'kkw-title', 'Send feedback');
    title.id = titleId;
    const sub = el('p', 'kkw-sub', 'What would you like to share?');
    band.append(title, sub);

    const grid = el('div', 'kkw-types');
    grid.setAttribute('role', 'group');
    grid.setAttribute('aria-labelledby', titleId);
    for (const kind of Object.keys(KINDS) as FeedbackKind[]) {
      const copy = KINDS[kind];
      const btn = el('button', 'kkw-type');
      btn.type = 'button';
      btn.dataset.type = kind;
      btn.innerHTML = svg(copy.icon, 'kkw-type-icon');
      btn.append(el('strong', undefined, copy.label), el('span', 'kkw-hint', copy.hint));
      btn.onclick = () => this.choose(kind);
      grid.appendChild(btn);
    }

    view.append(band, grid);
    return view;
  }

  private buildWriteStep(): HTMLElement {
    const view = el('div', 'kkw-step');

    const head = el('div', 'kkw-head kkw-band');
    const back = el('button', 'kkw-back', '‹');
    back.type = 'button';
    back.setAttribute('aria-label', 'Back: choose another type');
    back.title = 'Choose another type';
    back.onclick = () => this.goBack();
    const title = el('strong', 'kkw-title');
    head.append(back, title);


    const ratingBox = el('fieldset', 'kkw-rating');
    const legend = el('legend', 'kkw-label', `How would you rate ${this.config.appName?.trim() || 'your experience'}? (optional)`);
    const stars = el('div', 'kkw-stars');
    const ratingName = uid('rating');
    const ratingInputs: HTMLInputElement[] = [];
    for (let value = 5; value >= 1; value--) {
      const input = el('input', 'kkw-star-input');
      input.type = 'radio';
      input.name = ratingName;
      input.value = String(value);
      input.id = `${ratingName}-${value}`;
      const label = el('label', 'kkw-star');
      label.htmlFor = input.id;
      label.title = `${value} of 5`;
      label.innerHTML = svg('<path d="M12 2.8l2.8 5.7 6.3.9-4.6 4.4 1.1 6.2L12 17.1 6.4 20l1.1-6.2-4.6-4.4 6.3-.9z"/>', 'kkw-star-icon');
      label.appendChild(el('span', 'kkw-sr', `${value} star${value === 1 ? '' : 's'}`));

      label.addEventListener('mousedown', () => { label.dataset.wasChecked = String(input.checked); });
      label.addEventListener('click', (e) => {
        if (label.dataset.wasChecked === 'true') { e.preventDefault(); input.checked = false; this.updateConsentNudge(); }
        delete label.dataset.wasChecked;
      });
      input.addEventListener('change', () => this.updateConsentNudge());
      stars.append(input, label);
      ratingInputs.push(input);
    }

    stars.addEventListener('keydown', (e) => {
      const step = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      const current = Number(ratingInputs.find((i) => i.checked)?.value ?? 0);
      const next = ratingInputs.find((i) => Number(i.value) === Math.min(5, Math.max(1, current + step)));
      if (next) { next.checked = true; next.focus(); this.updateConsentNudge(); }
    });
    ratingBox.append(legend, stars);

    const msgId = uid('message');
    const fieldLabel = el('label', 'kkw-label');
    fieldLabel.htmlFor = msgId;
    const textarea = el('textarea', 'kkw-textarea');
    textarea.id = msgId;
    textarea.maxLength = 5000;
    textarea.required = true;

    const emailId = uid('email');
    const emailLabel = el('label', 'kkw-label', 'Email (optional)');
    emailLabel.htmlFor = emailId;
    const email = el('input', 'kkw-input');
    email.id = emailId;
    email.type = 'email';
    email.autocomplete = 'email';
    email.placeholder = 'you@example.com';

    // Praise only: consent to use the message as a testimonial, then an optional name.
    // Never ticked for the user. With 4–5 stars it gets a tint, a friendly line and a short pulse.
    const consentBox = el('label', 'kkw-consent');
    const consent = el('input');
    consent.type = 'checkbox';
    const consentText = el('span');
    consentText.append(
      el('strong', 'kkw-consent-lead', 'Glad you like it! May we share your words?'),
      document.createTextNode('You may show my message publicly as a testimonial.'),
      el('small', undefined, 'Optional. You can withdraw this at any time.'),
    );
    consentBox.append(consent, consentText);
    consentBox.addEventListener('animationend', () => consentBox.classList.remove('kkw-pulse'));

    const nameBox = el('div', 'kkw-hidden');
    const nameId = uid('name');
    const nameLabel = el('label', 'kkw-label', 'Name to show (optional)');
    nameLabel.htmlFor = nameId;
    const name = el('input', 'kkw-input');
    name.id = nameId;
    name.type = 'text';
    name.maxLength = 80;
    name.autocomplete = 'name';
    name.placeholder = 'e.g. Maria, illustrator';
    nameBox.append(nameLabel, name, el('p', 'kkw-note', 'Leave empty to appear as Anonymous.'));
    consent.onchange = () => {
      nameBox.classList.toggle('kkw-hidden', !consent.checked);
      if (consent.checked) name.focus();
      this.updateConsentNudge();
    };

    const hp = el('input', 'kkw-hp');
    hp.type = 'text';
    hp.style.display = 'none';
    hp.tabIndex = -1;
    hp.autocomplete = 'off';
    hp.setAttribute('aria-hidden', 'true');

    const turnstile = el('div', 'kkw-turnstile');

    const submit = el('button', 'kkw-submit', 'Send');
    submit.type = 'button';

    const msg = el('div', 'kkw-msg');
    msg.setAttribute('role', 'status');
    msg.setAttribute('aria-live', 'polite');

    const privacy = el('p', 'kkw-privacy');
    const privacyText = document.createTextNode('');
    privacy.appendChild(privacyText);
    if (this.config.privacyUrl) {
      const link = el('a', undefined, 'Privacy policy');
      link.href = this.config.privacyUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      privacy.append(link, document.createTextNode('.'));
    }

    view.append(head, ratingBox, fieldLabel, textarea, emailLabel, email, consentBox, nameBox, hp, turnstile, submit, msg, privacy);
    this.refs = {
      ...this.refs,
      title, ratingBox, ratingInputs, fieldLabel, textarea, email, consentBox, consent, nameBox, name, hp, turnstile, submit, msg, privacy, privacyText,
    };
    return view;
  }

  private buildDoneStep(): HTMLElement {
    const view = el('div', 'kkw-step kkw-done');
    view.innerHTML = svg('<circle cx="12" cy="12" r="9.5"/><path d="m7.5 12.5 3 3 6-6.5"/>', 'kkw-done-icon');
    const title = el('strong', 'kkw-title', 'Thanks for your feedback!');
    const text = el('p', 'kkw-sub');
    const again = el('button', 'kkw-link-btn', 'Send more feedback');
    again.type = 'button';
    again.onclick = () => this.reset();
    view.append(title, text, again);
    this.refs = { ...this.refs, doneText: text };
    return view;
  }

  private buildBranding(): HTMLElement {
    const link = el('a', 'kkw-brand');
    link.href = BRAND_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.innerHTML = BRAND_MARK;
    link.appendChild(document.createTextNode('Powered by Kudos Kit'));
    return link;
  }


  private showStep(step: Step): void {
    this.step = step;
    for (const [name, view] of Object.entries(this.views)) view.classList.toggle('kkw-hidden', name !== step);
  }

  private markChosen(kind: FeedbackKind | null): void {
    this.panel?.querySelectorAll<HTMLElement>('.kkw-type').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.type === kind));
    });
  }


  private updateConsentNudge(): void {
    const box = this.refs.consentBox;
    if (!box) return;
    const happy = this.kind === 'praise' && (this.getRating() ?? 0) >= 4 && !this.refs.consent.checked;
    const was = box.classList.contains('kkw-consent-hi');
    box.classList.toggle('kkw-consent-hi', happy);
    if (happy && !was) {
      box.classList.remove('kkw-pulse');
      void box.offsetWidth; // restart the animation
      box.classList.add('kkw-pulse');
    }
    if (!happy) box.classList.remove('kkw-pulse');
  }


  private hasDraft(): boolean {
    const r = this.refs;
    return Boolean(
      r.textarea.value.trim() || r.email.value.trim() || r.name.value.trim() ||
      r.consent.checked || r.ratingInputs.some((i) => i.checked),
    );
  }

  private choose(kind: FeedbackKind): void {
    this.kind = kind;
    this.markChosen(kind);
    const copy = KINDS[kind];
    const r = this.refs;
    r.title.textContent = copy.title;
    r.fieldLabel.textContent = `${copy.field} *`;
    r.textarea.placeholder = copy.placeholder;
    r.ratingBox.classList.toggle('kkw-hidden', kind === 'bug');
    r.consentBox.classList.toggle('kkw-hidden', kind !== 'praise');
    r.nameBox.classList.toggle('kkw-hidden', !(kind === 'praise' && r.consent.checked));
    r.privacyText.textContent = kind === 'bug' ? 'Bug reports include technical diagnostics (console logs). ' : '';
    r.privacy.classList.toggle('kkw-hidden', kind !== 'bug' && !this.config.privacyUrl);
    this.showMessage('');
    this.showStep('write');
    this.updateConsentNudge();
    r.textarea.focus();
  }

  private goBack(): void {
    this.showMessage('');
    this.showStep('choose');
    this.panel?.querySelector<HTMLElement>(`.kkw-type[data-type="${this.kind}"]`)?.focus();
  }


  showDone(): void {
    this.refs.doneText.textContent = this.kind ? KINDS[this.kind].thanks : '';
    this.showStep('done');
    this.panel?.querySelector<HTMLElement>('.kkw-link-btn')?.focus();
  }

  reset(): void {
    const r = this.refs;
    r.textarea.value = '';
    r.email.value = '';
    r.consent.checked = false;
    r.ratingInputs.forEach((i) => { i.checked = false; });
    r.name.value = '';
    r.nameBox.classList.add('kkw-hidden');
    r.consentBox.classList.remove('kkw-consent-hi', 'kkw-pulse');
    r.hp.value = '';
    this.kind = null;
    this.markChosen(null);
    this.showMessage('');
    this.setSubmitState(false);
    this.showStep('choose');
    this.panel?.querySelector<HTMLElement>('.kkw-type')?.focus();
  }


  getSelectedType(): FeedbackKind | null { return this.kind; }

  getMessage(): string { return this.refs.textarea.value.trim(); }

  getEmail(): string { return this.refs.email.value.trim(); }

  getHoneypot(): string { return this.refs.hp.value; }


  getRating(): number | null {
    if (this.kind === 'bug') return null;
    const checked = this.refs.ratingInputs.find((i) => i.checked);
    return checked ? Number(checked.value) : null;
  }


  getTestimonial(): { ok: boolean; name: string } {
    const ok = this.kind === 'praise' && this.refs.consent.checked;
    return { ok, name: ok ? this.refs.name.value.trim() : '' };
  }

  setSubmitState(loading: boolean): void {
    this.refs.submit.disabled = loading;
    this.refs.submit.textContent = loading ? 'Sending…' : 'Send';
  }

  showMessage(text: string, isError = false): void {
    const msg = this.refs.msg;
    msg.textContent = text;
    msg.classList.toggle('kkw-err', isError && text !== '');
    msg.classList.toggle('kkw-ok', !isError && text !== '');
  }

  getTurnstileContainer(): HTMLElement | null { return this.refs.turnstile ?? null; }

  getSubmitButton(): HTMLButtonElement | null { return this.refs.submit ?? null; }

  // ---------------------------------------------------------------- visibility

  togglePanel(): void { this.visible ? this.hidePanel() : this.showPanel(); }

  showPanel(): void {
    if (this.panel && !this.visible) {
      this.panel.style.display = 'block';
      this.visible = true;
      this.button?.setAttribute('aria-expanded', 'true');
    }
  }

  hidePanel(): void {
    if (this.panel && this.visible) {
      this.panel.style.display = 'none';
      this.visible = false;
      this.button?.setAttribute('aria-expanded', 'false');
      // Next time: fresh after sending, or when nothing was entered yet (just a type picked).
      // Anything typed or chosen is kept as a draft, so an accidental close loses nothing.
      if (this.step === 'done') this.reset();
      else if (this.step === 'write' && !this.hasDraft()) {
        this.kind = null;
        this.markChosen(null);
        this.showMessage('');
        this.showStep('choose');
      }
    }
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
    this.step = 'choose';
    this.kind = null;
  }
}
