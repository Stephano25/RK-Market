'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import { formatAr } from '../../lib/format'

export default function CheckoutPage() {
  const { items, total, refresh } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentResult, setPaymentResult] = useState<any>(null)
  const router = useRouter()

  const [form, setForm] = useState({
    shippingName: '',
    shippingAddr: '',
    shippingCity: '',
    shippingZip: '',
    paymentPhone: '',
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

      setPaymentResult(data)

      if (data.status === 'success') {
        await refresh()
        router.push(`/checkout/success?order_id=${data.orderId}`)
      }
      // Si pending, on affiche un message pour attendre la validation
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && !paymentResult) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold mb-4">Panier vide</h1>
        <button
          onClick={() => router.push('/products')}
          className="text-green-600 hover:underline"
        >
          Découvrir nos produits
        </button>
      </div>
    )
  }

  // Écran d'attente de validation Mobile Money
  if (paymentResult && paymentResult.status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-6">📱</div>
        <h1 className="text-3xl font-bold mb-4">Paiement en attente</h1>
        <p className="text-gray-600 mb-6">
          Une notification a été envoyée sur votre téléphone au{' '}
          <strong>{form.paymentPhone}</strong>.
        </p>
        <p className="text-gray-600 mb-8">
          Veuillez valider le paiement de{' '}
          <strong className="text-green-600">{formatAr(total)}</strong> via{' '}
          <strong>{paymentResult.provider.toUpperCase()}</strong>.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-sm text-yellow-800">
          ⏳ Numéro de transaction : {paymentResult.transactionId}
          <br />
          La commande sera confirmée automatiquement une fois le paiement validé.
        </div>
        <button
          onClick={() => {
            refresh()
            router.push(`/orders`)
          }}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Voir mes commandes
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Finaliser la commande</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow space-y-5"
        >
          <div>
            <h2 className="text-xl font-bold mb-4">📍 Adresse de livraison</h2>
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded text-sm mb-4">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <input
                placeholder="Nom complet"
                required
                value={form.shippingName}
                onChange={(e) =>
                  setForm({ ...form, shippingName: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                placeholder="Adresse"
                required
                value={form.shippingAddr}
                onChange={(e) =>
                  setForm({ ...form, shippingAddr: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Ville"
                  required
                  value={form.shippingCity}
                  onChange={(e) =>
                    setForm({ ...form, shippingCity: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  placeholder="Code postal"
                  required
                  value={form.shippingZip}
                  onChange={(e) =>
                    setForm({ ...form, shippingZip: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">📱 Numéro Mobile Money</h2>
            <input
              type="tel"
              placeholder="034 XX XXX XX"
              required
              value={form.paymentPhone}
              onChange={(e) =>
                setForm({ ...form, paymentPhone: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              Le provider est détecté automatiquement :<br />
              MVola (034, 038) · Orange (032, 037) · Airtel (033)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
          >
            {loading ? 'Traitement...' : `Payer ${formatAr(total)}`}
          </button>
          <p className="text-xs text-gray-500 text-center">
            🔒 Paiement sécurisé via Mobile Money
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
                <span>{formatAr(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <hr />
          <div className="flex justify-between font-bold text-lg mt-4">
            <span>Total</span>
            <span className="text-green-600">{formatAr(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}