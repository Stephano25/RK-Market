'use client'

import { useState } from 'react'
import { downloadReceipt, printReceipt } from '@/lib/receipt'

interface ReceiptButtonsProps {
  order: any
  variant?: 'default' | 'compact'
}

export default function ReceiptButtons({
  order,
  variant = 'default',
}: ReceiptButtonsProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = () => {
    setLoading(true)
    try {
      downloadReceipt(order)
    } catch (err) {
      console.error('Erreur PDF:', err)
      alert('Erreur lors de la génération du reçu')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    setLoading(true)
    try {
      printReceipt(order)
    } catch (err) {
      console.error('Erreur impression:', err)
      alert("Erreur lors de l'impression")
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'compact') {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          disabled={loading}
          className="text-xs px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          title="Télécharger le reçu PDF"
        >
          📥 PDF
        </button>
        <button
          onClick={handlePrint}
          disabled={loading}
          className="text-xs px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          title="Imprimer le reçu"
        >
          🖨️
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
      >
        📥 Télécharger le reçu (PDF)
      </button>
      <button
        onClick={handlePrint}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium"
      >
        🖨️ Imprimer
      </button>
    </div>
  )
}