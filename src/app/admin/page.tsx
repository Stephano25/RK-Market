import Link from 'next/link'
import StatsCard from '../../components/admin/StatsCard'
import SalesChart from '../../components/admin/SalesChart'
import { prisma } from '@/lib/prisma'
import { formatAr } from '@/lib/format'

async function getStats() {
  const orderItems = await prisma.orderItem.findMany({
    where: { order: { status: 'PAID' } },
    include: { product: { select: { category: true } } },
  })

  const salesByCategory: Record<string, { count: number; total: number }> = {}
  let totalRevenue = 0
  let totalSold = 0

  for (const item of orderItems) {
    const cat = item.product.category
    if (!salesByCategory[cat]) salesByCategory[cat] = { count: 0, total: 0 }
    salesByCategory[cat].count += item.quantity
    salesByCategory[cat].total += item.price * item.quantity
    totalRevenue += item.price * item.quantity
    totalSold += item.quantity
  }

  const lowStock = await prisma.product.findMany({
    where: { stock: { lt: 10 } },
    orderBy: { stock: 'asc' },
    take: 5,
  })

  const totalOrders = await prisma.order.count({ where: { status: 'PAID' } })
  const totalUsers = await prisma.user.count({ where: { role: 'USER' } })
  const totalProducts = await prisma.product.count()

  // Ventes 7 derniers jours
  const last7Days: { date: string; total: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    const next = new Date(date)
    next.setDate(next.getDate() + 1)

    const orders = await prisma.order.findMany({
      where: { status: 'PAID', createdAt: { gte: date, lt: next } },
      select: { total: true },
    })
    last7Days.push({
      date: date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit' }),
      total: orders.reduce((s, o) => s + o.total, 0),
    })
  }

  return {
    totalRevenue,
    totalSold,
    totalOrders,
    totalUsers,
    totalProducts,
    salesByCategory,
    lowStock,
    last7Days,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const categories = Object.entries(stats.salesByCategory)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Tableau de bord
          </h1>
          <p className="text-gray-500 mt-1">
            Vue d'ensemble de votre activité RK Market
          </p>
        </div>
        <Link
          href="/admin/rapports"
          className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 font-medium"
        >
          📊 Voir les rapports
        </Link>
      </div>

      {/* Notification rupture stock */}
      {stats.lowStock.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-bold text-red-700">
                {stats.lowStock.length} produit(s) en rupture de stock (&lt; 10)
              </h3>
              <ul className="mt-2 text-sm text-red-600 space-y-1">
                {stats.lowStock.map((p) => (
                  <li key={p.id}>
                    • <strong>{p.name}</strong> — Stock : {p.stock} unités
                  </li>
                ))}
              </ul>
              <Link
                href="/admin/stocks"
                className="inline-block mt-3 text-sm font-semibold text-red-700 hover:underline"
              >
                Gérer les stocks →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Cartes stats principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Ventes totales"
          value={formatAr(stats.totalRevenue)}
          icon="💰"
          color="green"
        />
        <StatsCard
          title="Produits vendus"
          value={stats.totalSold.toString()}
          icon="📦"
          color="blue"
        />
        <StatsCard
          title="Commandes"
          value={stats.totalOrders.toString()}
          icon="🛒"
          color="purple"
        />
        <StatsCard
          title="Clients"
          value={stats.totalUsers.toString()}
          icon="👥"
          color="orange"
        />
      </div>

      {/* Graphique + Catégories */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">Ventes des 7 derniers jours</h2>
          <SalesChart data={stats.last7Days} />
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">Ventes par catégorie</h2>
          {categories.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune vente pour le moment</p>
          ) : (
            <div className="space-y-3">
              {categories.map(([cat, data]) => (
                <div key={cat} className="border-b pb-2 last:border-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{cat}</span>
                    <span className="font-bold text-green-600 text-sm">
                      {formatAr(data.total)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {data.count} produit(s) vendu(s)
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alertes stock + Top produits */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">⚠️ Stocks faibles</h2>
            <Link
              href="/admin/stocks"
              className="text-sm text-green-600 hover:underline"
            >
              Voir tout →
            </Link>
          </div>
          {stats.lowStock.length === 0 ? (
            <p className="text-gray-500 text-sm">Tous les stocks sont OK ✅</p>
          ) : (
            <div className="space-y-2">
              {stats.lowStock.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.category}</p>
                  </div>
                  <span className="font-bold text-red-600">
                    {p.stock} unités
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">🏆 Top 5 produits vendus</h2>
          {Object.keys(stats.salesByCategory).length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune vente pour le moment</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(stats.salesByCategory)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 5)
                .map(([cat, data]) => (
                  <div
                    key={cat}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm font-medium">{cat}</span>
                    <span className="text-sm font-bold text-green-600">
                      {data.count} ventes
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}