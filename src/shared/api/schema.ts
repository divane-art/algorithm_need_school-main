/**
 * Schéma des contrats d'API d'AlgoPlanR (/api/v1/).
 *
 * Ce contrat formalise les échanges entre le frontend React/Next.js
 * et le futur backend Django REST Framework (drf-spectacular),
 * selon l'architecture en contextes délimités (DDD) documentée dans le plan.
 */

import type { School, Teacher, SchoolDiagnostic, Zone, ZoneSecurite, SchoolSeverity } from '@/types/education'
import type { DataQualityReport } from '@/types/data-quality'
import type { FaitPrince, FaitPrinceApplique } from '@/types/prince'
import type {
  Dataset,
  DecisionArbitrage,
  EngineSettings,
  GeographicScope,
  Recrue,
  SimulationResult,
  SimulationScenario,
} from '@/types/simulation'
import type { TerritorySelection } from '@/lib/analytics/territory'

export interface SanteResponse {
  statut: 'ok' | 'erreur'
  version: string
  horodatage: string
}

export interface FichierUploadResponse {
  id: string
  nom: string
  type: 'etablissements' | 'enseignants'
  feuilles: string[]
  feuilleChoisie: string
  colonnesDetectees: string[]
  apercu: Record<string, unknown>[]
  correspondancesSuggerees: Record<string, string>
}

export interface CreerJeuPayload {
  etablissements: string // ID de fichier ou contenu
  enseignants: string
  referentielEleves?: string
}

export interface JeuDeDonneesResume {
  id: string
  nom: string
  dateCreation: string
  nbEtablissements: number
  nbEnseignants: number
  estDemonstration: boolean
}

export interface DiagnosticResponse {
  ecoles: SchoolDiagnostic[]
  totaux: {
    nbEtablissements: number
    nbEnseignants: number
    nbEleves: number
    besoinTotal: number
    postesVacants: number
    excedentsTotal: number
  }
}

export interface SyntheseResponse {
  territoriale: unknown
  tableauDeBord: unknown
  pointsAttention: unknown[]
}

export interface SimulationExecutionPayload {
  scenarioId?: string
  preset?: string
  personnalise?: {
    nom: string
    parametres: Partial<EngineSettings>
  }
}

export interface ExpliquerPropositionResponse {
  matricule: string
  enseignantNom: string
  ecoleOrigine: string
  ecoleDestination: string
  scoreTotal: number
  detailScore: Record<string, number>
  rangVoeu: number
}

export interface RapportDecisionnelResponse {
  id: string
  titre: string
  dateGeneration: string
  scenarioRetenu: string
  donneesSynthese: unknown
}
