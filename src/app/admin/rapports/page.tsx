'use client'

import { useEffect, useState } from 'react'
import { formatAr } from '@/lib/format'
import ReportButtons from '@/components/admin/ReportButtons'

type Period = 'day' | 'week' | 'month' | 'semester' | 'year'

const PERIODS: { id: Period; label: string; icon: string }[] = [
  { id: 'day', label: 'Journalier', icon: '📅' },
  { id: 'week', label: 'Hebdomadaire', icon: '📆' },
  { id: 'month', label: 'Mensuel', icon: '🗓️' },
  { id: 'semester', label: 'Semestriel', icon: '📊' },
  { id: 'year', label: 'Annuel', icon: '📈' },
]

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('day')
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/reports?period=${period}`)
      .then((r) => r.json())
      .then((d) => setReport(d))
      .finally(() => setLoading(false))
  }, [period])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Rapports & Bilans</h1>
          <p className="text-gray-500 mt-1">
            Analysez les performances de RK Market
          </p>
        </div>
        {report && (
          <ReportButtons report={report} period={period} />
        )}
      </div>

      {/* Filtres période */}
      <div className="bg-white rounded-xl shadow p-2 inline-flex flex-wrap gap-1">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              period === p.id
                ? 'bg-green-600 text-white shadow'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {loading || !report ? (
        <div className="text-center py-16 text-gray-500">Chargement...</div>
      ) : (
        <>
          {/* Cartes stats période */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow p-5">
              <p className="text-xs text-gray-500 uppercase">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatAr(report.total)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-5">
              <p className="text-xs text-gray-500 uppercase">Commandes</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {report.ordersCount}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-5">
              <p className="text-xs text-gray-500 uppercase">Produits vendus</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {report.itemsCount}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-5">
              <p className="text-xs text-gray-500 uppercase">Panier moyen</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {formatAr(report.averageOrder)}
              </p>
            </div>
          </div>

          {/* Détails par catégorie */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-4">Ventes par catégorie</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="text-left px-4 py-3">Catégorie</th>
                    <th className="text-right px-4 py-3">Quantité</th>
                    <th className="text-right px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.byCategory.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-6 text-gray-500">
                        Aucune vente sur cette période
                      </td>
                    </tr>
                  ) : (
                    report.byCategory.map((row: any) => (
                      <tr key={row.category}>
                        <td className="px-4 py-3 font-medium">{row.category}</td>
                        <td className="px-4 py-3 text-right">{row.count}</td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">
                          {formatAr(row.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right">{report.itemsCount}</td>
                    <td className="px-4 py-3 text-right text-green-600">
                      {formatAr(report.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Liste des commandes */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-4">
              Détail des commandes ({report.orders.length})
            </h2>
            {report.orders.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Aucune commande sur cette période
              </p>
            ) : (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-3">N° commande</th>
                      <th className="text-left px-4 py-3">Client</th>
                      <th className="text-left px-4 py-3">Date</th>
                      <th className="text-left px-4 py-3">Paiement</th>
                      <th className="text-right px-4 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {report.orders.map((o: any) => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs">
                          {o.id.slice(0, 10)}...
                        </td>
                        <td className="px-4 py-3">{o.userName}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(o.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {o.paymentMethod}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          {formatAr(o.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}