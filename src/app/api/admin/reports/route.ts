import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/admin-auth'

type Period = 'day' | 'week' | 'month' | 'semester' | 'year'

function getDateRange(period: Period) {
  const now = new Date()
  const start = new Date()

  switch (period) {
    case 'day':
      start.setHours(0, 0, 0, 0)
      break
    case 'week':
      start.setDate(now.getDate() - 7)
      start.setHours(0, 0, 0, 0)
      break
    case 'month':
      start.setDate(now.getDate() - 30)
      start.setHours(0, 0, 0, 0)
      break
    case 'semester':
      start.setMonth(now.getMonth() - 6)
      start.setHours(0, 0, 0, 0)
      break
    case 'year':
      start.setFullYear(now.getFullYear() - 1)
      start.setHours(0, 0, 0, 0)
      break
  }

  return { start, end: now }
}

export async function GET(req: NextRequest) {
  const user = await requireAdminApi()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const period = (searchParams.get('period') || 'day') as Period

  const { start, end } = getDateRange(period)

  const orders = await prisma.order.findMany({
    where: {
      status: 'PAID',
      createdAt: { gte: start, lte: end },
    },
    include: {
      items: { include: { product: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const byCategory: Record<string, { count: number; total: number }> = {}
  let itemsCount = 0
  let total = 0

  for (const o of orders) {
    total += o.total
    for (const item of o.items) {
      itemsCount += item.quantity
      const cat = item.product.category
      if (!byCategory[cat]) byCategory[cat] = { count: 0, total: 0 }
      byCategory[cat].count += item.quantity
      byCategory[cat].total += item.price * item.quantity
    }
  }

  return NextResponse.json({
    period,
    start,
    end,
    total,
    ordersCount: orders.length,
    itemsCount,
    averageOrder: orders.length > 0 ? Math.round(total / orders.length) : 0,
    byCategory: Object.entries(byCategory).map(([category, data]) => ({
      category,
      ...data,
    })),
    orders: orders.map((o) => ({
      id: o.id,
      total: o.total,
      createdAt: o.createdAt,
      paymentMethod: o.paymentMethod,
      userName: o.user?.name || o.shippingName,
    })),
  })
}