const STEPS = [
  {
    title: 'Add one script',
    text: 'Paste a short snippet into your site or app. On the Widget page you pick colours, light or dark, and where the button sits, then copy the code.',
  },
  {
    title: 'Your users speak up',
    text: 'The Feedback button opens a small panel: bug, idea, praise or something else. It takes seconds and needs no account.',
  },
  {
    title: 'Your team follows up',
    text: 'Everything lands in one inbox. Triage it, mark it done, and copy the best praise as a quote for your website.',
  },
];

const SNIPPET = `<script src="https://feedback.example.com/kkw.js"></script>
<script>
  Feedback.init({
    project: 'my-app',
    turnstileSiteKey: '0x4AAAA…',
    theme: { mode: 'auto', accent: '#c2410c' },
  });
</script>`;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-20">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-bold tracking-wide text-accent uppercase">How it works</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-balance">Up and running in an afternoon.</h2>
          <ol className="mt-8 space-y-6">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-accent-contrast">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="mt-1 leading-relaxed text-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <figure className="overflow-hidden rounded-xl border border-[#2a2420] bg-[#1c1917] shadow-xl">
          <figcaption className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 text-xs text-[#ada39b]">
            <span>index.html</span>
            <span>One script, no dependencies</span>
          </figcaption>
          <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-[#f0ebe7]">
            <code>{SNIPPET}</code>
          </pre>
        </figure>
      </div>
    </section>
  );
}
