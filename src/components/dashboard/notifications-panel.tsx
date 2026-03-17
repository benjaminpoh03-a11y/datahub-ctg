'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  BellRing,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  CheckCircle,
  X,
  Settings,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'warning' | 'success' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  threshold?: {
    metric: string;
    value: number;
    condition: 'above' | 'below';
    currentValue: number;
  };
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'ROAS Below Threshold',
    message: 'GlowSkin ROAS dropped to 2.8x, below your 3.5x target',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
    threshold: { metric: 'ROAS', value: 3.5, condition: 'below', currentValue: 2.8 },
  },
  {
    id: '2',
    type: 'success',
    title: 'Revenue Target Achieved',
    message: 'Monthly revenue exceeded target by 12%',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Ad Spend Alert',
    message: 'Marketing budget 85% spent with 5 days remaining',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: true,
    threshold: { metric: 'Budget', value: 80, condition: 'above', currentValue: 85 },
  },
  {
    id: '4',
    type: 'info',
    title: 'New Data Available',
    message: 'TikTok Shop data synced successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    read: true,
  },
  {
    id: '5',
    type: 'warning',
    title: 'Conversion Rate Drop',
    message: 'Platform conversion rate down 15% vs last week',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
  },
];

const alertThresholds = [
  { metric: 'ROAS', enabled: true, threshold: 3.5, condition: 'below' as const },
  { metric: 'Conversion Rate', enabled: true, threshold: 2.5, condition: 'below' as const },
  { metric: 'Budget Usage', enabled: true, threshold: 80, condition: 'above' as const },
  { metric: 'Daily Revenue', enabled: false, threshold: 10000, condition: 'below' as const },
];

export function NotificationsPanel() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [showSettings, setShowSettings] = useState(false);

  const unreadCount = alerts.filter(a => !a.read).length;

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(a => ({ ...a, read: true })));
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default: return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9 relative">
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Alerts & Notifications</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="h-7 px-2"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-7 px-2 text-xs">
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {showSettings ? (
          /* Alert Settings */
          <div className="p-3">
            <p className="text-sm font-medium mb-3">Alert Thresholds</p>
            <div className="space-y-3">
              {alertThresholds.map((threshold, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch checked={threshold.enabled} className="data-[state=checked]:bg-primary" />
                    <div>
                      <p className="text-sm">{threshold.metric}</p>
                      <p className="text-xs text-muted-foreground">
                        Alert when {threshold.condition} {threshold.threshold}
                        {threshold.metric.includes('Rate') || threshold.metric.includes('ROAS') ? '' : '%'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(false)}
              className="w-full"
            >
              Back to alerts
            </Button>
          </div>
        ) : (
          /* Alert List */
          <ScrollArea className="h-80">
            {alerts.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No alerts</p>
                <p className="text-xs text-muted-foreground">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      'p-3 hover:bg-muted/50 transition-colors',
                      !alert.read && 'bg-muted/30'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn('text-sm font-medium', !alert.read && 'text-foreground')}>
                            {alert.title}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissAlert(alert.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">{formatTime(alert.timestamp)}</span>
                          {!alert.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(alert.id)}
                              className="h-6 text-xs"
                            >
                              Mark read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
