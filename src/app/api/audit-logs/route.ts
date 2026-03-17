import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - List audit logs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can view audit logs
    if (!['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const entity = searchParams.get('entity')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId
    if (action) where.action = action
    if (entity) where.entity = entity

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      }),
      db.auditLog.count({ where })
    ])

    // Get unique values for filters
    const [actions, entities, users] = await Promise.all([
      db.auditLog.groupBy({
        by: ['action'],
        _count: { action: true },
        orderBy: { action: 'asc' }
      }),
      db.auditLog.groupBy({
        by: ['entity'],
        _count: { entity: true },
        orderBy: { entity: 'asc' }
      }),
      db.user.findMany({
        where: { auditLogs: { some: {} } },
        select: { id: true, name: true, email: true }
      })
    ])

    return NextResponse.json({
      success: true,
      logs,
      total,
      filters: {
        actions: actions.map(a => a.action),
        entities: entities.map(e => e.entity),
        users
      }
    })
  } catch (error) {
    console.error('Audit logs API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
