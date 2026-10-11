/**
 * Infrastructure pour les rapports et exports de données.
 */

import { apiClient } from '@/src/shared/api/client'
import type { DecisionReport } from '@/types/simulation'
export { construireRapportDocx } from '@/lib/reporting/export-docx'
export { exporterClasseurComplet } from '@/lib/reporting/export-excel'
export { exporterCSV } from '@/lib/reporting/export-csv'

export const rapportsApi = {
  async obtenirRapport(jeuId: string, scenarioId?: string): Promise<DecisionReport | null> {
    try {
      return await apiClient.get<DecisionReport>(`/jeux/${jeuId}/rapport/`, {
        scenario: scenarioId,
      })
    } catch {
      return null
    }
  },
}
