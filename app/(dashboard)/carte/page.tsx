import { createClient } from '@/lib/supabase/server'
import dynamic from 'next/dynamic'

// Import dynamique pour éviter les erreurs SSR avec Leaflet
const InteractiveMap = dynamic(
  () => import('@/components/map/InteractiveMap'),
  { ssr: !!false }
)

export default async function CartePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Récupérer tous les cols
  const { data: cols } = await supabase
    .from('cols')
    .select('*')
    .order('nom')

  // Récupérer les cols gravis par l'utilisateur
  const { data: ascensions } = await supabase
    .from('ascensions')
    .select('col_id')
    .eq('user_id', user.id)
    .eq('validee', true)

  const colsGravisIds = ascensions?.map((a) => a.col_id) || []

  // Récupérer les cols épinglés
  const { data: pinnedCols } = await supabase
    .from('cols_epingles')
    .select('col_id')
    .eq('user_id', user.id)

  const pinnedColsIds = pinnedCols?.map((p) => p.col_id) || []

  // Enrichir les cols avec leur statut
  const colsWithStatus = cols?.map((col) => ({
    ...col,
    gravi: colsGravisIds.includes(col.id),
    epingle: pinnedColsIds.includes(col.id),
  }))

  // Récupérer tous les utilisateurs pour la comparaison
  const { data: users } = await supabase
    .from('profiles')
    .select('id, pseudo')
    .neq('id', user.id)
    .order('pseudo')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Carte interactive</h1>
        <p className="text-gray-600">
          Visualisez tous les cols et comparez vos ascensions avec d'autres cyclistes.
        </p>
      </div>

      <InteractiveMap
        cols={colsWithStatus || []}
        currentUserId={user.id}
        users={users || []}
      />
    </div>
  )
}