import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - Get single integration details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const integration = await db.integration.findUnique({
      where: { id },
      include: {
        brand: { select: { id: true, name: true } },
        platform: { select: { id: true, name: true, type: true } },
        syncJobs: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      integration,
    })
  } catch (error) {
    console.error('Get integration error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch integration' },
      { status: 500 }
    )
  }
}

// PUT - Update integration
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, apiKey, apiSecret, shopId, storeUrl, syncInterval, status } = body

    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (apiKey !== undefined) updateData.apiKey = apiKey
    if (apiSecret !== undefined) updateData.apiSecret = apiSecret
    if (shopId !== undefined) updateData.shopId = shopId
    if (storeUrl !== undefined) updateData.storeUrl = storeUrl
    if (syncInterval !== undefined) updateData.syncInterval = syncInterval
    if (status !== undefined) updateData.status = status

    const integration = await db.integration.update({
      where: { id },
      data: updateData,
      include: {
        brand: { select: { id: true, name: true } }
      }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'update',
        entity: 'integration',
        entityId: id,
        details: JSON.stringify({ updatedFields: Object.keys(updateData) })
      }
    })

    return NextResponse.json({
      success: true,
      integration,
    })
  } catch (error) {
    console.error('Update integration error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update integration' },
      { status: 500 }
    )
  }
}

// DELETE - Delete integration
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    await db.integration.delete({
      where: { id }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'delete',
        entity: 'integration',
        entityId: id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Integration deleted successfully'
    })
  } catch (error) {
    console.error('Delete integration error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete integration' },
      { status: 500 }
    )
  }
}
