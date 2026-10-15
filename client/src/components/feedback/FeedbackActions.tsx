import { cycleStatus, deleteFeedback, deleteFeedbackAndClose, withdrawTestimonial } from '@/app/(dashboard)/actions';
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

/** When the sender asks us to stop using their praise publicly. */
export function WithdrawTestimonialButton({ id, label }: { id: string; label: string }) {
  return (
    <form action={withdrawTestimonial.bind(null, id)}>
      <ConfirmButton
        variant="danger"
        size="sm"
        title={`Withdraw consent for ${label}?`}
        message="Do this when the sender asks us to stop using their message publicly. The message stays in the inbox, but it can no longer be used as a testimonial and the name to show is removed. Also take it down from any page where it’s already published."
        confirmLabel="Withdraw consent"
        pendingLabel="Withdrawing…"
      >
        Withdraw consent
      </ConfirmButton>
    </form>
  );
}
