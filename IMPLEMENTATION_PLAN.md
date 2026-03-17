# DataHub by CTG - Implementation Plan

## Overview
Converting from demo to production-ready multi-brand e-commerce analytics platform.

---

## Phase 1: Database & Authentication

### Database Schema
- Users (with roles: ADMIN, MANAGER, VIEWER)
- Brands (27 brands management)
- Platform Connections (API credentials)
- Orders & Sales Data
- Products & Inventory
- Ad Campaigns & Performance
- Sync Logs

### Authentication
- NextAuth.js v4 with credentials provider
- Role-based access control
- Brand-level permissions

### Database Migration
- SQLite → PostgreSQL (production ready)
- Prisma ORM for type-safe queries

---

## Phase 2: Brand Management

### Features
- Create/Edit/Delete brands
- Assign users to brands
- Brand-specific dashboards
- Brand-level permissions

---

## Phase 3: Platform Integrations

### E-commerce Platforms
| Platform | API | Auth Method | Data Available |
|----------|-----|-------------|----------------|
| Shopee | Open API v2 | OAuth 2.0 | Orders, Products, Inventory |
| Lazada | Open Platform | OAuth 2.0 | Orders, Products, Inventory |
| Shopify | Storefront API | API Key/Token | Orders, Products, Inventory |
| TikTok Shop | Open API | OAuth 2.0 | Orders, Products, Inventory |

### Ads Platforms
| Platform | API | Auth Method | Data Available |
|----------|-----|-------------|----------------|
| Facebook Ads | Marketing API | OAuth 2.0 | Campaigns, Spend, ROAS |
| Shopee Ads | Shopee Ads API | OAuth 2.0 | Campaigns, Spend, ROAS |
| Lazada Ads | Sponsored Solutions | OAuth 2.0 | Campaigns, Spend, ROAS |
| TikTok Ads | Marketing API | OAuth 2.0 | Campaigns, Spend, ROAS |

---

## Phase 4: Data Sync Engine

### Real-time Sync Options
1. **Webhooks** (Instant - Recommended where available)
   - Shopify: Order create/update webhooks
   - Shopee: Push notifications for orders
   
2. **Polling** (Scheduled - For platforms without webhooks)
   - Every 1 minute: Order status updates
   - Every 5 minutes: Product inventory
   - Every 15 minutes: Ad performance data

### Sync Architecture
```
Cron Job / Queue System
    ↓
API Fetchers (per platform)
    ↓
Data Normalizer
    ↓
Database Storage
    ↓
WebSocket → Real-time UI Updates
```

---

## Phase 5: Real Dashboard Data

### Replace Mock Data With
- Real-time order counts
- Live revenue from all platforms
- Actual ad spend & ROAS
- Real inventory levels
- Accurate forecasting

---

## Tech Stack

### Backend
- Next.js 16 API Routes
- Prisma ORM
- PostgreSQL (Supabase/Neon - Free tier)
- NextAuth.js v4

### Real-time
- WebSocket/Socket.io for live updates
- Server-Sent Events (SSE) alternative

### Security
- Encrypted API credentials (AES-256)
- Role-based access control
- Rate limiting per platform
- Secure credential storage

---

## Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Database & Auth | 2-3 days | None |
| Phase 2: Brand Management | 1-2 days | Phase 1 |
| Phase 3: Platform Integrations | 3-5 days | Phase 1, 2 |
| Phase 4: Ads Integrations | 2-3 days | Phase 3 |
| Phase 5: Data Sync Engine | 2-3 days | Phase 3, 4 |
| Phase 6: Real Dashboard Data | 2-3 days | Phase 5 |
| Phase 7: Orders & Inventory | 2-3 days | Phase 6 |
| Phase 8: Forecasting | 1-2 days | Phase 6 |

**Total: ~15-24 days of development**

---

## Getting Started

To proceed, we need:

1. **PostgreSQL Database** - Choose one:
   - [ ] Supabase (recommended - free 500MB)
   - [ ] Neon (free 0.5GB)
   - [ ] Railway (free $5 credit/month)
   - [ ] Your own PostgreSQL server

2. **Platform API Credentials**:
   - [ ] Shopee Seller Account + API access
   - [ ] Lazada Seller Account + API access
   - [ ] Shopify Store + API access
   - [ ] TikTok Shop Seller Account
   - [ ] Facebook Business Manager + Ads API
   - [ ] TikTok Ads Manager access

3. **Initial Setup**:
   - [ ] Create Supabase/Neon account
   - [ ] Get database connection string
   - [ ] We'll handle the rest!

---

## Next Steps

Let me know when you're ready to proceed with Phase 1, and I'll:
1. Set up the Prisma schema for PostgreSQL
2. Implement NextAuth.js authentication
3. Create the role-based access system
4. Set up the brand management system
