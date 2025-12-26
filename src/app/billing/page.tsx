"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
            <Card className="border-purple-500/20 bg-black/30 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <CreditCard className="h-5 w-5" />
                  Single Reading
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Get 1 credit for a single reading
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">$5</span>
                  <span className="text-gray-400"> / reading</span>
                </div>
                <Button className="w-full mystical-glow bg-purple-600 hover:bg-purple-700" disabled>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-black/30 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Sparkles className="h-5 w-5" />
                  Package Deal
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Get 5 credits at a discounted price
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">$20</span>
                  <span className="text-gray-400"> / 5 readings</span>
                </div>
                <Button className="w-full mystical-glow bg-purple-600 hover:bg-purple-700" disabled>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 backdrop-blur">
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

