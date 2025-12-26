# Setup Instructions

## Quick Start Guide

### 1. Install Dependencies

```bash
cd oracle
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the `oracle` directory:

```bash
cp .env.example .env
```

Fill in the following variables:

#### Database (PostgreSQL)
- **Vercel Postgres**: Go to your Vercel project → Storage → Create Database → Copy connection string
- **Supabase**: Go to Project Settings → Database → Copy connection string
- Format: `postgresql://user:password@host:port/database?schema=public`

#### NextAuth
- **NEXTAUTH_SECRET**: Generate with: `openssl rand -base64 32`
- **NEXTAUTH_URL**: 
  - Development: `http://localhost:3000`
  - Production: Your production URL (e.g., `https://your-app.vercel.app`)

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Application type: Web application
6. Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-app.vercel.app/api/auth/callback/google`
7. Copy Client ID and Client Secret

#### OpenAI
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API Keys
3. Create a new secret key
4. Copy the key (starts with `sk-`)

### 3. Set Up Database

```bash
# Push schema to database
pnpm db:push

# Generate Prisma Client
pnpm db:generate
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing the App

1. **Sign In**: Click "Sign In" and authenticate with Google
2. **Create Reading**: 
   - Go to Dashboard
   - Upload your photo
   - Upload Tarot cards photo
   - Select birth date
   - Enter your question
   - Choose a Tarot reader
   - Click "Create Reading"
3. **View Readings**: Go to "My Readings" to see all your readings

## Adding Credits (For Testing)

You can manually add credits to test the app:

```sql
-- Connect to your database and run:
UPDATE "User" SET credits = 10 WHERE email = 'your-email@example.com';
```

Or use Prisma Studio:
```bash
pnpm db:studio
```

## Deployment to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables in Vercel dashboard
4. Connect your PostgreSQL database
5. Deploy!

## Troubleshooting

### Database Connection Issues
- Check your `DATABASE_URL` format
- Ensure database is accessible from your IP (for local development)
- For Vercel Postgres, use the connection string from Vercel dashboard

### Authentication Issues
- Verify Google OAuth redirect URIs match exactly
- Check `NEXTAUTH_URL` matches your deployment URL
- Ensure `NEXTAUTH_SECRET` is set

### OpenAI API Issues
- Verify API key is correct
- Check your OpenAI account has credits
- Ensure API key has access to GPT-4o-mini model

### Image Upload Issues
- Check browser console for errors
- Ensure images are valid formats (JPG, PNG, etc.)
- Large images will be compressed automatically

## Next Steps

1. **Implement Billing**: See `/src/app/billing/page.tsx` for instructions
2. **Customize Tarot Readers**: Edit prompts in `/src/lib/tarot-readers.ts`
3. **Add More Languages**: Extend translations in `/src/lib/i18n.ts`
4. **Customize UI**: Modify components in `/src/components/`

