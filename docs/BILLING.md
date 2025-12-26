# Billing System Implementation Guide

## Choosing Between Stripe and LemonSqueezy

### Stripe
**Pros:**
- More features and flexibility
- Better documentation
- More payment methods
- Better for complex billing scenarios
- Widely used and trusted

**Cons:**
- More complex setup
- Higher transaction fees (2.9% + $0.30)
- Requires more code

**Best for:** Complex billing needs, subscriptions, multiple products

### LemonSqueezy
**Pros:**
- Simpler setup
- Lower transaction fees (3.5% + $0.30, but can be lower)
- Built-in tax handling
- Good for digital products
- Simpler API

**Cons:**
- Less flexible
- Fewer features
- Newer platform

**Best for:** Simple one-time payments, digital products, quick setup

## Recommendation

For this app, **Stripe** is recommended because:
1. More flexibility for future features (subscriptions, packages)
2. Better developer experience
3. More payment methods for international users
4. Better webhook handling

## Implementation Steps

### Option 1: Stripe

1. **Install Stripe:**
```bash
pnpm add stripe @stripe/stripe-js
```

2. **Create Server Action** (`src/app/actions/billing.ts`):
```typescript
"use server";

import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function createCheckoutSession(credits: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${credits} Reading Credits`,
          },
          unit_amount: credits === 1 ? 500 : credits === 5 ? 2000 : 0, // $5 or $20
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/billing`,
    metadata: {
      userId: session.user.id,
      credits: credits.toString(),
    },
  });

  return { url: checkoutSession.url };
}
```

3. **Create Webhook** (`src/app/api/webhooks/stripe/route.ts`):
```typescript
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const credits = parseInt(session.metadata?.credits || "0");

    if (userId && credits > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          credits: {
            increment: credits,
          },
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
```

4. **Update Billing Page** to call the Server Action

### Option 2: LemonSqueezy

1. **Install LemonSqueezy:**
```bash
pnpm add @lemonsqueezy/lemonsqueezy.js
```

2. **Create Server Action** (`src/app/actions/billing.ts`):
```typescript
"use server";

import LemonSqueezy from "@lemonsqueezy/lemonsqueezy.js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ls = new LemonSqueezy(process.env.LEMONSQUEEZY_API_KEY!);

export async function createCheckoutSession(credits: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const checkout = await ls.checkouts.create({
    storeId: process.env.LEMONSQUEEZY_STORE_ID!,
    variantId: credits === 1 ? "variant-id-1" : "variant-id-5", // Create variants in LemonSqueezy
    customPrice: credits === 1 ? 500 : 2000, // in cents
    checkoutOptions: {
      embed: false,
      media: false,
      logo: true,
    },
    checkoutData: {
      custom: {
        userId: session.user.id,
        credits: credits.toString(),
      },
    },
    expiresAt: null,
    preview: false,
    testMode: process.env.NODE_ENV === "development",
  });

  return { url: checkout.data.attributes.url };
}
```

3. **Create Webhook** (`src/app/api/webhooks/lemonsqueezy/route.ts`):
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-signature")!;

  // Verify webhook signature
  const hmac = crypto.createHmac("sha256", process.env.LEMONSQUEEZY_WEBHOOK_SECRET!);
  const digest = hmac.update(body).digest("hex");

  if (signature !== digest) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.meta.event_name === "order_created") {
    const customData = event.data.attributes.custom_data;
    const userId = customData?.userId;
    const credits = parseInt(customData?.credits || "0");

    if (userId && credits > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          credits: {
            increment: credits,
          },
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
```

## Testing

### Stripe Test Mode
- Use test API keys (start with `sk_test_`)
- Test card: `4242 4242 4242 4242`
- Any future expiry date, any CVC

### LemonSqueezy Test Mode
- Enable test mode in dashboard
- Use test API key
- Test payments will be marked as test

## Security Notes

1. **Never expose secret keys** in client-side code
2. **Always verify webhook signatures**
3. **Use environment variables** for all keys
4. **Validate user authentication** before creating checkout sessions
5. **Use HTTPS** in production

## Next Steps After Implementation

1. Update `/src/app/billing/page.tsx` to use the Server Actions
2. Create success/cancel pages
3. Add loading states
4. Test the full flow
5. Deploy and configure webhooks in production

