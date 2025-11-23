# 🚴 Cols de Vélo - Application Complète

Application web moderne pour recenser et comparer les cols de vélo gravis par des cyclistes.

## 🎯 Fonctionnalités

### ✅ Implémentées
- **Authentification** : Inscription et connexion avec Supabase Auth
- **Dashboard personnel** : Statistiques détaillées de vos performances
- **Carte interactive** : Visualisation géographique des cols avec Leaflet
- **Comparaison** : Comparez vos cols avec d'autres utilisateurs
- **Système d'épinglage** : Marquez les cols que vous voulez gravir
- **Explorateur d'utilisateurs** : Recherche et système de favoris
- **Profils utilisateurs** : Consultez les statistiques des autres cyclistes

### 🔜 À venir
- **Intégration Strava** : Synchronisation automatique des activités
- **Validation automatique** : Vérification des ascensions complètes
- **Import GPX** : Analyse des fichiers GPS

## 🏗️ Stack Technique

- **Frontend** : Next.js 15 (App Router) + React 19
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth
- **Carte** : Leaflet + React-Leaflet
- **Styling** : Tailwind CSS
- **Déploiement** : Vercel
- **Language** : TypeScript

## 📁 Structure du Projet

```
cols-velo/
├── app/
│   ├── (auth)/              # Pages d'authentification
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Pages principales
│   │   ├── dashboard/       # Tableau de bord
│   │   ├── carte/           # Carte interactive
│   │   ├── explorateur/     # Liste des utilisateurs
│   │   └── profil/[userId]/ # Profil utilisateur
│   ├── api/                 # Routes API (Strava)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── auth/                # Composants d'authentification
│   ├── dashboard/           # Composants du tableau de bord
│   ├── map/                 # Composants de carte
│   └── shared/              # Composants réutilisables
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Client Supabase (browser)
│   │   └── server.ts        # Client Supabase (server)
│   ├── types/
│   │   └── database.types.ts # Types TypeScript
│   └── utils/
├── supabase/
│   ├── migrations/
│   │   └── 20240101000000_init.sql
│   └── seed.sql
├── middleware.ts
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 🚀 Installation Locale

### Prérequis
- Node.js 18+ et npm
- Supabase CLI installé globalement
- Git

### Étape 1 : Cloner et installer

```bash
# Cloner le projet
git clone <your-repo>
cd cols-velo

# Installer les dépendances
npm install
```

### Étape 2 : Configuration Supabase Local

```bash
# Initialiser Supabase local
supabase init

# Démarrer Supabase local (Docker requis)
supabase start

# Cette commande affichera les credentials locaux
# Notez bien l'API URL et la anon key
```

### Étape 3 : Configuration des variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.local.example .env.local

# Éditer .env.local avec les valeurs affichées par 'supabase start'
```

Exemple de `.env.local` pour développement local :
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Étape 4 : Créer la base de données

```bash
# Créer la migration initiale
supabase migration new init

# Copier le contenu du fichier init.sql dans le fichier de migration créé
# Le fichier se trouve dans supabase/migrations/

# Appliquer les migrations
supabase db reset

# Optionnel : Insérer les données de test
supabase db execute < supabase/seed.sql
```

### Étape 5 : Lancer l'application

```bash
# Démarrer le serveur de développement
npm run dev

# L'application sera disponible sur http://localhost:3000
```

## 🗄️ Structure de la Base de Données

### Tables Principales

#### **profiles**
Étend `auth.users` avec des informations supplémentaires
- `id` : UUID (référence à auth.users)
- `email`, `pseudo`, `prenom`, `nom`
- `strava_id`, `strava_access_token`, etc. (pour future intégration)

#### **cols**
Référentiel de tous les cols
- Informations géographiques (latitude, longitude, altitude)
- Caractéristiques (dénivelé, distance, pente)
- Difficulté (facile, moyen, difficile, hc)
- `strava_segment_id` (pour future intégration)

#### **ascensions**
Performances des utilisateurs
- Lien user ↔ col
- Données de performance (temps, vitesse, FC, puissance)
- `validee` : booléen pour valider l'ascension complète
- `strava_activity_id` (pour future intégration)

#### **cols_epingles**
Cols marqués par les utilisateurs comme "à faire"

#### **favoris**
Système de favoris entre utilisateurs

### Vues

#### **user_statistics**
Vue agrégée des statistiques par utilisateur :
- Nombre de cols gravis
- Nombre total d'ascensions
- Dénivelé cumulé
- Nombre de sorties

## 🔐 Sécurité (Row Level Security)

Toutes les tables ont RLS activé :
- Les profils sont visibles par tous (lecture seule sauf pour soi-même)
- Les cols sont publics (lecture seule)
- Les ascensions sont visibles par tous, modifiables uniquement par le propriétaire
- Les épingles et favoris sont privés à chaque utilisateur

## 📦 Déploiement sur Vercel

### Étape 1 : Créer un projet Supabase en production

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Attendre que la base de données soit prête

### Étape 2 : Migrer la base de données

```bash
# Lier votre projet local au projet Supabase
supabase link --project-ref your-project-ref

# Pousser les migrations
supabase db push

# Insérer les données de test (optionnel)
psql -h your-project.supabase.co -U postgres -d postgres < supabase/seed.sql
```

### Étape 3 : Déployer sur Vercel

1. Pousser votre code sur GitHub
2. Aller sur [vercel.com](https://vercel.com)
3. Importer votre repository GitHub
4. Configurer les variables d'environnement :

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

5. Déployer !

### Étape 4 : Configuration post-déploiement

Dans Supabase Dashboard :
1. Aller dans Authentication > URL Configuration
2. Ajouter votre URL Vercel dans "Site URL" et "Redirect URLs"

## 🎨 Personnalisation

### Ajouter de nouveaux cols

```sql
INSERT INTO cols (nom, altitude, latitude, longitude, denivele, distance_km, pente_moyenne, pente_max, pays, region, description, difficulte)
VALUES ('Votre Col', 1500, 45.123, 6.456, 800, 10.5, 7.6, 12.0, 'France', 'Région', 'Description', 'difficile');
```

### Générer des ascensions de test

```sql
-- Pour un utilisateur spécifique
SELECT generate_test_ascensions('user-uuid-here', 10);
```

## 🔄 Intégration Strava (Préparation)

La structure est prête pour l'intégration Strava :

1. **Base de données** : Champs prévus dans `profiles`, `cols`, et `ascensions`
2. **UI** : Bouton "Connecter avec Strava" déjà présent
3. **API Routes** : Dossier `app/api/strava/` prêt

### Pour activer Strava :

1. Créer une application sur [strava.com/settings/api](https://www.strava.com/settings/api)
2. Ajouter les variables d'environnement :
```
STRAVA_CLIENT_ID=your-client-id
STRAVA_CLIENT_SECRET=your-client-secret
STRAVA_REDIRECT_URI=https://your-domain.com/api/strava/callback
```
3. Implémenter les routes OAuth dans `app/api/strava/`

## 🐛 Debugging

### Problèmes courants

**Erreur "Invalid API key"**
- Vérifiez que Supabase local est démarré : `supabase status`
- Vérifiez les variables d'environnement

**Carte ne s'affiche pas**
- Leaflet nécessite un import dynamique (déjà fait)
- Vérifiez la console pour les erreurs

**RLS bloque les requêtes**
- Vérifiez que l'utilisateur est authentifié
- Consultez les logs Supabase : `supabase logs`

## 📊 Commandes Utiles

```bash
# Développement
npm run dev              # Démarrer le serveur de dev

# Supabase
supabase start           # Démarrer Supabase local
supabase stop            # Arrêter Supabase local
supabase status          # Voir le statut
supabase db reset        # Réinitialiser la DB
supabase db diff         # Voir les changements

# Production
npm run build            # Build pour production
npm run start            # Démarrer en mode production
```

## 🤝 Contribution

Structure prête pour l'extension :
- Types TypeScript stricts
- Composants réutilisables
- Architecture modulaire
- Documentation inline

## 📝 Licence

MIT

## 🎯 Roadmap

- [ ] Intégration Strava OAuth
- [ ] Validation automatique des ascensions
- [ ] Import de fichiers GPX
- [ ] Classements et leaderboards
- [ ] Notifications push
- [ ] Mode hors-ligne (PWA)
- [ ] Export PDF des statistiques
- [ ] Widget de partage social

## 📧 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.

---

**Fait avec ❤️ pour les passionnés de vélo**