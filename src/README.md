# Architecture Frontend AlgoPlanR — Domain-Driven Design (DDD)

Ce dossier `src/` structure le frontend React / Next.js 16 d'AlgoPlanR selon les principes du **Domain-Driven Design (DDD)** et de la **Clean Architecture**, en parfaite cohérence avec le futur backend Django REST Framework.

---

## 1. Vue d'ensemble

Le code métier et d'interface est découpé en deux grands ensembles :
1. **`shared/`** : Éléments transverses non spécifiques à un métier (client API HTTP, typage OpenAPI, primitives graphiques du design system, noyau de formatage).
2. **`contextes/`** : Les **Bounded Contexts** (Contextes Délimités) du domaine de la planification et de l'affectation scolaire.

```
src/
├── shared/
│   ├── api/          # Client HTTP, gestion du jeton X-AlgoPlanR-Jeton, contrats OpenAPI
│   ├── kernel/       # Noyau partagé (formatage, identifiants uniques, fonctions géographiques)
│   └── ui/           # Primitives UI, graphiques, cartes et toasts réactifs
│
└── contextes/        # Les 9 Bounded Contexts métier
    ├── donnees/      # Import, contrôle qualité, établissements et enseignants
    ├── parametrage/  # Normes pédagogiques, pondérations, barèmes et seuils
    ├── diagnostic/   # Moteur A : besoins, déficits, excédents, priorités territoriales
    ├── prince/       # Faits du Prince : décisions d'affectation d'autorité de la DRH
    ├── simulation/   # Moteur B : mobilité, vivier, Gale-Shapley, flux et projections
    ├── arbitrage/    # Commissions d'arbitrage régionales et nationales
    ├── recrutement/  # Affectation des lauréats des concours sur postes vacants
    ├── rapports/     # Rapport décisionnel, exports Word (DOCX), Excel (XLSX) et CSV
    └── methodologie/ # Cadre méthodologique, formules et documentation
```

---

## 2. Structure interne d'un Bounded Context

Chaque contexte délimité respecte la séparation en couches :

- **`domain/`** :
  - Types métier, agrégats et objets de valeur (Value Objects).
  - Algorithmes et invariants purs (indépendants de tout framework UI).
- **`infrastructure/`** :
  - Client d'API typé (`<contexte>Api.ts`) ciblant `/api/v1/<endpoint>/`.
  - **Adaptateur autonome transparent** : si le backend Django n'est pas démarré, l'infrastructure bascule automatiquement sur les modules de calcul locaux en mémoire pour garantir 100 % de disponibilité dans l'interface sans interruption.
- **`application/`** :
  - Hooks React et gestionnaires de cas d'usage (`use<Contexte>.ts`).
- **`ui/`** :
  - Composants de présentation et pages spécialisées.

---

## 3. Communication avec le backend Django

### Base URL et Authentification
- L'URL de l'API est définie par la variable d'environnement `NEXT_PUBLIC_API_URL` (par défaut `http://127.0.0.1:8000/api/v1`).
- Toutes les requêtes HTTP transmettent l'en-tête de sécurité `X-AlgoPlanR-Jeton` pour empêcher tout appel non autorisé depuis un navigateur tiers.

### Bascule en mode connecté
Dès que le serveur Django est démarré sur le port 8000 :
1. L'indicateur dynamique dans la barre supérieure (`Topbar`) passe de **« Mode autonome (DDD) »** à **« Django connecté »**.
2. Les méthodes d'infrastructure (`donneesApi`, `simulationApi`, `princeApi`...) délèguent immédiatement les calculs aux endpoints REST de Django.
3. Toutes les structures de données (JSON d'entrée et de sortie) sont strictement identiques entre le moteur TypeScript local et l'API Django.

---

## 4. Algorithmes clés

- **Moteur A (`lib/analytics/diagnostic.ts`)** :
  - Calcule la dotation théorique $D$, le besoin $B = \max(0, \text{cible} - E)$ et l'excédent mobilisable $X = \max(0, E - D)$ pour chaque école.
  - Détermine le poids de vulnérabilité $w$ et l'indice de priorité d'affectation $u$.
- **Moteur B (`lib/simulation/engine.ts`)** :
  - Algorithme d'acceptation différée de **Gale-Shapley** (étudiant/enseignant proposant).
  - Construction du vivier de redéploiement et des postes ouverts.
  - Respect strict des invariants : les décisions du Prince et les arbitrages priment, aucun déficit n'est créé dans une école source.
