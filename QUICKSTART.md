# 🚀 Guide de Démarrage Rapide - Cols de Vélo

Ce guide vous permettra de lancer l'application en 10 minutes.

## ⚡ Installation Express

### 1. Prérequis (5 min)

```bash
# Installer Node.js (si pas déjà fait)
# Télécharger depuis https://nodejs.org

# Installer Supabase CLI
npm install -g supabase

# Vérifier Docker est installé et lancé
docker --version
```

### 2. Setup du Projet (2 min)

```bash
# Cloner et entrer dans le projet
git clone <your-repo>
cd cols-velo

# Installer les dépendances
npm install

# Initialiser Supabase
npx supabase init
```

### 3. Démarrer Supabase (1 min)

```bash
# Démarrer Supabase (première fois = téléchargement Docker images)
npx supabase start

# ⚠️ IMPORTANT : Copier l'API URL et anon key affichés
```

Vous verrez quelque chose comme :
```
API URL: http://127.0.0.1:54321
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Configuration Environnement (1 min)

```bash
# Créer le fichier .env.local
cp .env.local.example .env.local

# Éditer .env.local et remplacer par vos valeurs
```

Contenu de `.env.local` :
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Créer la Base de Données (1 min)

```bash
# Copier le SQL d'initialisation
# Créer le fichier supabase/migrations/20240101000000_init.sql
# Y copier tout le contenu du fichier init.sql fourni
# Créer le fichier supabase/seed.sql
# Appliquer les migrations
npx supabase db reset
```

### 6. Lancer l'Application (10 sec)

```bash
npm run dev
```

Ouvrir http://localhost:3000 🎉

## 🎯 Premiers Pas

### Créer un Compte

1. Cliquer sur "Commencer gratuitement"
2. Remplir le formulaire :
   - Prénom, Nom
   - Pseudo (unique)
   - Email, Mot de passe
3. Vous serez automatiquement connecté !

### Explorer l'Application

1. **Dashboard** : Voir vos statistiques (vides au début)
2. **Carte** : Visualiser les 15 cols de test
3. **Explorateur** : Voir les autres utilisateurs (créez-en plusieurs pour tester)

### Tester les Fonctionnalités

#### Générer des Ascensions de Test

Ouvrir Supabase Studio : http://127.0.0.1:54323

Aller dans SQL Editor et exécuter :

```sql
-- Remplacer 'your-user-id' par votre ID (visible dans l'URL du profil)
SELECT generate_test_ascensions('your-user-id', 5);
```

Rafraîchir le dashboard → Vous verrez vos statistiques !

#### Épingler un Col

1. Aller sur la Carte
2. Cliquer sur un marqueur
3. Cliquer "📌 Épingler"
4. Retour au Dashboard → Le col apparaît dans "Cols épinglés"

#### Comparer avec un Autre Utilisateur

1. Créer un second compte (navigateur privé)
2. Générer des ascensions différentes
3. Sur la Carte → Sélectionner l'utilisateur dans "Comparer avec"
4. Les couleurs changent selon qui a gravi quoi !

## 🔧 Commandes Utiles

```bash
# Développement
npm run dev                 # Démarrer l'app

# Supabase
supabase status            # Voir l'état de Supabase
supabase db reset          # Réinitialiser la DB
supabase studio            # Ouvrir Studio (GUI)
supabase stop              # Arrêter Supabase

# Database
supabase db diff           # Voir les changements DB
supabase migration new nom # Créer une nouvelle migration
```

## 🎨 Ajouter des Cols

Dans Supabase Studio (http://127.0.0.1:54323), SQL Editor :

```sql
INSERT INTO cols (nom, altitude, latitude, longitude, denivele, distance_km, pente_moyenne, pays, region, difficulte)
VALUES 
('Mon Col Local', 1200, 45.5, 6.5, 600, 8.5, 7.0, 'France', 'Ma Région', 'moyen');
```

## 🐛 Résolution de Problèmes

### Supabase ne démarre pas
```bash
# Redémarrer Docker
# Puis
supabase stop
supabase start
```

### "Invalid API key"
- Vérifier `.env.local` correspond aux valeurs de `supabase start`
- Redémarrer `npm run dev`

### La carte ne s'affiche pas
- Attendre quelques secondes (Leaflet charge)
- Vérifier la console (F12) pour erreurs
- Vider le cache navigateur

### Pas de cols visibles
```bash
# Re-insérer les données
supabase db execute < supabase/seed.sql
```

## 📱 Accéder depuis Mobile

```bash
# Trouver votre IP locale
# Windows : ipconfig
# Mac/Linux : ifconfig

# Modifier .env.local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
# Reste le même

# Accéder depuis mobile sur le même réseau
http://YOUR-LOCAL-IP:3000
```

## 🚀 Prêt pour la Production ?

Voir le [README.md](README.md) section "Déploiement sur Vercel" pour :
- Créer un projet Supabase en production
- Déployer sur Vercel
- Configurer les variables d'environnement

## 💡 Astuces

### Données de Développement Réalistes

```sql
-- Créer plusieurs utilisateurs tests via l'UI
-- Puis pour chacun :
SELECT generate_test_ascensions('user-id-1', 8);
SELECT generate_test_ascensions('user-id-2', 5);
SELECT generate_test_ascensions('user-id-3', 12);

-- Vérifier dans user_statistics
SELECT * FROM user_statistics ORDER BY cols_gravis DESC;
```

### Reset Complet

```bash
supabase db reset
supabase db execute < supabase/seed.sql
# Créer de nouveaux comptes
```

### Performance Tips

- Utiliser les index (déjà créés dans init.sql)
- Les vues matérialisées pour grandes données (pas nécessaire en dev)
- Limiter les requêtes avec `.limit()`

## 📚 Prochaines Étapes

1. **Explorer le code** : Commencer par `app/page.tsx`
2. **Modifier les styles** : Tailwind dans les composants
3. **Ajouter des fonctionnalités** : Voir la roadmap dans README.md
4. **Intégrer Strava** : Structure prête !

## 🆘 Besoin d'Aide ?

- Consulter le [README.md](README.md) complet
- Vérifier les logs : `supabase logs`
- Console navigateur (F12)
- Documentation Supabase : https://supabase.com/docs

---

**Happy Coding! 🚴‍♂️**