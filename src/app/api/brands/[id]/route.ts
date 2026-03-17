import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/brands/[id] - Get single brand
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const brand = await db.brand.findUnique({
      where: { id: params.id },
      include: {
        products: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        integrations: {
          include: { platform: true }
        },
        userBrands: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } }
        },
        _count: {
          select: { products: true, sales: true, adCampaigns: true }
        }
      }
    })

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    return NextResponse.json(brand)
  } catch (error) {
    console.error('Get brand error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/brands/[id] - Update brand
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description, color, website, isActive } = body

    const brand = await db.brand.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
        color,
        website,
        isActive,
      }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'update',
        entity: 'brand',
        entityId: brand.id,
        details: JSON.stringify({ name, slug })
      }
    })

    return NextResponse.json(brand)
  } catch (error) {
    console.error('Update brand error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/brands/[id] - Delete brand
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Soft delete by setting isActive to false
    const brand = await db.brand.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'delete',
        entity: 'brand',
        entityId: brand.id,
        details: JSON.stringify({ name: brand.name })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete brand error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
