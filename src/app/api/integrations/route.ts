import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - List all integrations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const integrations = await db.integration.findMany({
      include: {
        brand: {
          select: { id: true, name: true }
        },
        platform: {
          select: { id: true, name: true, type: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get sync job counts
    const integrationsWithStats = await Promise.all(
      integrations.map(async (integration) => {
        const syncJobCount = await db.syncJob.count({
          where: { integrationId: integration.id }
        })
        
        const lastSyncJob = await db.syncJob.findFirst({
          where: { integrationId: integration.id },
          orderBy: { createdAt: 'desc' }
        })

        return {
          ...integration,
          syncJobCount,
          lastSyncJob
        }
      })
    )

    // Calculate stats
    const stats = {
      total: integrations.length,
      active: integrations.filter(i => i.status === 'active').length,
      inactive: integrations.filter(i => i.status === 'inactive').length,
      error: integrations.filter(i => i.status === 'error').length,
      syncing: integrations.filter(i => i.syncStatus === 'syncing').length,
    }

    return NextResponse.json({
      success: true,
      integrations: integrationsWithStats,
      stats,
    })
  } catch (error) {
    console.error('Integrations API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch integrations' },
      { status: 500 }
    )
  }
}

// POST - Create new integration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can create integrations
    if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, type, brandId, platformId, apiKey, apiSecret, shopId, storeUrl, syncInterval } = body

    if (!name || !type || !brandId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if integration already exists for this brand and type
    const existing = await db.integration.findUnique({
      where: {
        brandId_type: { brandId, type }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Integration of this type already exists for this brand' }, { status: 400 })
    }

    const integration = await db.integration.create({
      data: {
        name,
        type,
        brandId,
        platformId,
        apiKey,
        apiSecret,
        shopId,
        storeUrl,
        syncInterval: syncInterval || 300,
        status: 'pending',
        syncStatus: 'pending',
      },
      include: {
        brand: { select: { id: true, name: true } }
      }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'create',
        entity: 'integration',
        entityId: integration.id,
        details: JSON.stringify({ name, type, brandId })
      }
    })

    return NextResponse.json({
      success: true,
      integration,
    })
  } catch (error) {
    console.error('Create integration error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create integration' },
      { status: 500 }
    )
  }
}
