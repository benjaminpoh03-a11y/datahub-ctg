'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Moon,
  Sun,
  RefreshCw,
  CalendarIcon,
  Filter,
} from 'lucide-react';
import { useFilterStore, useUIStore } from '@/lib/store';
import { getDateRangeInfo, getBrandList } from '@/lib/data/mock-data';
import { useMemo, useState, useEffect } from 'react';

const timeRanges = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'thisQuarter', label: 'This Quarter' },
  { value: 'thisYear', label: 'This Year' },
];

export function DashboardHeaderActions() {
  const { timeRange, setTimeRange, brandId, setBrandId } = useFilterStore();
  const { theme, setTheme } = useUIStore();
  const [mounted, setMounted] = useState(false);

  // Get brand list from mock data
  const brands = useMemo(() => {
    const brandList = getBrandList();
    return [
      { value: 'all', label: 'All Brands (27)' },
      ...brandList.map(b => ({ value: b.id, label: b.name, category: b.category }))
    ];
  }, []);

  // Only compute date info on client to avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Needed to avoid hydration mismatch with SSR
    setMounted(true);
  }, []);

  const dateInfo = useMemo(() => {
    if (!mounted) return null;
    return getDateRangeInfo(timeRange);
  }, [timeRange, mounted]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
      {/* Date Range Display - Hidden on mobile */}
      <div className="hidden xl:flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">
          {dateInfo ? `${formatDate(dateInfo.startDate)} - ${formatDate(dateInfo.endDate)}` : 'Loading...'}
        </span>
      </div>

      {/* Time Range Selector */}
      <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
        <SelectTrigger className="w-[130px] sm:w-[160px] h-8 sm:h-9 text-xs sm:text-sm">
          <CalendarIcon className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {timeRanges.map((range) => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Brand Filter - Hidden on very small screens */}
      <Select value={brandId || 'all'} onValueChange={(value) => setBrandId(value === 'all' ? null : value)}>
        <SelectTrigger className="w-[140px] sm:w-[180px] h-8 sm:h-9 text-xs sm:text-sm hidden sm:flex">
          <Filter className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <SelectValue placeholder="All Brands" />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {brands.map((brand) => (
            <SelectItem key={brand.value} value={brand.value}>
              {brand.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6 sm:h-8 hidden sm:block" />

      {/* Refresh Button */}
      <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={handleRefresh}>
        <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Button>

      {/* Theme Toggle */}
      <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={toggleTheme}>
        {theme === 'dark' ? (
          <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        ) : (
          <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        )}
      </Button>
    </div>
  );
}
