# HARSH UNLIMITED — PREMIUM MINECRAFT NETWORK WEBSITE

Production-ready, full-stack Minecraft server website, rank store, and administration system built for **Harsh Unlimited** (`play.harshunlimited.fun`).

---

## ⚡ Key Highlights & Capabilities

- **Modern Tech Stack**: Next.js App Router, TypeScript (strict mode), Tailwind CSS, PostgreSQL, Prisma ORM, Jose JWT session security, and Vitest.
- **Cinematic Gaming Aesthetic**: Custom dark theme (deep black `#08090d`, charcoal `#11141e`, and emerald/neon green `#10b981`), glowing badges, responsive navigation, and micro-interactions.
- **Live Minecraft Status**: Verified TCP ping integration (`play.harshunlimited.fun:25565`) displaying online player count, software version, and one-click copy buttons for Java and Bedrock Edition.
- **Cashfree DevStudio Payment Gateway**: Server-side order creation (`POST /pg/orders`), raw request HMAC-SHA256 signature verification over `x-webhook-timestamp` + payload, status polling, and graceful setup-required fallback when credentials are unconfigured.
- **Durable Rank Delivery System**:
  - `Paid Order` → `Entitlement Created` → `DeliveryJob Queued` → `Pterodactyl 1.x / Bridge API Dispatched` → `Acknowledged & Updated`.
  - Whitelisted console command templating with `{username}`, `{uuid}`, and `{rank}` replacements.
  - Manual Review fallback queue with one-click administrative retry button.
- **Customer Accounts & Security**:
  - Secure registration, password hashing with `bcryptjs`, and HTTP-only session cookies.
  - Official Mojang API UUID resolution with in-game `/verify HU-XXXXX` linking.
  - Live order tracking (`/orders/[id]`), rank entitlement history, and support tickets.
- **Protected Admin Dashboard (`/admin`)**:
  - Real-time revenue reporting in integer minor currency units (paise).
  - Product and Rank CRUD management.
  - Order audit, delivery job retry, and system audit trail.

---

## 🏗️ Architecture & Payment Flow

```
[Customer Checkout]
        │
        ▼
[POST /api/checkout/create-order]
        │ (Validate product & price from PostgreSQL)
        ▼
[Cashfree DevStudio API] ──(paymentLink / sessionId)──> [Customer Pays via UPI/Card]
                                                                  │
                                                                  ▼
[POST /api/webhooks/cashfree] <──(Signed HMAC-SHA256 Webhook)─────┘
        │
        ├─ Verify x-webhook-signature with CASHFREE_SECRET_KEY
        ├─ Idempotent Deduplication (WebhookEvent table)
        ├─ Transition Order to PAID
        │
        ▼
[Create Entitlement & DeliveryJob]
        │
        ├─ [Attempt 1]: Authenticated In-Game Command Bridge (/api/v1/execute)
        ├─ [Attempt 2]: Restricted Pterodactyl 1.x Console API (POST /api/client/servers/{id}/command)
        └─ [Fallback]: Enqueued to Admin Manual Fulfillment Queue (status: MANUAL_REVIEW)
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 20+ (v24 recommended)
- PostgreSQL database (or Docker)

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update the required variables:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/harsh_unlimited?schema=public"
AUTH_SECRET="your-32-character-random-secret"
CASHFREE_APP_ID="your_cashfree_app_id"
CASHFREE_SECRET_KEY="your_cashfree_secret_key"
CASHFREE_ENV="SANDBOX"
CASHFREE_API_VERSION="2023-08-01"
```

### 3. Database Initialization & Seeding
```bash
# Push Prisma schema to your PostgreSQL database
npm run prisma:push

# Seed default administrator, game modes, and rank products
npm run prisma:seed
```

Default seeded credentials:
- **Email**: `admin@harshunlimited.fun`
- **Password**: `Admin@HarshUnlimited2026!`
- **Role**: `SUPERADMIN`

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

Run the Vitest test suite:
```bash
npm test
```
The test suite validates:
- Cashfree HMAC-SHA256 signature verification & forged payload rejection
- Minor currency integer calculations (paise to INR without floating-point errors)
- Delivery command templating (`{username}`, `{uuid}`, `{rank}`) and sanitization
- Password hashing and JWT session generation/verification

---

## 📦 Production Deployment

### Option A: Docker Deployment
```bash
docker compose up -d --build
```

### Option B: Node.js VPS / Linux Service
```bash
npm run build
npm start
```

---

## 📋 Launch Checklist (External Integrations)

Before public launch, configure the following external credentials:
1. **Cashfree Merchant Account**:
   - Register on [Cashfree DevStudio](https://www.cashfree.com/devstudio/).
   - Obtain Production `App ID` and `Secret Key`.
   - Set webhook notification URL to: `https://your-domain.com/api/webhooks/cashfree`.
2. **Pterodactyl 1.x Panel**:
   - In Pterodactyl, generate an API Client Key with permission to execute console commands.
   - Set `PTERODACTYL_BASE_URL`, `PTERODACTYL_API_KEY`, and `PTERODACTYL_SERVER_ID`.
3. **In-Game Minecraft Server**:
   - Install LuckPerms (`/lp`) for rank hierarchy.
   - Configure DNS A/SRV records pointing `play.harshunlimited.fun` to your server IP.
