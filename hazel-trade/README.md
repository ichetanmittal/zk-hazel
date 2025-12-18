# Hazel Trade - Zero-Knowledge Commodity Trading Platform

A Next.js-based platform that solves the "trust deadlock" in commodity trading using Zero-Knowledge verification.

## Overview

Hazel Trade enables secure commodity trading by allowing:
- **Buyers** to prove they have funds (POF) without exposing bank details
- **Sellers** to prove they have product (POP) without revealing tank locations
- **Brokers** to facilitate deals and earn commissions (IMFPA)

## Features

### Core Functionality
- ✅ Role-based authentication (Buyer, Seller, Broker)
- ✅ Company verification (KYB)
- ✅ Zero-Knowledge proof verification (placeholder for now)
- ✅ 12-step standardized trading workflow
- ✅ Progressive Data Room unlocking
- ✅ Document management with Supabase Storage
- ✅ Commission tracking (IMFPA)
- ✅ Invite system for deals
- ✅ Real-time notifications

### User Roles

#### Broker
- Create and manage deals
- Invite buyers and sellers
- Monitor verification status
- Track commissions
- Access all deal documents

#### Buyer
- Upload Proof of Funds (POF)
  - MT799, MT760, BCL, MT199, Financial Statements
- ZK verification without exposing sensitive data
- Access Data Room after match
- Track deal progress through 12 steps
- Upload required documents at each step

#### Seller
- Upload Proof of Product (POP)
  - TSA, SGS Reports, ATSC, Certificates
- Tank location stays private with ZK verification
- Access Data Room after match
- Manage deal workflow
- Secure document sharing

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Vercel account (for deployment)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hazel-trade.git
cd hazel-trade
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the database migration:
   - Go to Supabase Dashboard → SQL Editor
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Execute the SQL

3. Enable Row Level Security (RLS) policies (already in migration)

4. Set up Storage bucket:
   - Go to Storage → Create bucket named `documents`
   - Set it to private
   - Add RLS policies for documents

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get these values from:
- Supabase Dashboard → Project Settings → API

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
hazel-trade/
├── app/
│   ├── auth/              # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/         # Dashboard pages
│   │   ├── deals/         # Deal management
│   │   ├── data-room/     # Document data room
│   │   └── page.tsx       # Main dashboard
│   ├── invite/            # Invite link handling
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── auth/              # Auth components
│   ├── dashboard/         # Dashboard components
│   ├── deals/             # Deal components
│   └── data-room/         # Data room components
├── lib/
│   ├── supabase/          # Supabase client config
│   │   ├── client.ts      # Browser client
│   │   ├── server.ts      # Server client
│   │   └── middleware.ts  # Auth middleware
│   └── utils/             # Utility functions
│       ├── cn.ts          # Class name utility
│       └── constants.ts   # App constants
├── types/
│   └── database.types.ts  # TypeScript types
├── supabase/
│   ├── migrations/        # Database migrations
│   └── seed/              # Seed data
└── middleware.ts          # Next.js middleware
```

## Database Schema

### Main Tables

- **users** - User accounts with role (BUYER/SELLER/BROKER)
- **companies** - Company information and KYB verification
- **deals** - Deal records with product details
- **deal_steps** - 12-step workflow tracking
- **documents** - Document storage with ZK verification
- **commissions** - IMFPA commission tracking
- **notifications** - In-app notifications
- **invites** - Deal invitation system

## 12-Step Trading Workflow

### Phase 1: PRE-TRADE
1. NCNDA / IMFPA
2. ICPO (Irrevocable Corporate Purchase Order)
3. Seller's SCO (Soft Corporate Offer)
4. Buyer Signs SCO

### Phase 2: AGREEMENT
5. SPA Draft (Sales & Purchase Agreement)
6. SPA Countersign

### Phase 3: VERIFICATION
7. Bank Readiness Exchange
8. DTA (Dip Test Authorization)
9. Dip Test / Q&Q Inspection

### Phase 4: SETTLEMENT
10. Payment & Title Transfer
11. Lift / Delivery
12. Commission Disbursement

## Key Features Detail

### Zero-Knowledge Verification

Currently implements a placeholder ZK verification system. In production, this would:
- Generate cryptographic proofs of document authenticity
- Verify proofs without exposing underlying data
- Publish verification status on-chain (optional)

### Data Room

Progressive unlocking based on deal status:
- **Agreements**: Unlocked from start
- **POF**: Unlocked after buyer verification
- **POP**: Unlocked after seller verification
- **Contracts**: Unlocked after SPA signed
- **Inspection**: Unlocked after DTA issued
- **Payment**: Unlocked after Q&Q passed

### Document Visibility

Before match:
- Buyer sees: Own POF only
- Seller sees: Own POP only
- Broker sees: All documents

After match:
- Buyer sees: Own POF + Seller's POP + Shared docs
- Seller sees: Own POP + Buyer's POF + Shared docs
- Broker sees: All documents

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
vercel --prod
```

### Environment Variables (Production)

Add these in Vercel Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)

## What's Included

This MVP includes:

✅ **Complete Authentication System**
- Role-based signup/login
- Multi-step onboarding
- Company verification

✅ **Dashboard Interface**
- Role-specific dashboards
- Deal overview
- Stats and metrics

✅ **Database Schema**
- Complete SQL migration
- Row Level Security (RLS)
- All necessary tables

✅ **UI Components**
- Built with shadcn/ui
- Fully responsive
- Dark mode support

## What's NOT Included (TODOs)

The following features need to be implemented:

🔲 **Deal Creation Flow** (Broker)
- Multi-step deal creation wizard
- Invite buyer/seller forms
- Commission setup (IMFPA)

🔲 **Document Upload System**
- Supabase Storage integration
- File upload components
- Document type validation

🔲 **12-Step Workflow Tracker**
- Step-by-step UI
- Document requirements per step
- Progress tracking

🔲 **Data Room**
- Document browsing
- Folder structure
- Progressive unlocking logic

🔲 **ZK Verification**
- Real ZK proof generation
- Proof verification
- Mock implementation for MVP

🔲 **Invite System**
- Unique invite links
- Email sending
- Token validation

🔲 **Notifications**
- In-app notification center
- Email notifications
- Real-time updates

🔲 **API Routes**
- Deal management endpoints
- Document upload endpoints
- Verification endpoints

## Next Steps

To continue development:

1. **Implement Deal Creation** (`app/dashboard/deals/new/page.tsx`)
2. **Build Workflow Tracker** (`components/deals/workflow-tracker.tsx`)
3. **Add Document Upload** (`components/deals/document-upload.tsx`)
4. **Create Data Room** (`app/dashboard/data-room/page.tsx`)
5. **Implement Notifications** (`app/dashboard/notifications/page.tsx`)

## License

Proprietary - All rights reserved

---

**Note**: This is an MVP foundation. The core authentication, database schema, and UI framework are ready. The remaining features (listed in TODOs) need to be built to complete the platform.
