/**
 * Infrastructure pour le diagnostic des besoins (Moteur A).
 */

import { apiClient } from '@/src/shared/api/client'
import type { SchoolDiagnostic } from '@/types/education'
import type { GlobalFilters } from '@/lib/analytics/territory'

export const diagnosticApi = {
  async obtenirDiagnostic(jeuId: string, filtres?: GlobalFilters): Promise<SchoolDiagnostic[] | null> {
    try {
      const enLigne = await apiClient.checkSante()
      if (enLigne) {
        return await apiClient.get<SchoolDiagnostic[]>(`/jeux/${jeuId}/diagnostic/`, {
          region: filtres?.territoire.region,
          departement: filtres?.territoire.departement,
          commune: filtres?.territoire.commune,
        })
      }
    } catch {
      // Repli
    }
    return null
  },
}
