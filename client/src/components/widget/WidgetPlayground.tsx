'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Label, MenuSelect } from '@/components/ui';
import { installSnippet, widgetConfig } from './snippet';
import type { WidgetMode, WidgetPosition, WidgetProject, WidgetSettings } from './types';

const MODES: Array<{ value: WidgetMode; label: string }> = [
  { value: 'auto', label: 'Follow the device' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];
const POSITIONS: Array<{ value: WidgetPosition; label: string }> = [
  { value: 'bottom-right', label: 'Bottom right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'top-right', label: 'Top right' },
  { value: 'top-left', label: 'Top left' },
];
const HEX = /^#[0-9a-fA-F]{6}$/;

interface WidgetPlaygroundProps {
  projects: WidgetProject[];
  turnstileSiteKey: string;
}


export function WidgetPlayground({ projects, turnstileSiteKey }: WidgetPlaygroundProps) {
  const [settings, setSettings] = useState<WidgetSettings>({
    project: projects[0]?.key ?? '',
    mode: 'auto',
    accent: '#c2410c',
    radius: 8,
    position: 'bottom-right',
  });
  const [accentText, setAccentText] = useState(settings.accent);
  const [origin, setOrigin] = useState('');
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const started = useRef<string | null>(null);
  const set = (patch: Partial<WidgetSettings>) => setSettings((s) => ({ ...s, ...patch }));


  useEffect(() => {
    setOrigin(window.location.origin);
    if (window.Feedback) return setReady(true);
    const script = document.createElement('script');
    script.src = '/kkw.js';
    script.onload = () => setReady(true);
    document.body.appendChild(script);
  }, []);


  const restartKey = `${settings.project}|${settings.position}`;
  useEffect(() => {
    const feedback = window.Feedback;
    if (!ready || !feedback || !origin || !settings.project) return;
    feedback.destroy();
    feedback.init(widgetConfig(settings, origin, turnstileSiteKey));
    started.current = restartKey;
    return () => feedback.destroy(); // leave no widget behind on other pages
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, origin, restartKey, turnstileSiteKey]);

  useEffect(() => {
    if (started.current === restartKey) {
      window.Feedback?.setTheme({ mode: settings.mode, accent: settings.accent, radius: settings.radius });
    }
  }, [settings.mode, settings.accent, settings.radius, restartKey]);

  const snippet = useMemo(
    () => (origin ? installSnippet(settings, origin, turnstileSiteKey) : ''),
    [settings, origin, turnstileSiteKey],
  );

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  if (projects.length === 0) {
    return (
      <Card className="p-5">
        <p className="font-medium">No active projects yet.</p>
        <p className="mt-1 text-muted">Add one to the projects table (see db/seed.sql), then come back here.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <Card className="space-y-4 self-start p-5">
        <h2 className="text-sm font-semibold">Look</h2>
        <div>
          <span aria-hidden className="mb-1.5 block text-xs font-medium text-muted">Project</span>
          <MenuSelect
            label="Project"
            className="w-full"
            value={settings.project}
            options={projects.map((p) => ({ value: p.key, label: `${p.name} (${p.prefix})` }))}
            onChange={(project) => set({ project })}
          />
        </div>
        <div>
          <span aria-hidden className="mb-1.5 block text-xs font-medium text-muted">Light or dark</span>
          <MenuSelect label="Light or dark" className="w-full" value={settings.mode} options={MODES} onChange={(mode) => set({ mode })} />
        </div>
        <div>
          <Label htmlFor="accent">Main color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label="Pick the main color"
              value={settings.accent}
              onChange={(e) => {
                set({ accent: e.target.value });
                setAccentText(e.target.value);
              }}
              className="h-9 w-12 cursor-pointer rounded-ui border border-border bg-surface p-1"
            />
            <input
              id="accent"
              value={accentText}
              onChange={(e) => {
                setAccentText(e.target.value);
                if (HEX.test(e.target.value)) set({ accent: e.target.value.toLowerCase() });
              }}
              maxLength={7}
              spellCheck={false}
              className="h-9 w-28 rounded-ui border border-border bg-surface px-3 font-mono text-sm text-text focus:border-accent focus:outline-none"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="radius">Corner rounding: {settings.radius}px</Label>
          <input
            id="radius"
            type="range"
            min={0}
            max={24}
            value={settings.radius}
            onChange={(e) => set({ radius: Number(e.target.value) })}
            className="w-full accent-[var(--accent)]"
          />
        </div>
        <div>
          <span aria-hidden className="mb-1.5 block text-xs font-medium text-muted">Position</span>
          <MenuSelect label="Position" className="w-full" value={settings.position} options={POSITIONS} onChange={(position) => set({ position })} />
        </div>
        <Button className="w-full" onClick={() => window.Feedback?.show()} disabled={!ready}>
          Open the widget
        </Button>
      </Card>

      <div className="min-w-0 space-y-6">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Install on your site</h2>
            <Button
              size="sm"
              disabled={!snippet}
              onClick={async () => {
                await navigator.clipboard.writeText(snippet);
                setCopied(true);
              }}
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </Button>
          </div>
          <p className="mt-1 text-muted">
            Paste this just before <code className="font-mono text-xs">&lt;/body&gt;</code> on every page of the site. Changes on the left update it.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-ui bg-surface-muted p-4 font-mono text-xs leading-relaxed text-text">
            <code>{snippet || 'Loading…'}</code>
          </pre>
          <p className="mt-3 text-xs text-muted">
            If the site sets a Content-Security-Policy, allow scripts from <code className="font-mono">{origin || 'this address'}</code> and{' '}
            <code className="font-mono">https://challenges.cloudflare.com</code> (the spam check), and connections to{' '}
            <code className="font-mono">{origin || 'this address'}</code>.
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold">Try a bug report</h2>
          <p className="mt-1 text-muted">
            Create some console activity, then open the widget, choose <strong>Bug</strong> and send. The report shows
            what was captured, with the password hidden. It lands in the{' '}
            <strong>{projects.find((p) => p.key === settings.project)?.name}</strong> inbox like a real one, so delete it afterwards.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => console.info('Demo: the user opened the export dialog')}>Log a message</Button>
            <Button size="sm" onClick={() => console.error('Demo: failed to load /api/projects (500)')}>Log an error</Button>
            <Button size="sm" onClick={() => console.log('Demo: signing in', { email: 'demo@example.com', password: 'hunter2-secret' })}>
              Log a password
            </Button>
            <Button
              size="sm"
              onClick={() => setTimeout(() => { throw new Error('Demo: something crashed'); }, 0)}
            >
              Throw an error
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
