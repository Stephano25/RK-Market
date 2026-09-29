import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatAr } from './format'

interface ReceiptOrder {
  id: string
  total: number
  status: string
  paymentMethod: string
  paymentRef?: string | null
  paymentPhone?: string | null
  paidAt?: string | Date | null
  createdAt: string | Date
  shippingName: string
  shippingAddr: string
  shippingCity: string
  shippingZip: string
  user?: { name: string; email: string } | null
  items: Array<{
    quantity: number
    price: number
    product: { name: string; category: string }
  }>
}

export function generateReceipt(order: ReceiptOrder) {
  const doc = new jsPDF()

  const GREEN: [number, number, number] = [22, 163, 74]
  const DARK: [number, number, number] = [17, 24, 39]
  const GRAY: [number, number, number] = [107, 114, 128]

  // ===== En-tête =====
  doc.setFillColor(...GREEN)
  doc.rect(0, 0, 210, 35, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('RK MARKET', 14, 18)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Votre supermarché en ligne à Madagascar', 14, 26)
  doc.text('contact@rk-market.mg  |  +261 34 XX XXX XX', 14, 31)

  // ===== Titre reçu =====
  doc.setTextColor(...DARK)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('REÇU DE PAIEMENT', 14, 50)

  // ===== Infos commande =====
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)

  const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  doc.text(`N° de commande : ${order.id}`, 14, 60)
  doc.text(`Date : ${orderDate}`, 14, 66)
  doc.text(
    `Statut : ${order.status === 'PAID' ? 'Payé ✓' : order.status}`,
    14,
    72
  )

  // ===== Infos client =====
  doc.setTextColor(...DARK)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('CLIENT', 14, 86)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.text(order.user?.name || order.shippingName, 14, 93)
  if (order.user?.email) doc.text(order.user.email, 14, 98)

  // ===== Adresse livraison =====
  doc.setTextColor(...DARK)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('LIVRAISON', 120, 86)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.text(order.shippingName, 120, 93)
  doc.text(order.shippingAddr, 120, 98)
  doc.text(`${order.shippingZip} ${order.shippingCity}`, 120, 103)

  // ===== Tableau des articles =====
  autoTable(doc, {
    startY: 115,
    head: [['Produit', 'Catégorie', 'Qté', 'Prix unitaire', 'Sous-total']],
    body: order.items.map((item) => [
      item.product.name,
      item.product.category,
      item.quantity.toString(),
      formatAr(item.price),
      formatAr(item.price * item.quantity),
    ]),
    headStyles: {
      fillColor: GREEN,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    bodyStyles: { textColor: DARK },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 35 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    },
  })

  // ===== Total =====
  const finalY = (doc as any).lastAutoTable.finalY + 10

  doc.setFillColor(240, 253, 244)
  doc.rect(130, finalY, 66, 15, 'F')

  doc.setTextColor(...DARK)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('TOTAL :', 135, finalY + 10)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...GREEN)
  doc.text(formatAr(order.total), 175, finalY + 10, { align: 'right' })

  // ===== Infos paiement =====
  const paymentY = finalY + 30
  doc.setTextColor(...DARK)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('DÉTAILS DU PAIEMENT', 14, paymentY)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)

  const methodLabels: Record<string, string> = {
    MVOLA: 'MVola (Telma)',
    ORANGE_MONEY: 'Orange Money',
    AIRTEL_MONEY: 'Airtel Money',
    CARD: 'Carte bancaire',
    CASH_ON_DELIVERY: 'Paiement à la livraison',
  }

  doc.text(
    `Méthode : ${methodLabels[order.paymentMethod] || order.paymentMethod}`,
    14,
    paymentY + 7
  )
  if (order.paymentPhone) {
    doc.text(`Téléphone : ${order.paymentPhone}`, 14, paymentY + 13)
  }
  if (order.paymentRef) {
    doc.text(`Référence : ${order.paymentRef}`, 14, paymentY + 19)
  }

  // ===== Pied de page =====
  const pageHeight = doc.internal.pageSize.height
  doc.setDrawColor(229, 231, 235)
  doc.line(14, pageHeight - 25, 196, pageHeight - 25)

  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  doc.text(
    'Merci pour votre confiance ! RK Market — Misaotra tompoko',
    105,
    pageHeight - 18,
    { align: 'center' }
  )
  doc.text(
    'Ce reçu est généré automatiquement et fait foi de votre achat.',
    105,
    pageHeight - 13,
    { align: 'center' }
  )

  return doc
}

export function downloadReceipt(order: ReceiptOrder) {
  const doc = generateReceipt(order)
  doc.save(`recu-rk-market-${order.id.slice(0, 8)}.pdf`)
}

export function printReceipt(order: ReceiptOrder) {
  const doc = generateReceipt(order)
  const blob = doc.output('blob')
  const url = URL.createObjectURL(blob)

  // Ouvre dans un nouvel onglet pour impression
  const printWindow = window.open(url, '_blank')
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print()
    }
  }
}