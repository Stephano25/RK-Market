interface StatsCardProps {
  title: string
  value: string
  icon: string
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red'
}

const COLORS = {
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
  red: 'bg-red-100 text-red-700',
}

export default function StatsCard({
  title,
  value,
  icon,
  color = 'green',
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
      <div className={`text-3xl w-14 h-14 rounded-lg flex items-center justify-center ${COLORS[color]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-xl font-bold text-gray-800 mt-1 truncate">{value}</p>
      </div>
    </div>
  )
}