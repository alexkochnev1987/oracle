"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TarotCardsDisplay } from "@/components/tarot-cards-display";
import { EmailReadingForm } from "@/components/email-reading-form";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { useLocale } from "@/hooks/use-locale";
import { getTranslations } from "@/lib/i18n";
import { getTarotReader } from "@/lib/tarot-readers";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Navbar } from "@/components/navbar";
import { PageContainer } from "@/components/page-container";

const BACKGROUND_IMAGES = [
  "/alien/ai.png",
  "/alien/alien.png",
  "/alien/door.png",
  "/alien/light.png",
  "/alien/space.png",
  "/alien/star.png",
];

export default function PublicReadingPage() {
  const params = useParams();
  const [locale] = useLocale();
  const t = getTranslations(locale);
  const [reading, setReading] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backgroundIndex, setBackgroundIndex] = useState(0);

  useEffect(() => {
    const token = params.token as string;
    if (token) {
      fetch(`/api/readings/share/${token}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Reading not found");
          }
          return res.json();
        })
        .then((data) => {
          setReading(data);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setIsLoading(false);
        });
    }
  }, [params.token]);

  const handlePrevious = () => {
    setBackgroundIndex((prev) =>
      prev === 0 ? BACKGROUND_IMAGES.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setBackgroundIndex((prev) =>
      prev === BACKGROUND_IMAGES.length - 1 ? 0 : prev + 1
    );
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden">
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
        <Navbar />
        <PageContainer maxWidth="4xl" className="relative z-10">
          <LoadingSkeleton variant="card" count={2} />
        </PageContainer>
      </div>
    );
  }

  if (error || !reading) {
    return (
      <div className="relative min-h-screen overflow-hidden">
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
        <Navbar />
        <PageContainer maxWidth="4xl" className="relative z-10">
          <Card className="p-6 text-center">
            <h1 className="mb-4 text-2xl font-bold text-white">
              {t.common.readingNotFound}
            </h1>
            <p className="text-[#9ca3af]">
              {error || t.common.readingNotFoundOrDeleted}
            </p>
          </Card>
        </PageContainer>
      </div>
    );
  }

  const reader = getTarotReader(reading.tarotReaderId, locale);
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
      <div className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={handlePrevious}
          className="bg-[rgba(100,200,255,0.2)] border border-[rgba(100,200,255,0.5)] hover:bg-[rgba(100,200,255,0.3)] backdrop-blur-sm"
          aria-label="Previous background"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleNext}
          className="bg-[rgba(100,200,255,0.2)] border border-[rgba(100,200,255,0.5)] hover:bg-[rgba(100,200,255,0.3)] backdrop-blur-sm"
          aria-label="Next background"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

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

        <div className="w-full">
          <EmailReadingForm shareToken={params.token as string} />
        </div>
      </PageContainer>
    </div>
  );
}
