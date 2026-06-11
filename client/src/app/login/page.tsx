import { loginAction } from './actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = Boolean(params.error);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#fafaf9' }}>
      <form
        action={loginAction}
        style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, padding: 32, width: 320 }}
      >
        <h1 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 600 }}>Admin</h1>
        {hasError && (
          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#c00', background: '#fee2e2', borderRadius: 4, padding: '8px 10px' }}>
            Invalid password
          </p>
        )}
        <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Password</label>
        <input
          type="password"
          name="password"
          required
          autoFocus
          style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #e5e5e5', borderRadius: 4, padding: '8px 10px', fontSize: 13, marginBottom: 16 }}
        />
        <button
          type="submit"
          style={{ width: '100%', padding: '9px 0', background: '#111', color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
