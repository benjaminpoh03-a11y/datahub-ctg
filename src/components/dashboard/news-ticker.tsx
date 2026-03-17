'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Zap,
  X
} from 'lucide-react';

interface NewsItem {
  id: string;
  type: 'success' | 'warning' | 'info' | 'alert';
  message: string;
  timestamp: Date;
  icon: React.ReactNode;
}

const NEWS_ITEMS: Omit<NewsItem, 'id' | 'timestamp'>[] = [
  { type: 'success', message: 'Shopee order #SH-2847 completed - RM 128.50', icon: <ShoppingCart className="h-3 w-3" /> },
  { type: 'success', message: 'GlowSkin hit daily target - RM 45,000 revenue', icon: <CheckCircle className="h-3 w-3" /> },
  { type: 'info', message: 'TikTok Shop sync completed - 234 new orders', icon: <Zap className="h-3 w-3" /> },
  { type: 'success', message: 'New customer acquired via Facebook Ads', icon: <TrendingUp className="h-3 w-3" /> },
  { type: 'warning', message: 'HairLux inventory low - 45 units remaining', icon: <AlertTriangle className="h-3 w-3" /> },
  { type: 'success', message: 'Shopify order #SF-1234 completed - RM 89.00', icon: <ShoppingCart className="h-3 w-3" /> },
  { type: 'info', message: 'Lazada data synced successfully', icon: <CheckCircle className="h-3 w-3" /> },
  { type: 'success', message: 'ROAS improved to 5.2x on TikTok Ads', icon: <TrendingUp className="h-3 w-3" /> },
  { type: 'alert', message: 'Facebook conversion rate dropped 2.3%', icon: <TrendingDown className="h-3 w-3" /> },
  { type: 'success', message: 'VitaWell monthly goal achieved', icon: <CheckCircle className="h-3 w-3" /> },
];

function createNewsItem(index: number): NewsItem {
  const item = NEWS_ITEMS[index % NEWS_ITEMS.length];
  const now = new Date();
  // Use deterministic offset based on index for hydration safety
  const offsetMinutes = index * 5;
  now.setMinutes(now.getMinutes() - offsetMinutes);
  
  return {
    id: `news-${index}`,
    ...item,
    timestamp: now,
  };
}

export function NewsTicker() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Initialize items client-side only to avoid hydration mismatch
  useEffect(() => {
    const initialItems = Array.from({ length: 5 }, (_, i) => createNewsItem(i));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Needed to avoid hydration mismatch with SSR
    setItems(initialItems);
  }, []);

  // Rotate through items
  useEffect(() => {
    if (items.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [items.length]);

  if (!isVisible || items.length === 0) return null;

  const currentItem = items[currentIndex];

  const getTypeStyles = (type: NewsItem['type']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400';
      case 'alert':
        return 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400';
      default:
        return 'bg-primary/10 border-primary/30 text-primary';
    }
  };

  // Format time safely
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative overflow-hidden bg-muted/30 border-b">
      <div className="flex items-center gap-3 px-4 py-2">
        {/* Live indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">Live Feed</span>
        </div>

        {/* Animated news item */}
        <div className="flex-1 overflow-hidden">
          <div
            key={currentItem.id}
            className={cn(
              'flex items-center gap-2 px-3 py-1 rounded-full border w-fit animate-in slide-in-from-right-4 fade-in duration-500',
              getTypeStyles(currentItem.type)
            )}
          >
            {currentItem.icon}
            <span className="text-sm font-medium">{currentItem.message}</span>
            <span className="text-xs opacity-60">
              {formatTime(currentItem.timestamp)}
            </span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
