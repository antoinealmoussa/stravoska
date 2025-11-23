import { createClient } from '@/lib/supabase/server'
import UsersList from '@/components/explorateur/UsersList'

export default async function ExplorateurPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Récupérer tous les utilisateurs avec leurs stats
  const { data: users } = await supabase
    .from('user_statistics')
    .select('*')
    .order('cols_gravis', { ascending: false })

  // Récupérer les favoris de l'utilisateur
  const { data: favoris } = await supabase
    .from('favoris')
    .select('favori_user_id')
    .eq('user_id', user.id)

  const favorisIds = favoris?.map((f) => f.favori_user_id) || []

  // Enrichir les utilisateurs avec le statut favori
  const usersWithFavorites = users?.map((u) => ({
    ...u,
    isFavorite: favorisIds.includes(u.id || ''),
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explorateur</h1>
        <p className="text-gray-600">
          Découvrez les performances des autres cyclistes et ajoutez-les à vos favoris.
        </p>
      </div>

      <UsersList 
        users={usersWithFavorites || []} 
        currentUserId={user.id}
      />
    </div>
  )
}