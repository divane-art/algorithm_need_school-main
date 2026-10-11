export type {
  SimulationScenario,
  SimulationResult,
  ProposedAssignment,
  GeographicScope,
} from '@/types/simulation'
export { runSimulation } from '@/lib/simulation/engine'
export { SCENARIOS_GEOGRAPHIQUES, scenarioGeographique } from '@/lib/simulation/scenarios'
export { calculerFlux, restreindreResultat } from '@/lib/simulation/filter'
