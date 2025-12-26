# Oracle - New Year Fortune Telling App

Modern Fullstack application for personalized Tarot card readings using AI.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), Tailwind CSS, Shadcn/UI, Lucide React
- **Backend:** Next.js Server Actions
- **Database:** Prisma ORM with PostgreSQL
- **AI:** OpenAI GPT-4o-mini (Vision API)
- **Auth:** NextAuth.js with Google Provider
- **Payments:** Billing system placeholder (Stripe/LemonSqueezy ready)
- **i18n:** Russian and English support

## Features

- 🎴 Multiple Tarot Readers with unique prompts
- 📸 Image compression before AI processing
- 🔐 Google OAuth authentication
- 💳 Credit-based billing system (ready for implementation)
- 🌍 Russian and English localization
- 📱 Mobile-responsive design
- 🎨 Mystical dark theme UI

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (Vercel Postgres or Supabase)
- OpenAI API key
- Google OAuth credentials

### Installation

1. **Install dependencies:**
```bash
pnpm install
```

2. **Set up environment variables:**
Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for dev)
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `OPENAI_API_KEY` - From OpenAI Platform

3. **Set up database:**
```bash
pnpm db:push
pnpm db:generate
```

4. **Run development server:**
```bash
pnpm dev
```

## Project Structure

```
oracle/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   └── reading.ts      # Server Actions for readings
│   │   ├── api/
│   │   │   ├── auth/           # NextAuth routes
│   │   │   └── readings/       # Reading API routes
│   │   ├── dashboard/          # Dashboard page
│   │   ├── readings/           # Reading pages
│   │   ├── billing/            # Billing page (placeholder)
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── ui/                 # Shadcn/UI components
│   │   ├── navbar.tsx          # Navigation bar
│   │   └── image-upload.tsx    # Image upload component
│   ├── lib/
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── prisma.ts           # Prisma client
│   │   ├── openai.ts           # OpenAI integration
│   │   ├── tarot-readers.ts    # Tarot reader configurations
│   │   ├── image-compression.ts # Image compression utilities
│   │   ├── i18n.ts             # Internationalization
│   │   └── utils.ts            # Utility functions
│   └── hooks/
│       └── use-locale.ts       # Locale hook
```

## Tarot Readers

The app includes 4 different Tarot readers, each with unique prompts:

1. **Classic Tarot Reader** - Traditional approach
2. **Mystical Oracle** - Deep spiritual analysis
3. **Practical Astrologer** - Practical advice
4. **Intuitive Reader** - Emotional focus

Each reader analyzes the same images differently, providing varied perspectives.

## Billing System

The billing system is set up as a placeholder. To implement:

1. **Choose a provider:** Stripe or LemonSqueezy
2. **Install SDK:** Add the provider's SDK to `package.json`
3. **Create Server Actions:** Handle payment intents
4. **Set up webhooks:** Confirm payments and add credits
5. **Update UI:** Connect buttons in `/billing` page

See `/src/app/billing/page.tsx` for implementation notes.

## Image Compression

Images are automatically compressed on the frontend before sending to OpenAI:
- Max dimensions: 1024x1024px
- Max size: 1MB
- Quality: 80%

This saves tokens and improves performance.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Connect PostgreSQL database
5. Deploy

### Environment Variables for Production

Make sure to set all required environment variables in your hosting platform.

## Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:push` - Push schema to database
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:studio` - Open Prisma Studio

## License

MIT
