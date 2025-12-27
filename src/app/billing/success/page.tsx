"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";
import { getCheckoutSession } from "@/app/actions/billing";
import Link from "next/link";

export default function BillingSuccessPage() {
  const [locale] = useLocale();
  const t = getTranslations(locale);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      const sessionId = searchParams.get("session_id");
      if (!sessionId) {
        setError(
          locale === "ru" ? "ID сессии не найден" : "Session ID not found"
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const sessionData = await getCheckoutSession(sessionId);

        if (!sessionData.isPaid) {
          setError(
            locale === "ru" ? "Оплата не завершена" : "Payment not completed"
          );
          setLoading(false);
          return;
        }

        setCredits(sessionData.credits);
      } catch (err) {
        console.error("Error fetching session details:", err);
        setError(
          err instanceof Error
            ? err.message
            : locale === "ru"
            ? "Ошибка при получении информации о сессии"
            : "Error fetching session details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [searchParams, locale]);

  return (
    <div className="min-h-screen mystical-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mx-auto max-w-2xl">
          <Card className="p-6 sm:p-8 text-center">
            {loading ? (
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-blue-400 animate-spin" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {locale === "ru"
                    ? "Проверка оплаты..."
                    : "Verifying payment..."}
                </h1>
                <p className="text-[#9ca3af] text-sm sm:text-base">
                  {locale === "ru" ? "Пожалуйста, подождите" : "Please wait"}
                </p>
              </div>
            ) : error ? (
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-400" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {locale === "ru" ? "Ошибка" : "Error"}
                </h1>
                <p className="text-[#9ca3af] text-sm sm:text-base mb-4">
                  {error}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-400" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {locale === "ru"
                      ? "Оплата успешна!"
                      : "Payment Successful!"}
                  </h1>
                  <p className="text-[#9ca3af] text-sm sm:text-base">
                    {locale === "ru"
                      ? "Спасибо за покупку!"
                      : "Thank you for your purchase!"}
                  </p>
                </div>

                {credits && credits > 0 && (
                  <div className="mb-6 p-4 bg-[rgba(100,200,255,0.1)] rounded-lg border border-[rgba(100,200,255,0.3)]">
                    <p className="text-white text-sm sm:text-base mb-2">
                      {locale === "ru"
                        ? "Кредиты добавлены на ваш счет:"
                        : "Credits added to your account:"}
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold text-[rgba(100,200,255,0.9)]">
                      +{credits}
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/dashboard">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />}
                >
                  {locale === "ru" ? "Создать расклад" : "Create Reading"}
                </Button>
              </Link>
              <Link href="/readings">
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />}
                >
                  {locale === "ru" ? "Мои расклады" : "My Readings"}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
