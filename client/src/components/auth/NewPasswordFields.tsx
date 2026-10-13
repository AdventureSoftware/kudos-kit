import { Input, Label } from '@/components/ui';
import { MAX_PASSWORD, MIN_PASSWORD } from '@/lib/password';

interface NewPasswordFieldsProps {
  ids?: { password: string; confirm: string };
  label?: string;
  autoFocus?: boolean;
}


export function NewPasswordFields({ ids = { password: 'password', confirm: 'confirm' }, label = 'Password', autoFocus }: NewPasswordFieldsProps) {
  return (
    <>
      <div>
        <Label htmlFor={ids.password}>{label}</Label>
        <Input
          id={ids.password}
          name={ids.password}
          type="password"
          required
          autoFocus={autoFocus}
          minLength={MIN_PASSWORD}
          maxLength={MAX_PASSWORD}
          autoComplete="new-password"
        />
        <p className="mt-1 text-xs text-muted">At least {MIN_PASSWORD} characters.</p>
      </div>
      <div>
        <Label htmlFor={ids.confirm}>Repeat password</Label>
        <Input id={ids.confirm} name={ids.confirm} type="password" required autoComplete="new-password" />
      </div>
    </>
  );
}
