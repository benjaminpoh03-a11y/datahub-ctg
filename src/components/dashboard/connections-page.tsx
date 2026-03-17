'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Cable,
  Plus,
  RefreshCw,
  Check,
  AlertCircle,
  Clock,
  MoreVertical,
  Store,
  HardDrive,
  Upload,
  FileSpreadsheet,
  Globe,
  Facebook,
  Youtube,
  Play,
  Pause,
  Settings,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

const platformIcons: Record<string, React.ElementType> = {
  shopee: Store,
  lazada: Store,
  shopify: Globe,
  tiktok_shop: Youtube,
  tiktok_ads: Youtube,
  facebook_ads: Facebook,
  google_ads: Globe,
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500',
  inactive: 'bg-gray-400',
  error: 'bg-red-500',
  pending: 'bg-amber-500',
}

const syncStatusColors: Record<string, string> = {
  completed: 'text-emerald-600 bg-emerald-500/10',
  syncing: 'text-amber-600 bg-amber-500/10',
  pending: 'text-gray-600 bg-gray-500/10',
  error: 'text-red-600 bg-red-500/10',
}

interface Integration {
  id: string
  name: string
  type: string
  status: string
  syncStatus: string
  lastSyncAt: string | null
  lastSuccessfulSync: string | null
  lastError: string | null
  syncInterval: number
  brand: { id: string; name: string }
  platform?: { id: string; name: string; type: string }
  syncJobCount?: number
  lastSyncJob?: {
    id: string
    status: string
    recordsSynced: number
    completedAt: string
  }
}

interface Brand {
  id: string
  name: string
}

const availableIntegrations = [
  { name: 'Shopee Seller API', type: 'shopee', description: 'Connect your Shopee seller account' },
  { name: 'Lazada Open API', type: 'lazada', description: 'Sync Lazada orders and inventory' },
  { name: 'Shopify Store', type: 'shopify', description: 'Connect your Shopify store' },
  { name: 'TikTok Shop', type: 'tiktok_shop', description: 'Sync TikTok Shop orders' },
  { name: 'Facebook Ads', type: 'facebook_ads', description: 'Import ad performance data' },
  { name: 'TikTok Ads', type: 'tiktok_ads', description: 'Import TikTok ad metrics' },
  { name: 'Google Ads', type: 'google_ads', description: 'Connect Google Ads account' },
]

export function ConnectionsPage() {
  const { data: session } = useSession()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    error: 0,
    syncing: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set())
  
  // Form state for new integration
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    brandId: '',
    apiKey: '',
    apiSecret: '',
    shopId: '',
    storeUrl: '',
    syncInterval: 300,
  })

  const fetchData = useCallback(async () => {
    try {
      const [integrationsRes, brandsRes] = await Promise.all([
        fetch('/api/integrations'),
        fetch('/api/brands'),
      ])
      
      const integrationsData = await integrationsRes.json()
      const brandsData = await brandsRes.json()
      
      if (integrationsData.success) {
        setIntegrations(integrationsData.integrations)
        setStats(integrationsData.stats)
      }
      
      if (brandsData.success) {
        setBrands(brandsData.brands)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load integrations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSync = async (integrationId: string) => {
    if (syncingIds.has(integrationId)) return
    
    setSyncingIds(prev => new Set(prev).add(integrationId))
    
    try {
      const response = await fetch(`/api/integrations/${integrationId}/sync`, {
        method: 'POST',
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success('Sync started successfully')
        // Poll for sync completion
        const pollInterval = setInterval(async () => {
          const statusRes = await fetch(`/api/integrations/${integrationId}/sync`)
          const statusData = await statusRes.json()
          
          if (statusData.success && statusData.syncStatus.syncStatus !== 'syncing') {
            setSyncingIds(prev => {
              const next = new Set(prev)
              next.delete(integrationId)
              return next
            })
            clearInterval(pollInterval)
            fetchData()
            if (statusData.syncStatus.syncStatus === 'completed') {
              toast.success('Sync completed successfully')
            } else if (statusData.syncStatus.syncStatus === 'error') {
              toast.error('Sync failed')
            }
          }
        }, 2000)
      } else {
        toast.error(data.error || 'Failed to start sync')
        setSyncingIds(prev => {
          const next = new Set(prev)
          next.delete(integrationId)
          return next
        })
      }
    } catch (error) {
      toast.error('Failed to start sync')
      setSyncingIds(prev => {
        const next = new Set(prev)
        next.delete(integrationId)
        return next
      })
    }
  }

  const handleToggleStatus = async (integration: Integration) => {
    const newStatus = integration.status === 'active' ? 'inactive' : 'active'
    
    try {
      const response = await fetch(`/api/integrations/${integration.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (response.ok) {
        toast.success(`Integration ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
        fetchData()
      } else {
        toast.error('Failed to update status')
      }
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (integration: Integration) => {
    if (!confirm(`Are you sure you want to delete "${integration.name}"?`)) return
    
    try {
      const response = await fetch(`/api/integrations/${integration.id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        toast.success('Integration deleted')
        fetchData()
      } else {
        toast.error('Failed to delete integration')
      }
    } catch {
      toast.error('Failed to delete integration')
    }
  }

  const handleCreateIntegration = async () => {
    if (!formData.name || !formData.type || !formData.brandId) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success('Integration created successfully')
        setShowAddDialog(false)
        resetForm()
        fetchData()
      } else {
        toast.error(data.error || 'Failed to create integration')
      }
    } catch {
      toast.error('Failed to create integration')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      brandId: '',
      apiKey: '',
      apiSecret: '',
      shopId: '',
      storeUrl: '',
      syncInterval: 300,
    })
  }

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const isManager = session?.user?.role && ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(session.user.role)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Connections</h1>
          <p className="text-muted-foreground">Manage integrations and data sources in one place</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Upload className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Upload CSV</span>
            <span className="sm:hidden">Upload</span>
          </Button>
          {isManager && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="flex-1 sm:flex-none" onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Connection
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Connection</DialogTitle>
                  <DialogDescription>Connect a new platform or data source</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Platform Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => {
                        const integration = availableIntegrations.find(i => i.type === value)
                        setFormData({ 
                          ...formData, 
                          type: value,
                          name: integration?.name || ''
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableIntegrations.map((integration) => {
                          const Icon = platformIcons[integration.type] || Store
                          return (
                            <SelectItem key={integration.type} value={integration.type}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {integration.name}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Select
                      value={formData.brandId}
                      onValueChange={(value) => setFormData({ ...formData, brandId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Connection Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="My Shopee Store"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key (optional)</Label>
                    <Input
                      id="apiKey"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      placeholder="Enter API key"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiSecret">API Secret (optional)</Label>
                    <Input
                      id="apiSecret"
                      type="password"
                      value={formData.apiSecret}
                      onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                      placeholder="Enter API secret"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="syncInterval">Sync Interval (seconds)</Label>
                    <Select
                      value={formData.syncInterval.toString()}
                      onValueChange={(value) => setFormData({ ...formData, syncInterval: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">5 minutes</SelectItem>
                        <SelectItem value="900">15 minutes</SelectItem>
                        <SelectItem value="1800">30 minutes</SelectItem>
                        <SelectItem value="3600">1 hour</SelectItem>
                        <SelectItem value="21600">6 hours</SelectItem>
                        <SelectItem value="86400">24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateIntegration}>Create Connection</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <Cable className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0">
                <Check className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-500/10 shrink-0">
                <Pause className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.inactive}</div>
                <p className="text-xs text-muted-foreground">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 shrink-0">
                <RefreshCw className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">{stats.syncing}</div>
                <p className="text-xs text-muted-foreground">Syncing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 shrink-0">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.error}</div>
                <p className="text-xs text-muted-foreground">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Integrations vs Data Sources */}
      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          {integrations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Cable className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No integrations yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Connect your first platform to start syncing data
                </p>
                {isManager && (
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Connection
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {integrations.map((integration) => {
                const Icon = platformIcons[integration.type] || Store
                const isSyncing = syncingIds.has(integration.id) || integration.syncStatus === 'syncing'
                
                return (
                  <Card key={integration.id} className="relative overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 ${
                        statusColors[integration.status] || 'bg-gray-400'
                      }`}
                    />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{integration.name}</CardTitle>
                            <p className="text-xs text-muted-foreground">
                              {integration.brand.name}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSync(integration.id)}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Sync Now
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(integration)}>
                              {integration.status === 'active' ? (
                                <>
                                  <Pause className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedIntegration(integration)
                              setShowConfigDialog(true)
                            }}>
                              <Settings className="mr-2 h-4 w-4" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(integration)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${statusColors[integration.status]}`} />
                            <span className="text-sm capitalize">{integration.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Sync Status</span>
                          <Badge className={syncStatusColors[integration.syncStatus] || ''}>
                            {isSyncing && (
                              <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                            )}
                            {integration.syncStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Last Sync</span>
                          <span className="text-sm">
                            {formatTime(integration.lastSyncAt)}
                          </span>
                        </div>
                        
                        {integration.lastError && (
                          <div className="mt-2 p-2 rounded bg-red-500/10 text-red-600 text-xs">
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {integration.lastError}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleSync(integration.id)}
                            disabled={isSyncing}
                          >
                            <RefreshCw className={`mr-2 h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Syncing...' : 'Sync'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              setSelectedIntegration(integration)
                              setShowConfigDialog(true)
                            }}
                          >
                            Configure
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          {/* Storage Progress */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Storage Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">1.2 GB of 5 GB used</span>
                  <span className="font-medium">24%</span>
                </div>
                <Progress value={24} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Data Sources Table */}
          <Card>
            <CardHeader>
              <CardTitle>Connected Sources</CardTitle>
              <CardDescription>All active data connections and their sync status</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Last Sync</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {integrations.map((integration) => (
                      <TableRow key={integration.id}>
                        <TableCell className="font-medium">{integration.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">
                            {integration.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{integration.brand.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {integration.status === 'active' && (
                              <>
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-emerald-600 text-sm">Active</span>
                              </>
                            )}
                            {integration.status === 'inactive' && (
                              <>
                                <div className="h-2 w-2 rounded-full bg-gray-400" />
                                <span className="text-gray-500 text-sm">Inactive</span>
                              </>
                            )}
                            {integration.status === 'error' && (
                              <>
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                <span className="text-red-600 text-sm">Error</span>
                              </>
                            )}
                            {integration.syncStatus === 'syncing' && (
                              <RefreshCw className="h-3 w-3 animate-spin text-amber-500 ml-2" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {integration.lastSuccessfulSync 
                            ? formatDate(integration.lastSuccessfulSync)
                            : 'Never'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Sync Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Sync Schedule</CardTitle>
              <CardDescription>Automatic data refresh configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { title: 'Real-time Sync', desc: 'Orders sync every 5 minutes' },
                  { title: 'Hourly Sync', desc: 'Product updates every hour' },
                  { title: 'Daily Sync', desc: 'Full refresh at 2 AM' },
                ].map((schedule, i) => (
                  <div key={i} className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{schedule.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{schedule.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Config Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure Integration</DialogTitle>
            <DialogDescription>Update integration settings</DialogDescription>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-3 mb-2">
                  {(() => {
                    const Icon = platformIcons[selectedIntegration.type] || Store
                    return <Icon className="h-5 w-5" />
                  })()}
                  <span className="font-medium">{selectedIntegration.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Brand: {selectedIntegration.brand.name}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Sync Interval</Label>
                <Select defaultValue={selectedIntegration.syncInterval.toString()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300">5 minutes</SelectItem>
                    <SelectItem value="900">15 minutes</SelectItem>
                    <SelectItem value="1800">30 minutes</SelectItem>
                    <SelectItem value="3600">1 hour</SelectItem>
                    <SelectItem value="21600">6 hours</SelectItem>
                    <SelectItem value="86400">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Last Successful Sync</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedIntegration.lastSuccessfulSync 
                    ? formatDate(selectedIntegration.lastSuccessfulSync) + ' at ' + formatTime(selectedIntegration.lastSuccessfulSync)
                    : 'Never'
                  }
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              toast.success('Settings saved')
              setShowConfigDialog(false)
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
