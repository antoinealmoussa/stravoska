'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface User {
  id: string | null
  pseudo: string | null
  cols_gravis: number | null
  nombre_ascensions: number | null
  denivele_total: number | null
  nombre_sorties: number | null
  isFavorite?: boolean
}

interface UsersListProps {
  users: User[]
  currentUserId: string
}

export default function UsersList({ users, currentUserId }: UsersListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'favorites'>('all')
  const [localUsers, setLocalUsers] = useState(users)
  const supabase = createClient()
  const router = useRouter()

  const filteredUsers = localUsers
    .filter((user) => user.id !== currentUserId) // Exclure l'utilisateur actuel
    .filter((user) =>
      user.pseudo?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((user) => {
      if (filter === 'favorites') {
        return user.isFavorite
      }
      return true
    })

  const toggleFavorite = async (userId: string, isFavorite: boolean) => {
    if (isFavorite) {
      // Retirer des favoris
      await supabase
        .from('favoris')
        .delete()
        .eq('user_id', currentUserId)
        .eq('favori_user_id', userId)
    } else {
      // Ajouter aux favoris
      await supabase.from('favoris').insert({
        user_id: currentUserId,
        favori_user_id: userId,
      })
    }

    // Mettre à jour l'état local
    setLocalUsers(
      localUsers.map((user) =>
        user.id === userId ? { ...user, isFavorite: !isFavorite } : user
      )
    )

    router.refresh()
  }

  const favoriteUsers = localUsers.filter((u) => u.isFavorite && u.id !== currentUserId)

  return (
    <div className="space-y-6">
      {/* Section Favoris */}
      {favoriteUsers.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            ⭐ Mes favoris
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Rechercher un cycliste..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('favorites')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'favorites'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Favoris
            </button>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            Aucun utilisateur trouvé.
          </p>
        )}
      </div>
    </div>
  )
}

function UserCard({
  user,
  onToggleFavorite,
}: {
  user: User
  onToggleFavorite: (userId: string, isFavorite: boolean) => void
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{user.pseudo}</h3>
        </div>
        <button
          onClick={() => onToggleFavorite(user.id || '', user.isFavorite || false)}
          className="text-2xl hover:scale-110 transition-transform"
        >
          {user.isFavorite ? '⭐' : '☆'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <p className="text-gray-500">Cols</p>
          <p className="font-medium text-gray-900">{user.cols_gravis || 0}</p>
        </div>
        <div>
          <p className="text-gray-500">Sorties</p>
          <p className="font-medium text-gray-900">{user.nombre_sorties || 0}</p>
        </div>
        <div>
          <p className="text-gray-500">Ascensions</p>
          <p className="font-medium text-gray-900">
            {user.nombre_ascensions || 0}
          </p>
        </div>
        <div>
          <p className="text-gray-500">D+ total</p>
          <p className="font-medium text-gray-900">
            {Math.round((user.denivele_total || 0) / 1000)}km
          </p>
        </div>
      </div>

      <Link
        href={`/profil/${user.id}`}
        className="block w-full text-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors"
      >
        Voir le profil
      </Link>
    </div>
  )
}