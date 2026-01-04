"use server";

import { auth } from "@/lib/auth";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
});

/**
 * Create a Stripe checkout session for purchasing credits
 * @param credits - Number of credits to purchase (default: 10)
 * @returns Checkout session URL
 */
export async function createCheckoutSession(credits: number = 10) {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userId = (session.user as any).id;
    if (!userId) {
      throw new Error("User ID not found in session");
    }

    // Calculate price based on credits
    // 10 credits = $1 (100 cents)
    // 100 credits = $5 (500 cents)
    let unitAmount: number;
    if (credits === 10) {
      unitAmount = 100; // $1.00 in cents
    } else if (credits === 100) {
      unitAmount = 500; // $5.00 in cents
    } else {
      // Default: calculate based on credits (10 cents per credit)
      unitAmount = credits * 10;
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
              description: `Get ${credits} credits for tarot readings`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/billing`,
      metadata: {
        userId: userId,
        credits: credits.toString(),
      },
    });

    if (!checkoutSession.url) {
      throw new Error("Failed to create checkout session");
    }

    return { url: checkoutSession.url };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to create checkout session");
  }
}

/**
 * Get checkout session details from Stripe
 * @param sessionId - Stripe checkout session ID
 * @returns Session details including credits purchased
 */
export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userId = (session.user as any).id;
    if (!userId) {
      throw new Error("User ID not found in session");
    }

    // Retrieve the checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify that this session belongs to the current user
    if (checkoutSession.metadata?.userId !== userId) {
      throw new Error("Session does not belong to this user");
    }

    // Get credits from metadata
    const credits = parseInt(checkoutSession.metadata?.credits || "0", 10);

    return {
      sessionId: checkoutSession.id,
      paymentStatus: checkoutSession.payment_status,
      isPaid: checkoutSession.payment_status === "paid",
      credits,
    };
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to retrieve checkout session");
  }
}
