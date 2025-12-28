"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import {
  getCardById,
  getCardImageUrl,
  getCardName,
  type TarotCard,
} from "@/lib/tarot-cards";
import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";

interface TarotCardsDisplayProps {
  cardIds: string[] | null | undefined;
  locale?: Locale;
  className?: string;
}

export function TarotCardsDisplay({
  cardIds,
  locale = "ru",
  className,
}: TarotCardsDisplayProps) {
  const t = getTranslations(locale);
  if (!cardIds || cardIds.length === 0) {
    return null;
  }

  // Get card objects from IDs
  const cards = cardIds
    .map((id) => getCardById(id))
    .filter((card): card is TarotCard => card !== undefined);

  if (cards.length === 0) {
    return null;
  }

  // Determine grid columns based on number of cards
  const getGridCols = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-3";
    if (count === 4) return "grid-cols-2 sm:grid-cols-4";
    if (count === 5) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
    if (count === 6) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6";
    // For 7+ cards, use responsive grid that adapts
    if (count <= 9) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
    if (count <= 12) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";
    // For more than 12 cards
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";
  };

  return (
    <Card className={`p-4 sm:p-6 ${className || ""}`} glow>
      <h2 className="mb-4 text-xl sm:text-2xl font-semibold text-white">
        {t.common.tarotCardsSpread}
      </h2>
      <div className={`grid ${getGridCols(cards.length)} gap-3 sm:gap-4`}>
        {cards.map((card, index) => {
          const cardImageUrl = getCardImageUrl(card.id);
          const hasImage = card.imageUrl !== undefined;

          return (
            <div
              key={`${card.id}-${index}`}
              className="flex flex-col items-center space-y-2"
            >
              {/* Card Image */}
              <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-[rgba(26,26,58,0.9)] border border-[rgba(100,200,255,0.2)]">
                {hasImage ? (
                  <Image
                    src={cardImageUrl}
                    alt={getCardName(card, locale)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    quality={85}
                    loading="lazy"
                    unoptimized={cardImageUrl.startsWith("http")}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2">
                    <div className="text-2xl sm:text-3xl mb-1">🃏</div>
                    <div className="text-[8px] sm:text-[10px] text-[rgba(100,200,255,0.6)] font-medium text-center leading-tight">
                      {getCardName(card, locale)}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Name */}
              <div className="text-xs sm:text-sm font-semibold text-[rgba(100,200,255,0.9)] text-center">
                {getCardName(card, locale)}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
