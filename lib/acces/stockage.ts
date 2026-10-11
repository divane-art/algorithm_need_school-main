/**
 * Conservation du registre des accès (mode Web sans Electron).
 */

import type { RegistreAcces } from '../../types/acces'
import { REGISTRE_VIDE, estRegistre } from './registre'

const CLE_NAVIGATEUR = 'algoplanr.acces'

export async function chargerRegistre(): Promise<RegistreAcces> {
  try {
    const brut: unknown = typeof window !== 'undefined' ? JSON.parse(window.localStorage.getItem(CLE_NAVIGATEUR) ?? 'null') : null
    return estRegistre(brut) ? brut : REGISTRE_VIDE
  } catch {
    return REGISTRE_VIDE
  }
}

export async function enregistrerRegistre(registre: RegistreAcces): Promise<void> {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CLE_NAVIGATEUR, JSON.stringify(registre))
  }
}
