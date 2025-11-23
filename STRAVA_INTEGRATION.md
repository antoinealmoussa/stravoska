# 🔗 Guide d'Intégration Strava

Ce document explique comment intégrer l'API Strava pour synchroniser automatiquement les activités.

## 📋 Prérequis

1. Compte Strava
2. Application Strava créée sur [strava.com/settings/api](https://www.strava.com/settings/api)
3. Structure de base de données déjà en place ✅

## 🏗️ Structure Déjà Prête

### Base de Données
Les champs Strava sont déjà présents dans :
- `profiles` : `strava_id`, `strava_access_token`, `strava_refresh_token`, `strava_expires_at`
- `cols` : `strava_segment_id`
- `ascensions` : `strava_activity_id`

### UI
- Bouton "Se connecter avec Strava" dans `/login`
- Placeholder prêt à être activé

## 🔧 Configuration

### 1. Créer une Application Strava

1. Aller sur https://www.strava.com/settings/api
2. Créer une nouvelle application
3. Noter :
   - **Client ID**
   - **Client Secret**
4. Configurer l'URL de callback :
   - Dev : `http://localhost:3000/api/strava/callback`
   - Prod : `https://your-domain.com/api/strava/callback`

### 2. Variables d'Environnement

Ajouter à `.env.local` :

```bash
STRAVA_CLIENT_ID=your-client-id
STRAVA_CLIENT_SECRET=your-client-secret
STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback
```

## 📝 Implémentation

### Étape 1 : Routes API OAuth

#### `app/api/strava/connect/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const clientId = process.env.STRAVA_CLIENT_ID
  const redirectUri = process.env.STRAVA_REDIRECT_URI
  
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=activity:read_all`
  
  return NextResponse.redirect(authUrl)
}
```

#### `app/api/strava/callback/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  
  if (!code) {
    return NextResponse.redirect('/dashboard?error=strava_auth_failed')
  }

  // Échanger le code contre un token
  const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  })

  const tokenData = await tokenResponse.json()

  // Sauvegarder dans Supabase
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await supabase
      .from('profiles')
      .update({
        strava_id: tokenData.athlete.id,
        strava_access_token: tokenData.access_token,
        strava_refresh_token: tokenData.refresh_token,
        strava_expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
      })
      .eq('id', user.id)
  }

  return NextResponse.redirect('/dashboard?strava=connected')
}
```

### Étape 2 : Synchronisation des Activités

#### `app/api/strava/sync/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Récupérer le profil avec tokens Strava
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.strava_access_token) {
    return NextResponse.json({ error: 'Strava not connected' }, { status: 400 })
  }

  // Vérifier si le token est expiré et le rafraîchir si nécessaire
  let accessToken = profile.strava_access_token
  if (new Date(profile.strava_expires_at) < new Date()) {
    accessToken = await refreshStravaToken(profile)
  }

  // Récupérer les activités
  const activitiesResponse = await fetch(
    'https://www.strava.com/api/v3/athlete/activities?per_page=50',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  const activities = await activitiesResponse.json()

  // Filtrer les activités de vélo
  const rideActivities = activities.filter(
    (a: any) => a.type === 'Ride' || a.type === 'VirtualRide'
  )

  // Traiter chaque activité
  const processedCount = await processActivities(rideActivities, user.id, supabase)

  return NextResponse.json({
    success: true,
    activitiesProcessed: processedCount,
  })
}

async function refreshStravaToken(profile: any) {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: profile.strava_refresh_token,
    }),
  })

  const data = await response.json()
  
  // Mettre à jour le profil
  const supabase = await createClient()
  await supabase
    .from('profiles')
    .update({
      strava_access_token: data.access_token,
      strava_refresh_token: data.refresh_token,
      strava_expires_at: new Date(data.expires_at * 1000).toISOString(),
    })
    .eq('id', profile.id)

  return data.access_token
}

async function processActivities(
  activities: any[],
  userId: string,
  supabase: any
) {
  let count = 0

  for (const activity of activities) {
    // Vérifier si l'activité existe déjà
    const { data: existing } = await supabase
      .from('ascensions')
      .select('id')
      .eq('strava_activity_id', activity.id)
      .single()

    if (existing) continue

    // Identifier le col gravi (à implémenter selon votre logique)
    const colId = await identifyCol(activity, supabase)
    
    if (colId) {
      await supabase.from('ascensions').insert({
        user_id: userId,
        col_id: colId,
        date_ascension: activity.start_date,
        temps_secondes: activity.elapsed_time,
        vitesse_moyenne_kmh: activity.average_speed * 3.6,
        frequence_cardiaque_moyenne: activity.average_heartrate,
        puissance_moyenne_watts: activity.average_watts,
        strava_activity_id: activity.id,
        validee: true, // Ou false, nécessitant validation manuelle
      })
      count++
    }
  }

  return count
}

async function identifyCol(activity: any, supabase: any) {
  // LOGIQUE SIMPLIFIÉE - À AMÉLIORER
  // Option 1 : Utiliser les segments Strava
  // Option 2 : Analyser la polyline de l'activité
  // Option 3 : Comparer les coordonnées avec les cols
  
  // Exemple basique : chercher par segment
  if (activity.segment_efforts && activity.segment_efforts.length > 0) {
    const segmentIds = activity.segment_efforts.map((s: any) => s.segment.id)
    
    const { data: col } = await supabase
      .from('cols')
      .select('id')
      .in('strava_segment_id', segmentIds)
      .single()
    
    return col?.id
  }
  
  return null
}
```

### Étape 3 : Composant UI de Synchronisation

#### `components/strava/SyncButton.tsx`

```typescript
'use client'

import { useState } from 'react'

export default function StravaSyncButton() {
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState('')

  const handleSync = async () => {
    setSyncing(true)
    setMessage('')

    try {
      const response = await fetch('/api/strava/sync', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`✅ ${data.activitiesProcessed} activités synchronisées`)
      } else {
        setMessage('❌ Erreur lors de la synchronisation')
      }
    } catch (error) {
      setMessage('❌ Erreur réseau')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleSync}
        disabled={syncing}
        className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-400"
      >
        {syncing ? 'Synchronisation...' : '🔄 Synchroniser Strava'}
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  )
}
```

### Étape 4 : Activer le Bouton de Connexion

Dans `app/(auth)/login/page.tsx`, remplacer le bouton disabled par :

```typescript
<Link
  href="/api/strava/connect"
  className="mt-4 w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
>
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
  </svg>
  Se connecter avec Strava
</Link>
```

## 🎯 Validation des Ascensions

### Logique de Validation

Pour valider qu'un col a été gravi en entier :

```typescript
async function validateAscension(activity: any, col: any) {
  // Récupérer le stream de l'activité (GPS, altitude)
  const streamResponse = await fetch(
    `https://www.strava.com/api/v3/activities/${activity.id}/streams?keys=latlng,altitude&key_by_type=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  
  const streams = await streamResponse.json()
  
  // Vérifier que le point le plus haut atteint correspond au sommet
  const maxAltitude = Math.max(...streams.altitude.data)
  const colAltitude = col.altitude
  
  const altitudeTolerance = 50 // 50m de tolérance
  
  if (Math.abs(maxAltitude - colAltitude) <= altitudeTolerance) {
    // Vérifier aussi que le départ est au bas du col
    const startAltitude = streams.altitude.data[0]
    const expectedStartAltitude = colAltitude - col.denivele
    
    if (Math.abs(startAltitude - expectedStartAltitude) <= altitudeTolerance) {
      return true
    }
  }
  
  return false
}
```

## 📊 Webhooks Strava (Optionnel)

Pour recevoir les nouvelles activités en temps réel :

### 1. Créer le webhook

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=YOUR_CLIENT_ID \
  -F client_secret=YOUR_CLIENT_SECRET \
  -F callback_url=https://your-domain.com/api/strava/webhook \
  -F verify_token=YOUR_VERIFY_TOKEN
```

### 2. Implémenter le endpoint

```typescript
// app/api/strava/webhook/route.ts
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('hub.mode')
  const token = request.nextUrl.searchParams.get('hub.verify_token')
  const challenge = request.nextUrl.searchParams.get('hub.challenge')
  
  if (mode === 'subscribe' && token === process.env.STRAVA_VERIFY_TOKEN) {
    return NextResponse.json({ 'hub.challenge': challenge })
  }
  
  return NextResponse.json({ error: 'Invalid request' }, { status: 403 })
}

export async function POST(request: NextRequest) {
  const event = await request.json()
  
  // Traiter l'événement (nouvelle activité, etc.)
  if (event.aspect_type === 'create' && event.object_type === 'activity') {
    // Récupérer et traiter l'activité
    await processNewActivity(event.object_id, event.owner_id)
  }
  
  return NextResponse.json({ success: true })
}
```

## 🧪 Test de l'Intégration

1. **Connexion** : Cliquer sur "Se connecter avec Strava"
2. **Autorisation** : Accepter les permissions sur Strava
3. **Synchronisation** : Cliquer sur "Synchroniser"
4. **Vérification** : Voir les nouvelles ascensions dans le dashboard

## 📝 Checklist d'Implémentation

- [ ] Créer l'application Strava
- [ ] Configurer les variables d'environnement
- [ ] Implémenter les routes OAuth (`/connect`, `/callback`)
- [ ] Implémenter la synchronisation (`/sync`)
- [ ] Activer le bouton de connexion dans l'UI
- [ ] Ajouter le bouton de synchronisation au dashboard
- [ ] Implémenter la logique de validation
- [ ] Mapper les segments Strava aux cols
- [ ] Tester avec des vraies données
- [ ] (Optionnel) Configurer les webhooks

## 🔐 Sécurité

- Ne jamais exposer `STRAVA_CLIENT_SECRET` côté client
- Stocker les tokens de manière sécurisée (déjà fait avec Supabase RLS)
- Rafraîchir les tokens expirés
- Valider toutes les données reçues de l'API

## 📚 Ressources

- [Documentation Strava API](https://developers.strava.com/docs/)
- [OAuth Flow](https://developers.strava.com/docs/authentication/)
- [Activity Streams](https://developers.strava.com/docs/reference/#api-Streams)

---

**L'intégration Strava transformera cette application ! 🚀**