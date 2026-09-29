import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const u = getCurrentUser()
  if (!u || u.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      user: { select: { name: true } },
    },
  })

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      total: o.total,
      status: o.status,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt,
      userName: o.user?.name || o.shippingName,
      itemsCount: o.items.reduce((s, i) => s + i.quantity, 0),
    })),
  })
}