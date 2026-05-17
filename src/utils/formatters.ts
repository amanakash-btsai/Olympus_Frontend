// ─────────────────────────────────────────────────────────────────────────────
// FILE: utils/formatters.ts
// Pure formatting functions used in table cells, detail pages, and forms.
// These convert raw data values into display-friendly strings.
//
// formatDate      — "2025-05-16T00:00:00Z" → "16 May 2025"
// formatDateTime  — same but includes hours and minutes
// formatCurrency  — 150000 → "฿150,000" (Thai Baht by default)
// formatStatus    — "Waiting_Approval" → "Waiting Approval" (for display)
// formatRole      — "EQC_Manager" → "EQC Manager"
// ─────────────────────────────────────────────────────────────────────────────

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
