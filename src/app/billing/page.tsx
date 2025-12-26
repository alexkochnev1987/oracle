"use client";

import { Navbar } from "@/components/navbar";
import { Sparkles, CreditCard } from "lucide-react";

/**
 * BILLING SYSTEM - TO BE IMPLEMENTED
 * 
 * This page is a placeholder for the billing system integration.
 * You can implement either Stripe or LemonSqueezy here.
 * 
 * Recommended approach:
 * 1. Choose your payment provider (Stripe or LemonSqueezy)
 * 2. Set up webhook endpoints for payment confirmation
 * 3. Create Server Actions to handle payment intents
 * 4. Update user credits after successful payment
 * 
 * Example flow:
 * - User clicks "Buy Credits" button
 * - Create payment intent via Server Action
 * - Redirect to payment provider checkout
 * - Webhook confirms payment and adds credits to user account
 * 
 * Stripe Setup:
 * - Install: @stripe/stripe-js, stripe
 * - Create checkout session
 * - Handle webhook: /api/webhooks/stripe
 * 
 * LemonSqueezy Setup:
 * - Install: @lemonsqueezy/lemonsqueezy.js
 * - Create checkout session
 * - Handle webhook: /api/webhooks/lemonsqueezy
 */

export default function BillingPage() {
  return (
    <div className="min-h-screen mystical-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-4xl font-bold text-white">Billing & Credits</h1>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-purple-500/30 bg-black/40 backdrop-blur-md shadow-lg transition-all hover:border-purple-500/50 hover:shadow-purple-500/20 p-6">
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-xl font-semibold text-white mb-2">
                  <CreditCard className="h-5 w-5 text-purple-400" />
                  Single Reading
                </h3>
                <p className="text-gray-300 text-sm">
                  Get 1 credit for a single reading
                </p>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">$5</span>
                <span className="text-gray-300"> / reading</span>
              </div>
              <button className="w-full mystical-glow bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2" disabled>
                <Sparkles className="h-4 w-4" />
                Coming Soon
              </button>
            </div>

            <div className="rounded-lg border border-purple-500/30 bg-black/40 backdrop-blur-md shadow-lg transition-all hover:border-purple-500/50 hover:shadow-purple-500/20 p-6">
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-xl font-semibold text-white mb-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  Package Deal
                </h3>
                <p className="text-gray-300 text-sm">
                  Get 5 credits at a discounted price
                </p>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">$20</span>
                <span className="text-gray-300"> / 5 readings</span>
              </div>
              <button className="w-full mystical-glow bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2" disabled>
                <Sparkles className="h-4 w-4" />
                Coming Soon
              </button>
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 backdrop-blur-md">
            <p className="text-sm text-yellow-200">
              <strong>Note:</strong> The billing system is not yet implemented. This is a placeholder page.
              To implement, choose between Stripe or LemonSqueezy and follow the instructions in the code comments.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

