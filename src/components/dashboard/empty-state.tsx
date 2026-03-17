'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Database,
  Search,
  Filter,
  BarChart3,
  FileX,
  AlertCircle,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyStateType = 
  | 'no-data' 
  | 'no-results' 
  | 'no-integrations' 
  | 'error' 
  | 'no-matches'
  | 'loading';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const defaultContent: Record<EmptyStateType, { title: string; description: string; icon: React.ReactNode }> = {
  'no-data': {
    title: 'No Data Available',
    description: 'There\'s no data for the selected time range. Try adjusting your filters.',
    icon: <Database className="h-12 w-12 text-muted-foreground/50" />,
  },
  'no-results': {
    title: 'No Results Found',
    description: 'We couldn\'t find any matching results. Try a different search term.',
    icon: <Search className="h-12 w-12 text-muted-foreground/50" />,
  },
  'no-integrations': {
    title: 'No Connections Yet',
    description: 'Connect your first data source to start seeing insights.',
    icon: <Plus className="h-12 w-12 text-muted-foreground/50" />,
  },
  'error': {
    title: 'Something Went Wrong',
    description: 'We encountered an error loading this data. Please try again.',
    icon: <AlertCircle className="h-12 w-12 text-red-500/50" />,
  },
  'no-matches': {
    title: 'No Matches Found',
    description: 'No data matches your current filter criteria.',
    icon: <Filter className="h-12 w-12 text-muted-foreground/50" />,
  },
  'loading': {
    title: 'Loading...',
    description: 'We\'re preparing your data. This won\'t take long.',
    icon: <RefreshCw className="h-12 w-12 text-muted-foreground/50 animate-spin" />,
  },
};

export function EmptyState({
  type = 'no-data',
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  const defaults = defaultContent[type];

  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="mb-4">
          {icon || defaults.icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {title || defaults.title}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mb-4">
          {description || defaults.description}
        </p>
        {action && (
          <Button onClick={action.onClick} variant="outline">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Skeleton loading states
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="p-6 space-y-4">
        <div className="flex justify-between">
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-[250px] w-full bg-muted/50 rounded animate-pulse" />
      </div>
    </Card>
  );
}

export function KPISkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse ml-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
