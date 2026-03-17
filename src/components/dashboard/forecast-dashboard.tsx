'use client';

import { useEffect, useState, useMemo } from 'react';
import { EnhancedKPICard } from './enhanced-kpi-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  Calculator,
  BarChart3,
} from 'lucide-react';
import { generateDashboardData, generateForecasts, formatCurrency, formatCompact } from '@/lib/data/mock-data';
import { useFilterStore } from '@/lib/store';
import type { DashboardData } from '@/types';

const COLORS = [
  'hsl(160, 84%, 39%)',
  'hsl(38, 92%, 50%)',
  'hsl(330, 81%, 60%)',
  'hsl(263, 70%, 50%)',
  'hsl(189, 94%, 43%)',
];

export function ForecastDashboard() {
  const { timeRange, brandId } = useFilterStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scenario, setScenario] = useState('baseline');

  // Re-generate data when filters change
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        setData(generateDashboardData(timeRange, brandId));
        setForecasts(generateForecasts(brandId));
        setLoading(false);
      }
    }, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [timeRange, brandId]);

  // Generate forecast data based on data
  const forecastData = useMemo(() => {
    const baseRevenue = data?.revenue.totalRevenue || 1000000;
    const multiplier = baseRevenue / 3000000;
    
    return [
      { month: 'Jan', actual: Math.round(850000 * multiplier), forecast: Math.round(820000 * multiplier) },
      { month: 'Feb', actual: Math.round(920000 * multiplier), forecast: Math.round(900000 * multiplier) },
      { month: 'Mar', actual: Math.round(1050000 * multiplier), forecast: Math.round(1000000 * multiplier) },
      { month: 'Apr', actual: Math.round(980000 * multiplier), forecast: Math.round(950000 * multiplier) },
      { month: 'May', actual: Math.round(1120000 * multiplier), forecast: Math.round(1050000 * multiplier) },
      { month: 'Jun', actual: Math.round(1200000 * multiplier), forecast: Math.round(1150000 * multiplier) },
      { month: 'Jul', actual: Math.round(1350000 * multiplier), forecast: Math.round(1300000 * multiplier) },
      { month: 'Aug', actual: null, forecast: Math.round(1400000 * multiplier) },
      { month: 'Sep', actual: null, forecast: Math.round(1500000 * multiplier) },
      { month: 'Oct', actual: null, forecast: Math.round(1550000 * multiplier) },
      { month: 'Nov', actual: null, forecast: Math.round(1650000 * multiplier) },
      { month: 'Dec', actual: null, forecast: Math.round(1800000 * multiplier) },
    ];
  }, [data]);

  // Generate budget data based on brand filter
  const budgetData = useMemo(() => {
    const baseBudget = data?.budget.totalBudget || 1900000;
    const baseSpent = data?.budget.spentBudget || 1200000;
    
    const allBrands = [
      { brand: 'GlowSkin', brandId: 'brand-1', budget: Math.round(baseBudget * 0.26), spent: Math.round(baseSpent * 0.27) },
      { brand: 'VitaWell', brandId: 'brand-2', budget: Math.round(baseBudget * 0.24), spent: Math.round(baseSpent * 0.23) },
      { brand: 'PureBeauty', brandId: 'brand-3', budget: Math.round(baseBudget * 0.21), spent: Math.round(baseSpent * 0.21) },
      { brand: 'ZenLife', brandId: 'brand-4', budget: Math.round(baseBudget * 0.16), spent: Math.round(baseSpent * 0.15) },
      { brand: 'HairLux', brandId: 'brand-5', budget: Math.round(baseBudget * 0.13), spent: Math.round(baseSpent * 0.14) },
    ];
    
    if (brandId) {
      const filtered = allBrands.filter(b => b.brandId === brandId);
      return filtered.map(b => ({ ...b, remaining: b.budget - b.spent }));
    }
    return allBrands.map(b => ({ ...b, remaining: b.budget - b.spent }));
  }, [data, brandId]);

  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  const totalBudget = budgetData.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgetData.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  const baseForecast = data.revenue.totalRevenue * 3.5;
  const scenarios = [
    { name: 'Baseline', revenue: Math.round(baseForecast), profit: Math.round(baseForecast * 0.3), spend: Math.round(baseForecast * 0.15) },
    { name: 'Optimistic', revenue: Math.round(baseForecast * 1.17), profit: Math.round(baseForecast * 1.17 * 0.32), spend: Math.round(baseForecast * 1.17 * 0.15) },
    { name: 'Pessimistic', revenue: Math.round(baseForecast * 0.79), profit: Math.round(baseForecast * 0.79 * 0.27), spend: Math.round(baseForecast * 0.79 * 0.14) },
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Key Forecast Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <EnhancedKPICard
          title="Q3 Forecast"
          value={formatCompact(scenarios[0].revenue)}
          prefix=""
          icon={TrendingUp}
          trend="up"
          trendLabel="Projected"
          contextualData={[
            { label: 'vs Actual', value: ((scenarios[0].revenue / data.revenue.totalRevenue - 1) * 100).toFixed(0), suffix: '%' },
          ]}
          targetProgress={{
            current: scenarios[0].revenue,
            target: scenarios[1].revenue,
            label: 'Optimistic',
          }}
        />
        <EnhancedKPICard
          title="Forecast Profit"
          value={formatCompact(scenarios[0].profit)}
          prefix=""
          icon={DollarSign}
          trend="up"
          trendLabel="Expected"
          contextualData={[
            { label: 'Margin', value: ((scenarios[0].profit / scenarios[0].revenue) * 100).toFixed(0), suffix: '%' },
          ]}
          targetProgress={{
            current: scenarios[0].profit,
            target: scenarios[1].profit,
            label: 'Optimistic',
          }}
        />
        <EnhancedKPICard
          title="Budget Allocated"
          value={formatCompact(totalBudget)}
          prefix=""
          icon={Calendar}
          trend="stable"
          trendLabel="Set"
          contextualData={[
            { label: 'Brands', value: budgetData.length },
          ]}
          targetProgress={{
            current: totalSpent,
            target: totalBudget,
            label: 'Used',
          }}
        />
        <EnhancedKPICard
          title="Budget Remaining"
          value={formatCompact(totalRemaining)}
          prefix=""
          icon={Target}
          trend={totalRemaining > 0 ? 'up' : 'down'}
          trendLabel={totalRemaining > 0 ? 'On Track' : 'Over Budget'}
          contextualData={[
            { label: 'Spent', value: ((totalSpent / totalBudget) * 100).toFixed(0), suffix: '%' },
          ]}
          targetProgress={{
            current: totalBudget - totalRemaining,
            target: totalBudget,
            label: 'Budget',
          }}
        />
      </div>

      {/* Forecast vs Actual Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Forecast vs Actual</CardTitle>
          <CardDescription>Year-to-date performance against projections</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[350px]">
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis tickFormatter={(v) => `RM ${(v/1000000).toFixed(1)}M`} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatCurrency(Number(v))} />} />
              <Area
                type="monotone"
                dataKey="actual"
                stroke={COLORS[0]}
                fillOpacity={1}
                fill="url(#colorActual)"
                strokeWidth={2}
                name="Actual"
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke={COLORS[1]}
                fillOpacity={1}
                fill="url(#colorForecast)"
                strokeDasharray="5 5"
                strokeWidth={2}
                name="Forecast"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Scenario Modeling */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scenario Modeling</CardTitle>
            <CardDescription>Compare different growth scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {scenarios.map((s, index) => (
                <div 
                  key={s.name}
                  className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                    scenario === s.name.toLowerCase() 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-muted-foreground/30'
                  }`}
                  onClick={() => setScenario(s.name.toLowerCase())}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{s.name}</span>
                    <Badge variant={index === 1 ? 'default' : index === 2 ? 'destructive' : 'outline'}>
                      {index === 1 ? '+17%' : index === 2 ? '-21%' : 'Base'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <p className="font-semibold">{formatCompact(s.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Profit</p>
                      <p className="font-semibold text-emerald-600">{formatCompact(s.profit)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ad Spend</p>
                      <p className="font-semibold">{formatCompact(s.spend)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Allocation</CardTitle>
            <CardDescription>Brand budget tracking</CardDescription>
          </CardHeader>
          <CardContent>
            {budgetData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No budget data available.
              </div>
            ) : (
              <div className="space-y-4">
                {budgetData.map((brand, index) => (
                  <div key={brand.brand} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                        <span className="font-medium">{brand.brand}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                          {formatCurrency(brand.spent)} / {formatCurrency(brand.budget)}
                        </span>
                        <span className="font-medium text-emerald-600">
                          {((brand.spent / brand.budget) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <Progress value={(brand.spent / brand.budget) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            )}
            {budgetData.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Budget</p>
                    <p className="font-semibold">{formatCurrency(totalBudget)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Spent</p>
                    <p className="font-semibold">{formatCurrency(totalSpent)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="font-semibold text-emerald-600">{formatCurrency(totalRemaining)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget vs Actual Table */}
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual by Brand</CardTitle>
          <CardDescription>Period budget performance</CardDescription>
        </CardHeader>
        <CardContent>
          {budgetData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No budget data available for the selected brand.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Brand</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Budget</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Spent</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Remaining</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Progress</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetData.map((brand, index) => {
                    const progress = (brand.spent / brand.budget) * 100;
                    const status = progress > 90 ? 'Over Budget' : progress > 75 ? 'On Track' : 'Under Budget';
                    return (
                      <tr key={brand.brand} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                            <span className="font-medium">{brand.brand}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">{formatCurrency(brand.budget)}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(brand.spent)}</td>
                        <td className="py-3 px-4 text-right text-emerald-600">{formatCurrency(brand.remaining)}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Progress value={progress} className="w-20 h-2" />
                            <span className="text-sm">{progress.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Badge 
                            variant={status === 'Over Budget' ? 'destructive' : status === 'On Track' ? 'default' : 'outline'}
                          >
                            {status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forecast Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Projected Growth</p>
                <p className="text-2xl font-bold text-emerald-600">+{(data.revenue.totalRevenue / 2500000 * 18.5).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/20">
                <Calculator className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin Target</p>
                <p className="text-2xl font-bold">{data.profit.netMargin.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-violet-500/5 border-violet-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/20">
                <BarChart3 className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Target</p>
                <p className="text-2xl font-bold">{formatCompact(data.revenue.totalRevenue / 2.5)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
    </div>
  );
}
