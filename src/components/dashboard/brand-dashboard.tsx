'use client';

import { useEffect, useState } from 'react';
import { EnhancedKPICard } from './enhanced-kpi-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DistributionPieChart } from '@/components/charts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Tag,
  TrendingUp,
  DollarSign,
  Target,
} from 'lucide-react';
import { formatCurrency, formatCompact } from '@/lib/data/mock-data';
import { useFilterStore } from '@/lib/store';

const COLORS = [
  '#10B981', '#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B',
  '#EF4444', '#22C55E', '#6366F1', '#F472B6', '#14B8A6',
];

interface BrandDetail {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  metrics: {
    revenue: number;
    orders: number;
    products: number;
    campaigns: number;
    growth: number;
  };
  integrations: Array<{ id: string; type: string; status: string }>;
}

interface BrandsResponse {
  success: boolean;
  data: BrandDetail[];
}

export function BrandDashboard() {
  const { timeRange, brandId, setBrandId } = useFilterStore();
  const [brands, setBrands] = useState<BrandDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const response = await fetch('/api/brands');
        const result: BrandsResponse = await response.json();
        
        if (isMounted && result.success !== false) {
          // The API returns the array directly or wrapped in success
          const brandsData = Array.isArray(result) ? result : (result.data || []);
          setBrands(brandsData);
        }
      } catch (error) {
        console.error('Failed to fetch brands:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Filter by selected brand if any
  const filteredBrands = brandId 
    ? brands.filter(b => b.id === brandId)
    : brands;

  // Top 10 for charts
  const topBrandsForChart = [...filteredBrands]
    .sort((a, b) => b.metrics.revenue - a.metrics.revenue)
    .slice(0, 10);
  
  const brandChartData = topBrandsForChart.map(b => ({
    name: b.name.length > 10 ? b.name.substring(0, 10) + '...' : b.name,
    revenue: b.metrics.revenue,
    profit: Math.round(b.metrics.revenue * 0.28),
    growth: b.metrics.growth,
  }));

  const pieData = topBrandsForChart.slice(0, 6).map(b => ({
    name: b.name,
    value: b.metrics.revenue,
    color: b.color || COLORS[brands.indexOf(b) % COLORS.length],
  }));

  // Calculate aggregate metrics
  const totalRevenue = filteredBrands.reduce((sum, b) => sum + b.metrics.revenue, 0);
  const avgGrowth = filteredBrands.length > 0 
    ? filteredBrands.reduce((sum, b) => sum + b.metrics.growth, 0) / filteredBrands.length 
    : 0;
  const totalOrders = filteredBrands.reduce((sum, b) => sum + b.metrics.orders, 0);
  const growingBrands = filteredBrands.filter(b => b.metrics.growth > 0).length;
  const decliningBrands = filteredBrands.filter(b => b.metrics.growth < 0).length;

  // Sort by revenue for display
  const sortedBrands = [...filteredBrands].sort((a, b) => b.metrics.revenue - a.metrics.revenue);

  // Calculate tier based on position
  const getTier = (index: number) => {
    if (index < 5) return 'Tier 1';
    if (index < 12) return 'Tier 2';
    if (index < 20) return 'Tier 3';
    return 'Tier 4';
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Key Brand Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <EnhancedKPICard
          title="Total Brands"
          value={filteredBrands.length}
          icon={Tag}
          trend="up"
          trendLabel="Active"
          contextualData={[
            { label: 'Growing', value: growingBrands },
            { label: 'Declining', value: decliningBrands },
          ]}
        />
        <EnhancedKPICard
          title="Total Revenue"
          value={formatCompact(totalRevenue)}
          prefix=""
          icon={DollarSign}
          trend={avgGrowth > 0 ? 'up' : 'down'}
          trendLabel={avgGrowth > 0 ? 'Growing' : 'Declining'}
          contextualData={[
            { label: 'Growth', value: avgGrowth.toFixed(1), suffix: '%' },
          ]}
          targetProgress={{
            current: totalRevenue,
            target: 120000000,
            label: 'Annual Target',
          }}
        />
        <EnhancedKPICard
          title="Avg Brand Growth"
          value={avgGrowth.toFixed(1)}
          suffix="%"
          icon={TrendingUp}
          trend={avgGrowth > 10 ? 'up' : avgGrowth < 0 ? 'down' : 'stable'}
          trendLabel={avgGrowth > 10 ? 'Strong' : avgGrowth < 0 ? 'Weak' : 'Average'}
          contextualData={[
            { label: 'Target', value: '10', suffix: '%' },
          ]}
          targetProgress={{
            current: avgGrowth,
            target: 15,
            label: 'Target Growth',
          }}
        />
        <EnhancedKPICard
          title="Total Orders"
          value={formatCompact(totalOrders)}
          icon={Target}
          trend="stable"
          trendLabel="All channels"
          contextualData={[
            { label: 'Avg/Brand', value: Math.round(totalOrders / filteredBrands.length).toLocaleString() },
          ]}
        />
      </div>

      {/* Brand Distribution */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution (Top 6)</CardTitle>
            <CardDescription>Leading brands by revenue share</CardDescription>
          </CardHeader>
          <CardContent>
            <DistributionPieChart data={pieData} title="" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Brands Performance</CardTitle>
            <CardDescription>Revenue comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <BarChart data={brandChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `RM ${(v/1000000).toFixed(1)}M`} className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" width={90} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatCurrency(Number(v))} />} />
                <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                  {brandChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'cards' | 'table')}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">All {filteredBrands.length} Brands</CardTitle>
          <TabsList>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="cards">Card View</TabsTrigger>
          </TabsList>
        </div>

        {/* Table View */}
        <TabsContent value="table" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">#</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Brand</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Tier</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Revenue</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Orders</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Products</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Growth</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Integrations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBrands.map((brand, index) => (
                      <tr 
                        key={brand.id} 
                        className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                        onClick={() => setBrandId(brand.id)}
                      >
                        <td className="py-3 px-4 text-muted-foreground">{index + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-3 w-3 rounded-full shrink-0" 
                              style={{ backgroundColor: brand.color || COLORS[index % COLORS.length] }} 
                            />
                            <div>
                              <span className="font-medium">{brand.name}</span>
                              {brand.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{brand.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="text-xs">{getTier(index)}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(brand.metrics.revenue)}</td>
                        <td className="py-3 px-4 text-right">{brand.metrics.orders.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{brand.metrics.products}</td>
                        <td className="py-3 px-4 text-right">
                          <Badge 
                            variant={brand.metrics.growth >= 0 ? 'outline' : 'destructive'}
                            className={brand.metrics.growth >= 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : ''}
                          >
                            {brand.metrics.growth >= 0 ? '+' : ''}{brand.metrics.growth.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            {brand.integrations.slice(0, 3).map((int) => (
                              <Badge key={int.id} variant="outline" className="text-xs">
                                {int.type}
                              </Badge>
                            ))}
                            {brand.integrations.length > 3 && (
                              <Badge variant="outline" className="text-xs">+{brand.integrations.length - 3}</Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Card View */}
        <TabsContent value="cards" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedBrands.map((brand, index) => (
              <Card 
                key={brand.id} 
                className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setBrandId(brand.id)}
              >
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: brand.color || COLORS[index % COLORS.length] }}
                />
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{brand.name}</CardTitle>
                    <Badge 
                      variant={brand.metrics.growth >= 0 ? 'outline' : 'destructive'}
                      className={`text-xs ${brand.metrics.growth >= 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : ''}`}
                    >
                      {brand.metrics.growth >= 0 ? '+' : ''}{brand.metrics.growth.toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{getTier(index)}</p>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Revenue</span>
                      <span className="font-semibold text-sm">{formatCompact(brand.metrics.revenue)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Orders</span>
                      <span className="text-sm">{brand.metrics.orders.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Products</span>
                      <span>{brand.metrics.products}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 lg:p-6 animate-pulse">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-80 rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-96 rounded-lg bg-muted" />
    </div>
  );
}
