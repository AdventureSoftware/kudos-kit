import { redirect } from 'next/navigation';
import { apiFetch, getMemberRole } from '@/lib/auth';
import { canManageProjects, type Project } from '@/lib/projects';
import { AddProjectForm } from '@/components/projects/AddProjectForm';
import { ProjectList } from '@/components/projects/ProjectList';
import { NewAppSteps } from '@/components/projects/NewAppSteps';

export const metadata = { title: 'Projects' };

export default async function ProjectsPage() {
  const [res, role] = await Promise.all([apiFetch('/v1/projects'), getMemberRole()]);
  if (res.status === 401) redirect('/login');
  if (!res.ok) throw new Error(`API error: projects ${res.status}`);
  const projects = (await res.json()) as Project[];
  const manage = canManageProjects(role);
  const active = projects.filter((p) => p.active).length;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Projects</h1>
        <p className="text-muted">
          The apps and sites that send feedback.{' '}
          {projects.length > 0 && `${active} on${projects.length > active ? `, ${projects.length - active} off` : ''}.`}
        </p>
      </div>

      {manage && <AddProjectForm takenPrefixes={projects.map((p) => p.prefix)} />}
      <ProjectList projects={projects} manage={manage} />
      {manage && <NewAppSteps />}
    </div>
  );
}
