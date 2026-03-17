import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// POST - Trigger manual sync for an integration
export async function POST(
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

    // Check if integration exists
    const integration = await db.integration.findUnique({
      where: { id },
      include: {
        brand: { select: { name: true } }
      }
    })

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    // Check if already syncing
    if (integration.syncStatus === 'syncing') {
      return NextResponse.json({ 
        error: 'Integration is already syncing' 
      }, { status: 400 })
    }

    // Update integration status
    await db.integration.update({
      where: { id },
      data: {
        syncStatus: 'syncing',
        lastSyncAt: new Date()
      }
    })

    // Create sync job
    const syncJob = await db.syncJob.create({
      data: {
        integrationId: id,
        type: 'manual',
        status: 'running',
        startedAt: new Date()
      }
    })

    // Simulate sync process (in production, this would be a background job)
    // For demo, we'll just update the status after a short delay
    setTimeout(async () => {
      try {
        // Simulate different sync types
        const syncTypes = ['orders', 'products', 'inventory', 'ads']
        const recordsSynced = Math.floor(Math.random() * 1000) + 100
        
        await db.syncJob.update({
          where: { id: syncJob.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            recordsSynced
          }
        })

        await db.integration.update({
          where: { id },
          data: {
            syncStatus: 'completed',
            lastSuccessfulSync: new Date()
          }
        })
      } catch (err) {
        console.error('Sync job error:', err)
      }
    }, 3000)

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'sync',
        entity: 'integration',
        entityId: id,
        details: JSON.stringify({ 
          type: 'manual',
          integrationName: integration.name,
          brand: integration.brand.name
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Sync started successfully',
      syncJob: {
        id: syncJob.id,
        status: 'running',
        startedAt: syncJob.startedAt
      }
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to start sync' },
      { status: 500 }
    )
  }
}

// GET - Get sync status for an integration
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
      select: {
        status: true,
        syncStatus: true,
        lastSyncAt: true,
        lastSuccessfulSync: true,
        lastError: true,
        syncInterval: true
      }
    })

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    const recentSyncJobs = await db.syncJob.findMany({
      where: { integrationId: id },
      take: 5,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      syncStatus: integration,
      recentJobs: recentSyncJobs
    })
  } catch (error) {
    console.error('Get sync status error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
}
