"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { TarotCardsDisplay } from "@/components/tarot-cards-display";
import { EmailReadingForm } from "@/components/email-reading-form";
import Image from "next/image";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { useLocale } from "@/hooks/use-locale";
import { getTranslations } from "@/lib/i18n";
import { getTarotReader } from "@/lib/tarot-readers";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function ReadingDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [locale] = useLocale();
  const t = getTranslations(locale);
  const [reading, setReading] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && params.id) {
      fetch(`/api/readings/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setReading(data);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [status, params.id, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen mystical-gradient">
        <Navbar />
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="mx-auto max-w-4xl">
            <LoadingSkeleton variant="card" count={2} />
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !reading) {
    return null;
  }

  const reader = getTarotReader(reading.tarotReaderId);
  const date =
    typeof reading.createdAt === "string"
      ? new Date(reading.createdAt)
      : reading.createdAt;

  // Generate share URL
  const shareUrl = reading.shareToken
    ? typeof window !== "undefined"
      ? `${window.location.origin}/readings/share/${reading.shareToken}`
      : `/readings/share/${reading.shareToken}`
    : "";

  return (
    <div className="min-h-screen mystical-gradient starry-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <Card className="p-4 sm:p-6" glow>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {reading.question}
              </h1>
              <span className="text-xs sm:text-sm text-[#9ca3af] whitespace-nowrap">
                {format(date, "PPP", {
                  locale: locale === "ru" ? ru : enUS,
                })}
              </span>
            </div>
            <div className="mb-4">
              <span className="text-sm sm:text-base text-[rgba(100,200,255,0.8)] font-medium">
                {reader.name} - {reader.description}
              </span>
            </div>
          </Card>

          {/* Tarot Cards Display - show if cards were selected */}
          {reading.selectedCards &&
            Array.isArray(reading.selectedCards) &&
            reading.selectedCards.length > 0 && (
              <TarotCardsDisplay
                cardIds={reading.selectedCards as string[]}
                locale={locale}
              />
            )}

          {/* User Image Display - show if image exists */}
          {reading.userImageUrl && (
            <Card className="p-4 sm:p-6" glow>
              <h2 className="mb-4 text-xl sm:text-2xl font-semibold text-white">
                {t.readings.userPhoto}
              </h2>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-[rgba(100,200,255,0.4)] bg-[rgba(26,26,58,0.7)]">
                <Image
                  src={reading.userImageUrl}
                  alt={t.readings.userPhoto}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={90}
                  unoptimized={reading.userImageUrl.startsWith("http")}
                />
              </div>
            </Card>
          )}

          <Card className="p-4 sm:p-6 md:p-8 cosmic-particles" glow>
            <h2 className="mb-4 text-xl sm:text-2xl font-semibold text-white">
              {t.readings.yourReading}
            </h2>
            <div className="prose prose-invert max-w-none text-[#e5e7eb]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {reading.predictionText}
              </ReactMarkdown>
            </div>
          </Card>

          {reading.shareToken && (
            <div className="w-full">
              <QRCodeDisplay
                shareToken={reading.shareToken}
                shareUrl={shareUrl}
                question={reading.question}
              />
            </div>
          )}

          <div className="w-full">
            <EmailReadingForm readingId={reading.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
