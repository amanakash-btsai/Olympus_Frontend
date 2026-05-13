export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatCurrency(amount: number | null | undefined, currency = 'THB'): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-TH', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatStatus(status: string): string {
  return status.replace(/_/g, ' ');
}

export function formatRole(role: string): string {
  return role.replace(/_/g, ' ');
}
