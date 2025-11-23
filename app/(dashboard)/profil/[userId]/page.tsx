import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import StatsCards from '@/components/dashboard/StatsCards'
import RecentAscensions from '@/components/dashboard/RecentAscensions'

export default async function ProfilPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const supabase = await createClient()

  // Récupérer le profil de l'utilisateur
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    notFound()
  }

  // Récupérer les statistiques
  const { data: stats } = await supabase
    .from('user_statistics')
    .select('*')
    .eq('id', userId)
    .single()

  // Compter le nombre total de cols
  const { count: totalCols } = await supabase
    .from('cols')
    .select('*', { count: 'exact', head: true })

  // Récupérer les ascensions récentes
  const { data: recentAscensions } = await supabase
    .from('ascensions')
    .select(`
      *,
      cols (*)
    `)
    .eq('user_id', userId)
    .eq('validee', true)
    .order('date_ascension', { ascending: false })
    .limit(10)

  const statsData = {
    colsGravis: stats?.cols_gravis || 0,
    totalCols: totalCols || 0,
    nombreAscensions: stats?.nombre_ascensions || 0,
    deniveleTotal: stats?.denivele_total || 0,
    nombreSorties: stats?.nombre_sorties || 0,
  }

  return (
    <div className="space-y-8">
      {/* En-tête du profil */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
            {profile.prenom[0]}{profile.nom[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {profile.prenom} {profile.nom}
            </h1>
            <p className="text-xl text-gray-600">@{profile.pseudo}</p>
            <p className="text-sm text-gray-500 mt-2">
              Membre depuis {new Date(profile.created_at).toLocaleDateString('fr-FR', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Statistiques</h2>
        <StatsCards stats={statsData} />
      </div>

      {/* Ascensions récentes */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ascensions récentes
        </h2>
        <RecentAscensions ascensions={recentAscensions || []} />
      </div>
    </div>
  )
}