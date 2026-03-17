'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Shield,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  User,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Settings,
  Users,
  Cable,
  Database,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AuditLog {
  id: string
  userId: string | null
  action: string
  entity: string
  entityId: string | null
  details: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
  } | null
}

interface AuditLogFilters {
  actions: string[]
  entities: string[]
  users: { id: string; name: string; email: string }[]
}

const actionIcons: Record<string, React.ElementType> = {
  login: Activity,
  logout: Activity,
  create: CheckCircle,
  update: Settings,
  delete: XCircle,
  sync: RefreshCw,
  error: AlertTriangle,
}

const actionColors: Record<string, string> = {
  login: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  logout: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  create: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  update: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  delete: 'bg-red-500/10 text-red-600 border-red-500/20',
  sync: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  error: 'bg-red-500/10 text-red-600 border-red-500/20',
}

const entityIcons: Record<string, React.ElementType> = {
  user: Users,
  brand: Database,
  integration: Cable,
  sale: FileText,
  product: FileText,
  dashboard: Activity,
}

export function AuditLogViewer() {
  const { data: session } = useSession()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filters, setFilters] = useState<AuditLogFilters>({
    actions: [],
    entities: [],
    users: []
  })
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [pageSize] = useState(20)
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [entityFilter, setEntityFilter] = useState<string>('all')
  const [userFilter, setUserFilter] = useState<string>('all')
  
  // Detail dialog
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  const isAdmin = session?.user?.role && ['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      params.set('limit', pageSize.toString())
      params.set('offset', (page * pageSize).toString())
      if (actionFilter !== 'all') params.set('action', actionFilter)
      if (entityFilter !== 'all') params.set('entity', entityFilter)
      if (userFilter !== 'all') params.set('userId', userFilter)

      const response = await fetch(`/api/audit-logs?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setLogs(data.logs)
        setTotal(data.total)
        if (page === 0 && data.filters) {
          setFilters(data.filters)
        }
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, actionFilter, entityFilter, userFilter])

  useEffect(() => {
    if (isAdmin) {
      fetchLogs()
    }
  }, [isAdmin, fetchLogs])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const parseDetails = (details: string | null) => {
    if (!details) return null
    try {
      return JSON.parse(details)
    } catch {
      return details
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You don&apos;t have permission to view audit logs.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">Track user actions and system events</p>
        </div>
        <Button onClick={() => fetchLogs()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 shrink-0">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{filters.users.length}</div>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{filters.actions.length}</div>
                <p className="text-xs text-muted-foreground">Action Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 shrink-0">
                <Database className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{filters.entities.length}</div>
                <p className="text-xs text-muted-foreground">Entity Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Showing {logs.length} of {total} events
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search in details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {filters.actions.map((action) => (
                  <SelectItem key={action} value={action}>
                    <span className="capitalize">{action}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {filters.entities.map((entity) => (
                  <SelectItem key={entity} value={entity}>
                    <span className="capitalize">{entity}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {filters.users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Logs Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4" />
              <p>No audit logs found</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead className="hidden md:table-cell">Details</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const ActionIcon = actionIcons[log.action] || Activity
                    const EntityIcon = entityIcons[log.entity] || FileText
                    
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {log.user ? getInitials(log.user.name) : 'SYS'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {log.user?.name || 'System'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {log.user?.email || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={cn('capitalize', actionColors[log.action] || '')}
                          >
                            <ActionIcon className="h-3 w-3 mr-1" />
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <EntityIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">{log.entity}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                            {log.details ? JSON.stringify(parseDetails(log.details)).slice(0, 50) + '...' : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(log.createdAt)}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatTime(log.createdAt)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedLog(log)
                              setShowDetailDialog(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
            <DialogDescription>
              Full information about this audit event
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">User</Label>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {selectedLog.user ? getInitials(selectedLog.user.name) : 'SYS'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedLog.user?.name || 'System'}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Action</Label>
                  <Badge 
                    variant="outline" 
                    className={cn('capitalize', actionColors[selectedLog.action] || '')}
                  >
                    {selectedLog.action}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Entity</Label>
                  <span className="capitalize">{selectedLog.entity}</span>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Entity ID</Label>
                  <span className="font-mono text-xs">{selectedLog.entityId || 'N/A'}</span>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">IP Address</Label>
                  <span className="font-mono text-xs">{selectedLog.ipAddress || 'N/A'}</span>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Timestamp</Label>
                  <span>{formatDate(selectedLog.createdAt)} {formatTime(selectedLog.createdAt)}</span>
                </div>
              </div>
              
              {selectedLog.details && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Details</Label>
                  <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(parseDetails(selectedLog.details), null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.userAgent && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">User Agent</Label>
                  <p className="text-xs text-muted-foreground break-all">
                    {selectedLog.userAgent}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper component for labels
function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn('font-medium', className)}>{children}</span>
}
