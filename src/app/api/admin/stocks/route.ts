import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

function isAdmin() {
  const u = getCurrentUser()
  return u?.role === 'ADMIN'
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const products = await prisma.product.findMany({
    orderBy: [{ stock: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json({ products })
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { productId, stock } = await req.json()
  if (typeof stock !== 'number' || stock < 0) {
    return NextResponse.json({ error: 'Stock invalide' }, { status: 400 })
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: { stock },
  })
  return NextResponse.json({ product })
}