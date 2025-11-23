import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si l'utilisateur est déjà connecté, redirection vers le dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            🚴 Cols de Vélo
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            Recensez, comparez et partagez vos ascensions
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Suivez vos performances cyclistes, visualisez vos cols gravis sur une carte
            interactive et comparez-vous avec d'autres passionnés.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl border border-gray-200"
            >
              Se connecter
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Statistiques détaillées
            </h3>
            <p className="text-gray-600">
              Suivez votre progression, nombre de cols gravis, dénivelé cumulé et bien plus.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Carte interactive
            </h3>
            <p className="text-gray-600">
              Visualisez tous les cols sur une carte, identifiez ceux que vous avez gravis.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Comparaison sociale
            </h3>
            <p className="text-gray-600">
              Comparez vos performances avec d'autres cyclistes, suivez vos amis.
            </p>
          </div>
        </div>

        {/* Integration Strava */}
        <div className="mt-24 bg-white rounded-2xl p-12 shadow-lg border border-gray-200 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-5xl">🚴</span>
            <span className="text-4xl font-bold text-gray-400">×</span>
            <svg className="w-16 h-16 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Intégration Strava à venir
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bientôt, synchronisez automatiquement vos activités Strava et validez vos
            ascensions en un clic. Toute la structure technique est prête !
          </p>
        </div>

        {/* CTA Final */}
        <div className="mt-24 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Prêt à commencer votre aventure ?
          </h2>
          <Link
            href="/register"
            className="inline-block px-12 py-5 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl font-bold text-xl hover:from-blue-700 hover:to-green-700 transition-all shadow-xl hover:shadow-2xl"
          >
            Créer mon compte gratuitement
          </Link>
        </div>
      </div>
    </div>
  )
}