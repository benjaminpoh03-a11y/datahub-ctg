import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// 27 Brands for CTG (Consumer Trading Group)
const brands = [
  // Tier 1: Major Brands (Top 5 - ~40% of revenue)
  { name: 'GlowSkin', slug: 'glowskin', description: 'Premium skincare products', color: '#10B981', category: 'Skincare', tier: 1, baseRevenue: 8000000 },
  { name: 'VitaWell', slug: 'vitawell', description: 'Health supplements & wellness', color: '#8B5CF6', category: 'Health', tier: 1, baseRevenue: 7500000 },
  { name: 'PureBeauty', slug: 'purebeauty', description: 'Natural cosmetics & beauty', color: '#EC4899', category: 'Cosmetics', tier: 1, baseRevenue: 7000000 },
  { name: 'ZenLife', slug: 'zenlife', description: 'Wellness & lifestyle products', color: '#06B6D4', category: 'Wellness', tier: 1, baseRevenue: 6500000 },
  { name: 'HairLux', slug: 'hairlux', description: 'Premium hair care solutions', color: '#F59E0B', category: 'Haircare', tier: 1, baseRevenue: 6000000 },
  
  // Tier 2: Growth Brands (6-12 - ~35% of revenue)
  { name: 'SkinNaturals', slug: 'skinnaturals', description: 'Natural skincare products', color: '#22C55E', category: 'Skincare', tier: 2, baseRevenue: 3500000 },
  { name: 'FitPro', slug: 'fitpro', description: 'Fitness & sports equipment', color: '#EF4444', category: 'Fitness', tier: 2, baseRevenue: 3200000 },
  { name: 'NatureBloom', slug: 'naturebloom', description: 'Organic & natural products', color: '#84CC16', category: 'Organic', tier: 2, baseRevenue: 3000000 },
  { name: 'TechCare', slug: 'techcare', description: 'Tech accessories & gadgets', color: '#6366F1', category: 'Gadgets', tier: 2, baseRevenue: 2800000 },
  { name: 'BabySoft', slug: 'babysoft', description: 'Baby & maternal products', color: '#F472B6', category: 'Baby Care', tier: 2, baseRevenue: 2600000 },
  { name: 'FreshGlow', slug: 'freshglow', description: 'Skincare essentials', color: '#14B8A6', category: 'Skincare', tier: 2, baseRevenue: 2400000 },
  { name: 'PetPal', slug: 'petpal', description: 'Pet food & accessories', color: '#F97316', category: 'Pet Care', tier: 2, baseRevenue: 2200000 },
  
  // Tier 3: Emerging Brands (13-20 - ~18% of revenue)
  { name: 'EcoHome', slug: 'ecohome', description: 'Home & living products', color: '#059669', category: 'Home', tier: 3, baseRevenue: 1200000 },
  { name: 'StyleMate', slug: 'stylemate', description: 'Fashion & apparel', color: '#7C3AED', category: 'Fashion', tier: 3, baseRevenue: 1100000 },
  { name: 'CleanFresh', slug: 'cleanfresh', description: 'Household essentials', color: '#0EA5E9', category: 'Household', tier: 3, baseRevenue: 1000000 },
  { name: 'NutriMax', slug: 'nutrimax', description: 'Dietary supplements', color: '#D946EF', category: 'Supplements', tier: 3, baseRevenue: 950000 },
  { name: 'SportX', slug: 'sportx', description: 'Sports & outdoor gear', color: '#DC2626', category: 'Sports', tier: 3, baseRevenue: 900000 },
  { name: 'HerbalPlus', slug: 'herbalplus', description: 'Traditional wellness products', color: '#16A34A', category: 'Traditional', tier: 3, baseRevenue: 850000 },
  { name: 'ModaStyle', slug: 'modastyle', description: 'Fashion & apparel', color: '#9333EA', category: 'Fashion', tier: 3, baseRevenue: 800000 },
  { name: 'KitchenPro', slug: 'kitchenpro', description: 'Kitchen & dining', color: '#EA580C', category: 'Kitchen', tier: 3, baseRevenue: 750000 },
  
  // Tier 4: Niche Brands (21-27 - ~7% of revenue)
  { name: 'ArtisanCraft', slug: 'artisancraft', description: 'Artisan & handmade goods', color: '#CA8A04', category: 'Handmade', tier: 4, baseRevenue: 350000 },
  { name: 'GreenEarth', slug: 'greenearth', description: 'Eco-friendly products', color: '#15803D', category: 'Eco', tier: 4, baseRevenue: 320000 },
  { name: 'TravelMate', slug: 'travelmate', description: 'Travel accessories', color: '#0891B2', category: 'Travel', tier: 4, baseRevenue: 280000 },
  { name: 'MusicVibe', slug: 'musicvibe', description: 'Lifestyle products', color: '#7C2D12', category: 'Lifestyle', tier: 4, baseRevenue: 250000 },
  { name: 'BookWorm', slug: 'bookworm', description: 'Educational materials', color: '#1E40AF', category: 'Education', tier: 4, baseRevenue: 220000 },
  { name: 'GiftJoy', slug: 'giftjoy', description: 'Gifts & specialty items', color: '#BE185D', category: 'Gifts', tier: 4, baseRevenue: 200000 },
  { name: 'SpecialtyPlus', slug: 'specialtyplus', description: 'Premium & luxury items', color: '#B91C1C', category: 'Premium', tier: 4, baseRevenue: 180000 },
]

// Sales Platforms
const platforms = [
  { name: 'Shopee', type: 'SHOPEE', description: 'Southeast Asia marketplace', share: 0.35 },
  { name: 'Lazada', type: 'LAZADA', description: 'Southeast Asia marketplace', share: 0.25 },
  { name: 'Shopify', type: 'SHOPIFY', description: 'E-commerce platform', share: 0.15 },
  { name: 'TikTok Shop', type: 'TIKTOK_SHOP', description: 'Social commerce', share: 0.15 },
  { name: 'Facebook', type: 'FACEBOOK', description: 'Social media sales', share: 0.05 },
  { name: 'Retail', type: 'RETAIL', description: 'Physical stores', share: 0.05 },
]

// Product templates by category
const productTemplates: Record<string, string[]> = {
  'Skincare': ['Face Serum', 'Moisturizer', 'Cleanser', 'Sunscreen', 'Eye Cream', 'Toner', 'Face Mask'],
  'Health': ['Multivitamins', 'Omega-3', 'Probiotics', 'Collagen', 'Vitamin C', 'Immune Boost'],
  'Cosmetics': ['Lipstick', 'Foundation', 'Mascara', 'Eyeshadow Palette', 'Concealer', 'Blush'],
  'Wellness': ['Essential Oils', 'Diffuser', 'Yoga Mat', 'Meditation Kit', 'Sleep Aid'],
  'Haircare': ['Shampoo', 'Conditioner', 'Hair Mask', 'Hair Serum', 'Styling Gel'],
  'Fitness': ['Resistance Bands', 'Protein Powder', 'Fitness Tracker', 'Workout Set'],
  'Organic': ['Organic Tea', 'Natural Supplements', 'Organic Snacks', 'Green Superfood'],
  'Gadgets': ['Phone Case', 'Wireless Charger', 'Power Bank', 'Earbuds Case'],
  'Baby Care': ['Baby Lotion', 'Diaper Cream', 'Baby Wash', 'Baby Powder'],
  'Pet Care': ['Pet Food', 'Pet Treats', 'Pet Grooming Kit', 'Pet Toys'],
  'Home': ['Candles', 'Storage Boxes', 'Decor Items', 'Bedding Sets'],
  'Fashion': ['T-Shirt', 'Dress', 'Pants', 'Accessories Set'],
  'Household': ['Cleaning Set', 'Laundry Detergent', 'Air Freshener'],
  'Supplements': ['Whey Protein', 'BCAA', 'Pre-Workout', 'Creatine'],
  'Sports': ['Running Shoes', 'Sports Apparel', 'Sports Accessories'],
  'Traditional': ['Herbal Tea', 'Traditional Remedy', 'Natural Healing'],
  'Kitchen': ['Cookware Set', 'Kitchen Tools', 'Storage Containers'],
  'Handmade': ['Handcrafted Items', 'Artisan Products', 'Custom Gifts'],
  'Eco': ['Reusable Bags', 'Eco-Friendly Products', 'Sustainable Items'],
  'Travel': ['Travel Pillow', 'Luggage Set', 'Travel Accessories'],
  'Lifestyle': ['Lifestyle Gadgets', 'Personal Care Items'],
  'Education': ['Books', 'Educational Materials', 'Learning Tools'],
  'Gifts': ['Gift Sets', 'Specialty Items', 'Premium Gifts'],
  'Premium': ['Luxury Items', 'Premium Products', 'Exclusive Sets'],
}

// Random helpers
function randomBetween(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ctg.com' },
    update: {},
    create: {
      email: 'admin@ctg.com',
      name: 'CTG Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  })
  console.log('✅ Created admin user:', admin.email)

  // Create demo users for each role
  const managerPassword = await bcrypt.hash('manager123', 12)
  const viewerPassword = await bcrypt.hash('viewer123', 12)

  const manager = await prisma.user.upsert({
    where: { email: 'manager@ctg.com' },
    update: {},
    create: {
      email: 'manager@ctg.com',
      name: 'Brand Manager',
      password: managerPassword,
      role: 'MANAGER',
      isActive: true,
    },
  })

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@ctg.com' },
    update: {},
    create: {
      email: 'viewer@ctg.com',
      name: 'Data Viewer',
      password: viewerPassword,
      role: 'VIEWER',
      isActive: true,
    },
  })
  console.log('✅ Created demo users')

  // Create platforms
  const platformRecords = []
  for (const platform of platforms) {
    let record = await prisma.platform.findFirst({
      where: { name: platform.name }
    })
    if (!record) {
      record = await prisma.platform.create({
        data: {
          name: platform.name,
          type: platform.type as any,
          description: platform.description,
          isActive: true,
        },
      })
    }
    platformRecords.push({ ...record, share: platform.share })
  }
  console.log('✅ Created', platforms.length, 'platforms')

  // Create brands
  const brandRecords = []
  for (const brand of brands) {
    const record = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { description: brand.description, color: brand.color },
      create: {
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        color: brand.color,
        isActive: true,
      },
    })
    brandRecords.push({ ...record, tier: brand.tier, baseRevenue: brand.baseRevenue, category: brand.category })
  }
  console.log('✅ Created', brands.length, 'brands')

  // Assign manager to first 5 brands (Tier 1)
  for (let i = 0; i < 5; i++) {
    await prisma.userBrand.upsert({
      where: {
        userId_brandId: {
          userId: manager.id,
          brandId: brandRecords[i].id,
        },
      },
      update: {},
      create: {
        userId: manager.id,
        brandId: brandRecords[i].id,
        role: 'MANAGER',
      },
    })
  }

  // Assign admin to all brands
  for (const brand of brandRecords) {
    await prisma.userBrand.upsert({
      where: {
        userId_brandId: {
          userId: admin.id,
          brandId: brand.id,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        brandId: brand.id,
        role: 'ADMIN',
      },
    })
  }
  console.log('✅ Assigned users to brands')

  // Create products for each brand
  console.log('📦 Creating products...')
  const productRecords = []
  for (const brand of brandRecords) {
    const templates = productTemplates[brand.category] || productTemplates['Home']
    const numProducts = Math.min(templates.length, Math.floor(randomBetween(5, 12)))
    
    for (let i = 0; i < numProducts; i++) {
      const template = templates[i % templates.length]
      const sku = `${brand.slug.toUpperCase()}-${String(i + 1).padStart(3, '0')}`
      const cost = randomBetween(15, 80)
      
      const product = await prisma.product.create({
        data: {
          sku,
          name: `${brand.name} ${template}`,
          category: brand.category,
          cost,
          brandId: brand.id,
          isActive: true,
        },
      })
      productRecords.push({ ...product, brandTier: brand.tier })
    }
  }
  console.log('✅ Created', productRecords.length, 'products')

  // Create sales data for last 90 days
  console.log('💰 Creating sales data (this may take a moment)...')
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 90)
  
  let salesCount = 0
  const batchSize = 100
  let batch: any[] = []
  
  for (const brand of brandRecords) {
    const brandProducts = productRecords.filter(p => p.brandId === brand.id)
    if (brandProducts.length === 0) continue
    
    // Daily orders based on tier
    const dailyOrders = brand.tier === 1 ? randomBetween(80, 150) :
                        brand.tier === 2 ? randomBetween(30, 60) :
                        brand.tier === 3 ? randomBetween(10, 25) :
                        randomBetween(3, 8)
    
    for (let d = 0; d < 90; d++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + d)
      
      // Weekend boost
      const dayOfWeek = date.getDay()
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.4 : 1.0
      
      const ordersForDay = Math.round(dailyOrders * weekendMultiplier * randomBetween(0.7, 1.3))
      
      for (let o = 0; o < ordersForDay; o++) {
        const product = randomItem(brandProducts)
        const platform = randomItem(platformRecords)
        const quantity = Math.floor(randomBetween(1, 4))
        const unitPrice = randomBetween(30, 200)
        const totalAmount = unitPrice * quantity
        const shippingCost = randomBetween(5, 15)
        const discount = randomBetween(0, totalAmount * 0.1)
        const netAmount = totalAmount - discount + shippingCost
        const costOfGoods = product.cost * quantity
        const grossProfit = netAmount - costOfGoods
        
        batch.push({
          orderId: `ORD-${date.toISOString().split('T')[0]}-${brand.slug}-${salesCount}`,
          transactionDate: date,
          status: 'completed',
          quantity,
          unitPrice,
          totalAmount,
          discount,
          shippingCost,
          netAmount,
          currency: 'MYR',
          costOfGoods,
          grossProfit,
          isNewCustomer: Math.random() > 0.7,
          platformId: platform.id,
          brandId: brand.id,
          productId: product.id,
        })
        
        salesCount++
        
        if (batch.length >= batchSize) {
          await prisma.sale.createMany({ data: batch })
          batch = []
        }
      }
    }
  }
  
  // Insert remaining batch
  if (batch.length > 0) {
    await prisma.sale.createMany({ data: batch })
  }
  console.log('✅ Created', salesCount, 'sales records')

  // Create ad campaigns
  console.log('📢 Creating ad campaigns...')
  const adPlatforms = ['FACEBOOK_ADS', 'SHOPEE_ADS', 'LAZADA_ADS', 'TIKTOK_ADS'] as const
  let campaignCount = 0
  
  for (const brand of brandRecords) {
    // Number of campaigns based on tier
    const numCampaigns = brand.tier === 1 ? randomBetween(5, 10) :
                         brand.tier === 2 ? randomBetween(3, 6) :
                         randomBetween(1, 3)
    
    for (let c = 0; c < numCampaigns; c++) {
      const adPlatform = randomItem([...adPlatforms])
      const budget = brand.tier === 1 ? randomBetween(5000, 20000) :
                     brand.tier === 2 ? randomBetween(2000, 8000) :
                     randomBetween(500, 3000)
      const budgetSpent = budget * randomBetween(0.5, 1.0)
      const impressions = Math.round(budgetSpent * randomBetween(20, 50))
      const clicks = Math.round(impressions * randomBetween(0.01, 0.05))
      const conversions = Math.round(clicks * randomBetween(0.02, 0.08))
      const conversionValue = conversions * randomBetween(50, 150)
      
      await prisma.adCampaign.create({
        data: {
          campaignId: `CAMP-${brand.slug}-${c + 1}`,
          name: `${brand.name} ${adPlatform.replace('_ADS', '')} Campaign ${c + 1}`,
          adPlatform: adPlatform as any,
          startDate: randomDate(startDate, endDate),
          budget,
          budgetSpent,
          impressions,
          clicks,
          conversions,
          conversionValue,
          ctr: clicks / impressions * 100,
          cpa: budgetSpent / Math.max(conversions, 1),
          roas: conversionValue / budgetSpent,
          cpm: budgetSpent / (impressions / 1000),
          cpc: budgetSpent / Math.max(clicks, 1),
          brandId: brand.id,
          status: 'active',
        },
      })
      campaignCount++
    }
  }
  console.log('✅ Created', campaignCount, 'ad campaigns')

  // Create daily metrics
  console.log('📊 Creating daily metrics...')
  let metricsCount = 0
  batch = []
  
  for (let d = 0; d < 90; d++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + d)
    
    const dayOfWeek = date.getDay()
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0
    
    // Aggregate metrics for each day
    const dailyRevenue = Math.round(273972 * weekendMultiplier * randomBetween(0.8, 1.2))
    const dailyOrders = Math.round(dailyRevenue / 85)
    const dailyProfit = Math.round(dailyRevenue * randomBetween(0.22, 0.28))
    const dailyAdSpend = Math.round(dailyRevenue * randomBetween(0.06, 0.10))
    
    batch.push({
      date,
      revenue: dailyRevenue,
      orders: dailyOrders,
      unitsSold: Math.round(dailyOrders * randomBetween(2, 3)),
      newCustomers: Math.round(dailyOrders * 0.7),
      returningCustomers: Math.round(dailyOrders * 0.3),
      totalDiscount: Math.round(dailyRevenue * 0.05),
      discountRate: 5,
      grossProfit: dailyProfit,
      netProfit: Math.round(dailyProfit * 0.7),
      margin: randomBetween(22, 28),
      adSpend: dailyAdSpend,
      adRevenue: Math.round(dailyAdSpend * 4.5),
      roas: randomBetween(3.5, 5.5),
    })
    
    metricsCount++
    
    if (batch.length >= batchSize) {
      await prisma.dailyMetric.createMany({ data: batch })
      batch = []
    }
  }
  
  if (batch.length > 0) {
    await prisma.dailyMetric.createMany({ data: batch })
  }
  console.log('✅ Created', metricsCount, 'daily metrics')

  // Create system settings
  await prisma.systemSetting.upsert({
    where: { key: 'company_name' },
    update: {},
    create: {
      key: 'company_name',
      value: 'CTG (Consumer Trading Group)',
      description: 'Company name',
    },
  })

  await prisma.systemSetting.upsert({
    where: { key: 'currency' },
    update: {},
    create: {
      key: 'currency',
      value: 'MYR',
      description: 'Default currency',
    },
  })

  await prisma.systemSetting.upsert({
    where: { key: 'currency_symbol' },
    update: {},
    create: {
      key: 'currency_symbol',
      value: 'RM',
      description: 'Currency symbol',
    },
  })
  console.log('✅ Created system settings')

  console.log('\n🎉 Seed completed!')
  console.log('\n📋 Summary:')
  console.log(`   - ${brands.length} brands`)
  console.log(`   - ${platforms.length} platforms`)
  console.log(`   - ${productRecords.length} products`)
  console.log(`   - ${salesCount} sales records`)
  console.log(`   - ${campaignCount} ad campaigns`)
  console.log(`   - ${metricsCount} daily metrics`)
  console.log('\n📋 Login Credentials:')
  console.log('   Admin:    admin@ctg.com / admin123')
  console.log('   Manager:  manager@ctg.com / manager123')
  console.log('   Viewer:   viewer@ctg.com / viewer123')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
