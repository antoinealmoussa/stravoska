interface StatsCardsProps {
  stats: {
    colsGravis: number
    totalCols: number
    nombreAscensions: number
    deniveleTotal: number
    nombreSorties: number
  }
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Cols gravis',
      value: `${stats.colsGravis} / ${stats.totalCols}`,
      subtitle: `${Math.round((stats.colsGravis / stats.totalCols) * 100) || 0}% complétés`,
      icon: '⛰️',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Nombre de sorties',
      value: stats.nombreSorties.toString(),
      subtitle: 'jours de vélo',
      icon: '🚴',
      color: 'bg-green-50 text-green-700 border-green-200',
    },
    {
      title: 'Ascensions totales',
      value: stats.nombreAscensions.toString(),
      subtitle: `Dont ${stats.nombreAscensions - stats.colsGravis} répétitions`,
      icon: '🔄',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      title: 'Dénivelé cumulé',
      value: `${Math.round(stats.deniveleTotal / 1000)} km`,
      subtitle: `${stats.deniveleTotal.toLocaleString()} mètres`,
      icon: '📈',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.color} rounded-xl p-6 border shadow-sm transition-transform hover:scale-105`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium opacity-80">{card.title}</h3>
            <span className="text-3xl">{card.icon}</span>
          </div>
          <div>
            <p className="text-3xl font-bold mb-1">{card.value}</p>
            <p className="text-sm opacity-70">{card.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  )
}