'use client'

/**
 * Statut de version web (sans Electron).
 * L'application fonctionne en mode web autonome avec stockage en mémoire/session.
 */

export interface EtatMiseAJour {
  phase: 'inactive' | 'a-jour'
  versionActuelle: string
}

export function useMiseAJour(): EtatMiseAJour | null {
  return null
}

export function BandeauMiseAJour(_props: { etat: EtatMiseAJour | null; donneesChargees: boolean }) {
  return null
}
