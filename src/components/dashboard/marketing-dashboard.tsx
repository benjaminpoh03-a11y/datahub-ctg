'use client';

import { useEffect, useState } from 'react';
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
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Target,
  DollarSign,
  TrendingUp,
  MousePointer,
  Eye,
  ShoppingCart,
  Zap,
  BarChart3,
  Facebook,
  Youtube,
} from 'lucide-react';
import { generateDashboardData, generateCampaigns, formatCurrency, formatCompact } from '@/lib/data/mock-data';
import { useFilterStore } from '@/lib/store';
import type { DashboardData } from '@/types';

const COLORS = [
  'hsl(160, 84%, 39%)',
  'hsl(38, 92%, 50%)',
  'hsl(330, 81%, 60%)',
  'hsl(263, 70%, 50%)',
  'hsl(189, 94%, 43%)',
];

export function MarketingDashboard() {
  const { timeRange, brandId } = useFilterStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Re-generate data when filters change
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        setData(generateDashboardData(timeRange, brandId));
        setCampaigns(generateCampaigns(brandId));
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

  const adPlatformData = [
    { name: 'Facebook Ads', spend: data.marketing.adSpend * 0.45, conversions: data.marketing.conversions * 0.42, roas: 4.8 },
    { name: 'TikTok Ads', spend: data.marketing.adSpend * 0.35, conversions: data.marketing.conversions * 0.38, roas: 5.1 },
    { name: 'Google Ads', spend: data.marketing.adSpend * 0.20, conversions: data.marketing.conversions * 0.20, roas: 4.3 },
  ];

  const weeklyTrend = [
    { day: 'Mon', spend: 12000, conversions: 580, roas: 4.5 },
    { day: 'Tue', spend: 15000, conversions: 720, roas: 4.8 },
    { day: 'Wed', spend: 14000, conversions: 650, roas: 4.6 },
    { day: 'Thu', spend: 16000, conversions: 780, roas: 4.9 },
    { day: 'Fri', spend: 18000, conversions: 920, roas: 5.1 },
    { day: 'Sat', spend: 22000, conversions: 1100, roas: 5.0 },
    { day: 'Sun', spend: 20000, conversions: 980, roas: 4.9 },
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Key Marketing Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <EnhancedKPICard
          title="Ad Spend"
          value={formatCompact(data.marketing.adSpend)}
          prefix=""
          icon={DollarSign}
          iconColor="text-amber-500"
          trend={data.marketing.roas > 4.5 ? 'up' : data.marketing.roas < 3.5 ? 'down' : 'stable'}
          trendLabel={data.marketing.roas > 4.5 ? 'Efficient' : data.marketing.roas < 3.5 ? 'Overspending' : 'On Track'}
          contextualData={[
            { label: 'Budget Used', value: Math.round((data.budget.spentBudget / data.budget.totalBudget) * 100), suffix: '%' },
            { label: 'ROAS', value: data.marketing.roas.toFixed(1), suffix: 'x' },
          ]}
          targetProgress={{
            current: data.budget.spentBudget,
            target: data.budget.totalBudget,
            label: 'Budget',
          }}
        />
        <EnhancedKPICard
          title="ROAS"
          value={data.marketing.roas.toFixed(2)}
          suffix="x"
          icon={TrendingUp}
          iconColor="text-emerald-500"
          trend={data.marketing.roas > 4.5 ? 'up' : data.marketing.roas < 3.5 ? 'down' : 'stable'}
          trendLabel={data.marketing.roas > 4.5 ? 'Excellent' : data.marketing.roas < 3.5 ? 'Below Target' : 'On Track'}
          contextualData={[
            { label: 'Target', value: '4.0', suffix: 'x' },
            { label: 'CPA', value: formatCompact(data.marketing.cpa) },
          ]}
          targetProgress={{
            current: data.marketing.roas,
            target: 6,
            label: 'Target ROAS',
          }}
        />
        <EnhancedKPICard
          title="CPA"
          value={data.marketing.cpa.toFixed(2)}
          prefix=""
          icon={Target}
          iconColor="text-violet-500"
          trend={data.marketing.cpa < 12 ? 'up' : data.marketing.cpa > 18 ? 'down' : 'stable'}
          trendLabel={data.marketing.cpa < 12 ? 'Low Cost' : data.marketing.cpa > 18 ? 'High Cost' : 'Average'}
          contextualData={[
            { label: 'Target', value: '15', prefix: '' },
            { label: 'Conversions', value: formatCompact(data.marketing.conversions) },
          ]}
          targetProgress={{
            current: 20 - data.marketing.cpa,
            target: 10,
            label: 'Efficiency Score',
          }}
        />
        <EnhancedKPICard
          title="CTR"
          value={data.marketing.ctr.toFixed(2)}
          suffix="%"
          icon={MousePointer}
          iconColor="text-cyan-500"
          trend={data.marketing.ctr > 3.5 ? 'up' : data.marketing.ctr < 2.5 ? 'down' : 'stable'}
          trendLabel={data.marketing.ctr > 3.5 ? 'High' : data.marketing.ctr < 2.5 ? 'Low' : 'Average'}
          contextualData={[
            { label: 'Clicks', value: formatCompact(data.marketing.clicks) },
            { label: 'Impr.', value: formatCompact(data.marketing.impressions) },
          ]}
          targetProgress={{
            current: data.marketing.ctr,
            target: 5,
            label: 'Target CTR',
          }}
        />
      </div>

      {/* Second Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <EnhancedKPICard
          title="Impressions"
          value={formatCompact(data.marketing.impressions)}
          icon={Eye}
          trend="up"
          trendLabel="Growing"
          contextualData={[
            { label: 'CPM', value: data.marketing.cpm.toFixed(2), prefix: '' },
          ]}
        />
        <EnhancedKPICard
          title="Clicks"
          value={formatCompact(data.marketing.clicks)}
          icon={MousePointer}
          trend={data.marketing.ctr > 3 ? 'up' : 'stable'}
          trendLabel={data.marketing.ctr > 3 ? 'Strong' : 'Normal'}
          contextualData={[
            { label: 'CTR', value: data.marketing.ctr.toFixed(2), suffix: '%' },
          ]}
        />
        <EnhancedKPICard
          title="Conversions"
          value={formatCompact(data.marketing.conversions)}
          icon={ShoppingCart}
          trend={data.marketing.conversions > 3000 ? 'up' : 'stable'}
          trendLabel={data.marketing.conversions > 3000 ? 'Strong' : 'Normal'}
          contextualData={[
            { label: 'Rate', value: ((data.marketing.conversions / data.marketing.clicks) * 100).toFixed(1), suffix: '%' },
          ]}
        />
        <EnhancedKPICard
          title="CPM"
          value={data.marketing.cpm.toFixed(2)}
          prefix=""
          icon={BarChart3}
          trend={data.marketing.cpm < 15 ? 'up' : data.marketing.cpm > 20 ? 'down' : 'stable'}
          trendLabel={data.marketing.cpm < 15 ? 'Low' : data.marketing.cpm > 20 ? 'High' : 'Average'}
          contextualData={[
            { label: 'Cost per 1K', value: 'views' },
          ]}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Weekly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
            <CardDescription>Daily ad spend and conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <BarChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis yAxisId="right" orientation="right" className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar yAxisId="left" dataKey="spend" fill={COLORS[1]} radius={[4, 4, 0, 0]} name="Spend (RM)" />
                <Line yAxisId="right" type="monotone" dataKey="roas" stroke={COLORS[0]} strokeWidth={2} name="ROAS" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Ad Platform Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Ad Platform Performance</CardTitle>
            <CardDescription>Spend and ROAS by platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {adPlatformData.map((platform, index) => (
                <div key={platform.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      <span className="font-medium">{platform.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">{formatCurrency(platform.spend)}</span>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        {platform.roas}x ROAS
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={(platform.spend / data.marketing.adSpend) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Active marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns found for the selected brand.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Campaign</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Platform</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Budget</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Spent</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Impressions</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Clicks</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Conv.</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">CTR</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{campaign.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {campaign.adPlatform.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">{formatCurrency(campaign.budget || 0)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(campaign.budgetSpent)}</td>
                      <td className="py-3 px-4 text-right">{formatCompact(campaign.impressions)}</td>
                      <td className="py-3 px-4 text-right">{formatCompact(campaign.clicks)}</td>
                      <td className="py-3 px-4 text-right">{formatCompact(campaign.conversions)}</td>
                      <td className="py-3 px-4 text-right">{campaign.ctr.toFixed(2)}%</td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-medium text-emerald-600">{campaign.roas.toFixed(1)}x</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marketing Insights */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Performing Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                <Facebook className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold">Facebook Ads</p>
                <p className="text-sm text-muted-foreground">ROAS: 4.8x</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Best Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10">
                <Zap className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="font-semibold">{campaigns[0]?.name || 'No campaigns'}</p>
                <p className="text-sm text-muted-foreground">ROAS: {campaigns[0]?.roas.toFixed(1) || 'N/A'}x</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Optimization Tip</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold">Increase TikTok Budget</p>
                <p className="text-sm text-muted-foreground">+15% potential ROI boost</p>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
