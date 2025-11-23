import { AscensionWithDetails } from '@/lib/types/database.types'

interface RecentAscensionsProps {
  ascensions: any[]
}

export default function RecentAscensions({ ascensions }: RecentAscensionsProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTime = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        🏔️ Ascensions récentes
      </h2>
      
      {ascensions.length > 0 ? (
        <div className="space-y-4">
          {ascensions.map((ascension) => (
            <div
              key={ascension.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {ascension.cols.nom}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(ascension.date_ascension)}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                    ascension.cols.difficulte
                  )}`}
                >
                  {ascension.cols.difficulte?.toUpperCase() || 'N/A'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                <div>
                  <p className="text-gray-500">Altitude</p>
                  <p className="font-medium text-gray-900">
                    {ascension.cols.altitude}m
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Dénivelé</p>
                  <p className="font-medium text-gray-900">
                    {ascension.cols.denivele}m
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Temps</p>
                  <p className="font-medium text-gray-900">
                    {formatTime(ascension.temps_secondes)}
                  </p>
                </div>
              </div>

              {ascension.vitesse_moyenne_kmh && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Vitesse moyenne: {ascension.vitesse_moyenne_kmh.toFixed(1)} km/h
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">
          Aucune ascension enregistrée.
          <br />
          <span className="text-sm">
            Connectez Strava pour importer vos activités !
          </span>
        </p>
      )}
    </div>
  )
}