# kookwleigh Waitlist

A production-ready dinner guest waitlist for Josh and Leigh, built with Next.js 14, TypeScript, Tailwind CSS, shadcn-style components, Framer Motion, Prisma, iron-session, and Resend.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create local environment values:

```bash
cp .env.example .env
```

3. Run the local SQLite migration:

```bash
npx prisma migrate dev
```

4. Optional demo data:

```bash
npm run seed
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

`DATABASE_URL`: Local SQLite uses `file:./dev.db`. Production should use a PostgreSQL-compatible connection string.

`SESSION_PASSWORD`: Required for iron-session. Must be at least 32 characters.

`ADMIN_PASSWORD`: Admin login password. Defaults in `.env.example` to `joshandleigh`.

`RESEND_API_KEY`: Optional. If missing, emails are logged to the server console.

`APP_URL`: Public app URL used in emails.

## Vercel Deployment

Set the same environment variables in Vercel. For production, set `DATABASE_URL` to a PostgreSQL-compatible database URL.

The build command runs:

```bash
node scripts/sync-prisma-artifacts.mjs && prisma generate && prisma migrate deploy && next build
```

The Prisma sync script selects SQLite artifacts for local `file:` URLs and PostgreSQL artifacts for production database URLs. There are no build-time database queries in pages or components.

## Routes

`/`: Landing page.

`/join`: Guest signup.

`/login`: Guest email login.

`/dashboard`: Guest waitlist, invite, and booking dashboard.

`/admin/login`: Admin password login.

`/admin`: Waitlist, slots, bookings, and active meals.
