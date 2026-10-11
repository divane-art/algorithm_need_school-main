/**
 * Infrastructure pour la simulation et la mobilité des enseignants (Moteur B).
 */

import { apiClient } from '@/src/shared/api/client'
import type { SimulationResult, SimulationScenario } from '@/types/simulation'

export const simulationApi = {
  async listerScenarios(jeuId: string): Promise<SimulationScenario[]> {
    try {
      return await apiClient.get<SimulationScenario[]>(`/jeux/${jeuId}/scenarios/`)
    } catch {
      return []
    }
  },

  async executerScenario(
    jeuId: string,
    scenarioId: string,
  ): Promise<SimulationResult | null> {
    try {
      return await apiClient.post<SimulationResult>(`/jeux/${jeuId}/scenarios/${scenarioId}/executer/`)
    } catch {
      return null
    }
  },
}
