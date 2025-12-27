"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, CreditCard } from "lucide-react";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";
import { createCheckoutSession } from "@/app/actions/billing";

export default function BillingPage() {
  const [locale] = useLocale();
  const t = getTranslations(locale);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handlePurchase = async (credits: number) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await createCheckoutSession(credits);
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
      setError(
        err instanceof Error
          ? err.message
          : locale === "ru"
          ? "Ошибка при создании сессии оплаты"
          : "Failed to create checkout session"
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen mystical-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 sm:mb-8 text-3xl sm:text-4xl font-bold text-white">
            {t.billing.title}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <Card hover glow className="p-4 sm:p-6">
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-white mb-2">
                  <CreditCard className="h-5 w-5 text-[rgba(100,200,255,0.8)]" />
                  {t.billing.singleReading.title}
                </h3>
                <p className="text-sm sm:text-base text-[#9ca3af]">
                  {t.billing.singleReading.description}
                </p>
              </div>
              <div className="mb-4">
                <span className="text-2xl sm:text-3xl font-bold text-white">{t.billing.singleReading.price}</span>
                <span className="text-sm sm:text-base text-[#9ca3af]">{t.billing.singleReading.priceUnit}</span>
              </div>
              <Button
                variant="primary"
                size="lg"
                disabled={isLoading}
                loading={isLoading}
                onClick={() => handlePurchase(10)}
                className="w-full"
                icon={<Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />}
              >
                {t.billing.singleReading.button}
              </Button>
            </Card>

            <Card hover glow className="p-4 sm:p-6">
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-white mb-2">
                  <Sparkles className="h-5 w-5 text-[rgba(100,200,255,0.8)]" />
                  {t.billing.package.title}
                </h3>
                <p className="text-sm sm:text-base text-[#9ca3af]">
                  {t.billing.package.description}
                </p>
              </div>
              <div className="mb-4">
                <span className="text-2xl sm:text-3xl font-bold text-white">{t.billing.package.price}</span>
                <span className="text-sm sm:text-base text-[#9ca3af]">{t.billing.package.priceUnit}</span>
              </div>
              <Button
                variant="primary"
                size="lg"
                disabled={isLoading}
                loading={isLoading}
                onClick={() => handlePurchase(100)}
                className="w-full"
                icon={<Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />}
              >
                {t.billing.package.button}
              </Button>
            </Card>
          </div>

          {error && (
            <Card className="mt-6 sm:mt-8 p-4 border-red-500/50 bg-red-500/10">
              <p className="text-sm text-red-400">{error}</p>
            </Card>
          )}

          <Card className="mt-6 sm:mt-8 p-4 border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.1)]">
            <p className="text-xs sm:text-sm text-[#d4af37]">
              <strong>{locale === "ru" ? "Примечание:" : "Note:"}</strong> {t.billing.note}
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
