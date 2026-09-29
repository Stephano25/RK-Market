'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatAr } from '@/lib/format'
import ReceiptButtons from '@/components/ReceiptButtons'

interface Order {
  id: string
  total: number
  status: string
  paymentMethod: string
  paymentRef?: string | null
  paymentPhone?: string | null
  paidAt?: string | null
  createdAt: string
  shippingName: string
  shippingAddr: string
  shippingCity: string
  shippingZip: string
  user?: { name: string; email: string } | null
  items: {
    quantity: number
    price: number
    product: { name: string; category: string }
  }[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-16">Chargement...</div>

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📦</div>
        <h1 className="text-2xl font-bold mb-4">Aucune commande</h1>
        <Link href="/products" className="text-green-600 hover:underline">
          Découvrir nos produits
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Mes commandes</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-5 rounded-xl shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs text-gray-500">N° {order.id}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  order.status === 'PAID'
                    ? 'bg-green-100 text-green-700'
                    : order.status === 'FAILED'
                    ? 'bg-red-100 text-red-700'
                    : order.status === 'DELIVERED'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {order.status}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-3">
              {order.items.map((it, i) => (
                <span key={i}>
                  {it.product.name} × {it.quantity}
                  {i < order.items.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-xs text-gray-500">
                {order.paymentMethod.replace('_', ' ')}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-bold text-green-600">
                  {formatAr(order.total)}
                </span>
                {order.status === 'PAID' && (
                  <ReceiptButtons order={order} variant="compact" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}