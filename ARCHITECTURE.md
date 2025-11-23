# 🏛️ Architecture Technique - Cols de Vélo

Documentation complète de l'architecture de l'application.

## 📊 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 15)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │    Pages    │  │  Components  │  │   Client State   │  │
│  │  App Router │  │  React 19    │  │                  │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE (Backend)                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL │  │  Supabase    │  │   Row Level      │  │
│  │  Database   │  │  Auth        │  │   Security       │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL APIS                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Strava    │  │   Leaflet    │  │   Future APIs    │  │
│  │     API     │  │   (Maps)     │  │                  │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Structure des Dossiers Détaillée

### `/app` - Application Next.js (App Router)

```
app/
├── (auth)/                  # Groupe de routes authentification
│   ├── login/              # Page de connexion
│   │   └── page.tsx        # UI connexion + logique auth
│   └── register/           # Page d'inscription
│       └── page.tsx        # Formulaire inscription + validation
│
├── (dashboard)/            # Groupe de routes principales (protégé)
│   ├── layout.tsx          # Layout commun avec Navigation
│   ├── dashboard/          # Tableau de bord personnel
│   │   └── page.tsx        # Statistiques + ascensions récentes
│   ├── carte/              # Carte interactive
│   │   └── page.tsx        # Leaflet Map + filtres + comparaison
│   ├── explorateur/        # Liste des utilisateurs
│   │   └── page.tsx        # Recherche + favoris
│   └── profil/[userId]/    # Profil utilisateur dynamique
│       └── page.tsx        # Stats publiques d'un utilisateur
│
├── api/                    # Routes API
│   └── strava/             # Endpoints Strava (future)
│       ├── connect/        # OAuth initiation
│       ├── callback/       # OAuth callback
│       └── sync/           # Synchronisation activités
│
├── layout.tsx              # Root layout
├── page.tsx                # Page d'accueil (landing page)
└── globals.css             # Styles globaux + Tailwind
```

**Principe de routage** :
- `(auth)` et `(dashboard)` sont des **route groups** qui n'affectent pas l'URL
- Le middleware protège automatiquement les routes du dashboard
- `[userId]` est une **route dynamique** pour les profils

### `/components` - Composants React Réutilisables

```
components/
├── auth/                   # Composants d'authentification (future)
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
│
├── dashboard/              # Composants du tableau de bord
│   ├── StatsCards.tsx      # Cards de statistiques (4 cartes)
│   └── RecentAscensions.tsx # Liste des ascensions récentes
│
├── map/                    # Composants de la carte
│   └── InteractiveMap.tsx  # Carte Leaflet + filtres + logique
│
├── explorateur/            # Composants explorateur
│   └── UsersList.tsx       # Liste + recherche + favoris
│
└── shared/                 # Composants partagés
    └── Navigation.tsx      # Navbar principale
```

**Principe de composition** :
- Chaque composant est **autonome** et réutilisable
- Props typées avec TypeScript
- Séparation logique client/serveur

### `/lib` - Bibliothèques et Utilitaires

```
lib/
├── supabase/               # Configuration Supabase
│   ├── client.ts           # Client browser (createBrowserClient)
│   └── server.ts           # Client server (createServerClient)
│
├── types/                  # Types TypeScript
│   └── database.types.ts   # Types générés depuis le schéma DB
│
└── utils/                  # Fonctions utilitaires (future)
    ├── date.ts
    ├── format.ts
    └── validation.ts
```

**Clients Supabase** :
- `client.ts` : Pour composants React (`'use client'`)
- `server.ts` : Pour Server Components et API Routes

### `/supabase` - Configuration Base de Données

```
supabase/
├── config.toml             # Configuration Supabase CLI
├── migrations/             # Migrations SQL versionnées
│   └── 20240101000000_init.sql  # Migration initiale
└── seed.sql                # Données de test (15 cols)
```

**Migrations** :
- Versionnées et appliquées dans l'ordre
- Créent les tables, indexes, RLS, triggers
- Reproductibles en local et prod

---

## 🔐 Architecture de Sécurité

### Row Level Security (RLS)

Toutes les tables ont RLS activé. Voici les règles :

#### **profiles** (Profils utilisateurs)
```sql
-- Lecture : Tous peuvent voir tous les profils
SELECT: true

-- Modification : Seulement son propre profil
UPDATE: auth.uid() = id
```

#### **cols** (Référentiel de cols)
```sql
-- Lecture seule pour tous
SELECT: true
```

#### **ascensions** (Performances)
```sql
-- Lecture : Tout le monde (pour comparer)
SELECT: true

-- Création : Seulement pour soi-même
INSERT: auth.uid() = user_id

-- Modification/Suppression : Seulement ses propres ascensions
UPDATE/DELETE: auth.uid() = user_id
```

#### **cols_epingles** (Épingles)
```sql
-- Lecture/Modification : Privé à chaque utilisateur
SELECT/INSERT/DELETE: auth.uid() = user_id
```

#### **favoris** (Favoris)
```sql
-- Lecture/Modification : Privé à chaque utilisateur
SELECT/INSERT/DELETE: auth.uid() = user_id
```

### Middleware Next.js

`middleware.ts` protège les routes :

```typescript
// Routes publiques : /, /login, /register
// Routes protégées : /dashboard, /carte, /explorateur, /profil/*
// Redirection automatique si non authentifié
```

---

## 📦 Modèle de Données

### Schéma Relationnel

```
                    ┌──────────────────┐
                    │   auth.users     │
                    │ (Supabase Auth)  │
                    └────────┬─────────┘
                             │
                             │ 1:1
                             ▼
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│    cols     │ *   │    profiles      │  1  │   favoris   │
│             │◄────┤                  ├─────►│             │
│ (Référence) │     │ (Utilisateurs)   │     │ (Relations) │
└──────┬──────┘     └────────┬─────────┘     └─────────────┘
       │                     │
       │ *                   │ *
       │                     │
       │            ┌────────▼─────────┐
       └────────────┤   ascensions     │
                    │ (Performances)   │
                    └──────────────────┘
                             │
                             │ *
                    ┌────────▼─────────┐
                    │  cols_epingles   │
                    │   (Wishlist)     │
                    └──────────────────┘
```

### Relations Détaillées

#### **1. Un utilisateur a plusieurs ascensions**
```sql
profiles (1) ──< ascensions (*)
```

#### **2. Un col peut être gravi plusieurs fois**
```sql
cols (1) ──< ascensions (*)
```

#### **3. Un utilisateur peut épingler plusieurs cols**
```sql
profiles (1) ──< cols_epingles (*) ──> cols (1)
```

#### **4. Un utilisateur peut avoir plusieurs favoris**
```sql
profiles (1) ──< favoris (*) ──> profiles (1)
```

### Vue Agrégée : `user_statistics`

Vue matérialisée calculée en temps réel :

```sql
SELECT 
  user_id,
  COUNT(DISTINCT col_id) as cols_gravis,
  COUNT(*) as nombre_ascensions,
  SUM(denivele) as denivele_total,
  COUNT(DISTINCT date) as nombre_sorties
FROM ascensions
GROUP BY user_id
```

---

## 🔄 Flux de Données

### 1. Inscription Utilisateur

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│   Client   │────►│  Supabase  │────►│ PostgreSQL │
│ (Register) │     │    Auth    │     │            │
└────────────┘     └────────────┘     └────────────┘
                           │
                           ▼
                    ┌────────────┐
                    │  Trigger   │
                    │  (auto)    │
                    └─────┬──────┘
                          │
                          ▼
                  ┌───────────────┐
                  │   profiles    │
                  │   (INSERT)    │
                  └───────────────┘
```

**Étapes** :
1. Utilisateur remplit le formulaire
2. `supabase.auth.signUp()` avec metadata
3. Trigger DB crée automatiquement le profil
4. Redirection vers dashboard

### 2. Chargement Dashboard

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│   Server   │────►│  Supabase  │────►│ PostgreSQL │
│ Component  │     │   Client   │     │    RLS     │
└────────────┘     └────────────┘     └────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌────────────┐     ┌────────────┐     ┌────────────┐
│   Stats    │     │ Ascensions │     │  Cols      │
│   View     │     │   Table    │     │  Épinglés  │
└────────────┘     └────────────┘     └────────────┘
```

**Requêtes parallèles** :
- `user_statistics` → Stats agrégées
- `ascensions + cols` → Ascensions récentes (JOIN)
- `cols_epingles + cols` → Cols épinglés (JOIN)

### 3. Carte Interactive

```
┌────────────┐
│   Client   │
│  (React)   │
└─────┬──────┘
      │
      ▼
┌─────────────────┐
│  InteractiveMap │
│   Component     │
└────┬────────────┘
     │
     ├──► fetch cols (tous)
     │
     ├──► fetch user ascensions
     │
     └──► (optionnel) fetch other user ascensions
          │
          ▼
     ┌────────────────┐
     │  Leaflet Map   │
     │  + Markers     │
     └────────────────┘
```

**Logique de couleurs** :
- **Vert** : Col gravi par vous
- **Gris** : Col non gravi
- **Mode comparaison** :
  - Vert : Les deux
  - Bleu : Vous uniquement
  - Orange : Autre uniquement
  - Gris : Aucun

---

## 🚀 Performance et Optimisations

### Stratégies Implémentées

#### 1. **Server-Side Rendering (SSR)**
Toutes les pages dashboard utilisent Server Components :
```typescript
// app/(dashboard)/dashboard/page.tsx
export default async function DashboardPage() {
  // Données fetchées côté serveur
  const { data } = await supabase.from('...').select()
  return <Component data={data} />
}
```

**Avantages** :
- SEO optimisé
- Temps de chargement initial réduit
- Pas de flash de contenu

#### 2. **Indexes PostgreSQL**
Tous les champs fréquemment interrogés ont des indexes :
```sql
CREATE INDEX idx_ascensions_user_id ON ascensions(user_id);
CREATE INDEX idx_ascensions_col_id ON ascensions(col_id);
CREATE INDEX idx_cols_latitude_longitude ON cols(latitude, longitude);
```

#### 3. **Vue Matérialisée**
`user_statistics` évite les calculs répétés :
```sql
-- Au lieu de 3 requêtes, 1 seule :
SELECT * FROM user_statistics WHERE id = user_id;
```

#### 4. **Client-Side Caching**
React Query pourrait être ajouté pour :
- Cache automatique
- Invalidation intelligente
- Requêtes en arrière-plan

### Améliorations Possibles

1. **Incremental Static Regeneration (ISR)**
```typescript
export const revalidate = 3600 // 1 heure
```

2. **Edge Functions**
```typescript
export const runtime = 'edge'
```

3. **Image Optimization**
```typescript
import Image from 'next/image'
// Auto-optimisation par Next.js
```

4. **Code Splitting**
```typescript
const Map = dynamic(() => import('./Map'), { ssr: false })
```

---

## 🧪 Tests (À Implémenter)

### Structure Recommandée

```
tests/
├── unit/
│   ├── components/
│   └── utils/
├── integration/
│   ├── auth.test.ts
│   └── database.test.ts
└── e2e/
    ├── user-flow.spec.ts
    └── dashboard.spec.ts
```

### Tools Suggérés

- **Unit** : Jest + React Testing Library
- **Integration** : Vitest + Supabase Test Helpers
- **E2E** : Playwright

---

## 📈 Évolutivité

### Capacité Actuelle

- **Utilisateurs** : ~10,000 actifs simultanés (tier gratuit)
- **Base de données** : 500 MB (tier gratuit Supabase)
- **Bande passante** : 5 GB/mois (tier gratuit Vercel)

### Scaling Vertical

Pour >10k utilisateurs :

1. **Supabase Pro** ($25/mois)
   - 8 GB database
   - 50 GB bande passante
   - Meilleure performance

2. **Vercel Pro** ($20/mois)
   - 100 GB bande passante
   - Analytics avancées
   - Protection DDoS

### Scaling Horizontal

Pour >100k utilisateurs :

1. **Database Sharding**
   - Partitionner par région géographique
   - Réplicas en lecture

2. **CDN pour Assets**
   - Cloudflare pour images
   - Cache agressif

3. **Queue System**
   - BullMQ pour jobs asynchrones
   - Traitement Strava en background

---

## 🔮 Architecture Future (Avec Strava)

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                      (Inchangé)                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      NEXT.JS API                             │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │ /api/strava/   │  │   Queue Jobs   │  │   Webhooks   │ │
│  │  - connect     │  │   (Sync)       │  │              │ │
│  │  - callback    │  │                │  │              │ │
│  │  - sync        │  │                │  │              │ │
│  └────────────────┘  └────────────────┘  └──────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    STRAVA API                                │
│  - OAuth2.0        - Activities      - Segments             │
│  - Streams         - Webhooks                               │
└─────────────────────────────────────────────────────────────┘
```

**Nouveaux flux** :
1. Connexion OAuth Strava
2. Webhook reçoit nouvelles activités
3. Queue traite les activités en async
4. Validation automatique des ascensions
5. Mise à jour temps réel des stats

---

## 📚 Ressources et Documentation

### Documentation Technique

- **Next.js** : [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase** : [supabase.com/docs](https://supabase.com/docs)
- **React Leaflet** : [react-leaflet.js.org](https://react-leaflet.js.org/)
- **Tailwind CSS** : [tailwindcss.com/docs](https://tailwindcss.com/docs)

### Guides Internes

- `README.md` : Documentation générale
- `QUICKSTART.md` : Installation rapide
- `DEPLOYMENT_CHECKLIST.md` : Checklist déploiement
- `STRAVA_INTEGRATION.md` : Guide intégration Strava

---

## 🎯 Principes de Design

### 1. **Separation of Concerns**
- Server Components pour data fetching
- Client Components pour interactivité
- API Routes pour logique métier

### 2. **Type Safety**
- TypeScript partout
- Types générés depuis DB
- Validation avec Zod (future)

### 3. **Progressive Enhancement**
- Fonctionne sans JS (SSR)
- Enhanced avec JS (interactions)
- Offline-ready (PWA future)

### 4. **Developer Experience**
- Hot reload instantané
- Logs clairs
- Types auto-complétés
- Migrations versionnées

---

**Cette architecture est conçue pour être :**
- ✅ Scalable (du MVP aux millions d'users)
- ✅ Maintenable (code clair et modulaire)
- ✅ Performante (SSR + caching + indexes)
- ✅ Sécurisée (RLS + middleware + validation)
- ✅ Évolutive (prête pour Strava et +)