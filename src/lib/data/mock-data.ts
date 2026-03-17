// Mock data generator for DataHub by CTG
import type { DashboardData, TimeRange } from '@/types';

// Generate deterministic random based on seed for consistency
let currentSeed = 0;
const seededRandom = () => {
  currentSeed = (currentSeed * 9301 + 49297) % 233280;
  return currentSeed / 233280;
};

const setSeed = (seed: number) => {
  currentSeed = seed;
};

// Generate random number within range
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

// Company Configuration - CTG (Consumer Trading Group)
// Annual Revenue: ~RM 100M | Monthly: ~RM 8.3M | Daily: ~RM 274K
const COMPANY_CONFIG = {
  annualRevenue: 100000000, // 100M RM
  monthlyRevenue: 8333333,  // ~8.3M RM
  dailyRevenue: 273972,     // ~274K RM
  totalBrands: 27,
};

// Brand configuration - 27 brands across different categories
const BRANDS = [
  // Tier 1: Major Brands (Top 5 - ~40% of revenue)
  { id: 'brand-1', name: 'GlowSkin', category: 'Skincare', share: 0.09, baseGrowth: [12, 22] },
  { id: 'brand-2', name: 'VitaWell', category: 'Health', share: 0.085, baseGrowth: [8, 18] },
  { id: 'brand-3', name: 'PureBeauty', category: 'Cosmetics', share: 0.08, baseGrowth: [10, 20] },
  { id: 'brand-4', name: 'ZenLife', category: 'Wellness', share: 0.075, baseGrowth: [6, 14] },
  { id: 'brand-5', name: 'HairLux', category: 'Haircare', share: 0.07, baseGrowth: [-2, 8] },
  
  // Tier 2: Growth Brands (6-12 - ~35% of revenue)
  { id: 'brand-6', name: 'SkinNaturals', category: 'Skincare', share: 0.055, baseGrowth: [15, 28] },
  { id: 'brand-7', name: 'FitPro', category: 'Fitness', share: 0.05, baseGrowth: [18, 30] },
  { id: 'brand-8', name: 'NatureBloom', category: 'Organic', share: 0.05, baseGrowth: [10, 22] },
  { id: 'brand-9', name: 'TechCare', category: 'Gadgets', share: 0.048, baseGrowth: [5, 15] },
  { id: 'brand-10', name: 'BabySoft', category: 'Baby Care', share: 0.045, baseGrowth: [8, 16] },
  { id: 'brand-11', name: 'FreshGlow', category: 'Skincare', share: 0.042, baseGrowth: [12, 24] },
  { id: 'brand-12', name: 'PetPal', category: 'Pet Care', share: 0.04, baseGrowth: [20, 35] },
  
  // Tier 3: Emerging Brands (13-20 - ~18% of revenue)
  { id: 'brand-13', name: 'EcoHome', category: 'Home', share: 0.032, baseGrowth: [5, 12] },
  { id: 'brand-14', name: 'StyleMate', category: 'Fashion', share: 0.03, baseGrowth: [2, 10] },
  { id: 'brand-15', name: 'CleanFresh', category: 'Household', share: 0.028, baseGrowth: [8, 18] },
  { id: 'brand-16', name: 'NutriMax', category: 'Supplements', share: 0.025, baseGrowth: [6, 14] },
  { id: 'brand-17', name: 'SportX', category: 'Sports', share: 0.022, baseGrowth: [10, 20] },
  { id: 'brand-18', name: 'HerbalPlus', category: 'Traditional', share: 0.02, baseGrowth: [-5, 5] },
  { id: 'brand-19', name: 'ModaStyle', category: 'Fashion', share: 0.018, baseGrowth: [15, 28] },
  { id: 'brand-20', name: 'KitchenPro', category: 'Kitchen', share: 0.015, baseGrowth: [3, 10] },
  
  // Tier 4: Niche Brands (21-27 - ~7% of revenue)
  { id: 'brand-21', name: 'ArtisanCraft', category: 'Handmade', share: 0.012, baseGrowth: [8, 18] },
  { id: 'brand-22', name: 'GreenEarth', category: 'Eco', share: 0.011, baseGrowth: [12, 25] },
  { id: 'brand-23', name: 'TravelMate', category: 'Travel', share: 0.01, baseGrowth: [5, 15] },
  { id: 'brand-24', name: 'MusicVibe', category: 'Lifestyle', share: 0.008, baseGrowth: [-3, 8] },
  { id: 'brand-25', name: 'BookWorm', category: 'Education', share: 0.007, baseGrowth: [10, 20] },
  { id: 'brand-26', name: 'GiftJoy', category: 'Gifts', share: 0.006, baseGrowth: [15, 28] },
  { id: 'brand-27', name: 'SpecialtyPlus', category: 'Premium', share: 0.005, baseGrowth: [18, 32] },
];

// Platform configuration - Based on actual CTG sales channels
const PLATFORMS = [
  { id: 'platform-1', name: 'Shopee', share: 0.38, conversionRate: 4.2, avgOrderValue: 85 },
  { id: 'platform-2', name: 'Shopify', share: 0.28, conversionRate: 2.8, avgOrderValue: 145 },
  { id: 'platform-3', name: 'Retail', share: 0.18, conversionRate: 0, avgOrderValue: 165 },
  { id: 'platform-4', name: 'Facebook', share: 0.08, conversionRate: 2.2, avgOrderValue: 118 },
  { id: 'platform-5', name: 'Lazada', share: 0.05, conversionRate: 3.8, avgOrderValue: 92 },
  { id: 'platform-6', name: 'TikTok Shop', share: 0.03, conversionRate: 5.5, avgOrderValue: 68 },
];

// Get date range info based on time range filter
export const getDateRangeInfo = (timeRange: TimeRange): { 
  multiplier: number; 
  days: number; 
  startDate: Date; 
  endDate: Date;
  label: string;
} => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (timeRange) {
    case 'today': {
      return { 
        multiplier: 1/365, // Daily as fraction of annual
        days: 1, 
        startDate: today, 
        endDate: now,
        label: 'Today'
      };
    }
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { 
        multiplier: 1/365,
        days: 1, 
        startDate: yesterday, 
        endDate: new Date(yesterday.getTime() + 86400000 - 1),
        label: 'Yesterday'
      };
    }
    case 'last7days': {
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 6);
      return { 
        multiplier: 7/365,
        days: 7, 
        startDate, 
        endDate: now,
        label: 'Last 7 Days'
      };
    }
    case 'last30days': {
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 29);
      return { 
        multiplier: 30/365,
        days: 30, 
        startDate, 
        endDate: now,
        label: 'Last 30 Days'
      };
    }
    case 'thisMonth': {
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const dayOfMonth = today.getDate();
      return { 
        multiplier: dayOfMonth / 365,
        days: dayOfMonth, 
        startDate, 
        endDate: now,
        label: 'This Month'
      };
    }
    case 'lastMonth': {
      const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endDate = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
      const daysInLastMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      return { 
        multiplier: daysInLastMonth / 365,
        days: daysInLastMonth, 
        startDate, 
        endDate,
        label: 'Last Month'
      };
    }
    case 'thisQuarter': {
      const quarterMonth = Math.floor(today.getMonth() / 3) * 3;
      const startDate = new Date(today.getFullYear(), quarterMonth, 1);
      const dayOfQuarter = Math.floor((today.getTime() - startDate.getTime()) / 86400000) + 1;
      return { 
        multiplier: dayOfQuarter / 365,
        days: dayOfQuarter, 
        startDate, 
        endDate: now,
        label: 'This Quarter'
      };
    }
    case 'thisYear': {
      const startDate = new Date(today.getFullYear(), 0, 1);
      const dayOfYear = Math.floor((today.getTime() - startDate.getTime()) / 86400000) + 1;
      return { 
        multiplier: dayOfYear / 365,
        days: dayOfYear, 
        startDate, 
        endDate: now,
        label: 'This Year'
      };
    }
    default: {
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 29);
      return { 
        multiplier: 30/365,
        days: 30, 
        startDate, 
        endDate: now,
        label: 'Last 30 Days'
      };
    }
  }
};

// Get multiplier based on time range
const getTimeRangeMultiplier = (timeRange: TimeRange): { multiplier: number; days: number } => {
  const info = getDateRangeInfo(timeRange);
  return { multiplier: info.multiplier, days: info.days };
};

// Get brand info by ID
const getBrandById = (brandId: string | null) => {
  if (!brandId) return null;
  return BRANDS.find(b => b.id === brandId) || null;
};

// Get brand share multiplier
const getBrandMultiplier = (brandId: string | null): number => {
  const brand = getBrandById(brandId);
  return brand ? brand.share : 1;
};

// Generate revenue trend data
export const generateRevenueTrend = (timeRange: TimeRange = 'last30days', totalRevenue: number, days: number): Array<{ date: string; dateLabel: string; revenue: number; profit: number }> => {
  const { startDate, endDate } = getDateRangeInfo(timeRange);
  const data: Array<{ date: string; dateLabel: string; revenue: number; profit: number }> = [];
  const now = new Date();
  
  const dailyRevenue = totalRevenue / days;
  const profitMargin = randomBetween(0.28, 0.35);
  
  if (timeRange === 'today') {
    const currentHour = now.getHours();
    const hourlyRevenue = dailyRevenue / 24;
    
    for (let hour = 0; hour <= currentHour; hour++) {
      const hourDate = new Date(startDate);
      hourDate.setHours(hour, 0, 0, 0);
      
      const revenue = Math.round(hourlyRevenue * randomBetween(0.7, 1.3));
      const profit = Math.round(revenue * profitMargin);
      
      data.push({
        date: hourDate.toISOString(),
        dateLabel: `${hour.toString().padStart(2, '0')}:00`,
        revenue,
        profit,
      });
    }
  } else {
    const actualDays = Math.min(days, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1);
    
    for (let i = 0; i < actualDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Weekend boost for e-commerce
      const weekendBoost = (date.getDay() === 0 || date.getDay() === 6) ? 1.18 : 1;
      // Payday effect (end of month)
      const paydayBoost = (date.getDate() === 25 || date.getDate() === 28) ? 1.15 : 1;
      const revenue = Math.round(dailyRevenue * weekendBoost * paydayBoost * randomBetween(0.85, 1.15));
      const profit = Math.round(revenue * profitMargin);
      
      data.push({
        date: date.toISOString().split('T')[0],
        dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue,
        profit,
      });
    }
  }
  
  return data;
};

// Main function to generate all dashboard data with consistency
export const generateDashboardData = (timeRange: TimeRange = 'last30days', brandId: string | null = null): DashboardData => {
  const { multiplier: timeMultiplier, days } = getTimeRangeMultiplier(timeRange);
  const selectedBrand = getBrandById(brandId);
  const brandMultiplier = selectedBrand ? selectedBrand.share : 1;
  
  const combinedMultiplier = timeMultiplier * brandMultiplier;
  
  // === CORE METRICS (scaled to 100M annual revenue) ===
  const baseRevenue = COMPANY_CONFIG.annualRevenue;
  const totalRevenue = Math.round(baseRevenue * combinedMultiplier);
  
  const grossMarginPercent = randomBetween(30, 36);
  const netMarginPercent = randomBetween(17, 23);
  const grossProfit = Math.round(totalRevenue * (grossMarginPercent / 100));
  const netProfit = Math.round(totalRevenue * (netMarginPercent / 100));
  
  const adSpendRate = randomBetween(0.12, 0.16);
  const adSpend = Math.round(totalRevenue * adSpendRate);
  
  const totalOrders = Math.round(totalRevenue / randomBetween(85, 105)); // AOV ~RM 95
  
  const totalBudget = Math.round(15000000 * timeMultiplier); // 15M annual budget
  const spentBudget = Math.round(totalBudget * randomBetween(0.58, 0.72));
  
  // Marketing metrics
  const conversions = Math.round(totalOrders * randomBetween(0.72, 0.88));
  const impressions = Math.round(adSpend * 55); // CPM ~RM 18
  const clicks = Math.round(impressions * randomBetween(0.026, 0.038)); // CTR ~3.2%
  
  // === BRAND DATA ===
  const brandRevenues: { name: string; revenue: number; growth: number }[] = [];
  const brandRevenueMap: Record<string, number> = {};
  
  if (selectedBrand) {
    brandRevenues.push({
      name: selectedBrand.name,
      revenue: totalRevenue,
      growth: randomBetween(selectedBrand.baseGrowth[0], selectedBrand.baseGrowth[1]),
    });
    brandRevenueMap[selectedBrand.name] = totalRevenue;
  } else {
    // Calculate brand revenues that sum to total
    let remainingRevenue = totalRevenue;
    BRANDS.forEach((brand, index) => {
      const isLast = index === BRANDS.length - 1;
      const brandRevenue = isLast ? remainingRevenue : Math.round(totalRevenue * brand.share);
      remainingRevenue -= brandRevenue;
      
      brandRevenueMap[brand.name] = brandRevenue;
      brandRevenues.push({
        name: brand.name,
        revenue: brandRevenue,
        growth: randomBetween(brand.baseGrowth[0], brand.baseGrowth[1]),
      });
    });
  }
  
  // Sort brands by revenue for top/bottom lists
  const sortedBrands = [...brandRevenues].sort((a, b) => b.revenue - a.revenue);
  const topBrands = sortedBrands.slice(0, 5); // Top 5
  const bottomBrands = sortedBrands.slice(-5).reverse(); // Bottom 5
  
  // === PLATFORM DATA ===
  const platformPerformance: { platform: string; revenue: number; orders: number }[] = [];
  const platformRevenueMap: Record<string, number> = {};
  
  let remainingPlatformRevenue = totalRevenue;
  PLATFORMS.forEach((platform, index) => {
    const isLast = index === PLATFORMS.length - 1;
    const platformRevenue = isLast ? remainingPlatformRevenue : Math.round(totalRevenue * platform.share);
    remainingPlatformRevenue -= platformRevenue;
    
    const platformOrders = Math.round(platformRevenue / platform.avgOrderValue);
    
    platformRevenueMap[platform.name] = platformRevenue;
    platformPerformance.push({
      platform: platform.name,
      revenue: platformRevenue,
      orders: platformOrders,
    });
  });
  
  // === REVENUE TREND ===
  const revenueTrend = generateRevenueTrend(timeRange, totalRevenue, days);
  
  // === CONSTRUCT DASHBOARD DATA ===
  return {
    revenue: {
      totalRevenue,
      revenueGrowth: randomBetween(8, 18),
      revenueByBrand: brandRevenueMap,
      revenueByPlatform: platformRevenueMap,
      revenueByProduct: {},
      revenueByCountry: {
        'Malaysia': Math.round(totalRevenue * 0.92),
        'Singapore': Math.round(totalRevenue * 0.08),
      },
    },
    sales: {
      unitsSold: Math.round(totalOrders * randomBetween(2.0, 2.8)), // ~2.4 units per order
      averageOrderValue: Math.round(totalRevenue / totalOrders),
      conversionRate: randomBetween(3.2, 4.5),
      returningCustomers: Math.round(randomBetween(32, 42)),
      totalOrders,
      orderGrowth: randomBetween(6, 16),
    },
    discounts: {
      totalDiscounts: Math.round(totalRevenue * randomBetween(0.10, 0.15)),
      discountRate: randomBetween(10, 15),
      promotionImpact: randomBetween(22, 32),
    },
    profit: {
      grossProfit,
      netProfit,
      contributionMargin: randomBetween(38, 48),
      productMargin: randomBetween(28, 38),
      grossMargin: grossMarginPercent,
      netMargin: netMarginPercent,
      operatingMargin: randomBetween(18, 26),
    },
    marketing: {
      adSpend,
      roas: totalRevenue / adSpend,
      cpa: adSpend / conversions,
      cpm: (adSpend / impressions) * 1000,
      ctr: (clicks / impressions) * 100,
      impressions,
      clicks,
      conversions,
    },
    budget: {
      totalBudget,
      spentBudget,
      remainingBudget: totalBudget - spentBudget,
      budgetPacing: (spentBudget / totalBudget) * 100,
    },
    topBrands,
    bottomBrands,
    platformPerformance,
    revenueTrend,
    timeRangeInfo: getDateRangeInfo(timeRange),
  };
};

// Today's metrics for executive dashboard
export const generateTodayMetrics = (brandId: string | null = null) => {
  const brandMultiplier = getBrandMultiplier(brandId);
  
  // Daily revenue ~RM 274K for all brands
  const todayRevenue = randomBetween(250000, 320000) * brandMultiplier;
  const todayProfit = todayRevenue * randomBetween(0.28, 0.34);
  const todayAdSpend = todayRevenue * randomBetween(0.12, 0.16);
  const todayOrders = Math.round(todayRevenue / randomBetween(85, 105));
  const avgOrderValue = Math.round(todayRevenue / todayOrders);
  const grossMargin = randomBetween(30, 36);
  const netMargin = randomBetween(17, 23);
  
  // Target calculations (monthly targets)
  const monthlyRevenueTarget = COMPANY_CONFIG.monthlyRevenue * brandMultiplier;
  const monthlyProfitTarget = monthlyRevenueTarget * 0.22;
  const monthlyAdSpendBudget = monthlyRevenueTarget * 0.14;
  const monthlyOrderTarget = Math.round(monthlyRevenueTarget / 95);
  
  // Calculate current progress
  const dayOfMonth = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  
  // Accumulated values (MTD)
  const mtdRevenue = todayRevenue * dayOfMonth * randomBetween(0.92, 1.08);
  const mtdProfit = todayProfit * dayOfMonth * randomBetween(0.88, 1.05);
  const mtdAdSpend = todayAdSpend * dayOfMonth * randomBetween(0.90, 1.10);
  const mtdOrders = Math.round(todayOrders * dayOfMonth * randomBetween(0.92, 1.08));
  
  return {
    revenue: {
      today: Math.round(todayRevenue),
      yesterday: Math.round(todayRevenue * randomBetween(0.92, 1.08)),
      growth: randomBetween(-3, 12),
      target: Math.round(monthlyRevenueTarget),
      mtd: Math.round(mtdRevenue),
      trend: randomBetween(-3, 12) > 2 ? 'up' : randomBetween(-3, 12) < -2 ? 'down' : 'stable' as 'up' | 'down' | 'stable',
    },
    profit: {
      today: Math.round(todayProfit),
      yesterday: Math.round(todayProfit * randomBetween(0.88, 1.05)),
      growth: randomBetween(-5, 15),
      target: Math.round(monthlyProfitTarget),
      mtd: Math.round(mtdProfit),
      margin: netMargin,
      trend: randomBetween(-5, 15) > 2 ? 'up' : randomBetween(-5, 15) < -2 ? 'down' : 'stable' as 'up' | 'down' | 'stable',
    },
    adSpend: {
      today: Math.round(todayAdSpend),
      yesterday: Math.round(todayAdSpend * randomBetween(0.90, 1.10)),
      growth: randomBetween(-8, 8),
      budget: Math.round(monthlyAdSpendBudget),
      mtd: Math.round(mtdAdSpend),
      trend: randomBetween(-8, 8) > 2 ? 'up' : randomBetween(-8, 8) < -2 ? 'down' : 'stable' as 'up' | 'down' | 'stable',
    },
    roas: {
      today: todayRevenue / todayAdSpend,
      yesterday: (todayRevenue * 0.96) / (todayAdSpend * 1.02),
      growth: randomBetween(-2, 6),
      target: 4.5,
      trend: randomBetween(-2, 6) > 1 ? 'up' : randomBetween(-2, 6) < -1 ? 'down' : 'stable' as 'up' | 'down' | 'stable',
    },
    orders: {
      today: todayOrders,
      avgOrderValue,
      target: monthlyOrderTarget,
      mtd: mtdOrders,
    },
    margin: {
      gross: grossMargin,
      net: netMargin,
    },
  };
};

// Generate integrations - scaled to 27 brands
export const generateIntegrations = () => [
  { id: 'int-1', name: 'Shopee Seller API', type: 'shopee', status: 'active' as 'active' | 'inactive' | 'error', lastSyncAt: new Date(), syncInterval: 15, syncStatus: 'completed' as 'completed' | 'syncing' | 'pending' | 'error', brandId: 'brand-1' },
  { id: 'int-2', name: 'Lazada Open API', type: 'lazada', status: 'active' as 'active' | 'inactive' | 'error', lastSyncAt: new Date(Date.now() - 300000), syncInterval: 15, syncStatus: 'completed' as 'completed' | 'syncing' | 'pending' | 'error', brandId: 'brand-1' },
  { id: 'int-3', name: 'TikTok Shop API', type: 'tiktok_shop', status: 'active' as 'active' | 'inactive' | 'error', lastSyncAt: new Date(Date.now() - 600000), syncInterval: 30, syncStatus: 'completed' as 'completed' | 'syncing' | 'pending' | 'error', brandId: 'brand-2' },
  { id: 'int-4', name: 'Shopify Store', type: 'shopify', status: 'active' as 'active' | 'inactive' | 'error', lastSyncAt: new Date(Date.now() - 900000), syncInterval: 15, syncStatus: 'syncing' as 'completed' | 'syncing' | 'pending' | 'error', brandId: 'brand-3' },
  { id: 'int-5', name: 'Facebook Ads', type: 'facebook_ads', status: 'active' as 'active' | 'inactive' | 'error', lastSyncAt: new Date(Date.now() - 180000), syncInterval: 60, syncStatus: 'completed' as 'completed' | 'syncing' | 'pending' | 'error', brandId: 'brand-1' },
  { id: 'int-6', name: 'TikTok Ads', type: 'tiktok_ads', status: 'active' as 'active' | 'inactive' | 'error', lastSyncAt: new Date(Date.now() - 3600000), syncInterval: 60, syncStatus: 'completed' as 'completed' | 'syncing' | 'pending' | 'error', brandId: 'brand-2' },
  { id: 'int-7', name: 'Google Ads', type: 'google_ads', status: 'active' as 'active' | 'inactive' | 'error', lastSyncAt: new Date(Date.now() - 240000), syncInterval: 60, syncStatus: 'completed' as 'completed' | 'syncing' | 'pending' | 'error', brandId: 'brand-3' },
  { id: 'int-8', name: 'Shopee Ads', type: 'shopee_ads', status: 'active' as 'active' | 'inactive' | 'error', lastSyncAt: new Date(Date.now() - 120000), syncInterval: 30, syncStatus: 'completed' as 'completed' | 'syncing' | 'pending' | 'error', brandId: 'brand-4' },
];

// Generate campaigns - scaled appropriately
export const generateCampaigns = (brandId: string | null = null) => {
  const allCampaigns = [
    { id: 'camp-1', name: 'GlowSkin Raya Sale', adPlatform: 'FACEBOOK_ADS' as const, startDate: new Date('2024-04-01'), budget: 180000, budgetSpent: 165000, impressions: 8500000, clicks: 285000, conversions: 12500, conversionValue: 720000, ctr: 3.35, cpa: 13.2, roas: 4.36, cpm: 19.4, brandId: 'brand-1' },
    { id: 'camp-2', name: 'VitaWell Health Boost', adPlatform: 'TIKTOK_ADS' as const, startDate: new Date('2024-05-15'), budget: 120000, budgetSpent: 98000, impressions: 6200000, clicks: 210000, conversions: 9200, conversionValue: 510000, ctr: 3.39, cpa: 10.65, roas: 5.20, cpm: 15.8, brandId: 'brand-2' },
    { id: 'camp-3', name: 'PureBeauty Festive', adPlatform: 'FACEBOOK_ADS' as const, startDate: new Date('2024-06-01'), budget: 150000, budgetSpent: 125000, impressions: 7200000, clicks: 252000, conversions: 10800, conversionValue: 580000, ctr: 3.50, cpa: 11.57, roas: 4.64, cpm: 17.4, brandId: 'brand-3' },
    { id: 'camp-4', name: 'ZenLife Wellness', adPlatform: 'GOOGLE_ADS' as const, startDate: new Date('2024-06-10'), budget: 80000, budgetSpent: 68000, impressions: 4500000, clicks: 162000, conversions: 7200, conversionValue: 340000, ctr: 3.60, cpa: 9.44, roas: 5.0, cpm: 15.1, brandId: 'brand-4' },
    { id: 'camp-5', name: 'HairLux Revival', adPlatform: 'TIKTOK_ADS' as const, startDate: new Date('2024-06-15'), budget: 65000, budgetSpent: 52000, impressions: 3800000, clicks: 140000, conversions: 5800, conversionValue: 250000, ctr: 3.68, cpa: 8.97, roas: 4.81, cpm: 13.7, brandId: 'brand-5' },
    { id: 'camp-6', name: 'SkinNaturals Launch', adPlatform: 'FACEBOOK_ADS' as const, startDate: new Date('2024-07-01'), budget: 95000, budgetSpent: 72000, impressions: 5200000, clicks: 195000, conversions: 8500, conversionValue: 420000, ctr: 3.75, cpa: 8.47, roas: 5.83, cpm: 13.8, brandId: 'brand-6' },
    { id: 'camp-7', name: 'FitPro Summer', adPlatform: 'TIKTOK_ADS' as const, startDate: new Date('2024-07-05'), budget: 70000, budgetSpent: 55000, impressions: 4100000, clicks: 172000, conversions: 7800, conversionValue: 380000, ctr: 4.20, cpa: 7.05, roas: 6.91, cpm: 13.4, brandId: 'brand-7' },
    { id: 'camp-8', name: 'PetPal Mega Sale', adPlatform: 'FACEBOOK_ADS' as const, startDate: new Date('2024-07-10'), budget: 45000, budgetSpent: 38000, impressions: 2800000, clicks: 112000, conversions: 5200, conversionValue: 195000, ctr: 4.0, cpa: 7.31, roas: 5.13, cpm: 13.6, brandId: 'brand-12' },
  ];
  
  if (brandId) {
    return allCampaigns.filter(c => c.brandId === brandId);
  }
  return allCampaigns;
};

// Generate forecasts - scaled to 100M
export const generateForecasts = (brandId: string | null = null) => {
  const allForecasts = [
    { id: 'fore-1', name: 'Q3 Revenue Forecast', period: 'Q3-2024', revenueForecast: 28000000, profitForecast: 6200000, adSpendForecast: 4200000, revenueActual: 22500000, profitActual: 4900000, adSpendActual: 3500000, brandId: 'brand-1', scenario: 'baseline' },
    { id: 'fore-2', name: 'Q3 Optimistic', period: 'Q3-2024', revenueForecast: 32000000, profitForecast: 7200000, adSpendForecast: 4800000, brandId: 'brand-1', scenario: 'optimistic' },
    { id: 'fore-3', name: 'Q3 Conservative', period: 'Q3-2024', revenueForecast: 25000000, profitForecast: 5500000, adSpendForecast: 3800000, brandId: 'brand-1', scenario: 'pessimistic' },
    { id: 'fore-4', name: 'Full Year Forecast', period: 'FY-2024', revenueForecast: 105000000, profitForecast: 23000000, adSpendForecast: 15000000, revenueActual: 68000000, profitActual: 14800000, adSpendActual: 10200000, brandId: 'brand-1', scenario: 'baseline' },
    { id: 'fore-5', name: 'VitaWell Q3', period: 'Q3-2024', revenueForecast: 24000000, profitForecast: 5300000, adSpendForecast: 3600000, revenueActual: 19500000, profitActual: 4200000, adSpendActual: 3000000, brandId: 'brand-2', scenario: 'baseline' },
    { id: 'fore-6', name: 'PureBeauty Growth', period: 'Q3-2024', revenueForecast: 22000000, profitForecast: 4800000, adSpendForecast: 3300000, brandId: 'brand-3', scenario: 'baseline' },
  ];
  
  if (brandId) {
    return allForecasts.filter(f => f.brandId === brandId);
  }
  return allForecasts;
};

// Currency symbol for Malaysian Ringgit
export const CURRENCY_SYMBOL = 'RM';

// Format currency in Malaysian Ringgit
export const formatCurrency = (value: number): string => {
  return `${CURRENCY_SYMBOL} ${value.toLocaleString('en-MY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

// Format currency with compact notation
export const formatCurrencyCompact = (value: number): string => {
  if (value >= 1000000) {
    return `${CURRENCY_SYMBOL} ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${CURRENCY_SYMBOL} ${(value / 1000).toFixed(0)}K`;
  }
  return formatCurrency(value);
};

// Format number with compact notation
export const formatCompact = (value: number, prefix: string = CURRENCY_SYMBOL): string => {
  const compact = new Intl.NumberFormat('en-MY', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
  return prefix ? `${prefix} ${compact}` : compact;
};

// Format percentage
export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

// Export brand list for filters
export const getBrandList = () => BRANDS;
export const getBrandCount = () => BRANDS.length;
