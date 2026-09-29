'use client'

import { useEffect, useState } from 'react'
import { formatAr } from '@/lib/format'

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  image: string
}

export default function StocksPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(0)
  const [saving, setSaving] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stocks')
      const data = await res.json()
      setProducts(data.products || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const startEdit = (p: Product) => {
    setEditingId(p.id)
    setEditValue(p.stock)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue(0)
  }

  const saveStock = async (id: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/stocks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, stock: editValue }),
      })
      if (res.ok) {
        await fetchProducts()
        setEditingId(null)
      }
    } finally {
      setSaving(false)
    }
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  )

  const lowStockCount = products.filter((p) => p.stock < 10).length
  const outOfStockCount = products.filter((p) => p.stock === 0).length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion des stocks</h1>
          <p className="text-gray-500 mt-1">
            {products.length} produits en catalogue
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-yellow-100 px-4 py-2 rounded-lg">
            <p className="text-xs text-yellow-700 font-semibold">⚠️ Faible</p>
            <p className="text-lg font-bold text-yellow-800">{lowStockCount}</p>
          </div>
          <div className="bg-red-100 px-4 py-2 rounded-lg">
            <p className="text-xs text-red-700 font-semibold">❌ Rupture</p>
            <p className="text-lg font-bold text-red-800">{outOfStockCount}</p>
          </div>
        </div>
      </div>

      <input
        type="text"
        placeholder="Rechercher un produit..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-96 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="text-left px-4 py-3">Produit</th>
                <th className="text-left px-4 py-3">Catégorie</th>
                <th className="text-right px-4 py-3">Prix</th>
                <th className="text-center px-4 py-3">Stock</th>
                <th className="text-center px-4 py-3">Statut</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Chargement...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Aucun produit trouvé
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.category}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatAr(p.price)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editingId === p.id ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) =>
                            setEditValue(parseInt(e.target.value) || 0)
                          }
                          className="w-20 px-2 py-1 border rounded text-center"
                          autoFocus
                        />
                      ) : (
                        <span className="font-bold">{p.stock}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.stock === 0 ? (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                          Rupture
                        </span>
                      ) : p.stock < 10 ? (
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-semibold">
                          Faible
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingId === p.id ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => saveStock(p.id)}
                            disabled={saving}
                            className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            💾 Enregistrer
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(p)}
                          className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          ✏️ Modifier
                        </button>
                      )}
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