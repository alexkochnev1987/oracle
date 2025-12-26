"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Shuffle, Upload } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  getRandomSpread,
  type TarotCard,
  getCardName,
  formatCardsForPrompt,
  getCardImageUrl,
} from "@/lib/tarot-cards";
import type { Locale } from "@/lib/i18n";

type SelectionMode = "upload" | "random";

interface TarotCardSelectorProps {
  label: string;
  cardsImage?: string;
  selectedCards?: TarotCard[];
  mode?: SelectionMode;
  locale?: Locale;
  onCardsImageChange?: (base64: string) => void;
  onSelectedCardsChange?: (cards: TarotCard[]) => void;
  onModeChange?: (mode: SelectionMode) => void;
  className?: string;
}

export function TarotCardSelector({
  label,
  cardsImage,
  selectedCards,
  mode: controlledMode,
  locale = "ru",
  onCardsImageChange,
  onSelectedCardsChange,
  onModeChange,
  className,
}: TarotCardSelectorProps) {
  const [internalMode, setInternalMode] = useState<SelectionMode>("upload");
  const [internalSelectedCards, setInternalSelectedCards] = useState<
    TarotCard[]
  >([]);

  // Use controlled mode if provided, otherwise use internal state
  const mode = controlledMode ?? internalMode;
  const currentSelectedCards = selectedCards ?? internalSelectedCards;

  const handleModeChange = (newMode: SelectionMode) => {
    if (onModeChange) {
      onModeChange(newMode);
    } else {
      setInternalMode(newMode);
    }

    // Clear the other mode's data when switching
    if (newMode === "upload") {
      if (onSelectedCardsChange) {
        onSelectedCardsChange([]);
      } else {
        setInternalSelectedCards([]);
      }
    } else {
      if (onCardsImageChange) {
        onCardsImageChange("");
      }
      // Generate initial random spread
      generateRandomSpread();
    }
  };

  const generateRandomSpread = () => {
    const newCards = getRandomSpread(6);
    if (onSelectedCardsChange) {
      onSelectedCardsChange(newCards);
    } else {
      setInternalSelectedCards(newCards);
    }
  };

  // Generate initial spread if in random mode and no cards selected
  useEffect(() => {
    if (mode === "random" && currentSelectedCards.length === 0) {
      generateRandomSpread();
    }
  }, [mode]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2 sm:space-y-3">
        <label className="block text-sm sm:text-base font-medium text-white">
          {label}
        </label>

        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 bg-[rgba(26,26,58,0.6)] rounded-lg border border-[rgba(100,200,255,0.3)]">
          <button
            type="button"
            onClick={() => handleModeChange("upload")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 text-sm sm:text-base font-medium",
              mode === "upload"
                ? "bg-gradient-to-r from-[#4a9eff] to-[#7c3aed] text-white shadow-[0_0_15px_rgba(100,200,255,0.4)]"
                : "text-[#9ca3af] hover:text-white hover:bg-[rgba(100,200,255,0.1)]"
            )}
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">
              {locale === "ru" ? "Загрузить фото" : "Upload Photo"}
            </span>
            <span className="sm:hidden">
              {locale === "ru" ? "Фото" : "Photo"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("random")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 text-sm sm:text-base font-medium",
              mode === "random"
                ? "bg-gradient-to-r from-[#4a9eff] to-[#7c3aed] text-white shadow-[0_0_15px_rgba(100,200,255,0.4)]"
                : "text-[#9ca3af] hover:text-white hover:bg-[rgba(100,200,255,0.1)]"
            )}
          >
            <Shuffle className="h-4 w-4" />
            <span className="hidden sm:inline">
              {locale === "ru" ? "Случайный расклад" : "Random Spread"}
            </span>
            <span className="sm:hidden">
              {locale === "ru" ? "Расклад" : "Spread"}
            </span>
          </button>
        </div>
      </div>

      {/* Upload Mode */}
      {mode === "upload" && (
        <ImageUpload
          label=""
          value={cardsImage}
          onChange={(base64) => {
            if (onCardsImageChange) {
              onCardsImageChange(base64);
            }
          }}
        />
      )}

      {/* Random Spread Mode */}
      {mode === "random" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {currentSelectedCards.map((card, index) => {
              const cardImageUrl = getCardImageUrl(card.id);
              const hasImage = card.imageUrl !== undefined;

              return (
                <Card
                  key={`${card.id}-${index}`}
                  className="p-2 sm:p-3 bg-[rgba(26,26,58,0.7)] border-[rgba(100,200,255,0.3)] hover:border-[rgba(100,200,255,0.5)] transition-all overflow-hidden"
                >
                  <div className="text-center space-y-2">
                    {/* Card Image */}
                    <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-[rgba(26,26,58,0.9)] border border-[rgba(100,200,255,0.2)]">
                      {hasImage ? (
                        <Image
                          src={cardImageUrl}
                          alt={getCardName(card, locale)}
                          fill
                          className="object-cover"
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
                    <div className="text-xs sm:text-sm font-semibold text-[rgba(100,200,255,0.9)]">
                      {getCardName(card, locale)}
                    </div>

                    {/* Card Type */}
                    {card.arcana === "major" && (
                      <div className="text-[10px] text-[#9ca3af]">
                        {locale === "ru" ? "Старший Аркан" : "Major Arcana"}
                      </div>
                    )}
                    {card.arcana === "minor" && card.suit && (
                      <div className="text-[10px] text-[#9ca3af]">
                        {locale === "ru"
                          ? card.suit === "cups"
                            ? "Кубки"
                            : card.suit === "pentacles"
                            ? "Пентакли"
                            : card.suit === "swords"
                            ? "Мечи"
                            : "Жезлы"
                          : card.suit === "cups"
                          ? "Cups"
                          : card.suit === "pentacles"
                          ? "Pentacles"
                          : card.suit === "swords"
                          ? "Swords"
                          : "Wands"}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Shuffle className="h-4 w-4" />}
            onClick={generateRandomSpread}
            className="w-full sm:w-auto"
          >
            {locale === "ru"
              ? "Сгенерировать новый расклад"
              : "Generate New Spread"}
          </Button>
        </div>
      )}
    </div>
  );
}
