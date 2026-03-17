'use client';

import { useEffect, useState } from 'react';
import { EnhancedKPICard } from './enhanced-kpi-card';
import { RevenueTrendChart, PlatformBarChart, DistributionPieChart } from '@/components/charts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Receipt,
} from 'lucide-react';
import { generateDashboardData, generateRevenueTrend, formatCurrency, formatCompact, formatPercent } from '@/lib/data/mock-data';
import { useFilterStore } from '@/lib/store';
import type { DashboardData } from '@/types';

export function FinancialDashboard() {
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

  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  const marginData = [
    { name: 'Gross Margin', value: data.profit.grossMargin, color: 'hsl(160, 84%, 39%)' },
    { name: 'Net Margin', value: data.profit.netMargin, color: 'hsl(263, 70%, 50%)' },
    { name: 'Operating Margin', value: data.profit.operatingMargin, color: 'hsl(38, 92%, 50%)' },
  ];

  const spendVsRevenue = data.revenueTrend.map((item) => ({
    date: item.date,
    dateLabel: item.dateLabel,
    revenue: item.revenue,
    spend: Math.round(item.revenue * 0.15),
    profit: item.profit,
  }));

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Key Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <EnhancedKPICard
          title="Total Revenue"
          value={formatCompact(data.revenue.totalRevenue)}
          prefix=""
          icon={DollarSign}
          iconColor="text-emerald-500"
          trend={data.revenue.revenueGrowth > 0 ? 'up' : data.revenue.revenueGrowth < 0 ? 'down' : 'stable'}
          trendLabel={data.revenue.revenueGrowth > 0 ? 'Growing' : data.revenue.revenueGrowth < 0 ? 'Declining' : 'Stable'}
          contextualData={[
            { label: 'Orders', value: data.sales.totalOrders.toLocaleString() },
            { label: 'Growth', value: data.revenue.revenueGrowth.toFixed(1), suffix: '%' },
          ]}
          targetProgress={{
            current: data.revenue.totalRevenue,
            target: data.budget.totalBudget,
            label: 'Budget Target',
          }}
        />
        <EnhancedKPICard
          title="Gross Profit"
          value={formatCompact(data.profit.grossProfit)}
          prefix=""
          icon={TrendingUp}
          iconColor="text-emerald-500"
          trend={data.profit.grossMargin > 32 ? 'up' : data.profit.grossMargin < 28 ? 'down' : 'stable'}
          trendLabel={data.profit.grossMargin > 32 ? 'Strong' : data.profit.grossMargin < 28 ? 'Weak' : 'On Track'}
          contextualData={[
            { label: 'Margin', value: data.profit.grossMargin.toFixed(1), suffix: '%' },
            { label: 'Revenue', value: formatCompact(data.revenue.totalRevenue) },
          ]}
          targetProgress={{
            current: data.profit.grossProfit,
            target: data.revenue.totalRevenue * 0.35,
            label: 'Target Profit',
          }}
        />
        <EnhancedKPICard
          title="Net Profit"
          value={formatCompact(data.profit.netProfit)}
          prefix=""
          icon={TrendingUp}
          iconColor="text-violet-500"
          trend={data.profit.netMargin > 20 ? 'up' : data.profit.netMargin < 16 ? 'down' : 'stable'}
          trendLabel={data.profit.netMargin > 20 ? 'Excellent' : data.profit.netMargin < 16 ? 'Below Target' : 'On Track'}
          contextualData={[
            { label: 'Margin', value: data.profit.netMargin.toFixed(1), suffix: '%' },
            { label: 'Operating', value: data.profit.operatingMargin.toFixed(1), suffix: '%' },
          ]}
          targetProgress={{
            current: data.profit.netProfit,
            target: data.revenue.totalRevenue * 0.25,
            label: 'Target Net',
          }}
        />
        <EnhancedKPICard
          title="Gross Margin"
          value={data.profit.grossMargin.toFixed(1)}
          suffix="%"
          icon={Percent}
          iconColor="text-amber-500"
          trend={data.profit.grossMargin > 32 ? 'up' : data.profit.grossMargin < 28 ? 'down' : 'stable'}
          trendLabel={data.profit.grossMargin > 32 ? 'Above Target' : data.profit.grossMargin < 28 ? 'Below Target' : 'At Target'}
          contextualData={[
            { label: 'Target', value: '30', suffix: '%' },
            { label: 'vs Industry', value: '28', suffix: '%' },
          ]}
          targetProgress={{
            current: data.profit.grossMargin,
            target: 35,
            label: 'Target Margin',
          }}
        />
        <EnhancedKPICard
          title="Net Margin"
          value={data.profit.netMargin.toFixed(1)}
          suffix="%"
          icon={Calculator}
          iconColor="text-cyan-500"
          trend={data.profit.netMargin > 20 ? 'up' : data.profit.netMargin < 16 ? 'down' : 'stable'}
          trendLabel={data.profit.netMargin > 20 ? 'Strong' : data.profit.netMargin < 16 ? 'Needs Work' : 'Average'}
          contextualData={[
            { label: 'Target', value: '18', suffix: '%' },
            { label: 'Operating', value: data.profit.operatingMargin.toFixed(1), suffix: '%' },
          ]}
          targetProgress={{
            current: data.profit.netMargin,
            target: 25,
            label: 'Target Margin',
          }}
        />
      </div>

      {/* Revenue & Profit Trend */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Ad Spend</CardTitle>
            <CardDescription>Spending efficiency analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <RevenueTrendChart
                data={spendVsRevenue}
                title=""
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Margin Analysis</CardTitle>
            <CardDescription>Profitability breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <DistributionPieChart data={marginData} title="" />
          </CardContent>
        </Card>
      </div>

      {/* Financial Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Metrics Overview</CardTitle>
          <CardDescription>Detailed breakdown of key financial indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Revenue Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Revenue Metrics</h4>
              <div className="grid gap-3 md:grid-cols-3">
                <MetricRow label="Total Revenue" value={formatCurrency(data.revenue.totalRevenue)} />
                <MetricRow label="Total Orders" value={data.sales.totalOrders.toLocaleString()} />
                <MetricRow label="Average Order Value" value={formatCurrency(data.sales.averageOrderValue)} />
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Cost Metrics</h4>
              <div className="grid gap-3 md:grid-cols-3">
                <MetricRow label="Cost of Goods Sold" value={formatCurrency(data.revenue.totalRevenue - data.profit.grossProfit)} />
                <MetricRow label="Total Discounts" value={formatCurrency(data.discounts.totalDiscounts)} />
                <MetricRow label="Marketing Spend" value={formatCurrency(data.marketing.adSpend)} />
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Profit Metrics</h4>
              <div className="grid gap-3 md:grid-cols-3">
                <MetricRow label="Gross Profit" value={formatCurrency(data.profit.grossProfit)} trend={12.5} />
                <MetricRow label="Operating Profit" value={formatCurrency(data.profit.netProfit * 1.1)} trend={8.3} />
                <MetricRow label="Net Profit" value={formatCurrency(data.profit.netProfit)} trend={15.2} />
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Margin Analysis</h4>
              <div className="grid gap-3 md:grid-cols-4">
                <MetricRow label="Gross Margin" value={`${data.profit.grossMargin.toFixed(1)}%`} trend={2.1} />
                <MetricRow label="Net Margin" value={`${data.profit.netMargin.toFixed(1)}%`} trend={1.8} />
                <MetricRow label="Contribution Margin" value={`${data.profit.contributionMargin.toFixed(1)}%`} />
                <MetricRow label="Operating Margin" value={`${data.profit.operatingMargin.toFixed(1)}%`} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Channel Profitability */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Channel Profitability</CardTitle>
            <CardDescription>Revenue and profit by sales channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.platformPerformance.map((platform, index) => {
                const profit = platform.revenue * 0.28;
                const margin = 28 - index * 2;
                return (
                  <div key={platform.platform} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: `hsl(${160 + index * 30}, 70%, 50%)` }} />
                      <span className="font-medium">{platform.platform}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(platform.revenue)}</p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-emerald-600">{formatCurrency(profit)}</p>
                        <p className="text-xs text-muted-foreground">Profit</p>
                      </div>
                      <Badge variant="outline">{margin}%</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual</CardTitle>
            <CardDescription>Period budget tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Marketing Budget</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(data.budget.spentBudget * 0.6)} / {formatCurrency(data.budget.totalBudget * 0.3)}
                  </span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Operational Budget</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(data.budget.spentBudget * 0.25)} / {formatCurrency(data.budget.totalBudget * 0.5)}
                  </span>
                </div>
                <Progress value={30} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">R&D Budget</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(data.budget.spentBudget * 0.15)} / {formatCurrency(data.budget.totalBudget * 0.2)}
                  </span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricRow({ label, value, trend }: { label: string; value: string; trend?: number }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium">{value}</span>
        {trend !== undefined && (
          <Badge variant="outline" className={trend > 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"}>
            {trend > 0 ? '+' : ''}{trend}%
          </Badge>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 lg:p-6 animate-pulse">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-80 rounded-lg bg-muted" />
        <div className="h-80 rounded-lg bg-muted" />
      </div>
    </div>
  );
}
