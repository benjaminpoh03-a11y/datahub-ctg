'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatCompact, formatPercent } from '@/lib/data/mock-data';
import type { DashboardData, TimeRange } from '@/types';

interface Insight {
  type: 'positive' | 'negative' | 'neutral' | 'alert' | 'suggestion';
  title: string;
  description: string;
  metric?: string;
  action?: string;
  priority: number; // For deterministic ordering
}

interface AISummaryCardProps {
  data: DashboardData;
  timeRange: TimeRange;
  brandId: string | null;
}

const BRAND_NAMES: Record<string, string> = {
  'brand-1': 'GlowSkin',
  'brand-2': 'VitaWell',
  'brand-3': 'PureBeauty',
  'brand-4': 'ZenLife',
  'brand-5': 'HairLux',
};

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  today: 'today',
  yesterday: 'yesterday',
  last7days: 'the last 7 days',
  last30days: 'the last 30 days',
  thisMonth: 'this month',
  lastMonth: 'last month',
  thisQuarter: 'this quarter',
  thisYear: 'this year',
  custom: 'custom period',
};

// Generate insights based on data (deterministic - no random)
function generateInsights(data: DashboardData, brandId: string | null): Insight[] {
  const insights: Insight[] = [];
  
  // Revenue performance
  if (data.revenue.totalRevenue > 3000000) {
    insights.push({
      type: 'positive',
      title: 'Strong Revenue Performance',
      description: `Total revenue of ${formatCurrency(data.revenue.totalRevenue)} exceeds expectations with healthy growth trajectory.`,
      metric: formatCompact(data.revenue.totalRevenue),
      action: 'View Details',
      priority: 1
    });
  } else if (data.revenue.totalRevenue < 1500000) {
    insights.push({
      type: 'alert',
      title: 'Revenue Below Target',
      description: 'Revenue is tracking below projections. Consider accelerating marketing spend or promotional activities.',
      metric: formatCurrency(data.revenue.totalRevenue),
      action: 'View Analysis',
      priority: 1
    });
  }
  
  // ROAS analysis
  if (data.marketing.roas > 4.5) {
    insights.push({
      type: 'positive',
      title: 'Excellent ROAS',
      description: `Return on ad spend of ${data.marketing.roas.toFixed(1)}x is outperforming targets. Consider scaling successful campaigns.`,
      metric: `${data.marketing.roas.toFixed(1)}x`,
      action: 'Scale Campaigns',
      priority: 2
    });
  } else if (data.marketing.roas < 3.5) {
    insights.push({
      type: 'alert',
      title: 'ROAS Needs Attention',
      description: `Current ROAS of ${data.marketing.roas.toFixed(1)}x is below target. Review ad creatives and targeting.`,
      metric: `${data.marketing.roas.toFixed(1)}x`,
      action: 'Optimize Ads',
      priority: 2
    });
  }
  
  // Profit margin
  if (data.profit.netMargin > 15) {
    insights.push({
      type: 'positive',
      title: 'Healthy Profit Margins',
      description: `Net profit margin of ${data.profit.netMargin.toFixed(1)}% indicates strong operational efficiency.`,
      metric: `${data.profit.netMargin.toFixed(1)}%`,
      action: 'View Report',
      priority: 3
    });
  }
  
  // Brand performance
  const topBrand = data.topBrands?.[0];
  if (topBrand && topBrand.growth > 15) {
    insights.push({
      type: 'positive',
      title: `${topBrand.name} Leading Growth`,
      description: `${topBrand.name} achieved ${topBrand.growth.toFixed(1)}% growth, contributing significantly to overall revenue.`,
      metric: `+${topBrand.growth.toFixed(1)}%`,
      action: 'View Brand',
      priority: 4
    });
  }
  
  // Bottom brand
  const bottomBrand = data.bottomBrands?.[0];
  if (bottomBrand && bottomBrand.growth < -3) {
    insights.push({
      type: 'negative',
      title: `${bottomBrand.name} Underperforming`,
      description: `${bottomBrand.name} is down ${Math.abs(bottomBrand.growth).toFixed(1)}%. Consider promotional pricing or product review.`,
      metric: `${bottomBrand.growth.toFixed(1)}%`,
      action: 'Create Promo',
      priority: 5
    });
  }
  
  // Platform opportunity
  const topPlatform = data.platformPerformance?.[0];
  if (topPlatform) {
    insights.push({
      type: 'suggestion',
      title: `Scale ${topPlatform.platform}`,
      description: `${topPlatform.platform} leads with ${formatCurrency(topPlatform.revenue)} revenue. Increasing investment could yield additional growth.`,
      metric: formatCompact(topPlatform.revenue),
      action: 'Increase Budget',
      priority: 6
    });
  }
  
  // Conversion rate
  if (data.sales.conversionRate > 3.5) {
    insights.push({
      type: 'positive',
      title: 'Strong Conversion Rate',
      description: `Conversion rate of ${data.sales.conversionRate.toFixed(2)}% indicates effective product listings and checkout flow.`,
      metric: `${data.sales.conversionRate.toFixed(2)}%`,
      action: 'View Funnel',
      priority: 7
    });
  }
  
  // Budget pacing
  if (data.budget.budgetPacing > 80) {
    insights.push({
      type: 'alert',
      title: 'Budget Nearly Depleted',
      description: `${data.budget.budgetPacing.toFixed(0)}% of budget has been spent. Consider adjusting pacing or requesting additional budget.`,
      metric: `${data.budget.budgetPacing.toFixed(0)}%`,
      action: 'Review Budget',
      priority: 8
    });
  }
  
  // Sort by priority and return top 4 (deterministic)
  return insights.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

// Generate summary text based on data
function generateSummaryText(data: DashboardData, timeRange: TimeRange, brandId: string | null): string {
  const periodLabel = TIME_RANGE_LABELS[timeRange];
  const brandLabel = brandId ? BRAND_NAMES[brandId] : 'all brands';
  const topBrand = data.topBrands?.[0];
  const topPlatform = data.platformPerformance?.[0];
  const bottomBrand = data.bottomBrands?.[0];
  
  const parts: string[] = [];
  
  parts.push(`Performance for ${periodLabel} across ${brandLabel} shows total revenue of ${formatCurrency(data.revenue?.totalRevenue || 0)}.`);
  
  if (topBrand) {
    parts.push(`${topBrand.name} leads brand performance with ${formatCurrency(topBrand.revenue)} revenue${topBrand.growth > 0 ? ` (+${topBrand.growth.toFixed(1)}% growth)` : ''}.`);
  }
  
  if (topPlatform) {
    parts.push(`${topPlatform.platform || topPlatform.name} is the top performing channel with ${formatCurrency(topPlatform.revenue)} in sales.`);
  }
  
  parts.push(`Marketing achieved ${(data.marketing?.roas || 0).toFixed(1)}x ROAS with ${formatCompact(data.marketing?.conversions || 0)} conversions.`);
  
  if (bottomBrand && bottomBrand.growth < 0) {
    parts.push(`Attention needed: ${bottomBrand.name} is underperforming with ${bottomBrand.growth.toFixed(1)}% growth.`);
  }
  
  return parts.join(' ');
}

export function AISummaryCard({ data, timeRange, brandId }: AISummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [summaryText, setSummaryText] = useState('');
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  // Generate insights client-side only to avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Needed to avoid hydration mismatch with SSR
    setInsights(generateInsights(data, brandId));
    setSummaryText(generateSummaryText(data, timeRange, brandId));
    setLastGenerated(new Date());
  }, [data, brandId, timeRange, refreshKey]);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setRefreshKey(prev => prev + 1);
      setIsLoading(false);
    }, 800);
  }, []);

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'suggestion':
        return <Lightbulb className="h-4 w-4 text-violet-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-primary" />;
    }
  };

  const getInsightStyle = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return 'border-emerald-500/30 bg-emerald-500/5';
      case 'negative':
        return 'border-red-500/30 bg-red-500/5';
      case 'alert':
        return 'border-amber-500/30 bg-amber-500/5';
      case 'suggestion':
        return 'border-violet-500/30 bg-violet-500/5';
      default:
        return 'border-border bg-muted/50';
    }
  };

  return (
    <Card className="relative overflow-hidden border-2 border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-transparent to-indigo-500/5">
      {/* Animated gradient border */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-indigo-500/20 to-violet-500/20 opacity-50 animate-pulse" />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AI Executive Summary
                <Badge className="bg-violet-500/20 text-violet-600 dark:text-violet-400 border-violet-500/30">
                  Auto-generated
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Updated {lastGenerated ? lastGenerated.toLocaleTimeString() : '...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={cn('h-4 w-4 mr-1', isLoading && 'animate-spin')} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="relative space-y-4">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
            </div>
          ) : (
            <>
              {/* Summary Text */}
              <p className="text-sm leading-relaxed text-foreground/90">
                {summaryText}
              </p>

              {/* Key Insights */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Key Insights</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {insights.map((insight, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer group',
                        getInsightStyle(insight.type)
                      )}
                    >
                      <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium truncate">{insight.title}</p>
                          {insight.metric && (
                            <Badge variant="outline" className="text-xs shrink-0">
                              {insight.metric}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {insight.description}
                        </p>
                        {insight.action && (
                          <button className="flex items-center gap-1 text-xs font-medium text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {insight.action}
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <span className="text-xs text-muted-foreground">Quick actions:</span>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Export Report
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Schedule Email
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Ask AI
                </Button>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
