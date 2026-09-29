'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '../../components/ProductCard'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
}

const CATEGORIES = [
  'all',
  'PPN',
  'Électroménager',
  'Produits de beauté',
  'Produits laitiers',
  'Boissons gazeuses',
]

function ProductsContent() {
  const params = useSearchParams()
  const initialCategory = params.get('category') || 'all'

  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(initialCategory)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    if (category !== 'all') p.set('category', category)

    fetch(`/api/products?${p}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false))
  }, [search, category])

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Nos produits</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? 'Toutes catégories' : c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">Chargement...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucun produit trouvé
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Chargement...</div>}>
      <ProductsContent />
    </Suspense>
  )
}