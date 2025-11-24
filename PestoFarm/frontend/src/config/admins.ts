// Admin email configuration helper
// Reads comma-separated admin emails from environment variable `REACT_APP_ADMIN_EMAILS`
// or from localStorage key `adminEmails`. Returns an array of lowercase emails.

export function getAdminEmails(): string[] {
  try {
    const env = process.env.REACT_APP_ADMIN_EMAILS || '';
    const stored = (typeof window !== 'undefined' && localStorage.getItem('adminEmails')) || '';
    const combined = [env, stored].filter(Boolean).join(',');
    const emails = combined
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    // Always include the default admin email
    if (!emails.includes('admin@pestofarm.com')) {
      emails.push('admin@pestofarm.com');
    }

    return emails;
  } catch (e) {
    return ['admin@pestofarm.com'];
  }
}

export function isAdminEmail(email?: string): boolean {
  if (!email) return false;
  const list = getAdminEmails();
  return list.includes(email.toLowerCase());
}
