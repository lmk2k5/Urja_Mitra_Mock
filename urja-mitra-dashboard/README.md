## UrjaMitra — ThingsBoard Dashboard

ShadCN UI based dashboard for ThingsBoard IoT energy monitoring.

### What’s inside

- **UI**: Next.js App Router + Tailwind + `shadcn/ui`
- **ThingsBoard API client**: `src/lib/thingsboard/client.ts` (implement with real HTTP calls)
- **Pages**:
  - `/login` sign in (links to ThingsBoard login)
  - `/dashboard` overview
  - `/devices` list
  - `/devices/[id]` device details
  - `/tips` electricity-saving tips
  - `/about` about us
  - `/settings` ThingsBoard connection

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` (redirects to `/dashboard`).

### Connect ThingsBoard

1. Add `THINGSBOARD_URL` (or `NEXT_PUBLIC_THINGSBOARD_URL`) and `THINGSBOARD_TOKEN` to `.env.local`
2. Implement the API calls in `src/lib/thingsboard/client.ts` and `src/lib/thingsboard/series.ts`

### Create a GitHub repo + push (from this folder)

From `urja-mitra-dashboard/`:

```bash
git init
git add -A
git commit -m "Initial commit: UrjaMitra ThingsBoard dashboard"

# Create the repo on GitHub (pick ONE option)
# Option A: GitHub CLI (recommended)
gh repo create urja-mitra-dashboard --public --source=. --remote=origin --push

# Option B: If you create the repo in the GitHub website first
git remote add origin https://github.com/<YOUR_USERNAME>/urja-mitra-dashboard.git
git branch -M main
git push -u origin main
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
