import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { hash } from 'bcryptjs'

// GET - Get single user details
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

    // Only admins or the user themselves can view details
    if (!['SUPER_ADMIN', 'ADMIN'].includes(session.user.role) && session.user.id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        userBrands: {
          include: {
            brand: {
              select: { id: true, name: true }
            }
          }
        },
        auditLogs: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            action: true,
            entity: true,
            details: true,
            createdAt: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Only admins can update other users, or user can update themselves (limited)
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)
    const isSelf = session.user.id === id

    if (!isAdmin && !isSelf) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, role, password, isActive, brandIds } = body

    // Non-admins can only update their own name
    if (!isAdmin && (role || isActive !== undefined || brandIds)) {
      return NextResponse.json({ error: 'Cannot update these fields' }, { status: 403 })
    }

    const updateData: Record<string, unknown> = {}

    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role && isAdmin) updateData.role = role
    if (isActive !== undefined && isAdmin) updateData.isActive = isActive
    if (password) {
      updateData.password = await hash(password, 12)
    }

    // Handle brand assignments for admins
    if (brandIds && isAdmin) {
      // Delete existing brand assignments
      await db.userBrand.deleteMany({
        where: { userId: id }
      })

      // Create new brand assignments
      if (brandIds.length > 0) {
        await db.userBrand.createMany({
          data: brandIds.map((brandId: string) => ({
            userId: id,
            brandId,
            role: role || 'VIEWER'
          }))
        })
      }
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      include: {
        userBrands: {
          include: {
            brand: { select: { id: true, name: true } }
          }
        }
      }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'update',
        entity: 'user',
        entityId: id,
        details: JSON.stringify({ updatedFields: Object.keys(updateData) })
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        userBrands: user.userBrands
      }
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user (soft delete by setting isActive = false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Only admins can delete users
    if (!['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prevent self-deletion
    if (session.user.id === id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
    }

    // Soft delete by setting isActive = false
    const user = await db.user.update({
      where: { id },
      data: { isActive: false }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'delete',
        entity: 'user',
        entityId: id,
        details: JSON.stringify({ email: user.email, name: user.name })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
