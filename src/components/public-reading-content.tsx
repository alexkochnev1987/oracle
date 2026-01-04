"use client";

import { useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card } from "@/components/ui/card";
import { TarotCardsDisplay } from "@/components/tarot-cards-display";
import { EmailReadingForm } from "@/components/email-reading-form";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { useLocale } from "@/hooks/use-locale";
import { getTranslations, type Locale } from "@/lib/i18n";
import { type TarotReaderId } from "@/lib/tarot-readers";
import { PageContainer } from "@/components/page-container";
import {
  BackgroundNavigation,
  BACKGROUND_IMAGES,
} from "@/components/background-navigation";
import { Navbar } from "@/components/navbar";

interface Reading {
  id: string;
  question: string;
  predictionText: string;
  tarotReaderId: string;
  createdAt: Date | string;
  selectedCards?: string[] | null;
  userImageUrl?: string | null;
}

interface PublicReadingContentProps {
  reading: Reading;
  shareToken: string;
}

export function PublicReadingContent({
  reading,
  shareToken,
}: PublicReadingContentProps) {
  const [locale] = useLocale();
  const t = getTranslations(locale);
  const [backgroundIndex, setBackgroundIndex] = useState(0);

  const reader = t.tarotReadersPrompts[reading.tarotReaderId as TarotReaderId];
  const date =
    typeof reading.createdAt === "string"
      ? new Date(reading.createdAt)
      : reading.createdAt;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src={BACKGROUND_IMAGES[backgroundIndex]}
          alt="Background"
          fill
          className="object-cover transition-opacity duration-500"
          priority
        />
        <div className="absolute inset-0 bg-[rgba(13,13,26,0.7)]" />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Navigation Buttons */}
      <BackgroundNavigation
        currentIndex={backgroundIndex}
        onIndexChange={setBackgroundIndex}
      />

      {/* Main Content */}
      <PageContainer maxWidth="4xl" className="relative z-10 space-y-6">
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
              {t.common.userPhoto}
            </h2>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-[rgba(100,200,255,0.4)] bg-[rgba(26,26,58,0.7)]">
              <Image
                src={reading.userImageUrl}
                alt={t.common.userPhoto}
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
            {t.common.yourReading}
          </h2>
          <div className="prose prose-invert max-w-none text-[#e5e7eb]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {reading.predictionText}
            </ReactMarkdown>
          </div>
        </Card>

        <div className="w-full">
          <EmailReadingForm shareToken={shareToken} />
        </div>
      </PageContainer>
    </div>
  );
}
