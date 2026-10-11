/**
 * Infrastructure pour les décisions d'arbitrage.
 */

import { apiClient } from '@/src/shared/api/client'
import type { DecisionArbitrage } from '@/types/simulation'

export const arbitrageApi = {
  async listerArbitrages(jeuId: string): Promise<DecisionArbitrage[]> {
    try {
      return await apiClient.get<DecisionArbitrage[]>(`/jeux/${jeuId}/arbitrages/`)
    } catch {
      return []
    }
  },

  async enregistrerArbitrage(jeuId: string, decision: DecisionArbitrage): Promise<void> {
    try {
      await apiClient.post(`/jeux/${jeuId}/arbitrages/`, decision)
    } catch {
      // Repli
    }
  },

  async annulerArbitrage(jeuId: string, decisionId: string): Promise<void> {
    try {
      await apiClient.delete(`/jeux/${jeuId}/arbitrages/${decisionId}/`)
    } catch {
      // Repli
    }
  },
}
