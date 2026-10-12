'use client';

import { useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from './Button';
import { ConfirmDialog } from './ConfirmDialog';

type ButtonProps = React.ComponentProps<typeof Button>;

interface ConfirmButtonProps extends Omit<ButtonProps, 'onClick' | 'type'> {
  title: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  pendingLabel?: string;
  tone?: 'primary' | 'danger';
}

/**
 * A button inside a <form> that asks for confirmation in a dialog,
 * then submits that form. Works with server actions.
 */
export function ConfirmButton({
  title,
  message,
  confirmLabel,
  pendingLabel,
  tone = 'danger',
  children,
  disabled,
  ...rest
}: ConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const { pending } = useFormStatus();

  return (
    <>
      <Button ref={ref} type="button" disabled={disabled || pending} onClick={() => setOpen(true)} {...rest}>
        {pending && pendingLabel ? pendingLabel : children}
      </Button>
      <ConfirmDialog
        open={open}
        title={title}
        message={message}
        confirmLabel={confirmLabel}
        tone={tone}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          ref.current?.form?.requestSubmit();
        }}
      />
    </>
  );
}
