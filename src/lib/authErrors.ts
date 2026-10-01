export function friendlyAuthError(error: { message?: string; code?: string } | null | undefined): string {
  const msg = (error?.message || '').toLowerCase();
  const code = (error?.code || '').toLowerCase();
  if (code === 'invalid_credentials' || msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return "That email or password doesn't look right.";
  }
  if (code === 'user_already_exists' || code === 'email_exists' || msg.includes('already registered') || msg.includes('already exists')) {
    return 'An account with this email already exists — try signing in.';
  }
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return 'Please confirm your email first. Check your inbox.';
  }
  return 'Something went wrong. Please try again.';
}
