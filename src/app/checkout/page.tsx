'use client'

import { useState } from 'react'
import { useCart } from '../../context/CartContext'

export default function CheckoutPage() {
  const { items, total } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    shippingName: '',
    shippingAddr: '',
    shippingCity: '',
    shippingZip: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return <div className="text-center py-16">Panier vide</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Finaliser la commande</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow space-y-4"
        >
          <h2 className="text-xl font-bold mb-4">Adresse de livraison</h2>
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded text-sm">
              {error}
            </div>
          )}
          <input
            placeholder="Nom complet"
            required
            value={form.shippingName}
            onChange={(e) => setForm({ ...form, shippingName: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            placeholder="Adresse"
            required
            value={form.shippingAddr}
            onChange={(e) => setForm({ ...form, shippingAddr: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Ville"
              required
              value={form.shippingCity}
              onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              placeholder="Code postal"
              required
              value={form.shippingZip}
              onChange={(e) => setForm({ ...form, shippingZip: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
          >
            {loading ? 'Redirection vers Stripe...' : `Payer ${total.toFixed(2)} €`}
          </button>
          <p className="text-xs text-gray-500 text-center">
            🔒 Paiement sécurisé via Stripe
          </p>
        </form>

        <div className="bg-white p-6 rounded-xl shadow h-fit">
          <h2 className="text-xl font-bold mb-4">Votre commande</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <span>{(item.product.price * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
          </div>
          <hr />
          <div className="flex justify-between font-bold text-lg mt-4">
            <span>Total</span>
            <span className="text-green-600">{total.toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </div>
  )
}