'use client';

import { useEffect, useState, useMemo } from 'react';
import { EnhancedKPICard } from './enhanced-kpi-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Star,
  AlertTriangle,
} from 'lucide-react';
import { generateDashboardData, formatCurrency, formatCompact } from '@/lib/data/mock-data';
import { useFilterStore } from '@/lib/store';
import type { DashboardData } from '@/types';

const COLORS = [
  'hsl(160, 84%, 39%)',
  'hsl(38, 92%, 50%)',
  'hsl(330, 81%, 60%)',
  'hsl(263, 70%, 50%)',
  'hsl(189, 94%, 43%)',
];

// Product data generator based on brand
const getProductsByBrand = (brandId: string | null, multiplier: number = 1) => {
  const allProducts = [
    { id: '1', name: 'GlowSkin Vitamin C Serum', brand: 'GlowSkin', brandId: 'brand-1', sku: 'GSC-001', unitsSold: Math.round(4520 * multiplier), revenue: Math.round(135600 * multiplier), profit: Math.round(40680 * multiplier), margin: 30, stock: 125 },
    { id: '2', name: 'VitaWell Multivitamin', brand: 'VitaWell', brandId: 'brand-2', sku: 'VW-002', unitsSold: Math.round(3890 * multiplier), revenue: Math.round(116700 * multiplier), profit: Math.round(35010 * multiplier), margin: 30, stock: 340 },
    { id: '3', name: 'PureBeauty Lip Gloss Set', brand: 'PureBeauty', brandId: 'brand-3', sku: 'PB-003', unitsSold: Math.round(3200 * multiplier), revenue: Math.round(96000 * multiplier), profit: Math.round(28800 * multiplier), margin: 30, stock: 89 },
    { id: '4', name: 'ZenLife Essential Oils', brand: 'ZenLife', brandId: 'brand-4', sku: 'ZL-004', unitsSold: Math.round(2750 * multiplier), revenue: Math.round(82500 * multiplier), profit: Math.round(24750 * multiplier), margin: 30, stock: 210 },
    { id: '5', name: 'HairLux Growth Serum', brand: 'HairLux', brandId: 'brand-5', sku: 'HL-005', unitsSold: Math.round(2100 * multiplier), revenue: Math.round(63000 * multiplier), profit: Math.round(18900 * multiplier), margin: 30, stock: 45 },
    { id: '6', name: 'GlowSkin Retinol Cream', brand: 'GlowSkin', brandId: 'brand-1', sku: 'GSC-006', unitsSold: Math.round(1980 * multiplier), revenue: Math.round(79200 * multiplier), profit: Math.round(23760 * multiplier), margin: 30, stock: 78 },
    { id: '7', name: 'VitaWell Omega-3', brand: 'VitaWell', brandId: 'brand-2', sku: 'VW-007', unitsSold: Math.round(1850 * multiplier), revenue: Math.round(55500 * multiplier), profit: Math.round(16650 * multiplier), margin: 30, stock: 450 },
    { id: '8', name: 'PureBeauty Foundation', brand: 'PureBeauty', brandId: 'brand-3', sku: 'PB-008', unitsSold: Math.round(1620 * multiplier), revenue: Math.round(64800 * multiplier), profit: Math.round(19440 * multiplier), margin: 30, stock: 92 },
  ];
  
  if (brandId) {
    return allProducts.filter(p => p.brandId === brandId);
  }
  return allProducts;
};

export function ProductDashboard() {
  const { timeRange, brandId } = useFilterStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Re-generate data when filters change
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        setData(generateDashboardData(timeRange, brandId));
        setLoading(false);
      }
    }, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [timeRange, brandId]);

  // Filter products based on brand selection
  const products = useMemo(() => {
    if (!data) return [];
    return getProductsByBrand(brandId, data.revenue.totalRevenue / 3500000);
  }, [brandId, data]);

  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  const topProducts = products.slice(0, 5);
  const lowStockProducts = products.filter(p => p.stock < 100);

  const productChartData = topProducts.map(p => ({
    name: p.name.split(' ').slice(0, 2).join(' '),
    revenue: p.revenue,
    units: p.unitsSold,
  }));

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Key Product Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <EnhancedKPICard
          title="Total Products"
          value={products.length}
          icon={Package}
          trend={products.length > 6 ? 'up' : 'stable'}
          trendLabel={products.length > 6 ? 'Full Catalog' : 'Active'}
          contextualData={[
            { label: 'Active', value: products.length },
          ]}
        />
        <EnhancedKPICard
          title="Units Sold"
          value={formatCompact(data.sales.unitsSold)}
          icon={ShoppingCart}
          trend={data.sales.unitsSold > 5000 ? 'up' : 'stable'}
          trendLabel={data.sales.unitsSold > 5000 ? 'High Volume' : 'Normal'}
          contextualData={[
            { label: 'Avg/Prod', value: Math.round(data.sales.unitsSold / Math.max(products.length, 1)) },
          ]}
        />
        <EnhancedKPICard
          title="Avg. Product Margin"
          value={data.profit.productMargin.toFixed(1)}
          suffix="%"
          icon={TrendingUp}
          trend={data.profit.productMargin > 30 ? 'up' : data.profit.productMargin < 25 ? 'down' : 'stable'}
          trendLabel={data.profit.productMargin > 30 ? 'Strong' : data.profit.productMargin < 25 ? 'Low' : 'Average'}
          contextualData={[
            { label: 'Target', value: '30', suffix: '%' },
          ]}
          targetProgress={{
            current: data.profit.productMargin,
            target: 35,
            label: 'Target Margin',
          }}
        />
        <EnhancedKPICard
          title="Low Stock Alerts"
          value={lowStockProducts.length}
          icon={AlertTriangle}
          iconColor="text-amber-500"
          trend={lowStockProducts.length === 0 ? 'up' : lowStockProducts.length > 3 ? 'down' : 'stable'}
          trendLabel={lowStockProducts.length === 0 ? 'All Good' : lowStockProducts.length > 3 ? 'Critical' : 'Attention'}
          contextualData={[
            { label: 'Total SKUs', value: products.length },
          ]}
        />
      </div>

      {/* Top Products Chart */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
            <CardDescription>Best performing products this period</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No products found for the selected brand.
              </div>
            ) : (
              <ChartContainer config={{}} className="h-[300px]">
                <BarChart data={productChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `RM ${(v/1000).toFixed(0)}k`} className="text-xs" />
                  <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatCurrency(Number(v))} />} />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                    {productChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Performance</CardTitle>
            <CardDescription>Units sold vs revenue comparison</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No products found for the selected brand.
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                        <span className="font-medium text-sm">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{formatCurrency(product.revenue)}</span>
                        <span className="text-xs text-muted-foreground ml-2">({product.unitsSold.toLocaleString()} units)</span>
                      </div>
                    </div>
                    <Progress 
                      value={(product.revenue / topProducts[0].revenue) * 100} 
                      className="h-1.5"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>Complete product inventory and performance</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No products found for the selected brand.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Brand</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">SKU</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Units Sold</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Revenue</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Profit</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Margin</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{product.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{product.brand}</Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{product.sku}</td>
                      <td className="py-3 px-4 text-right">{product.unitsSold.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(product.revenue)}</td>
                      <td className="py-3 px-4 text-right text-emerald-600">{formatCurrency(product.profit)}</td>
                      <td className="py-3 px-4 text-right">{product.margin}%</td>
                      <td className="py-3 px-4 text-right">
                        <Badge 
                          variant={product.stock < 100 ? 'destructive' : product.stock < 200 ? 'outline' : 'secondary'}
                        >
                          {product.stock}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>Products that need restocking soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                  </div>
                  <Badge variant="destructive">{product.stock} left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
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
    </div>
  );
}
