
export function FormError({ message, className }: { message: string | null; className?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className={`rounded-ui bg-danger-soft px-3 py-2 text-danger ${className ?? ''}`}>
      {message}
    </p>
  );
}
