'use client';

import { useRouter } from 'next/navigation';
import { MenuSelect } from '@/components/ui';

export function ProjectSwitcher({ projects, value, basePath }: { projects: string[]; value?: string; basePath: string }) {
  const router = useRouter();
  if (projects.length <= 1) return null;
  return (
    <MenuSelect
      label="Project"
      align="right"
      value={value ?? ''}
      options={[{ value: '', label: 'All projects' }, ...projects.map((p) => ({ value: p, label: p }))]}
      onChange={(p) => router.push(p ? `${basePath}?project=${encodeURIComponent(p)}` : basePath, { scroll: false })}
    />
  );
}
