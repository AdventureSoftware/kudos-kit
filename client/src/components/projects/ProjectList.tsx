import Link from 'next/link';
import { Badge, Card, EmptyState, Table, Td, Th, Tr } from '@/components/ui';
import type { Project } from '@/lib/projects';
import { ActiveToggle, ProjectName } from './ProjectControls';

const countFmt = new Intl.NumberFormat('en-GB');

/** Every project. Owners and admins can rename and turn projects on or off right in the table. */
export function ProjectList({ projects, manage }: { projects: Project[]; manage: boolean }) {
  return (
    <Card className="overflow-hidden">
      <h2 className="px-5 pt-4 pb-3 text-sm font-semibold">All projects</h2>
      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet."
          hint={manage ? 'Add the first one above.' : 'Ask an owner or admin to add one.'}
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th className="w-40">Key</Th>
              <Th className="w-24">Prefix</Th>
              <Th className="w-24 text-right">Reports</Th>
              <Th className="w-28">Status</Th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <Tr key={p.key} className={p.active ? undefined : 'text-muted'}>
                <Td className="font-medium text-text">
                  {manage ? <ProjectName projectKey={p.key} name={p.name} /> : p.name}
                </Td>
                <Td><code className="font-mono text-xs">{p.key}</code></Td>
                <Td><Badge tone="neutral" className="font-mono">{p.prefix}</Badge></Td>
                <Td className="text-right tabular-nums">
                  {p.reports > 0 ? (
                    <Link href={`/feedback?project=${encodeURIComponent(p.key)}`} className="text-accent hover:text-accent-hover hover:underline">
                      {countFmt.format(p.reports)}
                    </Link>
                  ) : (
                    <span className="text-muted">0</span>
                  )}
                </Td>
                <Td>
                  {manage ? (
                    <ActiveToggle projectKey={p.key} name={p.name} active={p.active} />
                  ) : (
                    <Badge tone={p.active ? 'success' : 'neutral'}>{p.active ? 'On' : 'Off'}</Badge>
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
      <p className="border-t border-border px-5 py-3 text-xs text-muted">
        A project that is off stops accepting new feedback; what it already has stays here. Projects can’t be
        deleted, because their reports keep their numbers.
      </p>
    </Card>
  );
}
