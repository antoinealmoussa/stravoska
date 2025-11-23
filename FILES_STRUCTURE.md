# 📂 Structure Complète des Fichiers

Liste exhaustive de tous les fichiers à créer pour l'application Cols de Vélo.

## 🎯 Légende

- ✅ = Fichier fourni dans les artifacts
- 📝 = À créer manuellement
- 🔧 = Configuration auto-générée

---

## 📦 Fichiers Racine

```
cols-velo/
├── ✅ package.json                    # Dépendances et scripts
├── ✅ tsconfig.json                   # Configuration TypeScript
├── ✅ next.config.js                  # Configuration Next.js
├── ✅ tailwind.config.ts              # Configuration Tailwind
├── 📝 postcss.config.js               # Configuration PostCSS (auto)
├── ✅ .gitignore                      # Fichiers à ignorer
├── ✅ .env.local.example              # Template variables d'env
├── 📝 .env.local                      # Variables d'env (à créer)
├── ✅ README.md                       # Documentation principale
├── ✅ QUICKSTART.md                   # Guide démarrage rapide
├── ✅ DEPLOYMENT_CHECKLIST.md         # Checklist déploiement
├── ✅ STRAVA_INTEGRATION.md           # Guide intégration Strava
├── ✅ ARCHITECTURE.md                 # Documentation architecture
└── ✅ FILES_STRUCTURE.md              # Ce fichier
```

---

## 📱 Application Next.js (`/app`)

### Fichiers Racine

```
app/
├── ✅ layout.tsx                      # Layout racine
├── ✅ page.tsx                        # Page d'accueil (landing)
└── ✅ globals.css                     # Styles globaux
```

### Routes d'Authentification (`/app/(auth)`)

```
app/(auth)/
├── login/
│   └── ✅ page.tsx                   # Page de connexion
└── register/
    └── ✅ page.tsx                   # Page d'inscription
```

### Routes Principales (`/app/(dashboard)`)

```
app/(dashboard)/
├── ✅ layout.tsx                      # Layout avec Navigation
├── dashboard/
│   └── ✅ page.tsx                   # Tableau de bord
├── carte/
│   └── ✅ page.tsx                   # Carte interactive
├── explorateur/
│   └── ✅ page.tsx                   # Liste utilisateurs
└── profil/
    └── [userId]/
        └── ✅ page.tsx               # Profil utilisateur
```

### Routes API (`/app/api`)

```
app/api/
└── strava/                           # (Future - préparé)
    ├── 📝 connect/
    │   └── route.ts                  # Initier OAuth
    ├── 📝 callback/
    │   └── route.ts                  # Callback OAuth
    └── 📝 sync/
        └── route.ts                  # Synchroniser activités
```

---

## 🧩 Composants React (`/components`)

### Composants Dashboard

```
components/dashboard/
├── ✅ StatsCards.tsx                  # Cartes statistiques
└── ✅ RecentAscensions.tsx            # Liste ascensions récentes
```

### Composants Explorateur

```
components/explorateur/
└── ✅ UsersList.tsx                   # Liste + recherche utilisateurs
```

### Composants Carte

```
components/map/
└── ✅ InteractiveMap.tsx              # Carte Leaflet interactive
```

### Composants Partagés

```
components/shared/
└── ✅ Navigation.tsx                  # Barre de navigation
```

### Composants Auth (Future)

```
components/auth/
├── 📝 LoginForm.tsx                   # Formulaire connexion
└── 📝 RegisterForm.tsx                # Formulaire inscription
```

### Composants Strava (Future)

```
components/strava/
├── 📝 ConnectButton.tsx               # Bouton connexion Strava
└── 📝 SyncButton.tsx                  # Bouton synchronisation
```

---

## 📚 Bibliothèques (`/lib`)

### Supabase

```
lib/supabase/
├── ✅ client.ts                       # Client browser
└── ✅ server.ts                       # Client server
```

### Types

```
lib/types/
└── ✅ database.types.ts               # Types DB générés
```

### Utilitaires (Future)

```
lib/utils/
├── 📝 date.ts                         # Formatage dates
├── 📝 format.ts                       # Formatage nombres
└── 📝 validation.ts                   # Validation données
```

---

## 🗄️ Supabase (`/supabase`)

### Configuration

```
supabase/
├── ✅ config.toml                     # Config Supabase CLI
└── .gitignore                        # (auto-créé)
```

### Migrations

```
supabase/migrations/
└── ✅ 20240101000000_init.sql        # Migration initiale
```

### Données de Test

```
supabase/
└── ✅ seed.sql                        # 15 cols célèbres
```

---

## 🔧 Fichiers de Configuration

### TypeScript

```
✅ tsconfig.json                       # Configuration TS
🔧 next-env.d.ts                       # Types Next.js (auto)
```

### Styles

```
✅ tailwind.config.ts                  # Config Tailwind
📝 postcss.config.js                   # Config PostCSS
```

### Next.js

```
✅ next.config.js                      # Config Next.js
✅ middleware.ts                       # Middleware auth (racine)
```

### Git

```
✅ .gitignore                          # Fichiers ignorés
```

### Environnement

```
✅ .env.local.example                  # Template
📝 .env.local                          # Variables réelles (ne pas commit)
```

---

## 📝 Fichiers Publics (`/public`)

```
public/
├── 📝 favicon.ico                     # Favicon
├── 📝 og-image.png                    # Image Open Graph
└── 📝 robots.txt                      # SEO
```

---

## 🚀 Commandes de Création

### 1. Initialiser le Projet

```bash
# Créer le dossier
mkdir cols-velo
cd cols-velo

# Initialiser npm
npm init -y

# Installer les dépendances
npm install next@latest react@latest react-dom@latest
npm install @supabase/ssr @supabase/supabase-js
npm install leaflet react-leaflet
npm install zod

# Dev dependencies
npm install -D typescript @types/node @types/react @types/react-dom
npm install -D @types/leaflet
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Créer la Structure

```bash
# Dossiers app
mkdir -p app/{(auth)/{login,register},(dashboard)/{dashboard,carte,explorateur,profil/[userId]},api/strava/{connect,callback,sync}}

# Dossiers components
mkdir -p components/{auth,dashboard,explorateur,map,shared,strava}

# Dossiers lib
mkdir -p lib/{supabase,types,utils}

# Dossier supabase
mkdir -p supabase/migrations

# Dossier public
mkdir public
```

### 3. Créer les Fichiers Vides

```bash
# App
touch app/layout.tsx app/page.tsx app/globals.css
touch app/\(auth\)/login/page.tsx
touch app/\(auth\)/register/page.tsx
touch app/\(dashboard\)/layout.tsx
touch app/\(dashboard\)/dashboard/page.tsx
touch app/\(dashboard\)/carte/page.tsx
touch app/\(dashboard\)/explorateur/page.tsx
touch app/\(dashboard\)/profil/\[userId\]/page.tsx

# Components
touch components/dashboard/StatsCards.tsx
touch components/dashboard/RecentAscensions.tsx
touch components/explorateur/UsersList.tsx
touch components/map/InteractiveMap.tsx
touch components/shared/Navigation.tsx

# Lib
touch lib/supabase/client.ts
touch lib/supabase/server.ts
touch lib/types/database.types.ts

# Supabase
touch supabase/config.toml
touch supabase/migrations/20240101000000_init.sql
touch supabase/seed.sql

# Config
touch tsconfig.json
touch next.config.js
touch tailwind.config.ts
touch middleware.ts
touch .gitignore
touch .env.local.example

# Docs
touch README.md QUICKSTART.md DEPLOYMENT_CHECKLIST.md
touch STRAVA_INTEGRATION.md ARCHITECTURE.md FILES_STRUCTURE.md
```

---

## ✅ Checklist de Vérification

### Avant de Démarrer

- [ ] Tous les dossiers créés
- [ ] `package.json` configuré
- [ ] Dépendances installées
- [ ] `.env.local` créé et rempli
- [ ] Supabase local démarré
- [ ] Migrations appliquées

### Fichiers Essentiels

#### Configuration
- [ ] `package.json`
- [ ] `tsconfig.json`
- [ ] `next.config.js`
- [ ] `tailwind.config.ts`
- [ ] `middleware.ts`

#### App
- [ ] `app/layout.tsx`
- [ ] `app/page.tsx`
- [ ] `app/globals.css`
- [ ] Pages auth (login, register)
- [ ] Pages dashboard (toutes)

#### Components
- [ ] Navigation
- [ ] StatsCards
- [ ] RecentAscensions
- [ ] UsersList
- [ ] InteractiveMap

#### Lib
- [ ] Clients Supabase (client + server)
- [ ] Types database

#### Supabase
- [ ] `config.toml`
- [ ] Migration initiale
- [ ] Seed data

#### Documentation
- [ ] README.md
- [ ] QUICKSTART.md
- [ ] Autres docs

---

## 🔍 Vérifier l'Intégrité

### Commande de Vérification

```bash
# Vérifier que tous les fichiers essentiels existent
ls -la app/layout.tsx \
       app/page.tsx \
       app/globals.css \
       components/shared/Navigation.tsx \
       lib/supabase/client.ts \
       lib/supabase/server.ts \
       supabase/migrations/20240101000000_init.sql
```

### Structure Complète Attendue

```bash
# Lister toute la structure
tree -L 3 -I 'node_modules|.next|.git'
```

Devrait afficher environ :
- **20-25 fichiers** de code source
- **5-6 fichiers** de configuration
- **4-5 fichiers** de documentation
- **Total : ~35 fichiers**

---

## 🎯 Priorités de Création

### Phase 1 : Configuration (15 min)
1. ✅ package.json
2. ✅ tsconfig.json
3. ✅ next.config.js
4. ✅ tailwind.config.ts
5. ✅ .gitignore
6. .env.local

### Phase 2 : Base de Données (10 min)
1. ✅ supabase/config.toml
2. ✅ supabase/migrations/init.sql
3. ✅ supabase/seed.sql

### Phase 3 : Types & Utils (5 min)
1. ✅ lib/types/database.types.ts
2. ✅ lib/supabase/client.ts
3. ✅ lib/supabase/server.ts
4. ✅ middleware.ts

### Phase 4 : Pages & Layouts (20 min)
1. ✅ app/layout.tsx + globals.css
2. ✅ app/page.tsx
3. ✅ app/(auth)/login/page.tsx
4. ✅ app/(auth)/register/page.tsx
5. ✅ app/(dashboard)/layout.tsx
6. ✅ Toutes les pages dashboard

### Phase 5 : Composants (20 min)
1. ✅ components/shared/Navigation.tsx
2. ✅ components/dashboard/*
3. ✅ components/explorateur/*
4. ✅ components/map/*

### Phase 6 : Documentation (10 min)
1. ✅ README.md
2. ✅ QUICKSTART.md
3. ✅ Autres docs

**Total : ~1h20 de création de fichiers**

---

## 🎨 Template de Fichier Vide

### Pour un Composant React

```typescript
// components/example/Example.tsx
interface ExampleProps {
  // Props ici
}

export default function Example({}: ExampleProps) {
  return (
    <div>
      {/* Contenu ici */}
    </div>
  )
}
```

### Pour une Page

```typescript
// app/example/page.tsx
export default function ExamplePage() {
  return (
    <div>
      <h1>Example Page</h1>
    </div>
  )
}
```

### Pour un Client Utility

```typescript
// lib/utils/example.ts
export function exampleFunction() {
  // Logique ici
}
```

---

**Avec cette structure, vous avez tout ce qu'il faut pour démarrer ! 🚀**