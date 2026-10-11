'use client'

/**
 * Point d'entrée de l'application.
 *
 * L'application est volontairement une page unique à navigation interne : les
 * données importées ne vivent qu'en mémoire, et cette forme garantit qu'elles
 * survivent à la navigation aussi bien dans le navigateur que dans la version
 * de bureau, qui sert un export statique sans serveur.
 */

import { useRef, useEffect } from 'react'
import { AlertTriangle, Check, RefreshCw } from 'lucide-react'
import { FILTRES_VIDES } from '@/lib/analytics/territory'
import { LIBELLE_SCOPE } from '@/lib/simulation/scenarios'
import { Notice, Pill } from '@/components/common'
import { FilterBar, PageHeader, Sidebar, TerritoryBreadcrumb, Topbar } from '@/components/layout'
import { BandeauMiseAJour, useMiseAJour } from '@/components/layout/MiseAJour'
import { useToast } from '@/src/shared/ui/Toast'
import {
  ContextDonnees,
  ContextParametrage,
  ContextDiagnostic,
  ContextPrince,
  ContextSimulation,
  ContextArbitrage,
  ContextRecrutement,
  ContextRapports,
  ContextMethodologie,
} from '@/src/contextes'
import { usePlanningState } from '@/components/usePlanningState'
// ACCÈS DÉSACTIVÉ — voir la note au-dessus de `Page`.
// import { AccesPage } from '@/components/acces/AccesPage'
// import { EcranConnexion } from '@/components/acces/EcranConnexion'
// import { useAcces, type Acces } from '@/components/acces/useAcces'
// import { demandesEnAttente } from '@/lib/acces/registre'
import { pageReserveeAuDrh } from '@/components/layout/navigation'
import type { SessionAcces } from '@/types/acces'

/** Pages sur lesquelles la barre de filtres territoriaux n'a pas de sens. */
const SANS_FILTRES = new Set(['import', 'methodology', 'settings', 'engine', 'data', 'logs', 'prince', 'acces', 'voeux', 'arbitrage', 'recrutes', 'projections'])

/**
 * ACCÈS DÉSACTIVÉ (AlgoPlanR 1.0.0) : la plateforme s'ouvre directement, sans
 * écran de connexion, avec les droits complets (ceux du DRH). La gestion des
 * accès des délégués régionaux est retirée du menu.
 *
 * Le code du contrôle d'accès est conservé (components/acces, lib/acces) : pour le
 * rétablir, décommenter les blocs marqués « ACCÈS DÉSACTIVÉ » dans ce fichier et
 * dans components/layout/index.tsx, puis supprimer `SESSION_DIRECTE`.
 *
 * Avec le contrôle d'accès, rien de l'application n'est monté tant que personne
 * n'est identifié. À la déconnexion, `Application` est démontée : les données
 * importées, qui ne vivent que dans son état, disparaissent avec elle et ne
 * passent pas d'une personne à la suivante.
 */
const SESSION_DIRECTE: SessionAcces = { role: 'drh' }

export default function Page() {
  // const acces = useAcces()
  // if (!acces.session) return <EcranConnexion acces={acces} />
  // return <Application acces={acces} session={acces.session} />
  return <Application session={SESSION_DIRECTE} />
}

// ACCÈS DÉSACTIVÉ : signature d'origine
// function Application({ acces, session }: { acces: Acces; session: SessionAcces }) {
function Application({ session }: { session: SessionAcces }) {
  const regionImposee = session.role === 'delegue' ? session.region : null
  const store = usePlanningState(regionImposee)
  const {
    page,
    setPage,
    mode,
    changerMode,
    menuOuvert,
    setMenuOuvert,
    donneesChargees,
    simulationPrete,
    filtres,
    setFiltres,
    optionsFiltres,
    perimetre,
    settings,
    scenarios,
    scenarioActif,
    setScenarioActif,
    calculEnCours,
    erreur,
    effacerSession,
    dataset,
    resultatAffiche,
  } = store

  const toast = useToast()
  const miseAJour = useMiseAJour()
  const estDrh = session.role === 'drh'
  // ACCÈS DÉSACTIVÉ : plus d'entrées de délégués à valider.
  // const entreesEnAttente = estDrh && acces.registre ? demandesEnAttente(acces.registre).length : 0
  const entreesEnAttente = 0
  /** Une page réservée au DRH n'est jamais rendue pour un délégué, quel que soit le lien suivi. */
  const pageInterdite = !estDrh && pageReserveeAuDrh(page)

  // Notifications dynamiques lors des changements d'état
  const prevDonneesRef = useRef(donneesChargees)
  useEffect(() => {
    if (!prevDonneesRef.current && donneesChargees) {
      toast.success(
        dataset?.demonstration
          ? 'Jeu de démonstration chargé avec succès (50 écoles, 200 enseignants).'
          : 'Fichiers importés et validés avec succès.',
        'Données prêtes',
      )
    }
    prevDonneesRef.current = donneesChargees
  }, [donneesChargees, dataset?.demonstration, toast])

  const prevSimuRef = useRef(simulationPrete)
  useEffect(() => {
    if (!prevSimuRef.current && simulationPrete) {
      toast.success('Les 3 scénarios géographiques de référence ont été calculés.', 'Simulation prête')
    }
    prevSimuRef.current = simulationPrete
  }, [simulationPrete, toast])

  const nomScenario = scenarios.find(s => s.id === scenarioActif)?.nom ?? 'Situation actuelle'

  const etat = calculEnCours ? (
    <Pill tone="info">
      <RefreshCw size={12} className="spin" aria-hidden="true" /> Calcul en cours
    </Pill>
  ) : erreur ? (
    <Pill tone="alert">
      <AlertTriangle size={12} aria-hidden="true" /> Erreur de calcul
    </Pill>
  ) : simulationPrete ? (
    <Pill tone="ok">
      <Check size={12} aria-hidden="true" /> Scénarios calculés
    </Pill>
  ) : donneesChargees ? (
    <Pill tone="info">Diagnostic calculé</Pill>
  ) : (
    <Pill tone="warn">Aucune donnée</Pill>
  )

  function confirmerEffacement() {
    const confirme =
      typeof window === 'undefined' ||
      window.confirm(
        "Effacer les données de cette session ?\n\nLes fichiers importés, les résultats calculés et les préférences enregistrées seront supprimés de cette session. Cette action est immédiate et irréversible.",
      )
    if (confirme) {
      effacerSession()
      toast.info('Toutes les données en mémoire et préférences ont été réinitialisées.', 'Session effacée')
    }
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#contenu">
        Aller au contenu principal
      </a>

      {menuOuvert && <div className="backdrop" onClick={() => setMenuOuvert(false)} aria-hidden="true" />}

      <Topbar
        mode={mode}
        onModeChange={changerMode}
        onOuvrirMenu={() => setMenuOuvert(true)}
        etat={etat}
        territoire={regionImposee && !filtres.territoire.region ? `Région ${regionImposee}` : perimetre}
        // ACCÈS DÉSACTIVÉ :
        // utilisateur={session.role === 'drh' ? 'DRH' : `Délégué · ${session.region}`}
        // onDeconnexion={deconnecter}
        anneeScolaire={settings.anneeScolaire}
        scenario={resultatAffiche ? `${nomScenario} (${LIBELLE_SCOPE[resultatAffiche.scope].toLowerCase()})` : nomScenario}
        onEffacer={confirmerEffacement}
      />

      <div className="app-body">
        <div className="sidebar-slot" />
        <Sidebar
          page={page}
          onNavigate={setPage}
          mode={mode}
          role={session.role}
          entreesEnAttente={entreesEnAttente}
          ouverte={menuOuvert}
          onFermer={() => setMenuOuvert(false)}
          donneesChargees={donneesChargees}
          simulationPrete={simulationPrete}
          version={miseAJour?.versionActuelle}
        />

        <div className="main-col">
          <main className="content" id="contenu">
            <PageHeader page={page} onAccueil={() => setPage(donneesChargees ? 'overview' : 'import')} />

            <div className="stack">
              <BandeauMiseAJour etat={miseAJour} donneesChargees={donneesChargees} />

              {erreur && (
                <Notice tone="alert" title="Le calcul a échoué.">
                  {erreur}
                </Notice>
              )}

              {/* ACCÈS DÉSACTIVÉ :
              {entreesEnAttente > 0 && page !== 'acces' && (
                <Notice tone="warn" title={`${entreesEnAttente} entrée(s) de délégué en attente de validation.`}>
                  <button type="button" className="btn-link" onClick={() => setPage('acces')}>
                    Ouvrir « Accès des délégués »
                  </button>
                </Notice>
              )} */}

              {regionImposee && page === 'import' && (
                <Notice tone="info" title={`Accès limité à la région ${regionImposee}.`}>
                  Seuls les établissements et les enseignants de cette région sont retenus à l’import ; le reste du
                  fichier est ignoré.
                </Notice>
              )}

              {pageInterdite && (
                <Notice tone="alert" title="Page réservée au DRH.">
                  Cette fonction n’est pas ouverte aux délégués régionaux.
                </Notice>
              )}

              {dataset?.demonstration && page !== 'import' && (
                <Notice tone="warn" title="Données de démonstration.">
                  Les valeurs affichées sont fictives et ne constituent pas des statistiques officielles.
                </Notice>
              )}

              {donneesChargees && !SANS_FILTRES.has(page) && (
                <>
                  <TerritoryBreadcrumb selection={filtres.territoire} onSelect={t => setFiltres({ ...filtres, territoire: t })} />
                  <FilterBar
                    filtres={filtres}
                    options={optionsFiltres}
                    onChange={setFiltres}
                    onReset={() => setFiltres(FILTRES_VIDES)}
                    scenarioActif={scenarioActif}
                    scenarios={scenarios.filter(s => !!store.resultats[s.id]).map(s => ({ id: s.id, nom: s.nom }))}
                    onScenarioChange={setScenarioActif}
                  />
                </>
              )}

              {page === 'import' && <ContextDonnees.ImportWizard store={store} />}
              {page === 'overview' && <ContextDiagnostic.OverviewPage store={store} />}
              {page === 'diagnostic' && <ContextDiagnostic.NationalDiagnosticPage store={store} />}
              {page === 'territoires' && <ContextDiagnostic.TerritoriesPage store={store} />}
              {page === 'priorites' && <ContextDiagnostic.PrioritySchoolsPage store={store} />}
              {page === 'schools' && <ContextDonnees.SchoolsPage store={store} />}
              {page === 'teachers' && <ContextDonnees.TeachersPage store={store} />}
              {page === 'prince' && estDrh && <ContextPrince.PrincePage store={store} />}
              {/* ACCÈS DÉSACTIVÉ : {page === 'acces' && estDrh && <AccesPage acces={acces} />} */}
              {page === 'simulations' && <ContextSimulation.SimulationsPage store={store} />}
              {page === 'voeux' && <ContextSimulation.VoeuxPage store={store} />}
              {page === 'arbitrage' && <ContextArbitrage.ArbitragePage store={store} />}
              {page === 'recrutes' && <ContextRecrutement.RecrutesPage store={store} />}
              {page === 'projections' && <ContextSimulation.ProjectionsPage store={store} />}
              {page === 'comparison' && <ContextSimulation.ComparisonPage store={store} />}
              {page === 'reports' && <ContextRapports.ReportPage store={store} />}
              {page === 'methodology' && <ContextMethodologie.MethodologyPage store={store} />}
              {page === 'settings' && estDrh && <ContextParametrage.ReferentialPage store={store} />}
              {page === 'engine' && estDrh && <ContextParametrage.EnginePage store={store} />}
              {page === 'data' && <ContextDonnees.DataPage store={store} />}
              {page === 'pool' && <ContextSimulation.PoolPage store={store} />}
              {page === 'posts' && <ContextSimulation.PostsPage store={store} />}
              {page === 'assignments' && <ContextSimulation.AssignmentsPage store={store} />}
              {page === 'unassigned' && <ContextSimulation.UnassignedPage store={store} />}
              {page === 'logs' && <ContextSimulation.LogsPage store={store} />}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
