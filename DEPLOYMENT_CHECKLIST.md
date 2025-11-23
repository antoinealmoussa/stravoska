# ✅ Checklist de Déploiement - Cols de Vélo

Guide complet pour déployer l'application en production sur Vercel.

## 🎯 Vue d'Ensemble

**Temps estimé** : 20-30 minutes  
**Coût** : Gratuit (avec les tiers gratuits Vercel + Supabase)  
**Prérequis** : Code fonctionnel en local

---

## 📋 Phase 1 : Préparation (5 min)

### ☐ Vérifier le Code Local

```bash
# Tout doit fonctionner en local
npm run dev

# Tester :
- ☐ Inscription / Connexion
- ☐ Dashboard affiche les stats
- ☐ Carte interactive fonctionne
- ☐ Explorateur liste les utilisateurs
- ☐ Profils accessibles
```

### ☐ Commit & Push sur GitHub

```bash
# Initialiser Git si pas déjà fait
git init
git add .
git commit -m "Initial commit - Cols de Vélo app"

# Créer un repo sur GitHub
# Puis :
git remote add origin https://github.com/your-username/cols-velo.git
git branch -M main
git push -u origin main
```

### ☐ Vérifier les Fichiers

```bash
# S'assurer que ces fichiers existent :
- ☐ .gitignore (ne pas commit .env.local)
- ☐ package.json
- ☐ next.config.js
- ☐ tsconfig.json
- ☐ tailwind.config.ts
- ☐ supabase/migrations/*.sql
```

---

## 📋 Phase 2 : Setup Supabase Production (10 min)

### ☐ Créer le Projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. **Sign up / Log in**
3. **New Project**
   - Organization : Créer ou sélectionner
   - Name : `cols-velo-prod`
   - Database Password : **Noter précieusement**
   - Region : Choisir le plus proche (EU West pour Europe)
   - Pricing Plan : Free
4. Attendre 2-3 minutes que le projet soit créé

### ☐ Récupérer les Credentials

Dans le Dashboard Supabase → Settings → API :

```
Project URL: https://xxxxx.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Les copier dans un fichier temporaire**

### ☐ Migrer la Base de Données

#### Option A : Via Supabase CLI (Recommandé)

```bash
# Lier au projet production
supabase link --project-ref xxxxx

# Pousser les migrations
supabase db push

# Vérifier que tout est OK
supabase db diff
```

#### Option B : Via SQL Editor (Alternative)

1. Dans Supabase Dashboard → SQL Editor
2. **New Query**
3. Copier-coller tout le contenu de `supabase/migrations/init.sql`
4. **Run**
5. Copier-coller le contenu de `supabase/seed.sql`
6. **Run**

### ☐ Configurer l'Auth

Dans Supabase Dashboard → Authentication → URL Configuration :

```
Site URL: https://your-app.vercel.app
Redirect URLs: https://your-app.vercel.app/**
```

**Note** : Vous modifierez cela après le déploiement Vercel

### ☐ Vérifier RLS

Authentication → Policies → Vérifier que toutes les tables ont des policies (doivent être en vert)

---

## 📋 Phase 3 : Déploiement Vercel (5 min)

### ☐ Créer le Projet Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. **Sign up / Log in** (avec GitHub)
3. **Add New... → Project**
4. **Import Git Repository** → Sélectionner `cols-velo`

### ☐ Configurer le Projet

**Framework Preset** : Next.js (détecté automatiquement)

**Root Directory** : `./` (par défaut)

**Build Command** : `npm run build` (par défaut)

**Output Directory** : `.next` (par défaut)

### ☐ Ajouter les Variables d'Environnement

Dans **Environment Variables**, ajouter :

```
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Utiliser les valeurs de production Supabase, pas localhost !**

### ☐ Déployer

1. Cliquer sur **Deploy**
2. Attendre 2-3 minutes
3. ✅ Déployé !

Vous obtiendrez une URL : `https://cols-velo-xxx.vercel.app`

---

## 📋 Phase 4 : Configuration Post-Déploiement (5 min)

### ☐ Mettre à Jour Supabase Auth

Retourner dans Supabase Dashboard → Authentication → URL Configuration :

```
Site URL: https://cols-velo-xxx.vercel.app
Redirect URLs: https://cols-velo-xxx.vercel.app/**
```

### ☐ Tester l'Application

1. Visiter votre URL Vercel
2. **Créer un compte**
3. **Vérifier** :
   - ☐ Inscription fonctionne
   - ☐ Redirection vers dashboard
   - ☐ Carte s'affiche
   - ☐ Cols visibles
   - ☐ Statistiques se mettent à jour
   - ☐ Épinglage fonctionne
   - ☐ Comparaison fonctionne

### ☐ Configurer un Domaine (Optionnel)

Dans Vercel Dashboard → Settings → Domains :

1. Ajouter votre domaine custom
2. Configurer DNS selon instructions
3. Mettre à jour l'URL dans Supabase Auth

---

## 📋 Phase 5 : Optimisations (Optionnel)

### ☐ Performance

- ☐ Activer Edge Functions dans Vercel
- ☐ Configurer ISR pour pages statiques
- ☐ Optimiser les images

### ☐ Monitoring

Dans Vercel :
- ☐ Activer Analytics
- ☐ Configurer Web Vitals

Dans Supabase :
- ☐ Vérifier les logs (Logs Explorer)
- ☐ Configurer les alertes

### ☐ Sécurité

- ☐ Activer HTTPS only
- ☐ Configurer CORS si nécessaire
- ☐ Vérifier RLS policies
- ☐ Rate limiting sur les endpoints sensibles

### ☐ SEO

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: 'Cols de Vélo - Recensez vos ascensions',
  description: 'Suivez vos performances cyclistes...',
  openGraph: {
    title: 'Cols de Vélo',
    description: '...',
    url: 'https://your-domain.com',
    siteName: 'Cols de Vélo',
    images: [
      {
        url: 'https://your-domain.com/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
}
```

---

## 🐛 Troubleshooting

### Erreur "Invalid API key"

```bash
# Vérifier les variables d'environnement
# Dans Vercel → Settings → Environment Variables
# Redéployer après modification
```

### La carte ne s'affiche pas

- Vérifier la console (F12)
- Leaflet CSS bien importé dans globals.css
- Vérifier que l'import est dynamique

### RLS bloque les requêtes

```sql
-- Dans Supabase SQL Editor
SELECT * FROM profiles WHERE id = 'user-id';
-- Si erreur, vérifier les policies
```

### Build Vercel échoue

```bash
# Localement, tester :
npm run build

# Si ça échoue, corriger les erreurs TypeScript
# Puis push et redéployer
```

---

## 📊 Monitoring Post-Déploiement

### Première Semaine

- ☐ Vérifier les logs d'erreur quotidiennement
- ☐ Surveiller les temps de réponse
- ☐ Tester sur différents devices
- ☐ Collecter les premiers retours utilisateurs

### Métriques à Suivre

1. **Performance** (Web Vitals)
   - LCP < 2.5s
   - FID < 100ms
   - CLS < 0.1

2. **Base de données**
   - Nombre de requêtes
   - Temps de réponse
   - Utilisation stockage

3. **Utilisateurs**
   - Inscriptions
   - Taux de rétention
   - Fonctionnalités utilisées

---

## 🚀 Après le Déploiement

### ☐ Communication

- ☐ Annoncer sur les réseaux sociaux
- ☐ Créer une page "À propos"
- ☐ Ajouter un formulaire de contact/feedback

### ☐ Documentation Utilisateur

- ☐ Guide de démarrage rapide
- ☐ FAQ
- ☐ Tutoriels vidéo

### ☐ Roadmap

Prochaines fonctionnalités (voir STRAVA_INTEGRATION.md) :
1. Intégration Strava
2. Import GPX
3. Leaderboards
4. Notifications
5. Export PDF

---

## 📞 Support

En cas de problème :

1. **Vercel** : [vercel.com/support](https://vercel.com/support)
2. **Supabase** : [supabase.com/docs](https://supabase.com/docs)
3. **Community** : Discord Vercel / Supabase

---

## ✨ Félicitations !

Votre application est maintenant en production ! 🎉

**URL Production** : https://cols-velo-xxx.vercel.app

**Prochaines étapes** :
- Collecter les retours
- Itérer rapidement
- Ajouter des fonctionnalités
- Intégrer Strava

**Bon courage pour la suite ! 🚴‍♂️**