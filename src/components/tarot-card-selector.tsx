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
  const [cardsRevealed, setCardsRevealed] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState<boolean>(false);

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
      // Reset generation state when switching to upload mode
      setHasGeneratedOnce(false);
      setCardsRevealed(false);
    } else {
      if (onCardsImageChange) {
        onCardsImageChange("");
      }
      // Reset generation state when switching to random mode
      setHasGeneratedOnce(false);
      setCardsRevealed(false);
      // Generate initial random spread but keep cards face down
      generateRandomSpread(false);
    }
  };

  const generateRandomSpread = async (revealCards: boolean = true) => {
    // Check if already generated once
    if (hasGeneratedOnce && revealCards) {
      return; // Don't allow second generation
    }

    // Only show loading if we already have cards (not first generation)
    const hasExistingCards = currentSelectedCards.length > 0;
    
    if (hasExistingCards) {
      setIsGenerating(true);
      setCardsRevealed(false);
      
      // Simulate loading delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));
    } else {
      setCardsRevealed(false);
    }
    
    const newCards = getRandomSpread(6);
    if (onSelectedCardsChange) {
      onSelectedCardsChange(newCards);
    } else {
      setInternalSelectedCards(newCards);
    }
    
    if (hasExistingCards) {
      setIsGenerating(false);
    }
    
    // Mark as generated if revealing cards
    if (revealCards) {
      setHasGeneratedOnce(true);
    }
    
    // Reveal cards after a short delay
    if (revealCards) {
      setTimeout(() => {
        setCardsRevealed(true);
      }, hasExistingCards ? 200 : 100);
    }
  };

  // Generate initial spread if in random mode and no cards selected
  useEffect(() => {
    if (mode === "random" && currentSelectedCards.length === 0) {
      generateRandomSpread(false);
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
            {isGenerating ? (
              // Loading skeletons - same structure as cards to prevent layout shift
              Array.from({ length: 6 }).map((_, index) => (
                <Card
                  key={`loading-${index}`}
                  className="p-2 sm:p-3 bg-[rgba(26,26,58,0.7)] border-[rgba(100,200,255,0.3)]"
                >
                  <div className="text-center space-y-2 relative">
                    <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-[rgba(26,26,58,0.9)] border border-[rgba(100,200,255,0.2)] animate-pulse">
                      <div className="w-full h-full bg-gradient-to-br from-[rgba(100,200,255,0.1)] to-[rgba(124,58,237,0.1)]" />
                    </div>
                    {/* Placeholder for card name - same height as real card name */}
                    <div className="min-h-[20px] flex items-center justify-center">
                      <div className="h-4 w-3/4 bg-[rgba(100,200,255,0.2)] rounded animate-pulse" />
                    </div>
                    {/* Placeholder for card type - same height as real card type */}
                    <div className="min-h-[14px] flex items-center justify-center">
                      <div className="h-3 w-2/3 bg-[rgba(100,200,255,0.1)] rounded animate-pulse" />
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              currentSelectedCards.map((card, index) => {
                const cardImageUrl = getCardImageUrl(card.id);
                const hasImage = card.imageUrl !== undefined;
                const isRevealed = cardsRevealed;

                return (
                  <Card
                    key={`${card.id}-${index}`}
                    className="p-2 sm:p-3 bg-[rgba(26,26,58,0.7)] border-[rgba(100,200,255,0.3)] hover:border-[rgba(100,200,255,0.5)] transition-all overflow-hidden"
                  >
                    <div className="text-center space-y-2 relative">
                      {/* Card Image Container with 3D flip effect */}
                      <div
                        className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-[rgba(26,26,58,0.9)] border border-[rgba(100,200,255,0.2)]"
                        style={{
                          perspective: "1000px",
                        }}
                      >
                        <div
                          className="relative w-full h-full transition-transform duration-700 ease-in-out"
                          style={{
                            transformStyle: "preserve-3d",
                            transform: isRevealed ? "rotateY(0deg)" : "rotateY(180deg)",
                          }}
                        >
                          {/* Card Back (Face Down) */}
                          <div
                            className="absolute inset-0 w-full h-full backface-hidden"
                            style={{
                              backfaceVisibility: "hidden",
                              transform: "rotateY(180deg)",
                            }}
                          >
                            <div className="w-full h-full bg-gradient-to-br from-[#1a1a3a] via-[#2d1b4e] to-[#1a1a3a] flex flex-col items-center justify-center p-4 border-2 border-[rgba(212,175,55,0.3)]">
                              <div className="text-4xl sm:text-5xl mb-2 opacity-80">
                                🔮
                              </div>
                              <div className="text-[10px] sm:text-xs text-[rgba(212,175,55,0.7)] font-semibold uppercase tracking-wider">
                                {locale === "ru" ? "Таро" : "Tarot"}
                              </div>
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(212,175,55,0.1)_100%)]" />
                            </div>
                          </div>

                          {/* Card Front (Face Up) */}
                          <div
                            className="absolute inset-0 w-full h-full backface-hidden"
                            style={{
                              backfaceVisibility: "hidden",
                            }}
                          >
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
                        </div>
                      </div>

                      {/* Card Name - reserve space to prevent layout shift */}
                      <div className="min-h-[20px] flex items-center justify-center">
                        {isRevealed && (
                          <div className="text-xs sm:text-sm font-semibold text-[rgba(100,200,255,0.9)]">
                            {getCardName(card, locale)}
                          </div>
                        )}
                      </div>

                      {/* Card Type - reserve space to prevent layout shift */}
                      <div className="min-h-[14px] flex items-center justify-center">
                        {isRevealed && (
                          <>
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
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Shuffle className="h-4 w-4" />}
            onClick={() => generateRandomSpread(true)}
            disabled={isGenerating || hasGeneratedOnce}
            className="w-full sm:w-auto"
          >
            {isGenerating
              ? locale === "ru"
                ? "Генерация..."
                : "Generating..."
              : hasGeneratedOnce
              ? locale === "ru"
                ? "Расклад сгенерирован"
                : "Spread Generated"
              : locale === "ru"
              ? "Сгенерировать новый расклад"
              : "Generate New Spread"}
          </Button>
        </div>
      )}
    </div>
  );
}
