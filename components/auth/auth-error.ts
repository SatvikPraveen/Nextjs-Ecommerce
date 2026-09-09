// File: components/auth/auth-error.ts

// Maps NextAuth error codes (from signIn() results and OAuth redirect
// `error` query params) to user-facing messages.
export function mapAuthError(code: string | null | undefined): string | null {
  if (!code) return null;

  switch (code) {
    case 'CredentialsSignin':
      return 'Invalid email or password.';
    case 'OAuthAccountNotLinked':
      return 'That email is already registered with a different sign-in method.';
    case 'AccessDenied':
      return 'Access denied.';
    case 'Verification':
      return 'The sign-in link is no longer valid.';
    default:
      return 'Something went wrong while signing in. Please try again.';
  }
}
