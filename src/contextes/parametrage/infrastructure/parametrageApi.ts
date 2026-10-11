/**
 * Infrastructure pour les paramètres et normes du moteur.
 */

import { apiClient } from '@/src/shared/api/client'
import type { EngineSettings } from '@/types/simulation'
import { DEFAULT_SETTINGS } from '@/lib/config/settings'

export const parametrageApi = {
  async obtenirParametresDefaut(): Promise<EngineSettings> {
    try {
      const enLigne = await apiClient.checkSante()
      if (enLigne) {
        return await apiClient.get<EngineSettings>('/parametres/defaut/')
      }
    } catch {
      // Repli
    }
    return DEFAULT_SETTINGS
  },

  async sauvegarderParametres(jeuId: string, settings: EngineSettings): Promise<EngineSettings> {
    try {
      return await apiClient.put<EngineSettings>(`/jeux/${jeuId}/parametres/`, settings)
    } catch {
      return settings
    }
  },
}
