'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, CheckCircle, AlertTriangle, RefreshCw, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataQualityIndicatorProps {
  lastUpdated: Date | null;
  nextUpdate?: Date;
  confidence?: number;
  isLive?: boolean;
  size?: 'sm' | 'md';
}

export function DataQualityIndicator({
  lastUpdated,
  nextUpdate,
  confidence = 95,
  isLive = true,
  size = 'sm',
}: DataQualityIndicatorProps) {
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);

  // Update seconds since last update client-side only
  useEffect(() => {
    if (!lastUpdated) return;
    
    const updateSeconds = () => {
      setSecondsSinceUpdate(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    };
    
    updateSeconds();
    const interval = setInterval(updateSeconds, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);
  
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Loading...';
    if (secondsSinceUpdate < 60) return 'Just now';
    if (secondsSinceUpdate < 3600) return `${Math.floor(secondsSinceUpdate / 60)}m ago`;
    if (secondsSinceUpdate < 86400) return `${Math.floor(secondsSinceUpdate / 3600)}h ago`;
    return `${Math.floor(secondsSinceUpdate / 86400)}d ago`;
  };

  const getNextUpdateIn = () => {
    if (!nextUpdate) return null;
    const secondsUntilUpdate = Math.floor((nextUpdate.getTime() - Date.now()) / 1000);
    if (secondsUntilUpdate <= 0) return 'Updating...';
    if (secondsUntilUpdate < 60) return `in ${secondsUntilUpdate}s`;
    if (secondsUntilUpdate < 3600) return `in ${Math.floor(secondsUntilUpdate / 60)}m`;
    return `in ${Math.floor(secondsUntilUpdate / 3600)}h`;
  };

  const getConfidenceLevel = () => {
    if (confidence >= 95) return { label: 'High', color: 'text-emerald-600', bg: 'bg-emerald-500/10' };
    if (confidence >= 80) return { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-500/10' };
    return { label: 'Low', color: 'text-red-600', bg: 'bg-red-500/10' };
  };

  const confidenceLevel = getConfidenceLevel();

  if (size === 'sm') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              {isLive ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              ) : (
                <Clock className="h-3 w-3 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground">{formatLastUpdated()}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <div className="space-y-1">
              <p>Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Loading...'}</p>
              {nextUpdate && <p>Next update: {getNextUpdateIn()}</p>}
              <p>Data confidence: {confidence}% ({confidenceLevel.label})</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Last Updated */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1.5 font-normal">
              {isLive ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              ) : (
                <Clock className="h-3 w-3 text-muted-foreground" />
              )}
              {formatLastUpdated()}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Last synced at {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Loading...'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Confidence */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={cn('gap-1.5 font-normal', confidenceLevel.bg, confidenceLevel.color)}>
              {confidence >= 95 ? (
                <CheckCircle className="h-3 w-3" />
              ) : confidence >= 80 ? (
                <Info className="h-3 w-3" />
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
              {confidence}% confidence
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p>Data quality score: {confidence}%</p>
              <p className="text-xs text-muted-foreground">
                {confidence >= 95 ? 'All sources synced successfully' :
                 confidence >= 80 ? 'Most sources synced, some pending' :
                 'Some data may be outdated'}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Next Update */}
      {nextUpdate && (
        <Badge variant="outline" className="gap-1.5 font-normal text-muted-foreground">
          <RefreshCw className="h-3 w-3" />
          Updates {getNextUpdateIn()}
        </Badge>
      )}
    </div>
  );
}
