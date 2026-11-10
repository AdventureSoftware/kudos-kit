'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Button, Card, FormError, Input, Label } from '@/components/ui';
import { addProject } from '@/app/(dashboard)/projects/actions';
import { KEY_PATTERN, NAME_MAX, PREFIX_PATTERN, suggestKey, suggestPrefix } from '@/lib/projects';

/**
 * Owners and admins add a project. Key and prefix are filled in from the name
 * until someone edits them, and can't be changed once the project exists.
 */
export function AddProjectForm({ takenPrefixes }: { takenPrefixes: string[] }) {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [prefix, setPrefix] = useState('');
  const [keyEdited, setKeyEdited] = useState(false);
  const [prefixEdited, setPrefixEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const keyOk = KEY_PATTERN.test(key);
  const prefixOk = PREFIX_PATTERN.test(prefix);
  const prefixTaken = takenPrefixes.includes(prefix);

  function onName(value: string) {
    setName(value);
    if (!keyEdited) setKey(suggestKey(value));
    if (!prefixEdited) setPrefix(suggestPrefix(value, takenPrefixes));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setAdded(null);
    if (!keyOk) return setError('The key may use lower-case letters, digits and dashes, starting with a letter or digit.');
    if (!prefixOk) return setError('The prefix is a letter followed by up to 4 letters or digits, e.g. CP.');
    if (prefixTaken) return setError(`The prefix ${prefix} is already used by another project.`);
    const input = { name: name.trim(), key, prefix };
    start(async () => {
      const result = await addProject(input);
      if (result.error) return setError(result.error);
      setAdded(input.name);
      setName('');
      setKey('');
      setPrefix('');
      setKeyEdited(false);
      setPrefixEdited(false);
    });
  }

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold">Add a project</h2>
      <p className="mt-1 text-muted">One for each app or website that gets the feedback button.</p>

      <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)_6rem_auto] sm:items-end">
        <div>
          <Label htmlFor="project-name">Name</Label>
          <Input
            id="project-name"
            required
            maxLength={NAME_MAX}
            value={name}
            onChange={(e) => onName(e.target.value)}
            placeholder="e.g. Colorpage"
            autoComplete="off"
          />
        </div>
        <div>
          <Label htmlFor="project-key">Key</Label>
          <Input
            id="project-key"
            required
            maxLength={40}
            value={key}
            onChange={(e) => {
              setKeyEdited(true);
              setKey(e.target.value.toLowerCase().replace(/\s+/g, '-'));
            }}
            placeholder="e.g. colorpage"
            spellCheck={false}
            autoComplete="off"
            aria-invalid={key !== '' && !keyOk}
            className="font-mono"
          />
        </div>
        <div>
          <Label htmlFor="project-prefix">Prefix</Label>
          <Input
            id="project-prefix"
            required
            maxLength={5}
            value={prefix}
            onChange={(e) => {
              setPrefixEdited(true);
              setPrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
            }}
            placeholder="e.g. CP"
            spellCheck={false}
            autoComplete="off"
            aria-invalid={prefix !== '' && (!prefixOk || prefixTaken)}
            className="font-mono"
          />
        </div>
        <Button type="submit" variant="primary" disabled={pending || !name.trim() || !key || !prefix}>
          {pending ? 'Adding…' : 'Add project'}
        </Button>
      </form>

      <p className="mt-2 text-xs text-muted">
        <strong className="font-semibold">Key</strong> goes in the widget code on the site
        {key && keyOk ? <> (<code className="font-mono">project: &apos;{key}&apos;</code>)</> : null}.{' '}
        <strong className="font-semibold">Prefix</strong> numbers its reports
        {prefix && prefixOk ? ` (${prefix}-1, ${prefix}-2…)` : ''}. Neither can be changed later; the name can.
      </p>

      <FormError message={error} className="mt-3" />
      {added && (
        <p role="status" className="mt-3 rounded-ui bg-success-soft px-3 py-2 text-success">
          {added} added. Get its install code on the{' '}
          <Link href="/widget" className="font-semibold underline underline-offset-2">Widget page</Link>.
        </p>
      )}
    </Card>
  );
}
