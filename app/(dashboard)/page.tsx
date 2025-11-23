import { createClient } from '@/lib/supabase/server'
import StatsCards from '@/components/dashboard/StatsCards'
import RecentAscensions from '@/components/dashboard/RecentAscensions'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Récupérer les statistiques
  const { data: stats } = await supabase
    .from('user_statistics')
    .select('*')
    .eq('id', user.id)
    .single()

  // Compter le nombre total de cols
  const { count: totalCols } = await supabase
    .from('cols')
    .select('*', { count: 'exact', head: true })

  // Récupérer les ascensions récentes avec détails des cols
  const { data: recentAscensions } = await supabase
    .from('ascensions')
    .select(`
      *,
      cols (*)
    `)
    .eq('user_id', user.id)
    .eq('validee', true)
    .order('date_ascension', { ascending: false })
    .limit(5)

  // Récupérer les cols épinglés
  const { data: pinnedCols } = await supabase
    .from('cols_epingles')
    .select(`
      *,
      cols (*)
    `)
    .eq('user_id', user.id)

  const statsData = {
    colsGravis: stats?.cols_gravis || 0,
    totalCols: totalCols || 0,
    nombreAscensions: stats?.nombre_ascensions || 0,
    deniveleTotal: stats?.denivele_total || 0,
    nombreSorties: stats?.nombre_sorties || 0,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
        <p className="text-gray-600">
          Bienvenue ! Voici un aperçu de vos performances cyclistes.
        </p>
      </div>

      <StatsCards stats={statsData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentAscensions ascensions={recentAscensions || []} />
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            📍 Cols épinglés
          </h2>
          {pinnedCols && pinnedCols.length > 0 ? (
            <div className="space-y-3">
              {pinnedCols.slice(0, 5).map((pinned: any) => (
                <div
                  key={pinned.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{pinned.cols.nom}</p>
                    <p className="text-sm text-gray-500">
                      {pinned.cols.altitude}m • {pinned.cols.denivele}m D+
                    </p>
                    {pinned.note && (
                      <p className="text-xs text-gray-600 mt-1 italic">{pinned.note}</p>
                    )}
                  </div>
                  <span className="text-2xl">📌</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Aucun col épinglé pour le moment.
              <br />
              <span className="text-sm">Rendez-vous sur la carte pour en ajouter !</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}