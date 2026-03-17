# DataHub by CTG

A modern, AI-powered Business Intelligence (BI) dashboard for multi-brand e-commerce companies. Track revenue, marketing performance, and financial metrics in real-time across 27+ brands.

![Version](https://img.shields.io/badge/version-2.3.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-Private-red)

## ✨ Features

### 📊 Executive Dashboard
- Real-time KPIs: Revenue, Orders, Profit, Ad Spend, ROAS
- Brand and Platform performance comparison
- Trend analysis with sparklines and charts
- Live order feed with recent transactions

### 💰 Financial Dashboard
- Revenue breakdown by brand and platform
- Gross margin and net profit analysis
- Daily, weekly, and monthly trends
- Currency support (MYR default)

### 📈 Marketing Dashboard
- Ad spend tracking across platforms
- ROAS analysis by campaign
- Conversion metrics and CPA tracking
- Facebook, Shopee, Lazada, TikTok Ads integration

### 🏷️ Brand & Platform Analytics
- Per-brand performance metrics
- Platform comparison (Shopee, Lazada, Shopify, TikTok Shop)
- Growth trends and market share analysis

### 📱 Product Performance
- Top-selling products
- Inventory tracking
- SKU-level analytics

### 🔮 Forecast & Budget
- Revenue forecasting
- Budget vs. actual tracking
- Scenario modeling

### 🔐 Security & Access Control
- Role-based access (Super Admin, Admin, Manager, Viewer)
- User management with brand-level permissions
- Audit logging for compliance
- Secure API integrations

### 🤖 AI Assistant
- Natural language queries for data insights
- Automated report generation
- Intelligent alerts and recommendations

## 🚀 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | PostgreSQL (Prisma ORM) |
| Auth | NextAuth.js v4 |
| Charts | Recharts |
| State | Zustand + TanStack Query |
| Animations | Framer Motion |
| Icons | Lucide React |

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/datahub-ctg.git
cd datahub-ctg

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client and seed database
npm run db:generate
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/datahub?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:password@host:5432/datahub?sslmode=require"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# AI Features (Optional)
Z_AI_API_KEY="your-api-key-here"
```

Generate a secret: `openssl rand -base64 32`

## 🚀 Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/datahub-ctg)

### Option 2: Manual Deploy

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/datahub-ctg.git
   git push -u origin main
   ```

2. **Create Vercel Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `DATABASE_URL` - Your PostgreSQL connection string
     - `DIRECT_DATABASE_URL` - Same as above (for Prisma)
     - `NEXTAUTH_SECRET` - Random secret key
     - `NEXTAUTH_URL` - Your Vercel URL (e.g., `https://datahub-ctg.vercel.app`)

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically run `prisma generate` and build your app

### Setting Up PostgreSQL Database

For Vercel deployment, use one of these PostgreSQL providers:

| Provider | Free Tier | Notes |
|----------|-----------|-------|
| [Vercel Postgres](https://vercel.com/storage/postgres) | ✅ | Easiest integration |
| [Neon](https://neon.tech) | ✅ | Serverless PostgreSQL |
| [Supabase](https://supabase.com) | ✅ | PostgreSQL + extras |
| [PlanetScale](https://planetscale.com) | ✅ | MySQL-compatible |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # NextAuth.js endpoints
│   │   ├── dashboard/     # Dashboard data API
│   │   ├── users/         # User management API
│   │   └── integrations/  # Integration management
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Dashboard pages
│   └── page.tsx           # Main dashboard entry
├── components/
│   ├── ui/                # shadcn/ui components
│   └── dashboard/         # Dashboard-specific components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
│   ├── auth.ts            # NextAuth configuration
│   ├── db.ts              # Prisma client
│   └── store.ts           # Zustand store
└── types/                 # TypeScript type definitions

prisma/
├── schema.prisma          # Database schema
└── seed.ts               # Database seeding
```

## 🔑 Default Login Credentials

After seeding, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@ctg.com | admin123 |
| Manager | manager@ctg.com | manager123 |
| Viewer | viewer@ctg.com | viewer123 |

⚠️ **Change these passwords in production!**

## 📊 Supported Integrations

| Platform | Type | Status |
|----------|------|--------|
| Shopee | E-commerce | ✅ Ready |
| Lazada | E-commerce | ✅ Ready |
| Shopify | E-commerce | ✅ Ready |
| TikTok Shop | E-commerce | ✅ Ready |
| Facebook Ads | Advertising | ✅ Ready |
| Google Ads | Advertising | ✅ Ready |
| TikTok Ads | Advertising | ✅ Ready |

## 🤝 Contributing

This is a private project. Contact the CTG team for contribution guidelines.

## 📄 License

Private - All rights reserved.

---

Built with ❤️ by the CTG Team.

**Version:** 2.3.0
