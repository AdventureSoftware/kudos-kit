export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="px-4 py-16 text-center">
      <p className="font-medium text-text">{title}</p>
      {hint && <p className="mt-1 text-muted">{hint}</p>}
    </div>
  );
}
