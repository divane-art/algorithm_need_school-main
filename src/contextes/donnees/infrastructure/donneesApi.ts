/**
 * Infrastructure d'accès aux données : implémente le contrat API Django
 * avec bascule locale transparente si le serveur est indisponible.
 */

import { apiClient } from '@/src/shared/api/client'
import type { Dataset } from '@/types/simulation'
import type { DataQualityReport } from '@/types/data-quality'
import { construireJeuDemonstration } from '@/lib/data/demo-dataset'

export const donneesApi = {
  /**
   * Charge le jeu de données de démonstration.
   * Interroge POST /api/v1/jeux/demonstration/ si disponible, sinon exécute localement.
   */
  async chargerDemonstration(): Promise<Dataset> {
    try {
      const estEnLigne = await apiClient.checkSante()
      if (estEnLigne) {
        return await apiClient.post<Dataset>('/jeux/demonstration/')
      }
    } catch {
      // repli local
    }
    return construireJeuDemonstration()
  },

  /**
   * Récupère le rapport de qualité des données pour le jeu actif.
   */
  async obtenirRapportQualite(jeuId: string): Promise<DataQualityReport | null> {
    try {
      return await apiClient.get<DataQualityReport>(`/jeux/${jeuId}/qualite/`)
    } catch {
      return null
    }
  },

  /**
   * Efface le jeu actif de la base de données persistante (Django) / de la session.
   */
  async supprimerJeu(jeuId: string): Promise<void> {
    try {
      await apiClient.delete(`/jeux/${jeuId}/`)
    } catch {
      // En mode local, géré par le state React
    }
  },
}
