'use client'

import { useEffect, useState } from 'react'
import { formatAr } from '@/lib/format'

interface Order {
  id: string
  total: number
  status: string
  paymentMethod: string
  createdAt: string
  userName: string
  itemsCount: number
}

const STATUS_COLORS: Record<string, string> = {
  PAID: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  FAILED: 'bg-red-100 text-red-700',
  SHIPPED: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-purple-100 text-purple-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
}

export default function SalesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/sales')
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter((o) => {
    const matchFilter = filter === 'all' || o.status === filter
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.userName.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const totalFiltered = filtered.reduce((s, o) => s + o.total, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Ventes</h1>
          <p className="text-gray-500 mt-1">
            {orders.length} commandes · Total affiché : {formatAr(totalFiltered)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Rechercher (N° ou client)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'PAID', label: 'Payées' },
          { id: 'PENDING', label: 'En attente' },
          { id: 'FAILED', label: 'Échouées' },
          { id: 'DELIVERED', label: 'Livrées' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === f.id
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="text-left px-4 py-3">N° commande</th>
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Paiement</th>
                <th className="text-center px-4 py-3">Articles</th>
                <th className="text-center px-4 py-3">Statut</th>
                <th className="text-right px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Chargement...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Aucune commande
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">
                      {o.id.slice(0, 12)}...
                    </td>
                    <td className="px-4 py-3 font-medium">{o.userName}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(o.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{o.paymentMethod}</td>
                    <td className="px-4 py-3 text-center">{o.itemsCount}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">
                      {formatAr(o.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}