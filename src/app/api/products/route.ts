import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getCurrentUser } from '../../../lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  const where: any = {}
  if (category && category !== 'all') where.category = category
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ products })
}

export async function POST(req: NextRequest) {
  const user = getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const body = await req.json()
  const product = await prisma.product.create({ data: body })
  return NextResponse.json({ product })
}