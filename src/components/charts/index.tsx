'use client';

import { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useFilterStore } from '@/lib/store';
import { useUIStore } from '@/lib/store';
import { CURRENCY_SYMBOL } from '@/lib/data/mock-data';
import { cn } from '@/lib/utils';

// Color palette for charts
export const COLORS = [
  'hsl(160, 84%, 39%)',  // Green
  'hsl(38, 92%, 50%)',   // Amber
  'hsl(330, 81%, 60%)',  // Pink
  'hsl(263, 70%, 50%)',  // Violet
  'hsl(189, 94%, 43%)',  // Cyan
  'hsl(0, 84%, 60%)',    // Red
  'hsl(215, 100%, 50%)', // Blue
];

// Brand ID mapping for drill-down
const BRAND_MAP: Record<string, string> = {
  'GlowSkin': 'brand-1',
  'VitaWell': 'brand-2',
  'PureBeauty': 'brand-3',
  'ZenLife': 'brand-4',
  'HairLux': 'brand-5',
};

// Revenue trend chart
interface RevenueTrendData {
  date: string;
  dateLabel?: string;
  revenue: number;
  profit: number;
  spend?: number;
}

interface RevenueTrendChartProps {
  data: RevenueTrendData[];
  title?: string;
  description?: string;
}

export function RevenueTrendChart({ data, title = 'Revenue Trend', description }: RevenueTrendChartProps) {
  const chartConfig = {
    revenue: {
      label: 'Revenue',
      color: COLORS[0],
    },
    profit: {
      label: 'Profit',
      color: COLORS[3],
    },
    spend: {
      label: 'Spend',
      color: COLORS[1],
    },
  } satisfies ChartConfig;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Check if data is hourly (today view) or daily
  const isHourly = data.length > 0 && data[0].dateLabel?.includes(':');
  
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {activeIndex !== null && (
            <Badge variant="outline" className="text-xs">
              Hover for details
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <AreaChart 
            data={data} 
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            onMouseMove={(_, e) => {
              if (e?.activeTooltipIndex !== undefined) {
                setActiveIndex(e.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[3]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS[3]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="dateLabel"
              tickFormatter={(_, index) => {
                const item = data[index];
                return item?.dateLabel || '';
              }}
              className="text-xs"
              interval={isHourly ? 2 : Math.ceil(data.length / 10)}
            />
            <YAxis
              tickFormatter={(value) => `${CURRENCY_SYMBOL} ${(value / 1000).toFixed(0)}k`}
              className="text-xs"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => `${CURRENCY_SYMBOL} ${Number(value).toLocaleString()}`}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={COLORS[0]}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              strokeWidth={2}
              cursor="pointer"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke={COLORS[3]}
              fillOpacity={1}
              fill="url(#colorProfit)"
              strokeWidth={2}
              cursor="pointer"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Platform performance bar chart
interface PlatformData {
  platform: string;
  revenue: number;
  orders?: number;
}

interface PlatformBarChartProps {
  data: PlatformData[];
  title?: string;
  description?: string;
  onBarClick?: (platform: string) => void;
}

export function PlatformBarChart({ data, title = 'Revenue by Platform', description, onBarClick }: PlatformBarChartProps) {
  const chartConfig = {
    revenue: {
      label: 'Revenue',
      color: COLORS[0],
    },
  } satisfies ChartConfig;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { setActiveDashboard } = useUIStore();

  const handleClick = (index: number) => {
    if (onBarClick) {
      onBarClick(data[index].platform);
    } else {
      setActiveDashboard('platform');
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Badge variant="outline" className="text-xs">
            Click to drill down
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(value) => `${CURRENCY_SYMBOL} ${(value / 1000).toFixed(0)}k`}
              className="text-xs"
            />
            <YAxis
              dataKey="platform"
              type="category"
              className="text-xs"
              width={70}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => `${CURRENCY_SYMBOL} ${Number(value).toLocaleString()}`}
                />
              }
            />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                  onClick={() => handleClick(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className="transition-opacity cursor-pointer hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Pie chart for distribution with drill-down
interface DistributionData {
  name: string;
  value: number;
  color?: string;
}

interface DistributionPieChartProps {
  data: DistributionData[];
  title?: string;
  description?: string;
  innerRadius?: number;
  onSliceClick?: (name: string) => void;
}

export function DistributionPieChart({ 
  data, 
  title, 
  description, 
  innerRadius = 60,
  onSliceClick 
}: DistributionPieChartProps) {
  const chartConfig = data.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: item.color || COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { setBrandId } = useFilterStore();
  const { setActiveDashboard } = useUIStore();

  const handleClick = (index: number) => {
    const name = data[index].name;
    if (onSliceClick) {
      onSliceClick(name);
    } else if (BRAND_MAP[name]) {
      setBrandId(BRAND_MAP[name]);
      setActiveDashboard('brand');
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Badge variant="outline" className="text-xs">
            Click to filter
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={activeIndex !== null ? 85 : 80}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              cursor="pointer"
              onClick={(_, index) => handleClick(index)}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || COLORS[index % COLORS.length]}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                  className="transition-all cursor-pointer hover:opacity-80"
                />
              ))}
            </Pie>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => `${CURRENCY_SYMBOL} ${Number(value).toLocaleString()}`}
                />
              }
            />
          </PieChart>
        </ChartContainer>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {data.map((entry, index) => (
            <button
              key={entry.name}
              onClick={() => handleClick(index)}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              className={cn(
                'flex items-center gap-2 px-2 py-1 rounded-md transition-colors cursor-pointer',
                activeIndex === index ? 'bg-muted' : 'hover:bg-muted/50'
              )}
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-muted-foreground">{entry.name}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Simple line chart
interface SimpleLineChartProps {
  data: { date: string; value: number }[];
  title?: string;
  description?: string;
  color?: string;
}

export function SimpleLineChart({ data, title, description, color = COLORS[0] }: SimpleLineChartProps) {
  const chartConfig = {
    value: {
      label: 'Value',
      color,
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              className="text-xs"
            />
            <YAxis className="text-xs" />
            <ChartTooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              cursor="pointer"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
