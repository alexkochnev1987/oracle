/**
 * Whitelist of users allowed to use AI image analysis
 * Currently hardcoded, can be moved to database or environment variables later
 */
const ALLOWED_EMAILS = [
  "alexkochnev1987@gmail.com",
  "aliaksandr.kochneu@innowise.com",
] as const;

/**
 * Check if a user email is allowed to use AI image analysis
 * @param email - User email address
 * @returns true if user is allowed, false otherwise
 */
export function isUserAllowedForAI(
  email: string | null | undefined
): boolean {
  if (!email) {
    return false;
  }

  return ALLOWED_EMAILS.includes(email as any);
}

