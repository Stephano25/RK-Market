'use client'

import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)
  const router = useRouter()

  const handleAdd = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      })
      if (res.status === 401) {
        router.push('/login')
        return
      }
      await addToCart(product.id, 1)
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
      <div className="relative h-56 bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
          {product.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mt-1">{product.name}</h3>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-green-600">
            {product.price.toFixed(2)} €
          </span>
          <button
            onClick={handleAdd}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white font-medium transition ${
              added
                ? 'bg-green-700'
                : 'bg-green-600 hover:bg-green-700 disabled:opacity-50'
            }`}
          >
            {loading ? '...' : added ? '✓ Ajouté' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  )
}