import { cycleStatus, deleteFeedback, deleteFeedbackAndClose } from '@/app/admin/actions';
import { Badge, ConfirmButton, statusTone } from '@/components/ui';

const NEXT_STATUS: Record<string, string> = { new: 'triaged', triaged: 'done', done: 'new' };

export function StatusButton({ id, status }: { id: string; status: string }) {
  return (
    <form action={cycleStatus.bind(null, id)}>
      <button
        type="submit"
        className="cursor-pointer rounded-full hover:opacity-80"
        title={`Mark as ${NEXT_STATUS[status] ?? 'new'}`}
      >
        <Badge tone={statusTone[status] ?? 'neutral'}>{status}</Badge>
      </button>
    </form>
  );
}

export function DeleteButton({ id, label, closeHref }: { id: string; label: string; closeHref?: string }) {
  const action = closeHref ? deleteFeedbackAndClose.bind(null, id, closeHref) : deleteFeedback.bind(null, id);
  return (
    <form action={action}>
      <ConfirmButton
        variant="danger"
        size="sm"
        title={`Delete ${label}?`}
        message="It will be removed permanently, including its console logs and errors. This cannot be undone."
        confirmLabel="Delete"
        pendingLabel="Deleting…"
      >
        Delete
      </ConfirmButton>
    </form>
  );
}
