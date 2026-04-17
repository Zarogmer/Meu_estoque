export function formatCentavos(centavos: number): string {
  const reais = centavos / 100;
  return reais.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function reaisToCentavos(reais: number): number {
  return Math.round(reais * 100);
}

export function centavosToReais(centavos: number): number {
  return centavos / 100;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Phone formatting ──────────────────────────────────────────
// Standard brazilian phone mask used across the app:
//   "(11) 1234-5678"      — landline (10 digits)
//   "(11) 91234-5678"     — mobile (11 digits)
// Accepts either a digits-only string or any masked input; always
// re-masks based on the digit count so editing never corrupts the
// format. Returns "" when there are no digits so placeholders show.
export function formatPhone(value: string | null | undefined): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

// Strips the mask, returning only the digits. Use before persisting
// or before comparing two phones.
export function digitsOnly(value: string | null | undefined): string {
  if (!value) return '';
  return value.replace(/\D/g, '');
}
