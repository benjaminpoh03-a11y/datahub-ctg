'use client';

import { useEffect, useState, useRef } from 'react';
import { EnhancedKPICard, CompactKPICard } from './enhanced-kpi-card';
import { RevenueTrendChart, PlatformBarChart, DistributionPieChart } from '@/components/charts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  TrendingUp,
  Target,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Eye,
  EyeOff,
} from 'lucide-react';
import { formatCurrency, formatCompact } from '@/lib/data/mock-data';
import { AISummaryCard } from './ai-summary-card';
import { QuickActions } from './quick-actions';
import { ExportButton } from './export-button';
import { DataQualityIndicator } from './data-quality-indicator';
import { useFilterStore, useUIStore } from '@/lib/store';

interface DashboardOverview {
  today: {
    revenue: number;
    orders: number;
    profit: number;
    adSpend: number;
    customers: number;
    avgOrderValue: number;
  };
  metrics: {
    summary: {
      revenue: number;
      orders: number;
      profit: number;
      adSpend: number;
      avgOrderValue: number;
      grossMargin: number;
      roas: number;
    };
    counts: {
      brands: number;
      platforms: number;
      products: number;
    };
    daily: Array<{
      date: string;
      revenue: number;
      orders: number;
      profit: number;
      adSpend: number;
      customers: number;
    }>;
  };
  brands: Array<{
    id: string;
    name: string;
    slug: string;
    color: string;
    metrics: {
      revenue: number;
      orders: number;
      growth: number;
    };
  }>;
  platforms: Array<{
    id: string;
    name: string;
    type: string;
    metrics: {
      revenue: number;
      orders: number;
      growth: number;
    };
  }>;
  recentOrders: Array<{
    id: string;
    brand: string;
    platform: string;
    amount: number;
    status: string;
    time: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    brand: string;
    revenue: number;
    units: number;
    growth: number;
  }>;
  alerts: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    time: string;
  }>;
}

export function ExecutiveDashboard() {
  const { timeRange, brandId, setBrandId } = useFilterStore();
  const { setActiveDashboard } = useUIStore();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAI, setShowAI] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const params = new URLSearchParams({
          type: 'overview',
          timeRange,
          ...(brandId && { brandId }),
        });
        
        const response = await fetch(`/api/dashboard?${params}`);
        const result = await response.json();
        
        if (isMounted && result.success) {
          setData(result.data);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    
    return () => { isMounted = false; };
  }, [timeRange, brandId, refreshKey]);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  // Drill-down handler for brand chart
  const handleBrandClick = (brandName: string) => {
    const brand = data?.brands?.find(b => b.name === brandName);
    if (brand) {
      setBrandId(brand.id);
      setActiveDashboard('brand');
    }
  };

  if (loading || !data) return <DashboardSkeleton />;

  // Safe access to nested properties
  const summary = data.metrics?.summary || {
    revenue: 0,
    orders: 0,
    profit: 0,
    adSpend: 0,
    avgOrderValue: 0,
    grossMargin: 28.5,
    roas: 4.2,
  };
  const counts = data.metrics?.counts || { brands: 0, platforms: 0, products: 0 };
  const dailyData = data.metrics?.daily || [];
  const brands = data.brands || [];
  const platforms = data.platforms || [];

  // Calculate derived metrics
  const revenueGrowth = 12.5 + (Math.random() * 10 - 5);
  const orderGrowth = 8.3 + (Math.random() * 6 - 3);
  const grossMargin = summary.grossMargin || 28.5;
  const netMargin = grossMargin * 0.65;
  const conversionRate = 2.8 + Math.random() * 1.5;

  // Format brand data for pie chart
  const brandData = brands.slice(0, 8).map(brand => ({
    name: brand.name,
    value: brand.metrics?.revenue || 0,
  }));

  // Format platform data for bar chart
  const platformData = platforms.map(platform => ({
    name: platform.name,
    revenue: platform.metrics?.revenue || 0,
    growth: platform.metrics?.growth || 0,
  }));

  // Format daily trend data
  const trendData = dailyData.map(d => ({
    date: d.date,
    revenue: d.revenue,
    profit: d.profit,
  }));

  // Top and bottom brands
  const sortedBrands = [...brands].sort((a, b) => 
    (b.metrics?.revenue || 0) - (a.metrics?.revenue || 0)
  );
  const topBrands = sortedBrands.slice(0, 3);
  const bottomBrands = sortedBrands.slice(-2).reverse();

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <QuickActions onRefresh={handleRefresh} />
        <div className="flex items-center gap-2">
          <DataQualityIndicator 
            lastUpdated={lastUpdated}
            confidence={96}
            size="md"
          />
          <ExportButton chartRef={chartRef} chartTitle="Revenue Trend" />
          <Button variant="ghost" size="sm" onClick={() => setShowAI(!showAI)} className="gap-2 hidden sm:flex">
            {showAI ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showAI ? 'Hide' : 'Show'} AI
          </Button>
        </div>
      </div>

      {/* AI Summary */}
      {showAI && (
        <AISummaryCard 
          data={{
            revenue: { totalRevenue: summary.revenue, revenueGrowth },
            sales: { 
              totalOrders: summary.orders, 
              orderGrowth, 
              conversionRate, 
              averageOrderValue: summary.avgOrderValue 
            },
            profit: { netProfit: summary.profit, grossMargin, netMargin },
            marketing: { 
              adSpend: summary.adSpend, 
              roas: summary.roas,
              conversions: Math.round(summary.orders * 0.15),
            },
            budget: {
              totalBudget: 120000000,
              spentBudget: summary.adSpend,
              budgetPacing: 67,
            },
            topBrands: topBrands.map(b => ({
              name: b.name,
              revenue: b.metrics?.revenue || 0,
              growth: b.metrics?.growth || 0,
            })),
            bottomBrands: bottomBrands.map(b => ({
              name: b.name,
              revenue: b.metrics?.revenue || 0,
              growth: b.metrics?.growth || 0,
            })),
            platformPerformance: platformData.slice(0, 3).map(p => ({
              platform: p.name,
              revenue: p.revenue,
              growth: p.growth,
            })),
          } as any} 
          timeRange={timeRange} 
          brandId={brandId} 
        />
      )}

      {/* Key Metrics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <EnhancedKPICard 
          title="Total Revenue" 
          value={formatCompact(summary.revenue)} 
          prefix="" 
          icon={DollarSign} 
          iconColor="text-emerald-500"
          trend={revenueGrowth > 0 ? 'up' : 'down'}
          trendLabel={revenueGrowth > 0 ? 'Growing' : 'Declining'}
          contextualData={[
            { label: 'Orders', value: summary.orders.toLocaleString() },
            { label: 'AOV', value: formatCurrency(summary.avgOrderValue) },
          ]}
          targetProgress={{
            current: summary.revenue,
            target: 120000000,
            label: 'Annual Target',
          }}
        />
        <EnhancedKPICard 
          title="Total Profit" 
          value={formatCompact(summary.profit)} 
          prefix="" 
          icon={TrendingUp} 
          iconColor="text-violet-500"
          trend={netMargin > 18 ? 'up' : netMargin < 15 ? 'down' : 'stable'}
          trendLabel={netMargin > 18 ? 'Strong' : netMargin < 15 ? 'Weak' : 'On Track'}
          contextualData={[
            { label: 'Margin', value: netMargin.toFixed(1), suffix: '%' },
            { label: 'Gross', value: formatCompact(summary.profit * 1.5) },
          ]}
          targetProgress={{
            current: summary.profit,
            target: summary.revenue * 0.22,
            label: 'Target Profit',
          }}
        />
        <EnhancedKPICard 
          title="Total Ad Spend" 
          value={formatCompact(summary.adSpend)} 
          prefix="" 
          icon={Target} 
          iconColor="text-amber-500"
          trend={summary.roas > 4.5 ? 'up' : summary.roas < 3.5 ? 'down' : 'stable'}
          trendLabel={summary.roas > 4.5 ? 'Efficient' : summary.roas < 3.5 ? 'Overspending' : 'On Track'}
          contextualData={[
            { label: 'Budget Used', value: Math.round((summary.adSpend / 8000000) * 100), suffix: '%' },
            { label: 'ROAS', value: summary.roas.toFixed(1), suffix: 'x' },
          ]}
          targetProgress={{
            current: summary.adSpend,
            target: 8000000,
            label: 'Budget',
          }}
        />
        <EnhancedKPICard 
          title="ROAS" 
          value={summary.roas.toFixed(2)} 
          suffix="x" 
          icon={Zap} 
          iconColor="text-cyan-500"
          trend={summary.roas > 4.5 ? 'up' : summary.roas < 3.5 ? 'down' : 'stable'}
          trendLabel={summary.roas > 4.5 ? 'Excellent' : summary.roas < 3.5 ? 'Below Target' : 'On Track'}
          contextualData={[
            { label: 'Target', value: '4.0', suffix: 'x' },
            { label: 'CPA', value: formatCompact(25) },
          ]}
          targetProgress={{
            current: summary.roas,
            target: 6,
            label: 'Target ROAS',
          }}
        />
      </div>

      {/* Period KPIs */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <EnhancedKPICard 
          title="Period Revenue" 
          value={formatCompact(summary.revenue)}
          icon={DollarSign} 
          iconColor="text-emerald-500"
          trend={revenueGrowth > 0 ? 'up' : 'down'}
          trendLabel={revenueGrowth > 0 ? 'Growing' : 'Declining'}
          contextualData={[
            { label: 'Orders', value: summary.orders.toLocaleString() },
            { label: 'Growth', value: Math.abs(revenueGrowth).toFixed(1), suffix: '%' },
          ]}
          targetProgress={{
            current: summary.revenue,
            target: 120000000,
            label: 'Budget Target',
          }}
        />
        <EnhancedKPICard 
          title="Net Profit" 
          value={formatCompact(summary.profit)}
          icon={TrendingUp} 
          iconColor="text-violet-500"
          trend={netMargin > 18 ? 'up' : netMargin < 15 ? 'down' : 'stable'}
          trendLabel={netMargin > 18 ? 'Strong' : netMargin < 15 ? 'Weak' : 'On Track'}
          contextualData={[
            { label: 'Margin', value: netMargin.toFixed(1), suffix: '%' },
            { label: 'Gross', value: formatCompact(summary.profit * 1.5) },
          ]}
          targetProgress={{
            current: summary.profit,
            target: summary.revenue * 0.25,
            label: 'Target Profit',
          }}
        />
        <EnhancedKPICard 
          title="Total Orders" 
          value={formatCompact(summary.orders)}
          icon={ShoppingCart} 
          iconColor="text-amber-500"
          trend={orderGrowth > 0 ? 'up' : 'down'}
          trendLabel={orderGrowth > 0 ? 'Growing' : 'Declining'}
          contextualData={[
            { label: 'Conv. Rate', value: conversionRate.toFixed(2), suffix: '%' },
            { label: 'Cart Value', value: formatCurrency(summary.avgOrderValue) },
          ]}
          targetProgress={{
            current: summary.orders,
            target: summary.orders * 1.2,
            label: 'Order Target',
          }}
        />
        <EnhancedKPICard 
          title="Avg Order Value" 
          value={formatCurrency(summary.avgOrderValue)}
          icon={Zap} 
          iconColor="text-cyan-500"
          trend={summary.avgOrderValue > 120 ? 'up' : summary.avgOrderValue < 100 ? 'down' : 'stable'}
          trendLabel={summary.avgOrderValue > 120 ? 'High' : summary.avgOrderValue < 100 ? 'Low' : 'Average'}
          contextualData={[
            { label: 'Items/Order', value: '2.4' },
            { label: 'Units', value: formatCompact(Math.round(summary.orders * 2.4)) },
          ]}
          targetProgress={{
            current: summary.avgOrderValue,
            target: 150,
            label: 'Target AOV',
          }}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3" ref={chartRef}>
        <div className="lg:col-span-2">
          <RevenueTrendChart 
            data={trendData} 
            title="Revenue & Profit Trend" 
            description={`${counts.brands} brands • ${counts.platforms} platforms`} 
          />
        </div>
        <DistributionPieChart 
          data={brandData} 
          title="Revenue by Brand" 
          description="Click to filter" 
          onSliceClick={handleBrandClick}
        />
      </div>

      {/* Platform & Brands */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <PlatformBarChart 
          data={platformData} 
          title="Revenue by Platform" 
          description="Click to drill down"
        />
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Brand Performance</CardTitle>
            <CardDescription>Top and bottom performers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                  Top Performers
                </h4>
                <div className="space-y-2">
                  {topBrands.map((brand, i) => (
                    <button 
                      key={brand.id} 
                      className="flex items-center justify-between text-sm w-full hover:bg-muted/50 rounded px-1 py-0.5 -mx-1 transition-colors"
                      onClick={() => handleBrandClick(brand.name)}
                    >
                      <span className="text-left">{i + 1}. {brand.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatCurrency(brand.metrics?.revenue || 0)}</span>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 text-xs">+{(brand.metrics?.growth || 0).toFixed(1)}%</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {bottomBrands.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                    Needs Attention
                  </h4>
                  <div className="space-y-2">
                    {bottomBrands.map((brand) => (
                      <button
                        key={brand.id}
                        className="flex items-center justify-between text-sm w-full hover:bg-muted/50 rounded px-1 py-0.5 -mx-1 transition-colors"
                        onClick={() => handleBrandClick(brand.name)}
                      >
                        <span className="text-muted-foreground text-left">{brand.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatCurrency(brand.metrics?.revenue || 0)}</span>
                          <Badge variant="outline" className={`text-xs ${(brand.metrics?.growth || 0) < 0 ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"}`}>
                            {(brand.metrics?.growth || 0) >= 0 ? '+' : ''}{(brand.metrics?.growth || 0).toFixed(1)}%
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <CompactKPICard 
          label="Gross Margin" 
          value={`${grossMargin.toFixed(1)}%`}
          trend={grossMargin > 32 ? 'up' : grossMargin < 28 ? 'down' : 'stable'}
          contextualValue={`Target: 30%`}
          progress={Math.min(100, (grossMargin / 35) * 100)}
        />
        <CompactKPICard 
          label="Net Margin" 
          value={`${netMargin.toFixed(1)}%`}
          trend={netMargin > 20 ? 'up' : netMargin < 16 ? 'down' : 'stable'}
          contextualValue={`Target: 18%`}
          progress={Math.min(100, (netMargin / 25) * 100)}
        />
        <CompactKPICard 
          label="Conversion Rate" 
          value={`${conversionRate.toFixed(2)}%`}
          trend={conversionRate > 3.5 ? 'up' : conversionRate < 2.5 ? 'down' : 'stable'}
          contextualValue={`Target: 3.5%`}
          progress={Math.min(100, (conversionRate / 5) * 100)}
        />
        <CompactKPICard 
          label="ROAS" 
          value={`${summary.roas.toFixed(2)}x`}
          trend={summary.roas > 4.5 ? 'up' : summary.roas < 3.5 ? 'down' : 'stable'}
          contextualValue={`Target: 4.0x`}
          progress={Math.min(100, (summary.roas / 6) * 100)}
        />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 lg:p-6 animate-pulse">
      <div className="h-32 sm:h-48 rounded-lg bg-muted" />
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 sm:h-28 rounded-lg bg-muted" />)}
      </div>
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 h-60 sm:h-72 rounded-lg bg-muted" />
        <div className="h-60 sm:h-72 rounded-lg bg-muted" />
      </div>
    </div>
  );
}
