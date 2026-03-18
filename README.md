# The Daily Metabolic Reboot — Multi-Tenant Optavia Client Hub

A white-label, multi-tenant client hub for Optavia coaching organizations. Each coach org gets their own branded hub page, configurable from an admin panel. A super admin manages all organizations from a master dashboard.

---

## Architecture Overview

```
/hub/[orgSlug]          → Client-facing hub (public, unique per org)
/admin/[orgSlug]        → Org admin config panel (authenticated)
/superadmin             → Master dashboard for you (super admin only)
/login                  → Admin sign in
/forgot-password        → Request password reset email
/reset-password         → Set new password via email link
/invite                 → New coach accepts invite + creates account
```

### User Roles
| Role        | Access                                                        |
|-------------|---------------------------------------------------------------|
| super_admin | All orgs, create/delete orgs, all settings                    |
| org_admin   | Their org only — branding, Zoom, Facebook, coaches, checklist |

### Clients (no login)
Clients visit `/hub/[orgSlug]` with no account needed. Their checklist progress is saved server-side using an anonymous UUID stored in localStorage, scoped to their org.

---

## Tech Stack

| Layer        | Choice                           |
|--------------|----------------------------------|
| Framework    | Next.js 14 (App Router)          |
| Database     | PostgreSQL via Supabase           |
| ORM          | Prisma                           |
| Auth         | NextAuth.js (credentials + JWT)  |
| Email        | Resend (transactional email)     |
| File Upload  | Supabase Storage (logos)         |
| Styling      | Inline styles + Google Fonts     |
| Deployment   | Vercel                           |

---

## Getting Started

### 1. Clone & Install
```bash
git clone <your-repo>
cd daily-reset
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in all values:
```bash
cp .env.example .env.local
```

### 3. Supabase Setup
1. Create a project at https://supabase.com
2. Copy your connection string, URL, and keys into `.env.local`
3. In Supabase Storage, create a **public bucket** named `logos`

### 4. Resend Setup (email)
1. Sign up at https://resend.com (free: 3,000 emails/month)
2. Add your domain or use the Resend sandbox for testing
3. Copy your API key into `.env.local`

### 5. Database Setup
```bash
npx prisma migrate dev --name init
npm run prisma:seed       # Creates super admin account
```

### 6. Run Locally
```bash
npm run dev
# Visit http://localhost:3000/superadmin to get started
```

---

## Feature Summary

### ✅ Feature 1 — Client Checklist Progress (server-side)
- Clients get an anonymous UUID in localStorage on first visit
- Checklist state (onboarding + essentials) is saved to the database per client per org
- Progress persists across page reloads and browser restarts
- No login required for clients
- API: `GET /api/checklist` and `POST /api/checklist`

### ✅ Feature 2 — Password Reset Flow
- Admin clicks "Forgot your password?" on the login page
- Email sent via Resend with a secure 1-hour token link
- `/reset-password?token=...` validates and updates password
- Tokens are single-use and invalidated after use
- API: `POST /api/auth/reset` (request) · `PATCH /api/auth/reset` (confirm)

### ✅ Feature 3 — Logo Upload (drag & drop)
- Org admins drag-and-drop or click to upload their logo in the admin panel
- Uploaded to Supabase Storage bucket `logos` under `[orgSlug]/logo-[timestamp].ext`
- Supports PNG, JPEG, WebP, SVG — max 2MB
- Instant preview before and after upload
- Logo URL saved to org record automatically
- API: `POST /api/upload/logo` (multipart form)

### ✅ Feature 4 — Downstream Coach Invite System
- Org admins can invite other coaches by email from their admin panel
- Invite email sent via Resend with a 7-day token link
- New coach visits `/invite?token=...`, sets name + password, account created
- Auto sign-in after account creation, redirected to their admin panel
- Admin can see active coaches + pending/expired invites, and revoke invites
- APIs: `GET/POST/DELETE /api/coaches` · `GET /api/invite/validate` · `POST /api/invite/accept`

---

## Creating a New Coach Org (Super Admin Flow)

1. Log in at `/superadmin`
2. Click **"+ New Organization"**
3. Fill in: org name, URL slug, admin email, temp password
4. System creates the org + admin account in one transaction
5. Copy and share two links:
   - **Client Hub URL**: `yourdomain.com/hub/[slug]` → share with clients
   - **Admin URL**: `yourdomain.com/admin/[slug]` → share with coach

---

## Full Folder Structure

```
daily-reset/
├── app/
│   ├── hub/[orgSlug]/page.tsx          # Public client hub
│   ├── admin/[orgSlug]/page.tsx        # Org admin config panel
│   ├── superadmin/page.tsx             # Master admin dashboard
│   ├── login/page.tsx                  # Admin sign in
│   ├── forgot-password/page.tsx        # Request reset email
│   ├── reset-password/page.tsx         # Confirm new password
│   ├── invite/page.tsx                 # New coach accepts invite
│   └── api/
│       ├── auth/[...nextauth]/route.ts # NextAuth handler
│       ├── auth/reset/route.ts         # Password reset (POST + PATCH)
│       ├── orgs/[orgSlug]/route.ts     # Org data (GET + PATCH)
│       ├── checklist/route.ts          # Checklist progress (GET + POST)
│       ├── upload/logo/route.ts        # Logo upload (POST multipart)
│       ├── coaches/route.ts            # Coach list + invites (GET/POST/DELETE)
│       ├── invite/validate/route.ts    # Validate invite token (GET)
│       ├── invite/accept/route.ts      # Accept invite + create account (POST)
│       └── superadmin/
│           ├── orgs/route.ts           # All orgs (GET + POST)
│           └── orgs/[orgId]/route.ts   # Delete org (DELETE)
├── components/
│   ├── HubClient.tsx                   # Full hub UI (client component)
│   ├── LogoUploader.tsx                # Drag-and-drop logo upload
│   └── CoachManager.tsx               # Invite + manage coaches
├── lib/
│   ├── db.ts                           # Prisma singleton
│   ├── auth.ts                         # NextAuth config
│   └── email/index.ts                  # Resend email helpers
├── prisma/
│   ├── schema.prisma                   # Full DB schema (5 models)
│   └── seed.ts                         # Super admin seed
└── .env.example                        # All required env vars
```

---

## Deployment to Vercel

1. Push to GitHub
2. Import repo in Vercel dashboard
3. Add all env vars from `.env.example` in Vercel project settings
4. Deploy — Vercel auto-runs `next build`
5. Run migrations: `npx prisma migrate deploy` (from local with production DATABASE_URL)
6. Run seed: `npm run prisma:seed` (one time, with production DATABASE_URL)

