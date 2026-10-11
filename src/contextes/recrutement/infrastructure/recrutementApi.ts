/**
 * Infrastructure pour les nouvelles recrues / concours.
 */

import { apiClient } from '@/src/shared/api/client'
import type { Recrue } from '@/types/simulation'

export const recrutementApi = {
  async listerRecrues(jeuId: string): Promise<Recrue[]> {
    try {
      return await apiClient.get<Recrue[]>(`/jeux/${jeuId}/recrues/`)
    } catch {
      return []
    }
  },

  async importerRecrues(jeuId: string, fichier: File): Promise<Recrue[]> {
    try {
      const fd = new FormData()
      fd.append('fichier', fichier)
      return await apiClient.post<Recrue[]>(`/jeux/${jeuId}/recrues/import/`, fd)
    } catch {
      return []
    }
  },
}
