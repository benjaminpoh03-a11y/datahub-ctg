import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/brands - Get all brands
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')

    const brands = await db.brand.findMany({
      where: active ? { isActive: active === 'true' } : undefined,
      include: {
        _count: {
          select: { products: true, sales: true, adCampaigns: true }
        },
        integrations: {
          select: { id: true, type: true, status: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(brands)
  } catch (error) {
    console.error('Get brands error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/brands - Create new brand
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description, color, website } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    // Check if brand with slug already exists
    const existing = await db.brand.findUnique({
      where: { slug }
    })

    if (existing) {
      return NextResponse.json({ error: 'Brand with this slug already exists' }, { status: 400 })
    }

    const brand = await db.brand.create({
      data: {
        name,
        slug,
        description,
        color,
        website,
        isActive: true,
      }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'create',
        entity: 'brand',
        entityId: brand.id,
        details: JSON.stringify({ name, slug })
      }
    })

    return NextResponse.json(brand, { status: 201 })
  } catch (error) {
    console.error('Create brand error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
