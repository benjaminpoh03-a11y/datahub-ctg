'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Activity, RefreshCw } from 'lucide-react';

interface LiveIndicatorProps {
  className?: string;
}

export function LiveIndicator({ className }: LiveIndicatorProps) {
  // Use null initially to avoid hydration mismatch with Date
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dataPoints, setDataPoints] = useState(0);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const dataPointsRef = useRef(0);

  // Initialize on client-side only
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Needed to avoid hydration mismatch with SSR
    setLastUpdate(new Date());
  }, []);

  // Update seconds ago display
  useEffect(() => {
    if (!lastUpdate) return;
    
    const updateSecondsAgo = () => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdate.getTime()) / 1000));
    };
    
    updateSecondsAgo();
    const interval = setInterval(updateSecondsAgo, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      dataPointsRef.current += Math.floor(Math.random() * 5) + 1;
      setDataPoints(dataPointsRef.current);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Simulate occasional sync
  useEffect(() => {
    const syncInterval = setInterval(() => {
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 2000);
    }, 30000);

    return () => clearInterval(syncInterval);
  }, []);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastUpdate(new Date());
    }, 1500);
  };

  return (
    <div className={cn('flex items-center gap-1.5 sm:gap-3', className)}>
      {/* Data Points Counter */}
      <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
        <span>{dataPoints.toLocaleString()} data points</span>
      </div>

      {/* Last Update */}
      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
        <ClockIcon />
        <span>
          {isSyncing ? 'Syncing...' : `${secondsAgo}s ago`}
        </span>
      </div>

      {/* Live Status Badge */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 cursor-pointer transition-all bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-medium text-xs sm:text-sm">LIVE</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Data syncs every 5 seconds</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Manual Sync Button - Hidden on very small screens */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 sm:h-8 sm:w-8 hidden sm:flex"
        onClick={handleManualSync}
        disabled={isSyncing}
      >
        <RefreshCw className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', isSyncing && 'animate-spin')} />
      </Button>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  );
}
