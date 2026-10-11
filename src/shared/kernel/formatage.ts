/**
 * Fonctions de formatage partagées pour l'affichage (Kernel).
 */

export function fmtEntier(valeur: number | null | undefined): string {
  if (valeur == null || Number.isNaN(valeur)) return '—'
  return new Intl.NumberFormat('fr-FR').format(Math.round(valeur))
}

export function fmtPourcentage(valeur: number | null | undefined, decimales = 1): string {
  if (valeur == null || Number.isNaN(valeur)) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valeur)
}

export function fmtNombre(valeur: number | null | undefined, decimales = 2): string {
  if (valeur == null || Number.isNaN(valeur)) return '—'
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valeur)
}

export function fmtDate(valeur: string | Date | null | undefined): string {
  if (!valeur) return '—'
  const d = typeof valeur === 'string' ? new Date(valeur) : valeur
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

/** Tri textuel respectant les règles typographiques de la langue française */
export function comparerFr(a: string, b: string): number {
  return a.localeCompare(b, 'fr', { sensitivity: 'base' })
}
