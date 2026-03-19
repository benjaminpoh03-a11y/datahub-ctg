import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { subDays, format, startOfDay, endOfDay } from 'date-fns'
import { generateDashboardData, generateTodayMetrics } from '@/lib/data/mock-data'

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'
    const brandId = searchParams.get('brandId')
    const platformId = searchParams.get('platformId')
    const timeRange = (searchParams.get('timeRange') || 'last30days') as any

    const days = timeRange === 'last7days' ? 7 : timeRange === 'last30days' ? 30 : timeRange === 'last90days' ? 90 : 30
    const startDate = startOfDay(subDays(new Date(), days))
    const endDate = endOfDay(new Date())

    let data: any

    try {
      // Try to fetch from database first
      switch (type) {
        case 'brands':
          data = await getBrandsData()
          break
        case 'platforms':
          data = await getPlatformsData()
          break
        case 'metrics':
          data = await getMetricsData(startDate, endDate, days, brandId, platformId)
          break
        case 'overview':
        default:
          data = await getOverviewData(startDate, endDate, days, brandId, platformId)
          break
      }
    } catch (dbError) {
      console.error('Database fetch failed, falling back to mock data:', dbError)
      // Fallback to mock data if database fails
      const mockData = generateDashboardData(timeRange, brandId)
      const todayMetrics = generateTodayMetrics(brandId)
      
      // Map mock data to the format expected by ExecutiveDashboard
      data = {
        today: {
          revenue: todayMetrics.revenue.today,
          orders: todayMetrics.orders.today,
          profit: todayMetrics.profit.today,
          adSpend: todayMetrics.adSpend.today,
          customers: Math.round(todayMetrics.orders.today * 0.7),
          avgOrderValue: todayMetrics.orders.avgOrderValue,
        },
        metrics: {
          summary: {
            revenue: mockData.revenue.totalRevenue,
            orders: mockData.sales.totalOrders,
            profit: mockData.profit.netProfit,
            adSpend: mockData.marketing.adSpend,
            avgOrderValue: mockData.sales.averageOrderValue,
            grossMargin: mockData.profit.grossMargin,
            roas: mockData.marketing.roas,
          },
          counts: {
            brands: 27,
            platforms: 6,
            products: 1450,
          },
          daily: mockData.revenueTrend.map(d => ({
            date: d.date,
            revenue: d.revenue,
            orders: Math.round(d.revenue / 95),
            profit: d.profit,
            adSpend: Math.round(d.revenue * 0.14),
            customers: Math.round(d.revenue / 95 * 0.7),
          })),
        },
        brands: Object.entries(mockData.revenue.revenueByBrand).map(([name, revenue], i) => ({
          id: `brand-${i+1}`,
          name: name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          color: '#3b82f6',
          metrics: {
            revenue: revenue,
            orders: Math.round(revenue / 95),
            growth: 10 + Math.random() * 10,
          }
        })),
        platforms: mockData.platformPerformance.map((p, i) => ({
          id: `platform-${i+1}`,
          name: p.platform,
          type: p.platform.toUpperCase().replace(/\s+/g, '_'),
          metrics: {
            revenue: p.revenue,
            orders: p.orders,
            growth: 12.5,
          }
        })),
        recentOrders: [
          { id: 'ORD-7721', brand: 'GlowSkin', platform: 'Shopee', amount: 145, status: 'completed', time: '2 min ago' },
          { id: 'ORD-7720', brand: 'VitaWell', platform: 'Lazada', amount: 89, status: 'completed', time: '5 min ago' },
          { id: 'ORD-7719', brand: 'PureBeauty', platform: 'Shopify', amount: 210, status: 'processing', time: '12 min ago' },
          { id: 'ORD-7718', brand: 'ZenLife', platform: 'TikTok Shop', amount: 65, status: 'completed', time: '18 min ago' },
          { id: 'ORD-7717', brand: 'GlowSkin', platform: 'Shopee', amount: 120, status: 'completed', time: '25 min ago' },
        ],
        topProducts: [],
        alerts: [
          { id: '1', type: 'success', title: 'Data Sync Complete', message: 'Synced 1,240 orders from Shopee', time: '5 min ago' },
          { id: '2', type: 'warning', title: 'Low Stock Alert', message: 'GlowSkin Serum is below safety stock', time: '12 min ago' },
        ],
        isMock: true
      }
    }

    const response = NextResponse.json({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        filters: { brandId, platformId, timeRange },
        user: { id: session.user.id, role: session.user.role },
        source: data?.isMock ? 'mock' : 'database'
      },
    })
    
    // Prevent all caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

async function getBrandsData() {
  const brands = await db.brand.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { products: true, sales: true, adCampaigns: true } },
      integrations: { select: { id: true, type: true, status: true } }
    },
    orderBy: { name: 'asc' }
  })

  const salesData = await db.sale.groupBy({
    by: ['brandId'],
    _sum: { totalAmount: true, quantity: true },
    _count: { id: true },
  })

  const salesMap = new Map(salesData.map(s => [s.brandId, s]))

  const thirtyDaysAgo = subDays(new Date(), 30)
  const sixtyDaysAgo = subDays(new Date(), 60)
  
  const prevSalesData = await db.sale.groupBy({
    by: ['brandId'],
    where: { transactionDate: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    _sum: { totalAmount: true },
  })
  const prevSalesMap = new Map(prevSalesData.map(s => [s.brandId, s._sum.totalAmount || 0]))

  return brands.map(brand => {
    const sales = salesMap.get(brand.id)
    const currentRevenue = sales?._sum.totalAmount || 1
    const prevRevenue = prevSalesMap.get(brand.id) || currentRevenue * 0.9
    const growth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0
    
    return {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      color: brand.color,
      logo: brand.logo,
      isActive: brand.isActive,
      metrics: {
        revenue: Math.round(currentRevenue),
        orders: sales?._count.id || 0,
        products: brand._count.products,
        campaigns: brand._count.adCampaigns,
        growth: Math.round(growth * 10) / 10,
      },
      integrations: brand.integrations,
    }
  })
}

async function getPlatformsData() {
  const platforms = await db.platform.findMany({
    where: { isActive: true },
    include: { _count: { select: { sales: true } } }
  })

  const salesData = await db.sale.groupBy({
    by: ['platformId'],
    _sum: { totalAmount: true },
    _count: { id: true },
  })

  const salesMap = new Map(salesData.map(s => [s.platformId, s]))

  const thirtyDaysAgo = subDays(new Date(), 30)
  const sixtyDaysAgo = subDays(new Date(), 60)
  
  const prevSalesData = await db.sale.groupBy({
    by: ['platformId'],
    where: { transactionDate: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    _sum: { totalAmount: true },
  })
  const prevSalesMap = new Map(prevSalesData.map(s => [s.platformId, s._sum.totalAmount || 0]))

  return platforms.map(platform => {
    const sales = salesMap.get(platform.id)
    const currentRevenue = sales?._sum.totalAmount || 0
    const prevRevenue = prevSalesMap.get(platform.id) || currentRevenue * 0.9
    const growth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0
    
    return {
      id: platform.id,
      name: platform.name,
      type: platform.type,
      description: platform.description,
      metrics: {
        revenue: Math.round(currentRevenue),
        orders: sales?._count.id || 0,
        avgOrderValue: sales?._count.id ? Math.round(currentRevenue / sales._count.id) : 0,
        growth: Math.round(growth * 10) / 10,
      }
    }
  })
}

async function getMetricsData(startDate: Date, endDate: Date, days: number, brandId?: string | null, platformId?: string | null) {
  const [totalBrands, totalPlatforms, totalProducts] = await Promise.all([
    db.brand.count({ where: { isActive: true } }),
    db.platform.count({ where: { isActive: true } }),
    db.product.count(),
  ])

  
  const salesWhere = {
    transactionDate: { gte: startDate, lte: endDate },
    ...(brandId && { brandId }),
    ...(platformId && { platformId }),
  }

  const salesStats = await db.sale.aggregate({
    where: salesWhere,
    _sum: { totalAmount: true, netAmount: true, grossProfit: true, quantity: true },
    _count: { id: true },
    _avg: { totalAmount: true },
  })

  const totalRevenue = salesStats._sum.totalAmount || 0
  const totalOrders = salesStats._count.id || 0
  const totalProfit = salesStats._sum.grossProfit || 0

  const adStats = await db.adCampaign.aggregate({
    where: { ...(brandId && { brandId }) },
    _sum: { budgetSpent: true, conversionValue: true, conversions: true },
  })

  const totalAdSpend = adStats._sum.budgetSpent || 0
  const adRevenue = adStats._sum.conversionValue || 0
  const roas = totalAdSpend > 0 ? adRevenue / totalAdSpend : 0

  const dailySales = await db.sale.groupBy({
    by: ['transactionDate'],
    where: salesWhere,
    _sum: { totalAmount: true, netAmount: true, grossProfit: true },
    _count: { id: true },
    orderBy: { transactionDate: 'asc' },
  })

  const dailyData = dailySales.map(d => ({
    date: format(d.transactionDate, 'yyyy-MM-dd'),
    revenue: Math.round(d._sum.totalAmount || 0),
    orders: d._count.id,
    profit: Math.round(d._sum.grossProfit || 0),
    adSpend: Math.round((totalAdSpend / days) * 100) / 100,
    customers: Math.round(d._count.id * 0.7),
  }))

  const grossMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  return {
    summary: {
      revenue: Math.round(totalRevenue),
      orders: totalOrders,
      profit: Math.round(totalProfit),
      adSpend: Math.round(totalAdSpend),
      avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      grossMargin: Math.round(grossMargin * 10) / 10,
      roas: Math.round(roas * 10) / 10,
    },
    counts: { brands: totalBrands, platforms: totalPlatforms, products: totalProducts },
    daily: dailyData,
  }
}

async function getOverviewData(startDate: Date, endDate: Date, days: number, brandId?: string | null, platformId?: string | null) {
  const [brands, platforms, metrics] = await Promise.all([
    getBrandsData(),
    getPlatformsData(),
    getMetricsData(startDate, endDate, days, brandId, platformId),
  ])

  const todayStart = startOfDay(new Date())
  const todayEnd = endOfDay(new Date())
  
  const todaySales = await db.sale.aggregate({
    where: {
      transactionDate: { gte: todayStart, lte: todayEnd },
      ...(brandId && { brandId }),
      ...(platformId && { platformId }),
    },
    _sum: { totalAmount: true, grossProfit: true },
    _count: { id: true },
  })

  // Get ad spend aggregated - using different variable name
  const adSpendAggregateResult = await db.adCampaign.aggregate({
    where: { ...(brandId && { brandId }) },
    _sum: { budgetSpent: true },
  })

  const todayRevenue = todaySales._sum.totalAmount || 0
  const todayOrders = todaySales._count.id || 0
  const todayProfit = todaySales._sum.grossProfit || 0
  // Calculate daily ad spend - using different variable name
  const dailyAdSpendAmount = adSpendAggregateResult._sum.budgetSpent ? adSpendAggregateResult._sum.budgetSpent / 30 : 0

  const recentSales = await db.sale.findMany({
    where: {
      ...(brandId && { brandId }),
      ...(platformId && { platformId }),
    },
    include: {
      brand: { select: { name: true } },
      platform: { select: { name: true } },
    },
    orderBy: { transactionDate: 'desc' },
    take: 10,
  })

  const recentOrders = recentSales.map(sale => ({
    id: sale.orderId,
    brand: sale.brand.name,
    platform: sale.platform.name,
    amount: Math.round(sale.totalAmount),
    status: sale.status,
    time: formatTimeAgo(sale.transactionDate),
  }))

  const alerts = []
  
  if (metrics.summary.grossMargin < 25) {
    alerts.push({
      id: '1',
      type: 'warning',
      title: 'Low Gross Margin',
      message: `Gross margin is ${metrics.summary.grossMargin.toFixed(1)}%, below target of 30%`,
      time: 'Just now',
    })
  }
  
  if (metrics.summary.roas < 4) {
    alerts.push({
      id: '2',
      type: 'warning',
      title: 'ROAS Below Target',
      message: `ROAS is ${metrics.summary.roas.toFixed(1)}x, target is 4.0x`,
      time: 'Just now',
    })
  }
  
  alerts.push({
    id: '3',
    type: 'success',
    title: 'Data Sync Complete',
    message: `Synced ${metrics.summary.orders.toLocaleString()} orders`,
    time: '5 min ago',
  })

  return {
    today: {
      revenue: Math.round(todayRevenue),
      orders: todayOrders,
      profit: Math.round(todayProfit),
      adSpend: Math.round(dailyAdSpendAmount),
      customers: Math.round(todayOrders * 0.7),
      avgOrderValue: todayOrders > 0 ? Math.round(todayRevenue / todayOrders) : 0,
    },
    metrics,
    brands,
    platforms,
    recentOrders,
    topProducts: [],
    alerts,
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}
