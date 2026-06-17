/** Company email domain. New accounts sign in as <username>@airocean.com. */
export const COMPANY_EMAIL_DOMAIN = "airocean.com";

/** Build the company email from a username (idempotent if a full email is given). */
export function emailFromUsername(input: string): string {
  const v = input.trim().toLowerCase();
  return v.includes("@") ? v : `${v}@${COMPANY_EMAIL_DOMAIN}`;
}
