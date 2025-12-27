# Stripe Payment Setup Guide

This guide explains how to set up Stripe payments for the credit system.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Access to your Stripe Dashboard

## Step 1: Get Stripe API Keys

**⚠️ IMPORTANT: Make sure you're in Test mode, not Live mode!**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) (this link automatically switches to test mode)
2. **If you see Live keys** (`pk_live_`, `sk_live_`), switch to Test mode:
   - Look for **"Test mode has moved. Show me"** message at the top and click it, OR
   - Find the mode toggle in the top right corner and switch to **"Test mode"**
3. Navigate to **Developers** → **API keys**
4. In the **"Standard keys"** section:
   - Copy your **Publishable key** (starts with `pk_test_` for test mode)
   - Click **"Reveal test key"** for the Secret key, then copy it (starts with `sk_test_` for test mode)
5. **Verify** the keys start with `pk_test_` and `sk_test_` (NOT `pk_live_` and `sk_live_`!)

## Step 2: Set Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**⚠️ IMPORTANT:**

- **STRIPE_SECRET_KEY** must start with `sk_test_` (test) or `sk_live_` (production)
- **STRIPE_PUBLISHABLE_KEY** must start with `pk_test_` (test) or `pk_live_` (production)
- **DO NOT** use publishable key (`pk_`) in `STRIPE_SECRET_KEY` - this will cause errors!

**Note:** For production, use live keys (starting with `pk_live_` and `sk_live_`).

## Step 3: Set Up Webhook

### For Local Development

**⚠️ IMPORTANT:** Webhook secret for local development **changes every time** you run `stripe listen`!

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. **Copy the webhook signing secret** that appears in the terminal output (starts with `whsec_`)
   - It will look like: `> Ready! Your webhook signing secret is whsec_...`
5. Add it to your `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
6. **Note:** If you stop and restart `stripe listen`, you'll get a NEW secret - update your `.env.local` with the new value!

### For Production (Vercel)

**⚠️ IMPORTANT:** Webhook secret for production is **permanent** for each endpoint you create.

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) (make sure you're in **Live mode** for production)
2. Navigate to **Developers** → **Webhooks**
3. Click **Add endpoint**
4. Enter your webhook URL:
   ```
   https://new-year-oracle.vercel.app/api/webhooks/stripe
   ```
5. Select events to listen for:
   - `checkout.session.completed`
6. Click **Add endpoint**
7. On the endpoint page, click **"Reveal"** next to **Signing secret** (starts with `whsec_`)
8. Copy the signing secret
9. Add it to your Vercel environment variables:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `STRIPE_WEBHOOK_SECRET` with the signing secret value
   - **This secret will NOT change** unless you delete and recreate the webhook endpoint

## Step 4: Test the Integration

### Test Card Numbers

Use these test card numbers in Stripe Checkout:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- Use any future expiry date and any 3-digit CVC

### Testing Flow

1. Start your development server:
   ```bash
   pnpm dev
   ```
2. Sign in to your application
3. Go to the Billing page (`/billing`)
4. Click "Purchase" button
5. Use test card `4242 4242 4242 4242` in Stripe Checkout
6. Complete the payment
7. Verify that credits are added to your account

## Step 5: Run Migration for Existing Users

If you have existing users, run the migration script to give them 10 credits:

```bash
pnpm migrate:credits
```

This will:

- Give 10 credits to all users with `credits = 0`
- Skip users in the whitelist (they have unlimited credits)

## Pricing

Current pricing:

- **$1 for 10 credits** (1 credit = 1 reading)

To change pricing, update the `unitAmount` in `src/app/actions/billing.ts`:

- Price in cents (e.g., 100 = $1.00)
- Update the `credits` parameter to match

## Security Notes

1. **Never expose secret keys** in client-side code
2. **Always verify webhook signatures** (already implemented)
3. **Use HTTPS** in production
4. **Keep webhook secrets secure** - never commit them to version control

## Troubleshooting

### Webhook Not Receiving Events

1. Check that the webhook URL is correct
2. Verify the webhook secret is set correctly
3. Check Stripe Dashboard → Webhooks → Recent events for errors
4. For local development, ensure Stripe CLI is running

### Credits Not Added After Payment

1. Check webhook logs in Stripe Dashboard
2. Check server logs for errors
3. Verify `STRIPE_WEBHOOK_SECRET` is set correctly
4. Ensure the webhook endpoint is accessible

### Test Mode vs Live Mode

- **Test mode:** Use `pk_test_` and `sk_test_` keys
- **Live mode:** Use `pk_live_` and `sk_live_` keys
- Make sure to use matching keys (all test or all live)

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
