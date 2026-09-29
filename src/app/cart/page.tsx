'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { formatAr } from '@/lib/format'

export default function CartPage() {
  const { items, total, updateQuantity, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-3xl font-bold mb-4">Votre panier est vide</h1>
        <Link
          href="/products"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Continuer mes achats
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Votre panier</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-xl shadow flex gap-4 items-center"
            >
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-bold">{item.product.name}</h3>
                <p className="text-green-600 font-semibold">
                  {formatAr(item.product.price)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:text-red-700 text-xl"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-xl shadow h-fit">
          <h2 className="text-xl font-bold mb-4">Récapitulatif</h2>
          <div className="flex justify-between mb-2">
            <span>Sous-total</span>
            <span>{formatAr(total)}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span>Livraison</span>
            <span className="text-green-600">Gratuite</span>
          </div>
          <hr className="my-4" />
          <div className="flex justify-between text-lg font-bold mb-6">
            <span>Total</span>
            <span className="text-green-600">{formatAr(total)}</span>
          </div>
          <Link
            href="/checkout"
            className="block w-full text-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
          >
            Passer la commande
          </Link>
        </div>
      </div>
    </div>
  )
}