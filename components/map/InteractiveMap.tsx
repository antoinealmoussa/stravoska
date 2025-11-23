'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ColWithStatus } from '@/lib/types/database.types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface InteractiveMapProps {
  cols: ColWithStatus[]
  currentUserId: string
  users: { id: string; pseudo: string }[]
}

export default function InteractiveMap({
  cols,
  currentUserId,
  users,
}: InteractiveMapProps) {
  const [filteredCols, setFilteredCols] = useState(cols)
  const [filter, setFilter] = useState<'all' | 'gravi' | 'nonGravi' | 'epingle'>('all')
  const [compareUserId, setCompareUserId] = useState<string | null>(null)
  const [compareUserCols, setCompareUserCols] = useState<string[]>([])
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    applyFilters()
  }, [filter, compareUserId, cols])

  const applyFilters = async () => {
    let filtered = cols

    if (filter === 'gravi') {
      filtered = cols.filter((col) => col.gravi)
    } else if (filter === 'nonGravi') {
      filtered = cols.filter((col) => !col.gravi)
    } else if (filter === 'epingle') {
      filtered = cols.filter((col) => col.epingle)
    }

    // Si mode comparaison, récupérer les cols de l'autre utilisateur
    if (compareUserId) {
      const { data: otherUserAscensions } = await supabase
        .from('ascensions')
        .select('col_id')
        .eq('user_id', compareUserId)
        .eq('validee', true)

      const otherUserColIds = otherUserAscensions?.map((a) => a.col_id) || []
      setCompareUserCols(otherUserColIds)
    } else {
      setCompareUserCols([])
    }

    setFilteredCols(filtered)
  }

  const togglePin = async (colId: string, isPinned: boolean) => {
    if (isPinned) {
      await supabase
        .from('cols_epingles')
        .delete()
        .eq('user_id', currentUserId)
        .eq('col_id', colId)
    } else {
      await supabase.from('cols_epingles').insert({
        user_id: currentUserId,
        col_id: colId,
      })
    }

    router.refresh()
  }

  // Créer des icônes personnalisées
  const createIcon = (col: ColWithStatus) => {
    let color = '#9ca3af' // Gris par défaut (non gravi)

    if (compareUserId) {
      // Mode comparaison
      const currentUserHas = col.gravi
      const otherUserHas = compareUserCols.includes(col.id)

      if (currentUserHas && otherUserHas) {
        color = '#10b981' // Vert - les deux l'ont gravi
      } else if (currentUserHas) {
        color = '#3b82f6' // Bleu - seulement vous
      } else if (otherUserHas) {
        color = '#f59e0b' // Orange - seulement l'autre
      }
    } else {
      // Mode normal
      if (col.gravi) {
        color = '#10b981' // Vert - gravi
      }
    }

    const svgIcon = `
      <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 27 15 27s15-16.5 15-27c0-8.284-6.716-15-15-15z" 
              fill="${color}" 
              stroke="#fff" 
              stroke-width="2"/>
        ${col.epingle ? '<circle cx="15" cy="15" r="5" fill="#fbbf24"/>' : ''}
      </svg>
    `

    return L.divIcon({
      html: svgIcon,
      className: 'custom-marker',
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -42],
    })
  }

  const getDifficultyColor = (difficulte: string | null) => {
    switch (difficulte) {
      case 'facile':
        return 'bg-green-100 text-green-800'
      case 'moyen':
        return 'bg-yellow-100 text-yellow-800'
      case 'difficile':
        return 'bg-orange-100 text-orange-800'
      case 'hc':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Centre de la France par défaut
  const center: [number, number] = [46.2276, 2.2137]

  return (
    <div className="space-y-4">
      {/* Contrôles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer les cols
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Tous', icon: '🗺️' },
                { value: 'gravi', label: 'Gravis', icon: '✅' },
                { value: 'nonGravi', label: 'Non gravis', icon: '❌' },
                { value: 'epingle', label: 'Épinglés', icon: '📍' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comparaison */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comparer avec un autre cycliste
            </label>
            <select
              value={compareUserId || ''}
              onChange={(e) => setCompareUserId(e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Aucun (mode normal)</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.pseudo}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Légende */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Légende</p>
          <div className="flex flex-wrap gap-4 text-sm">
            {compareUserId ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>Gravi par les deux</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span>Gravi par vous uniquement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span>Gravi par l'autre uniquement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                  <span>Non gravi par les deux</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>Col gravi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                  <span>Col non gravi</span>
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span>Col épinglé</span>
            </div>
          </div>
        </div>
      </div>

      {/* Carte */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <MapContainer
          center={center}
          zoom={6}
          style={{ height: '600px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredCols.map((col) => (
            <Marker
              key={col.id}
              position={[col.latitude, col.longitude]}
              icon={createIcon(col)}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-lg mb-2">{col.nom}</h3>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Altitude:</span>
                      <span className="font-medium">{col.altitude}m</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Dénivelé:</span>
                      <span className="font-medium">{col.denivele}m</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Distance:</span>
                      <span className="font-medium">{col.distance_km}km</span>
                    </div>
                    {col.pente_moyenne && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Pente moy:</span>
                        <span className="font-medium">{col.pente_moyenne}%</span>
                      </div>
                    )}
                  </div>

                  {col.difficulte && (
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-3 ${getDifficultyColor(
                        col.difficulte
                      )}`}
                    >
                      {col.difficulte.toUpperCase()}
                    </span>
                  )}

                  <button
                    onClick={() => togglePin(col.id, col.epingle || false)}
                    className={`w-full px-3 py-2 rounded-lg font-medium transition-colors ${
                      col.epingle
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {col.epingle ? '📍 Épinglé' : '📌 Épingler'}
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-sm text-gray-600">
          Affichage de <span className="font-medium text-gray-900">{filteredCols.length}</span> col
          {filteredCols.length > 1 ? 's' : ''} sur{' '}
          <span className="font-medium text-gray-900">{cols.length}</span> au total
        </p>
      </div>
    </div>
  )
}