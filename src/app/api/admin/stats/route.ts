import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/admin-auth'

export async function GET() {
  const user = await requireAdminApi()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  // Ventes par catégorie
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: { status: 'PAID' },
    },
    include: {
      product: { select: { category: true, name: true } },
      order: { select: { createdAt: true } },
    },
  })

  const salesByCategory: Record<string, { count: number; total: number }> = {}
  let totalRevenue = 0
  let totalSold = 0

  for (const item of orderItems) {
    const cat = item.product.category
    if (!salesByCategory[cat]) salesByCategory[cat] = { count: 0, total: 0 }
    salesByCategory[cat].count += item.quantity
    salesByCategory[cat].total += item.price * item.quantity
    totalRevenue += item.price * item.quantity
    totalSold += item.quantity
  }

  // Produits en rupture (< 10)
  const lowStockProducts = await prisma.product.findMany({
    where: { stock: { lt: 10 } },
    orderBy: { stock: 'asc' },
  })

  // Top 5 produits vendus
  const productSales: Record<string, { name: string; qty: number; total: number }> = {}
  for (const item of orderItems) {
    const id = item.productId
    if (!productSales[id]) {
      productSales[id] = { name: item.product.name, qty: 0, total: 0 }
    }
    productSales[id].qty += item.quantity
    productSales[id].total += item.price * item.quantity
  }
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)

  // Nombre total de commandes payées
  const totalOrders = await prisma.order.count({
    where: { status: 'PAID' },
  })

  // Nombre de clients
  const totalUsers = await prisma.user.count({
    where: { role: 'USER' },
  })

  // Nombre total de produits en catalogue
  const totalProducts = await prisma.product.count()

  // Ventes des 7 derniers jours
  const last7Days: { date: string; total: number; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)

    const dayOrders = await prisma.order.findMany({
      where: {
        status: 'PAID',
        createdAt: { gte: date, lt: nextDay },
      },
      select: { total: true },
    })

    last7Days.push({
      date: date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit' }),
      total: dayOrders.reduce((s, o) => s + o.total, 0),
      count: dayOrders.length,
    })
  }

  return NextResponse.json({
    totalRevenue,
    totalSold,
    totalOrders,
    totalUsers,
    totalProducts,
    salesByCategory,
    lowStockProducts,
    topProducts,
    last7Days,
  })
}