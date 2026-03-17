'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  LucideIcon,
  Target,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

// Trend type definition
type TrendType = 'up' | 'down' | 'stable';

// Contextual data structure
interface ContextualData {
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
}

// Target progress structure
interface TargetProgress {
  current: number;
  target: number;
  label?: string;
}

interface EnhancedKPICardProps {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  icon?: LucideIcon;
  iconColor?: string;
  // Trend badge
  trend?: TrendType;
  trendLabel?: string;
  // Contextual data (secondary info)
  contextualData?: ContextualData[];
  // Progress bar
  targetProgress?: TargetProgress;
  className?: string;
  loading?: boolean;
}

// Helper to determine trend styling
const getTrendStyles = (trend: TrendType) => {
  switch (trend) {
    case 'up':
      return {
        badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        icon: TrendingUp,
        label: 'Upward',
      };
    case 'down':
      return {
        badgeClass: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20',
        icon: TrendingDown,
        label: 'Declining',
      };
    case 'stable':
    default:
      return {
        badgeClass: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20',
        icon: Minus,
        label: 'Stable',
      };
  }
};

export function EnhancedKPICard({
  title,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  iconColor = 'text-primary',
  trend,
  trendLabel,
  contextualData,
  targetProgress,
  className,
  loading = false,
}: EnhancedKPICardProps) {
  const trendStyles = trend ? getTrendStyles(trend) : null;
  const TrendIcon = trendStyles?.icon;
  
  // Calculate progress percentage
  const progressPercent = targetProgress 
    ? Math.min(100, Math.round((targetProgress.current / targetProgress.target) * 100))
    : null;
  
  // Determine progress bar color based on percentage
  const getProgressColor = (percent: number) => {
    if (percent >= 90) return 'bg-emerald-500';
    if (percent >= 70) return 'bg-amber-500';
    return 'bg-primary';
  };

  return (
    <Card className={cn('relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-0.5', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {trend && trendStyles && (
            <Badge 
              variant="outline" 
              className={cn('text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 flex items-center gap-0.5', trendStyles.badgeClass)}
            >
              <TrendIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">{trendLabel || trendStyles.label}</span>
            </Badge>
          )}
          {Icon && (
            <div className={cn('p-1.5 sm:p-2 rounded-lg bg-muted/50', iconColor)}>
              <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
        {loading ? (
          <div className="space-y-2">
            <div className="h-7 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          </div>
        ) : (
          <div className="space-y-2">
            {/* Main value */}
            <div className="text-lg sm:text-2xl font-bold">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </div>
            
            {/* Contextual data - secondary info */}
            {contextualData && contextualData.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {contextualData.map((item, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <span className="text-muted-foreground/70">{item.label}:</span>
                    <span className="font-medium text-foreground">
                      {item.prefix}{typeof item.value === 'number' ? item.value.toLocaleString() : item.value}{item.suffix}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Target progress bar */}
            {targetProgress && progressPercent !== null && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {targetProgress.label || 'Target'}
                  </span>
                  <span className="font-medium">
                    {progressPercent}%
                  </span>
                </div>
                <div className="relative h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      getProgressColor(progressPercent)
                    )}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                  <span>Current: {prefix}{targetProgress.current.toLocaleString()}</span>
                  <span>Target: {prefix}{targetProgress.target.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Decorative gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20" />
      </CardContent>
    </Card>
  );
}

// Compact variant for smaller spaces
interface CompactKPICardProps {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  trend?: TrendType;
  contextualValue?: string;
  progress?: number;
  className?: string;
}

export function CompactKPICard({
  title,
  value,
  prefix = '',
  suffix = '',
  trend,
  contextualValue,
  progress,
  className,
}: CompactKPICardProps) {
  const trendStyles = trend ? getTrendStyles(trend) : null;
  const TrendIcon = trendStyles?.icon;

  return (
    <div className={cn(
      'flex items-center justify-between p-3 sm:p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow',
      className
    )}>
      <div className="space-y-0.5 sm:space-y-1">
        <div className="text-xs sm:text-sm text-muted-foreground">{title}</div>
        <div className="text-base sm:text-lg font-semibold">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </div>
        {contextualValue && (
          <div className="text-xs text-muted-foreground">{contextualValue}</div>
        )}
      </div>
      <div className="flex flex-col items-end gap-1">
        {trend && trendStyles && (
          <Badge 
            variant="outline" 
            className={cn('text-[10px] px-1.5 py-0 flex items-center gap-0.5', trendStyles.badgeClass)}
          >
            <TrendIcon className="h-2.5 w-2.5" />
          </Badge>
        )}
        {progress !== undefined && (
          <div className="w-12 sm:w-16 h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                'h-full rounded-full',
                progress >= 90 ? 'bg-emerald-500' : progress >= 70 ? 'bg-amber-500' : 'bg-primary'
              )}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to determine trend from change percentage
export function getTrendFromChange(change: number): TrendType {
  if (change > 2) return 'up';
  if (change < -2) return 'down';
  return 'stable';
}
