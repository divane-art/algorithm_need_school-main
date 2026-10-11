# Spécification Technique de l'API Backend Django REST Framework — AlgoPlanR

> **Document de référence pour l'équipe de développement Backend.**  
> Cette spécification détaille l'ensemble des routes, contrats d'échange (JSON Request/Response), codes d'erreur et règles métier de l'API REST `/api/v1/` que le backend Django doit exposer pour alimenter le frontend React/TypeScript en architecture DDD.

---

## 1. Principes Généraux de l'API

### 1.1 Base URL & Préfixes
- **Base URL** : `http://127.0.0.1:8000/api/v1/`
- En développement avec le frontend Next.js : variable d'environnement `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1`

### 1.2 Sécurité & En-têtes HTTP
Toutes les requêtes émises par le client doivent contenir :
```http
Content-Type: application/json
Accept: application/json
X-AlgoPlanR-Jeton: <jeton_session_aleatoire>
```
*Le jeton `X-AlgoPlanR-Jeton` est généré localement pour s'assurer qu'aucun site web tiers ne puisse envoyer de requêtes au serveur local.*

### 1.3 Gestion des Erreurs & Codes HTTP
- `200 OK` : Succès d'une requête de consultation ou de calcul.
- `201 Created` : Création d'une ressource (jeu, fait de Prince, scénario, arbitrage).
- `204 No Content` : Suppression réussie (annulations de fait de Prince, suppression de jeu).
- `400 Bad Request` : Format de données invalide ou paramètres manquants.
- `404 Not Found` : Ressource introuvable (école, enseignant, jeu ou scénario inexistant).
- `422 Unprocessable Entity` : Rejet métier avec motif explicite (ex : tentative d'affecter un enseignant sur sa propre école).
- `500 Internal Server Error` : Erreur interne non gérée.

Format standard de retour d'erreur :
```json
{
  "code": "ERREUR_METIER",
  "message": "Description lisible de l'erreur",
  "details": {
    "champ": ["Motif spécifique du refus"]
  }
}
```

---

## 2. Tableau Synthétique des Routes par Contexte Délimité (DDD)

| Contexte | Méthode | Route | Description |
| :--- | :--- | :--- | :--- |
| **Système** | `GET` | `/sante/` | Contrôle d'état et vérification de disponibilité |
| **Paramétrage** | `GET` | `/parametres/defaut/` | Paramètres et pondérations par défaut |
| | `GET` | `/scenarios/presets/` | Liste des scénarios préenregistrés |
| | `GET` | `/jeux/{jeu_id}/parametres/` | Paramètres effectifs du jeu actif |
| | `PUT` | `/jeux/{jeu_id}/parametres/` | Modification des normes et seuils |
| | `GET` | `/jeux/{jeu_id}/situations-familiales/` | Inventaire des situations matrimoniales |
| **Données & Jeux** | `POST` | `/fichiers/` | Téléversement d'un fichier Excel/CSV |
| | `PATCH` | `/fichiers/{id}/correspondances/` | Validation du mapping des colonnes |
| | `POST` | `/jeux/` | Construction d'un jeu de données complet |
| | `POST` | `/jeux/demonstration/` | Chargement du jeu type Cameroun (50 écoles, 200 enseignants) |
| | `GET` | `/jeux/` | Liste des jeux enregistrés en base |
| | `GET` | `/jeux/{jeu_id}/` | Détail et métadonnées du jeu |
| | `DELETE` | `/jeux/{jeu_id}/` | Suppression d'un jeu (« Effacer les données ») |
| | `GET` | `/jeux/{jeu_id}/qualite/` | Rapport de contrôle de qualité des données |
| | `GET` | `/jeux/{jeu_id}/etablissements/` | Liste filtrée des établissements scolaires |
| | `GET` | `/jeux/{jeu_id}/etablissements/{code}/` | Fiche détaillée d'un établissement |
| | `GET` | `/jeux/{jeu_id}/enseignants/` | Liste des enseignants et barème individuel |
| | `GET` | `/jeux/{jeu_id}/enseignants/{mat}/` | Fiche détaillée et éligibilité d'un enseignant |
| | `GET` | `/jeux/{jeu_id}/recherche/enseignants/?q=` | Recherche textuelle d'un enseignant |
| | `GET` | `/jeux/{jeu_id}/recherche/etablissements/?q=` | Recherche textuelle d'un établissement |
| **Diagnostic (A)** | `GET` | `/jeux/{jeu_id}/diagnostic/` | Calcul Moteur A (besoins, excédents, sévérité) |
| | `GET` | `/jeux/{jeu_id}/territoires/` | Arbre territorial hiérarchique |
| | `GET` | `/jeux/{jeu_id}/territoires/options/` | Options des menus déroulants (régions, dép, com) |
| | `GET` | `/jeux/{jeu_id}/priorites/` | Écoles ordonnées par indice de priorité |
| | `GET` | `/jeux/{jeu_id}/synthese/` | Synthèse territoriale et indicateurs de dispersion |
| **Fait du Prince** | `GET` | `/jeux/{jeu_id}/faits-prince/` | Liste des décisions d'autorité de la DRH |
| | `POST` | `/jeux/{jeu_id}/faits-prince/` | Enregistrement d'un fait du Prince |
| | `POST` | `/jeux/{jeu_id}/faits-prince/impact/` | Aperçu d'impact avant enregistrement |
| | `POST` | `/jeux/{jeu_id}/faits-prince/import/` | Import en lot de décisions d'autorité |
| | `DELETE` | `/jeux/{jeu_id}/faits-prince/{id}/` | Annulation d'une décision |
| **Simulation (B)**| `GET` | `/jeux/{jeu_id}/scenarios/` | Liste des scénarios calculés et statut |
| | `POST` | `/jeux/{jeu_id}/scenarios/base/` | Exécution des 3 scénarios géographiques de référence |
| | `POST` | `/jeux/{jeu_id}/scenarios/` | Création et exécution d'un scénario sur mesure |
| | `GET` | `/jeux/{jeu_id}/scenarios/{sid}/` | Synthèse des résultats d'un scénario |
| | `GET` | `/jeux/{jeu_id}/scenarios/{sid}/affectations/` | Propositions d'affectation Gale-Shapley |
| | `GET` | `/jeux/{jeu_id}/scenarios/{sid}/non-affectes/` | Candidats sans solution ou postes non couverts |
| | `GET` | `/jeux/{jeu_id}/scenarios/{sid}/vivier/` | Vivier mobilisable des écoles excédentaires |
| | `GET` | `/jeux/{jeu_id}/scenarios/{sid}/postes/` | Postes ouverts et cibles théoriques |
| | `GET` | `/jeux/{jeu_id}/scenarios/{sid}/flux/` | Analyse des flux entrants, sortants et solde |
| | `GET` | `/jeux/{jeu_id}/comparaison/` | Comparaison multi-scénarios (Local vs Dept vs Étendu) |
| **Arbitrage** | `GET` | `/jeux/{jeu_id}/arbitrages/` | Liste des décisions de commissions |
| | `POST` | `/jeux/{jeu_id}/arbitrages/` | Enregistrement ou mise à jour d'un arbitrage |
| | `DELETE` | `/jeux/{jeu_id}/arbitrages/{id}/` | Annulation d'une décision d'arbitrage |
| **Recrutement** | `GET` | `/jeux/{jeu_id}/recrues/` | Liste des lauréats des concours sur postes vacants |
| | `POST` | `/jeux/{jeu_id}/recrues/import/` | Import d'un fichier de nouvelles recrues |
| **Rapports** | `GET` | `/jeux/{jeu_id}/rapport/?scenario=` | Génération du modèle de rapport décisionnel complet |

---

## 3. Détail des Endpoints & Formats d'Échange

### 3.1 Système & Santé

#### `GET /api/v1/sante/`
Vérification que le serveur Django est fonctionnel.
- **Réponse `200 OK`** :
```json
{
  "statut": "ok",
  "version": "1.0.0",
  "horodatage": "2026-10-11T14:30:00Z"
}
```

---

### 3.2 Données & Fichiers

#### `POST /api/v1/jeux/demonstration/`
Génère ou recharge le jeu type officiel (Cameroun, 50 écoles représentatives, 200 enseignants, mix francophone/anglophone, zones rurales et urbaines).
- **Réponse `201 Created`** :
```json
{
  "id": "jeu-demo-2026",
  "nom": "Jeu de démonstration national",
  "dateCreation": "2026-10-11T14:30:00Z",
  "nbEtablissements": 50,
  "nbEnseignants": 200,
  "estDemonstration": true
}
```

#### `GET /api/v1/jeux/{jeu_id}/qualite/`
Retourne le bilan de validation des données importées (incohérences, doublons, champs manquants).
- **Réponse `200 OK`** :
```json
{
  "nbLignesEtablissements": 50,
  "nbLignesEnseignants": 200,
  "tauxCompletude": 0.985,
  "anomalies": [
    {
      "niveau": "avertissement",
      "categorie": "coordonnees",
      "message": "3 établissements sans coordonnées GPS précises",
      "impact": "Positionnés au chef-lieu de commune"
    }
  ]
}
```

---

### 3.3 Diagnostic des Besoins (Moteur A)

#### `GET /api/v1/jeux/{jeu_id}/diagnostic/`
Retourne le calcul des besoins, excédents et dotations théoriques école par école.
- **Paramètres de requête (Query params)** :
  - `region` (optionnel) : filtre sur une région (ex: `Centre`)
  - `departement` (optionnel) : filtre sur un département (ex: `Mfoundi`)
  - `commune` (optionnel) : filtre sur une commune (ex: `Yaoundé 1`)
  - `zone` (optionnel) : `urbaine` | `semi_urbaine` | `rurale`
  - `sansPrince` (optionnel) : `true` pour exclure les faits de Prince et observer la situation brute.

- **Réponse `200 OK`** :
```json
{
  "ecoles": [
    {
      "school": {
        "id": "EP-001",
        "nom": "École Publique de Bastos",
        "region": "Centre",
        "departement": "Mfoundi",
        "commune": "Yaoundé 1",
        "zone": "urbaine",
        "zoneSecurite": "verte",
        "typeEtab": "École publique",
        "sousSysteme": "francophone",
        "nbClasses": 12,
        "nbEleves": 540
      },
      "calcul": {
        "norme": 50,
        "cible": 11,
        "enseignantsEnPoste": 14,
        "enseignantsRetenus": 14,
        "dotation": 12,
        "besoin": 0,
        "excedent": 2,
        "sallesManquantes": 0
      },
      "priorite": {
        "pointsAccessibilite": 0,
        "pointsSecurite": 0,
        "poids": 1.0,
        "indice": 0.0
      },
      "severite": "excedent"
    }
  ],
  "totaux": {
    "nbEtablissements": 50,
    "nbEnseignants": 200,
    "nbEleves": 18500,
    "besoinTotal": 45,
    "excedentsTotal": 32,
    "postesVacants": 13
  }
}
```

---

### 3.4 Fait du Prince (Décisions de la DRH)

#### `POST /api/v1/jeux/{jeu_id}/faits-prince/`
Enregistre une décision d'affectation d'autorité.
- **Corps de la requête (`application/json`)** :
```json
{
  "teacherId": "ENS-10492",
  "ecoleDestinationId": "EP-001",
  "reference": "Note de service DRH N° 2026/041/MINEDUB"
}
```

- **Réponse `201 Created`** :
```json
{
  "id": "prince-8f1b2c",
  "teacherId": "ENS-10492",
  "schoolDestinationId": "EP-001",
  "reference": "Note de service DRH N° 2026/041/MINEDUB",
  "decideLe": "2026-10-11T14:35:00Z",
  "enseignant": "MBIIDA Paul",
  "origine": {
    "id": "EP-042",
    "nom": "EP Mbalmayo Centre",
    "commune": "Mbalmayo",
    "departement": "Nyong-et-So'o",
    "region": "Centre"
  },
  "destination": {
    "id": "EP-001",
    "nom": "École Publique de Bastos",
    "commune": "Yaoundé 1",
    "departement": "Mfoundi",
    "region": "Centre"
  }
}
```

- **Réponse `422 Unprocessable Entity` (en cas de refus métier)** :
```json
{
  "code": "FAIT_PRINCE_REFUSE",
  "message": "La décision n'a pas pu être enregistrée.",
  "details": {
    "motif": "L'enseignant est déjà rattaché à cet établissement de destination."
  }
}
```

---

### 3.5 Simulation d'Affectation & Mobilité (Moteur B)

#### `POST /api/v1/jeux/{jeu_id}/scenarios/base/`
Déclenche le calcul des trois scénarios géographiques de référence :
1. `geo-commune` : Mouvements restreints à la même commune.
2. `geo-departement` : Mouvements autorisés au sein du même département.
3. `geo-etendu` : Mouvements interdépartementaux et interrégionaux.

- **Réponse `200 OK`** :
```json
{
  "scenarios": [
    {
      "id": "geo-commune",
      "nom": "Scénario local (commune)",
      "scope": "commune",
      "postesCouverts": 12,
      "tauxCouverture": 0.266
    },
    {
      "id": "geo-departement",
      "nom": "Scénario départemental",
      "scope": "departement",
      "postesCouverts": 24,
      "tauxCouverture": 0.533
    },
    {
      "id": "geo-etendu",
      "nom": "Scénario étendu (national)",
      "scope": "etendu",
      "postesCouverts": 31,
      "tauxCouverture": 0.688
    }
  ]
}
```

#### `GET /api/v1/jeux/{jeu_id}/scenarios/{sid}/affectations/`
Liste détaillée des propositions d'affectation calculées par l'algorithme d'acceptation différée de **Gale-Shapley**.
- **Réponse `200 OK`** :
```json
{
  "total": 24,
  "affectations": [
    {
      "teacherId": "ENS-30291",
      "nomEns": "FOTSO",
      "prenomEns": "Jean-Pierre",
      "nature": "obligatoire",
      "statut": "propose",
      "bareme": 48.5,
      "score": 72.0,
      "niveauProximite": "meme_departement",
      "schoolOrigineId": "EP-014",
      "nomEtabOrigine": "EP Bafia Sud",
      "schoolDestinationId": "EP-019",
      "nomEtabDestination": "EP Makénéné 2",
      "breakdown": {
        "total": 72.0,
        "components": [
          { "label": "Barème individuel", "valeur": 48.5, "poids": 1.0, "contribution": 48.5 },
          { "label": "Priorité du poste", "valeur": 18.0, "poids": 1.0, "contribution": 18.0 },
          { "label": "Proximité géographique", "valeur": 5.5, "poids": 1.0, "contribution": 5.5 }
        ]
      }
    }
  ]
}
```

---

### 3.6 Arbitrage des Commissions

#### `POST /api/v1/jeux/{jeu_id}/arbitrages/`
Enregistre la décision d'une commission (commission régionale ou nationale). Remplace toute décision préalable sur le même enseignant.
- **Corps de la requête (`application/json`)** :
```json
{
  "teacherId": "ENS-30291",
  "nomEnseignant": "FOTSO Jean-Pierre",
  "instance": "regionale",
  "decision": "maintenu",
  "motif": "Raison médicale attestée par certificat d'expertise",
  "schoolDestinationId": null,
  "nomEtabDestination": null
}
```

---

### 3.7 Rapport Décisionnel

#### `GET /api/v1/jeux/{jeu_id}/rapport/?scenario={sid}`
Retourne l'arborescence complète et rédigée du rapport décisionnel, prêt pour l'affichage ou l'export Word / Excel.
- **Réponse `200 OK`** :
```json
{
  "id": "rapport-2026-1",
  "titre": "RAPPORT D’AFFECTATION DES ENSEIGNANTS",
  "perimetre": "National",
  "anneeScolaire": "2026-2027",
  "genereLe": "2026-10-11T14:40:00Z",
  "sections": [
    {
      "titre": "1. Synthèse nationale",
      "paragraphes": [
        "Sur l'ensemble des 50 établissements observés, le besoin total s'établit à 45 enseignants..."
      ],
      "points": [
        "45 postes nécessaires identifiés",
        "31 postes couverts par le scénario retenu (68.8 % de couverture)",
        "14 postes vacants résiduels nécessitant un arbitrage ou concours"
      ]
    }
  ]
}
```

---

## 4. Règles de Fidélité et Invariants de Calcul (Python ↔ TypeScript)

Pour garantir une parité mathématique stricte entre le moteur Django Python et le frontend TypeScript :

1. **Arrondis** : `Math.round(x)` en JavaScript arrondit les demi-valeurs vers le haut (+∞), tandis que `round()` en Python utilise l'arrondi bancaire (au pair le plus proche). Implémenter en Python la fonction helper :
   ```python
   import math
   def arrondi_js(valeur: float) -> int:
       if valeur >= 0:
           return math.floor(valeur + 0.5)
       return math.ceil(valeur - 0.5)
   ```

2. **Tri alphabétique en français** :
   Utiliser `unicodedata.normalize('NFD', texte)` pour assurer le même ordre de tri que `localeCompare('fr')`.

3. **Invariants métier** :
   - Un enseignant ne peut jamais être affecté sur deux postes.
   - Un poste ne peut jamais recevoir plus d'un enseignant.
   - Les décisions d'autorité (faits du Prince) s'appliquent en amont de tout calcul.
   - Une simulation ne peut en aucun cas créer de déficit dans l'école d'origine d'un enseignant redéployé.
