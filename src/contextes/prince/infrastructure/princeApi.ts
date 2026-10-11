/**
 * Infrastructure pour les faits du Prince.
 */

import { apiClient } from '@/src/shared/api/client'
import type { FaitPrince } from '@/types/prince'

export const princeApi = {
  async listerFaitsPrince(jeuId: string): Promise<FaitPrince[]> {
    try {
      return await apiClient.get<FaitPrince[]>(`/jeux/${jeuId}/faits-prince/`)
    } catch {
      return []
    }
  },

  async enregistrerFaitPrince(
    jeuId: string,
    matricule: string,
    ecoleDestinationId: string,
    reference: string,
  ): Promise<FaitPrince | null> {
    try {
      return await apiClient.post<FaitPrince>(`/jeux/${jeuId}/faits-prince/`, {
        matricule,
        ecoleDestination: ecoleDestinationId,
        reference,
      })
    } catch {
      return null
    }
  },

  async annulerFaitPrince(jeuId: string, faitId: string): Promise<void> {
    try {
      await apiClient.delete(`/jeux/${jeuId}/faits-prince/${faitId}/`)
    } catch {
      // Repli
    }
  },
}
