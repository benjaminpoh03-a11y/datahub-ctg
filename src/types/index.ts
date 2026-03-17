// Platform types
export type PlatformType = 'SHOPEE' | 'LAZADA' | 'SHOPIFY' | 'TIKTOK_SHOP' | 'FACEBOOK' | 'WHATSAPP' | 'RETAIL' | 'OTHER';

export type AdPlatformType = 'FACEBOOK_ADS' | 'TIKTOK_ADS' | 'GOOGLE_ADS' | 'OTHER';

// User roles
export type UserRole = 'ADMIN' | 'EXECUTIVE' | 'ANALYST';

// Revenue metrics
export interface RevenueMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  revenueByBrand: Record<string, number>;
  revenueByPlatform: Record<string, number>;
  revenueByProduct: Record<string, number>;
  revenueByCountry: Record<string, number>;
}

// Sales metrics
export interface SalesMetrics {
  unitsSold: number;
  averageOrderValue: number;
  conversionRate: number;
  returningCustomers: number;
  totalOrders: number;
  orderGrowth: number;
}

// Discount metrics
export interface DiscountMetrics {
  totalDiscounts: number;
  discountRate: number;
  promotionImpact: number;
}

// Profit metrics
export interface ProfitMetrics {
  grossProfit: number;
  netProfit: number;
  contributionMargin: number;
  productMargin: number;
  grossMargin: number;
  netMargin: number;
  operatingMargin: number;
}

// Marketing metrics
export interface MarketingMetrics {
  adSpend: number;
  roas: number;
  cpa: number;
  cpm: number;
  ctr: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

// Budget metrics
export interface BudgetMetrics {
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  budgetPacing: number;
}

// Brand performance
export interface BrandPerformance {
  name: string;
  revenue: number;
  growth: number;
}

// Platform performance
export interface PlatformPerformance {
  platform: string;
  revenue: number;
  orders: number;
}

// Revenue trend
export interface RevenueTrendPoint {
  date: string;
  dateLabel?: string;
  revenue: number;
  profit: number;
}

// Time range info
export interface TimeRangeInfo {
  multiplier: number;
  days: number;
  startDate: Date;
  endDate: Date;
  label: string;
}

// Combined dashboard data
export interface DashboardData {
  revenue: RevenueMetrics;
  sales: SalesMetrics;
  discounts: DiscountMetrics;
  profit: ProfitMetrics;
  marketing: MarketingMetrics;
  budget: BudgetMetrics;
  topBrands: BrandPerformance[];
  bottomBrands: BrandPerformance[];
  platformPerformance: PlatformPerformance[];
  revenueTrend: RevenueTrendPoint[];
  timeRangeInfo?: TimeRangeInfo;
}

// Brand data
export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  color?: string;
  isActive: boolean;
}

// Platform data
export interface Platform {
  id: string;
  name: string;
  type: PlatformType;
  description?: string;
  isActive: boolean;
}

// Product data
export interface Product {
  id: string;
  sku: string;
  name: string;
  category?: string;
  brandId: string;
  brand?: Brand;
  cost: number;
  isActive: boolean;
}

// Sale transaction
export interface Sale {
  id: string;
  orderId: string;
  transactionDate: Date;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  discount: number;
  netAmount: number;
  currency: string;
  platformId: string;
  brandId: string;
  productId?: string;
  platform?: Platform;
  brand?: Brand;
  product?: Product;
}

// Ad Campaign
export interface AdCampaign {
  id: string;
  name: string;
  adPlatform: AdPlatformType;
  startDate: Date;
  endDate?: Date;
  budget?: number;
  budgetSpent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue?: number;
  ctr: number;
  cpa: number;
  roas: number;
  cpm: number;
  brandId: string;
  brand?: Brand;
}

// Forecast data
export interface Forecast {
  id: string;
  name: string;
  period: string;
  revenueForecast: number;
  profitForecast: number;
  adSpendForecast: number;
  revenueActual?: number;
  profitActual?: number;
  adSpendActual?: number;
  revenueVariance?: number;
  profitVariance?: number;
  brandId: string;
  brand?: Brand;
  scenario?: string;
}

// Budget
export interface Budget {
  id: string;
  name: string;
  period: string;
  totalBudget: number;
  marketingBudget: number;
  operationalBudget: number;
  spentAmount: number;
  remainingAmount: number;
  brandId: string;
  platformId?: string;
}

// Integration
export interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  lastSyncAt?: Date;
  syncInterval: number;
  syncStatus: 'pending' | 'syncing' | 'completed' | 'error';
  lastError?: string;
  brandId: string;
  platformId?: string;
}

// AI Chat message
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  queryType?: string;
  chartData?: string;
  createdAt: Date;
}

// Time range filter
export type TimeRange = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear' | 'custom';

// Date range
export interface DateRange {
  from: Date;
  to: Date;
}
