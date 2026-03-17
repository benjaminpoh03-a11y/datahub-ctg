'use client';

import { useEffect, useState, useMemo } from 'react';
import { EnhancedKPICard } from './enhanced-kpi-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DistributionPieChart, PlatformBarChart } from '@/components/charts';
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
  Store,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Globe,
  Cable,
} from 'lucide-react';
import { generateDashboardData, formatCurrency, formatCompact } from '@/lib/data/mock-data';
import { useFilterStore } from '@/lib/store';
import type { DashboardData } from '@/types';

const COLORS = [
  'hsl(160, 84%, 39%)',
  'hsl(38, 92%, 50%)',
  'hsl(330, 81%, 60%)',
  'hsl(263, 70%, 50%)',
  'hsl(189, 94%, 43%)',
  'hsl(0, 84%, 60%)',
];

export function PlatformDashboard() {
  const { timeRange, brandId } = useFilterStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Re-generate data when filters change
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        setData(generateDashboardData(timeRange, brandId));
        setLoading(false);
      }
    }, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [timeRange, brandId]);

  // Generate platform details based on data
  const platformDetails = useMemo(() => {
    if (!data) return [];
    
    return data.platformPerformance.map((p, index) => ({
      id: `platform-${index}`,
      name: p.platform,
      type: getPlatformType(p.platform),
      revenue: p.revenue,
      orders: p.orders,
      avgOrderValue: Math.round(p.revenue / p.orders),
      conversion: [3.8, 3.5, 2.8, 4.2, 2.5, 0][index] || 3.0,
      growth: [15.2, 8.7, 22.5, 45.3, -3.2, 5.8][index] || 10,
      status: 'active',
      color: COLORS[index % COLORS.length]
    }));
  }, [data]);

  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  const platformChartData = platformDetails.map(p => ({
    platform: p.name,
    revenue: p.revenue,
    orders: p.orders,
  }));

  const pieData = platformDetails.map(p => ({
    name: p.name,
    value: p.revenue,
    color: p.color,
  }));

  const totalRevenue = platformDetails.reduce((sum, p) => sum + p.revenue, 0);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Key Platform Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <EnhancedKPICard
          title="Total Platforms"
          value={platformDetails.length}
          icon={Store}
          trend="up"
          trendLabel="Active"
          contextualData={[
            { label: 'Marketplaces', value: platformDetails.filter(p => p.type === 'Marketplace').length },
          ]}
        />
        <EnhancedKPICard
          title="Total Revenue"
          value={formatCompact(totalRevenue)}
          prefix=""
          icon={DollarSign}
          trend={data.revenue.revenueGrowth > 0 ? 'up' : 'down'}
          trendLabel={data.revenue.revenueGrowth > 0 ? 'Growing' : 'Declining'}
          contextualData={[
            { label: 'Growth', value: data.revenue.revenueGrowth.toFixed(1), suffix: '%' },
          ]}
          targetProgress={{
            current: totalRevenue,
            target: data.budget.totalBudget,
            label: 'Budget',
          }}
        />
        <EnhancedKPICard
          title="Total Orders"
          value={formatCompact(platformDetails.reduce((sum, p) => sum + p.orders, 0))}
          icon={ShoppingCart}
          trend={data.sales.orderGrowth > 0 ? 'up' : 'stable'}
          trendLabel={data.sales.orderGrowth > 0 ? 'Growing' : 'Stable'}
          contextualData={[
            { label: 'Conv. Rate', value: data.sales.conversionRate.toFixed(2), suffix: '%' },
          ]}
        />
        <EnhancedKPICard
          title="Avg AOV"
          value={Math.round(platformDetails.reduce((sum, p) => sum + p.avgOrderValue, 0) / platformDetails.length)}
          prefix=""
          icon={TrendingUp}
          trend={data.sales.averageOrderValue > 100 ? 'up' : 'stable'}
          trendLabel={data.sales.averageOrderValue > 100 ? 'High' : 'Average'}
          contextualData={[
            { label: 'Target', value: '100', prefix: '' },
          ]}
          targetProgress={{
            current: data.sales.averageOrderValue,
            target: 120,
            label: 'Target AOV',
          }}
        />
      </div>

      {/* Platform Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PlatformBarChart
          data={platformChartData}
          title="Revenue by Platform"
          description="Sales channel performance"
        />

        <DistributionPieChart
          data={pieData}
          title="Revenue Distribution"
          description="Market share by platform"
        />
      </div>

      {/* Platform Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {platformDetails.map((platform) => (
          <Card key={platform.id} className="relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: platform.color }}
            />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{platform.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{platform.type}</Badge>
                  <Badge 
                    variant={platform.growth >= 0 ? 'outline' : 'destructive'}
                    className={platform.growth >= 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : ''}
                  >
                    {platform.growth >= 0 ? '+' : ''}{platform.growth}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-xl font-semibold">{formatCurrency(platform.revenue)}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="font-medium">{platform.orders.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">AOV</p>
                    <p className="font-medium">RM {platform.avgOrderValue}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Conv.</p>
                    <p className="font-medium">{platform.conversion}%</p>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Share of Total</span>
                    <span className="font-medium">{((platform.revenue / totalRevenue) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(platform.revenue / totalRevenue) * 100} className="h-1.5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance Comparison</CardTitle>
          <CardDescription>Detailed metrics by sales channel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Platform</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Revenue</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Orders</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">AOV</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Conversion</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Growth</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {platformDetails.map((platform) => (
                  <tr key={platform.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: platform.color }} />
                        <span className="font-medium">{platform.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{platform.type}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(platform.revenue)}</td>
                    <td className="py-3 px-4 text-right">{platform.orders.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">RM {platform.avgOrderValue}</td>
                    <td className="py-3 px-4 text-right">{platform.conversion}%</td>
                    <td className="py-3 px-4 text-right">
                      <Badge 
                        variant={platform.growth >= 0 ? 'outline' : 'destructive'}
                        className={platform.growth >= 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : ''}
                      >
                        {platform.growth >= 0 ? '+' : ''}{platform.growth}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-sm">Active</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cable className="h-5 w-5" />
            Integration Status
          </CardTitle>
          <CardDescription>API connection health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {platformDetails.slice(0, 5).map((platform) => (
              <div key={platform.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-medium">{platform.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Last sync</p>
                  <p className="text-xs font-medium">2 min ago</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getPlatformType(platform: string): string {
  const types: Record<string, string> = {
    'Shopee': 'Marketplace',
    'Lazada': 'Marketplace',
    'Shopify': 'Own Website',
    'TikTok Shop': 'Social Commerce',
    'Facebook': 'Social Commerce',
    'Retail': 'Offline',
  };
  return types[platform] || 'Other';
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 lg:p-6 animate-pulse">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
