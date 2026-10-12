'use client';

import { Button } from './Button';

/** A submit button that asks for confirmation before its form is submitted. */
export function ConfirmButton({
  message,
  children,
  ...rest
}: React.ComponentProps<typeof Button> & { message: string }) {
  return (
    <Button
      type="submit"
      {...rest}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </Button>
  );
}
