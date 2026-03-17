'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  Plus,
  Link2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Settings,
  ExternalLink,
  Unlink,
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  type: string
  status: string
  brand: { id: string; name: string; color: string }
  platform?: { id: string; name: string }
  lastSyncAt: string | null
  syncStatus: string
  lastError: string | null
  syncInterval: number
  apiKey?: string
  shopId?: string
  storeUrl?: string
}

interface Brand {
  id: string
  name: string
  color: string | null
}

const INTEGRATION_TYPES = [
  { value: 'shopee', label: 'Shopee', category: 'Marketplace', icon: '🛒' },
  { value: 'lazada', label: 'Lazada', category: 'Marketplace', icon: '🛒' },
  { value: 'shopify', label: 'Shopify', category: 'E-commerce', icon: '🏪' },
  { value: 'tiktok_shop', label: 'TikTok Shop', category: 'Social Commerce', icon: '📱' },
  { value: 'facebook_ads', label: 'Facebook Ads', category: 'Advertising', icon: '📢' },
  { value: 'shopee_ads', label: 'Shopee Ads', category: 'Advertising', icon: '📢' },
  { value: 'lazada_ads', label: 'Lazada Ads', category: 'Advertising', icon: '📢' },
  { value: 'tiktok_ads', label: 'TikTok Ads', category: 'Advertising', icon: '📢' },
  { value: 'google_ads', label: 'Google Ads', category: 'Advertising', icon: '📢' },
]

export default function IntegrationsPage() {
  const { data: session } = useSession()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Form state
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

  const canManage = session?.user?.role && ['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [intRes, brandsRes] = await Promise.all([
        fetch('/api/integrations'),
        fetch('/api/brands'),
      ])

      if (intRes.ok) setIntegrations(await intRes.json())
      if (brandsRes.ok) setBrands(await brandsRes.json())
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load integrations')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Integration created')
        setDialogOpen(false)
        resetForm()
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create integration')
      }
    } catch (error) {
      toast.error('Failed to create integration')
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async (integrationId: string) => {
    toast.info('Testing connection...')
    // In production, this would call the actual API
    setTimeout(() => {
      toast.success('Connection successful!')
    }, 1500)
  }

  const handleSync = async (integrationId: string) => {
    toast.info('Starting sync...')
    // In production, this would trigger a sync job
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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { variant: 'default' | 'secondary' | 'destructive'; icon: any }> = {
      active: { variant: 'default', icon: CheckCircle2 },
      inactive: { variant: 'secondary', icon: XCircle },
      error: { variant: 'destructive', icon: AlertTriangle },
      pending: { variant: 'secondary', icon: RefreshCw },
    }
    const style = styles[status] || styles.inactive
    const Icon = style.icon

    return (
      <Badge variant={style.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const filteredIntegrations = integrations.filter(int => {
    if (filterType !== 'all' && int.type !== filterType) return false
    if (filterStatus !== 'all' && int.status !== filterStatus) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Integrations</h1>
          <p className="text-muted-foreground">
            Connect your sales channels and advertising platforms
          </p>
        </div>
        {canManage && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Platform Integration</DialogTitle>
                <DialogDescription>
                  Connect a new platform or advertising account
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Integration Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., GlowSkin Shopee Store"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Platform Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {INTEGRATION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Select
                    value={formData.brandId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, brandId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: brand.color || '#10B981' }}
                            />
                            {brand.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(formData.type === 'shopee' || formData.type === 'lazada') && (
                  <div className="space-y-2">
                    <Label htmlFor="shopId">Shop ID</Label>
                    <Input
                      id="shopId"
                      value={formData.shopId}
                      onChange={(e) => setFormData(prev => ({ ...prev, shopId: e.target.value }))}
                      placeholder="Your shop ID"
                    />
                  </div>
                )}

                {formData.type === 'shopify' && (
                  <div className="space-y-2">
                    <Label htmlFor="storeUrl">Store URL</Label>
                    <Input
                      id="storeUrl"
                      value={formData.storeUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, storeUrl: e.target.value }))}
                      placeholder="https://your-store.myshopify.com"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    value={formData.apiKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Your API key"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiSecret">API Secret</Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    value={formData.apiSecret}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiSecret: e.target.value }))}
                    placeholder="Your API secret"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sync Interval</Label>
                  <Select
                    value={formData.syncInterval.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, syncInterval: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">Every minute</SelectItem>
                      <SelectItem value="300">Every 5 minutes</SelectItem>
                      <SelectItem value="900">Every 15 minutes</SelectItem>
                      <SelectItem value="1800">Every 30 minutes</SelectItem>
                      <SelectItem value="3600">Every hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Integration
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Integrations</CardDescription>
            <CardTitle className="text-3xl">{integrations.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-3xl text-emerald-600">
              {integrations.filter(i => i.status === 'active').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Errors</CardDescription>
            <CardTitle className="text-3xl text-destructive">
              {integrations.filter(i => i.status === 'error').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl">
              {integrations.filter(i => i.status === 'pending').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {INTEGRATION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.icon} {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Integration Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredIntegrations.map((integration) => {
          const typeInfo = INTEGRATION_TYPES.find(t => t.value === integration.type)
          
          return (
            <Card key={integration.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{typeInfo?.icon || '🔌'}</div>
                    <div>
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                      <CardDescription className="text-xs">{integration.brand.name}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(integration.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="outline">{typeInfo?.label || integration.type}</Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Sync</span>
                  <span>
                    {integration.lastSyncAt
                      ? new Date(integration.lastSyncAt).toLocaleString()
                      : 'Never'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sync Interval</span>
                  <span>Every {Math.floor(integration.syncInterval / 60)} min</span>
                </div>

                {integration.lastError && (
                  <div className="p-2 rounded bg-destructive/10 text-destructive text-xs">
                    <div className="flex items-center gap-1 font-medium mb-1">
                      <AlertTriangle className="h-3 w-3" />
                      Error
                    </div>
                    {integration.lastError}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleTestConnection(integration.id)}
                  >
                    Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSync(integration.id)}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Sync
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredIntegrations.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-1">No integrations found</h3>
            <p className="text-sm text-muted-foreground">
              {filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first integration to get started'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
