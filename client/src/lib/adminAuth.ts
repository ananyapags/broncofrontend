// Admin authorization utilities
const ADMIN_EMAILS = [
  'apagadala@scu.edu',
  'cwkwong@scu.edu'
];

export function isAdminUser(userEmail: string | null | undefined): boolean {
  if (!userEmail) return false;
  return ADMIN_EMAILS.includes(userEmail.toLowerCase());
}

export function requireAdmin(userEmail: string | null | undefined): void {
  if (!isAdminUser(userEmail)) {
    throw new Error('Admin privileges required');
  }
}