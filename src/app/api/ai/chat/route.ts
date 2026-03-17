import { NextRequest, NextResponse } from 'next/server';

// System prompt for the DataHub AI assistant
const SYSTEM_PROMPT = `You are the AI Data Assistant for DataHub by CTG, a business intelligence platform for a multi-brand health, beauty, and wellness ecommerce company.

You help executives and analysts understand their business data by answering questions about:
- Revenue metrics (total, by brand, by platform, by product)
- Sales metrics (orders, units sold, AOV, conversion rate)
- Marketing performance (ad spend, ROAS, CPA, CTR)
- Profit metrics (gross profit, net profit, margins)
- Budget tracking and forecasting
- Platform and brand comparisons

Current Business Context:
- The company operates 5 brands: GlowSkin (skincare), VitaWell (supplements), PureBeauty (cosmetics), ZenLife (wellness), HairLux (hair care)
- Sales channels: Shopee, Lazada, Shopify, TikTok Shop, Facebook, Retail
- Ad platforms: Facebook Ads, TikTok Ads, Google Ads

Guidelines:
1. Be concise and executive-friendly
2. When relevant, provide specific numbers and percentages
3. Highlight trends and insights
4. If asked about specific data, provide realistic insights based on the context
5. Format responses clearly with bullet points when appropriate
6. Always maintain a professional, business-focused tone`;

// Simple random number generator (no memory allocation)
const rand = (min: number, max: number) => min + Math.random() * (max - min);

// Sample intelligent responses based on query patterns (lightweight - no data generation)
function getSampleResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Revenue related queries
  if (lowerMessage.includes('revenue') || lowerMessage.includes('sales')) {
    if (lowerMessage.includes('yesterday') || lowerMessage.includes('today')) {
      return `📊 **Today's Revenue Performance**

Revenue today: **$${rand(85, 125).toFixed(0)}k**
vs Yesterday: **+${rand(2, 12).toFixed(1)}%**

**Key highlights:**
• GlowSkin leading with $${rand(25, 35).toFixed(0)}k in sales
• Shopee channel performing strongly
• Conversion rate holding at 3.8%`;
    }
    
    return `📊 **Revenue Overview (Last 30 Days)**

Total Revenue: **$${rand(2.8, 3.5).toFixed(2)}M**

**By Brand:**
• GlowSkin: $${rand(0.75, 0.95).toFixed(2)}M (28%)
• VitaWell: $${rand(0.65, 0.85).toFixed(2)}M (25%)
• PureBeauty: $${rand(0.58, 0.75).toFixed(2)}M (22%)
• ZenLife: $${rand(0.38, 0.52).toFixed(2)}M (15%)
• HairLux: $${rand(0.25, 0.38).toFixed(2)}M (10%)

**Growth trend:** +${rand(10, 18).toFixed(1)}% vs previous period`;
  }
  
  // ROAS queries
  if (lowerMessage.includes('roas') || lowerMessage.includes('return on ad')) {
    return `📈 **ROAS Performance Analysis**

Overall ROAS: **${rand(4.2, 5.2).toFixed(2)}x**

**By Platform:**
• TikTok Ads: 5.1x ⬆️ (best performer)
• Facebook Ads: 4.8x (stable)
• Google Ads: 4.3x (improving)

**By Brand:**
• VitaWell: 5.2x (excellent)
• GlowSkin: 4.9x (good)
• PureBeauty: 4.6x (on target)

**Recommendation:** Consider shifting 15% of Facebook budget to TikTok for better returns.`;
  }
  
  // Brand comparison
  if (lowerMessage.includes('brand') && (lowerMessage.includes('compare') || lowerMessage.includes('best') || lowerMessage.includes('top'))) {
    return `🏆 **Brand Performance Ranking**

**Top Performer: GlowSkin**
• Revenue: $${rand(0.75, 0.95).toFixed(2)}M
• Growth: +${rand(12, 22).toFixed(1)}%
• ROAS: 4.9x
• Best selling: Vitamin C Serum

**Runner-up: VitaWell**
• Revenue: $${rand(0.65, 0.85).toFixed(2)}M
• Growth: +${rand(8, 15).toFixed(1)}%
• ROAS: 5.2x (highest!)
• Best selling: Multivitamin

**Needs Attention: HairLux**
• Revenue: $${rand(0.25, 0.38).toFixed(2)}M
• Growth: -${rand(3, 8).toFixed(1)}%
• Recommendation: Review product lineup and ad creatives`;
  }
  
  // Platform queries
  if (lowerMessage.includes('shopee') || lowerMessage.includes('lazada') || lowerMessage.includes('shopify') || lowerMessage.includes('tiktok') || lowerMessage.includes('platform')) {
    return `🏪 **Platform Performance Comparison**

**Shopee** (Market Leader)
• Revenue: $${rand(0.88, 1.1).toFixed(2)}M
• Orders: ${Math.round(rand(8, 12))}k
• Growth: +${rand(12, 17).toFixed(1)}%

**TikTok Shop** (Fastest Growing)
• Revenue: $${rand(0.4, 0.55).toFixed(2)}M
• Growth: +${rand(35, 50).toFixed(1)}% 🚀
• Conversion: 4.2% (highest)

**Shopify** (Own Channel)
• Revenue: $${rand(0.48, 0.65).toFixed(2)}M
• AOV: $${Math.round(rand(140, 160))} (highest)
• Margin: 35% (best margin)

**Recommendation:** Scale TikTok Shop while maintaining Shopee presence.`;
  }
  
  // Product queries
  if (lowerMessage.includes('product') || lowerMessage.includes('worst') || lowerMessage.includes('best selling')) {
    if (lowerMessage.includes('worst') || lowerMessage.includes('underperform')) {
      return `⚠️ **Underperforming Products**

**HairLux Growth Serum**
• Revenue: $${Math.round(rand(50, 70))}k
• Units sold: ${Math.round(rand(1800, 2300))}
• Stock: 45 units (low)
• Growth: -${rand(5, 10).toFixed(1)}%

**Issues identified:**
• Low ad engagement (CTR: 1.8%)
• High competition in hair care segment
• Stock running low

**Recommendations:**
1. Create bundle deals with ZenLife products
2. Refresh ad creatives
3. Consider promotional pricing`;
    }
    
    return `📦 **Top Products This Month**

**1. GlowSkin Vitamin C Serum**
• Revenue: $${Math.round(rand(120, 150))}k
• Units: ${Math.round(rand(4200, 4700))}
• Margin: 32%

**2. VitaWell Multivitamin**
• Revenue: $${Math.round(rand(100, 125))}k
• Units: ${Math.round(rand(3800, 4200))}
• Margin: 30%

**3. PureBeauty Lip Gloss Set**
• Revenue: $${Math.round(rand(85, 105))}k
• Units: ${Math.round(rand(3200, 3500))}
• Margin: 28%

**Trend:** Skincare products seeing +18% growth this quarter.`;
  }
  
  // Budget queries
  if (lowerMessage.includes('budget') || lowerMessage.includes('spend') || lowerMessage.includes('forecast')) {
    return `💰 **Budget & Forecast Summary**

**Monthly Budget Status:**
• Total Allocated: $${rand(4.5, 5.5).toFixed(2)}M
• Spent: $${rand(2.8, 3.2).toFixed(2)}M (${rand(55, 65).toFixed(0)}%)
• Remaining: $${rand(1.8, 2.2).toFixed(2)}M

**Q3 Forecast:**
• Revenue Target: $${rand(8.5, 9.5).toFixed(1)}M
• Current Pace: ${Math.round(rand(95, 105))}%
• Projected: On track

**Marketing Spend:**
• Facebook: $${Math.round(rand(200, 250))}k
• TikTok: $${Math.round(rand(150, 190))}k
• Google: $${Math.round(rand(80, 110))}k`;
  }
  
  // Profit queries
  if (lowerMessage.includes('profit') || lowerMessage.includes('margin')) {
    return `💵 **Profit Analysis**

**Profit Metrics (Last 30 Days):**
• Gross Profit: $${rand(0.85, 1.1).toFixed(2)}M
• Net Profit: $${rand(0.52, 0.72).toFixed(2)}M
• Gross Margin: ${rand(28, 35).toFixed(1)}%
• Net Margin: ${rand(18, 23).toFixed(1)}%

**By Brand (Net Margin):**
• GlowSkin: 32% ⭐
• VitaWell: 30%
• PureBeauty: 28%
• ZenLife: 26%
• HairLux: 22%

**Trend:** Margins improved +${rand(1, 3).toFixed(1)}% from optimization of ad spend.`;
  }
  
  // Default helpful response
  return `I can help you analyze your business data! Here are some things you can ask:

📊 **Revenue & Sales**
• "What was our revenue yesterday?"
• "Show me sales by brand"

📈 **Marketing Performance**
• "What's our ROAS?"
• "Compare ad platforms"

🏆 **Comparisons**
• "Which brand performs best?"
• "Compare Shopee vs Shopify"

💰 **Budget & Forecast**
• "What's our budget status?"
• "Show me profit margins"

📦 **Products**
• "What are our top products?"
• "Which products are underperforming?"

**Current highlights:**
• Total Revenue: $${rand(2.8, 3.5).toFixed(2)}M
• Overall ROAS: ${rand(4.2, 5.2).toFixed(2)}x
• Top Brand: GlowSkin (+${Math.round(rand(12, 20))}%)`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Use sample responses directly (no external AI SDK to reduce memory)
    const response = getSampleResponse(message);
    
    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    
    // Return a simple fallback response
    return NextResponse.json({
      success: true,
      response: getSampleResponse('default'),
    });
  }
}
