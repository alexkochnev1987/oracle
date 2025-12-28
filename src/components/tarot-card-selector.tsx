"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Shuffle, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  getRandomSpread,
  allTarotCards,
  type TarotCard,
  getCardName,
  getCardImageUrl,
} from "@/lib/tarot-cards";
import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";

type SelectionMode = "random" | "manual";

interface TarotCardSelectorProps {
  label: string;
  selectedCards?: TarotCard[];
  mode?: SelectionMode;
  locale?: Locale;
  onSelectedCardsChange?: (cards: TarotCard[]) => void;
  onModeChange?: (mode: SelectionMode) => void;
  className?: string;
  allCardsRevealed?: boolean; // If false, all cards start face down
  onRevealedCardsChange?: (revealedCount: number) => void; // Callback for revealed cards count
}

export function TarotCardSelector({
  label,
  selectedCards,
  mode: controlledMode,
  locale = "ru",
  onSelectedCardsChange,
  onModeChange,
  className,
  allCardsRevealed = false,
  onRevealedCardsChange,
}: TarotCardSelectorProps) {
  const t = getTranslations(locale);
  const [internalMode, setInternalMode] = useState<SelectionMode>("random");
  const [internalSelectedCards, setInternalSelectedCards] = useState<
    TarotCard[]
  >([]);
  // Initialize revealed cards based on allCardsRevealed prop
  const [revealedCardIndices, setRevealedCardIndices] = useState<Set<number>>(
    () => {
      if (allCardsRevealed && selectedCards && selectedCards.length > 0) {
        return new Set(selectedCards.map((_, index) => index));
      }
      return new Set();
    }
  );
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
    if (newMode === "random") {
      // Reset generation state when switching to random mode
      setHasGeneratedOnce(false);
      setRevealedCardIndices(new Set());
      // Generate initial random spread but keep cards face down
      generateRandomSpread(false);
    } else {
      // Clear selected cards when switching to manual mode
      if (onSelectedCardsChange) {
        onSelectedCardsChange([]);
      } else {
        setInternalSelectedCards([]);
      }
      setRevealedCardIndices(new Set());
    }
  };

  const generateRandomSpread = async (revealCards: boolean = false) => {
    // Only show loading if we already have cards (not first generation)
    const hasExistingCards = currentSelectedCards.length > 0;

    if (hasExistingCards) {
      setIsGenerating(true);
      setRevealedCardIndices(new Set());

      // Simulate loading delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));
    } else {
      setRevealedCardIndices(new Set());
    }

    const newCards = getRandomSpread(3); // Changed from 6 to 3
    if (onSelectedCardsChange) {
      onSelectedCardsChange(newCards);
    } else {
      setInternalSelectedCards(newCards);
    }

    if (hasExistingCards) {
      setIsGenerating(false);
    }

    // Mark as generated
    setHasGeneratedOnce(true);
  };

  const handleCardClick = (index: number) => {
    if (mode === "random") {
      // Toggle reveal state for this specific card
      setRevealedCardIndices((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
        return newSet;
      });
    }
  };

  const handleManualCardClick = (card: TarotCard) => {
    if (mode !== "manual") return;

    const isSelected = currentSelectedCards.some((c) => c.id === card.id);
    let newSelectedCards: TarotCard[];

    if (isSelected) {
      // Deselect card
      newSelectedCards = currentSelectedCards.filter((c) => c.id !== card.id);
    } else {
      // Select card (max 3)
      if (currentSelectedCards.length >= 3) {
        return; // Already selected 3 cards
      }
      newSelectedCards = [...currentSelectedCards, card];
    }

    if (onSelectedCardsChange) {
      onSelectedCardsChange(newSelectedCards);
    } else {
      setInternalSelectedCards(newSelectedCards);
    }
  };

  // Generate initial spread if in random mode and no cards selected
  useEffect(() => {
    if (mode === "random" && currentSelectedCards.length === 0) {
      generateRandomSpread(false);
    }
  }, [mode]);

  // Reset revealed cards when allCardsRevealed changes or cards change
  useEffect(() => {
    if (currentSelectedCards.length > 0) {
      if (allCardsRevealed) {
        const allRevealed = new Set(
          currentSelectedCards.map((_, index) => index)
        );
        setRevealedCardIndices(allRevealed);
      } else {
        setRevealedCardIndices(new Set());
      }
    }
  }, [allCardsRevealed, currentSelectedCards.length]);

  // Notify parent about revealed cards count when it changes (async to avoid setState during render)
  useEffect(() => {
    if (onRevealedCardsChange) {
      if (mode === "random") {
        onRevealedCardsChange(revealedCardIndices.size);
      } else {
        // In manual mode, revealed count is 0 (cards are always visible)
        onRevealedCardsChange(0);
      }
    }
  }, [revealedCardIndices.size, mode, onRevealedCardsChange]);

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
              {t.dashboard.randomSpread}
            </span>
            <span className="sm:hidden">
              {t.common.spread}
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("manual")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 text-sm sm:text-base font-medium",
              mode === "manual"
                ? "bg-gradient-to-r from-[#4a9eff] to-[#7c3aed] text-white shadow-[0_0_15px_rgba(100,200,255,0.4)]"
                : "text-[#9ca3af] hover:text-white hover:bg-[rgba(100,200,255,0.1)]"
            )}
          >
            <Hand className="h-4 w-4" />
            <span className="hidden sm:inline">
              {t.common.selectCards}
            </span>
            <span className="sm:hidden">
              {t.common.select}
            </span>
          </button>
        </div>
      </div>

      {/* Random Spread Mode */}
      {mode === "random" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {isGenerating
              ? // Loading skeletons
                Array.from({ length: 3 }).map((_, index) => (
                  <Card
                    key={`loading-${index}`}
                    className="p-2 sm:p-3 bg-[rgba(26,26,58,0.7)] border-[rgba(100,200,255,0.3)]"
                  >
                    <div className="text-center space-y-2 relative">
                      <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-[rgba(26,26,58,0.9)] border border-[rgba(100,200,255,0.2)] animate-pulse">
                        <div className="w-full h-full bg-gradient-to-br from-[rgba(100,200,255,0.1)] to-[rgba(124,58,237,0.1)]" />
                      </div>
                      <div className="min-h-[20px] flex items-center justify-center">
                        <div className="h-4 w-3/4 bg-[rgba(100,200,255,0.2)] rounded animate-pulse" />
                      </div>
                      <div className="min-h-[14px] flex items-center justify-center">
                        <div className="h-3 w-2/3 bg-[rgba(100,200,255,0.1)] rounded animate-pulse" />
                      </div>
                    </div>
                  </Card>
                ))
              : currentSelectedCards.map((card, index) => {
                  const cardImageUrl = getCardImageUrl(card.id);
                  const hasImage = card.imageUrl !== undefined;
                  const isRevealed = revealedCardIndices.has(index);

                  return (
                    <Card
                      key={`${card.id}-${index}`}
                      className="p-2 sm:p-3 bg-[rgba(26,26,58,0.7)] border-[rgba(100,200,255,0.3)] hover:border-[rgba(100,200,255,0.5)] transition-all overflow-hidden cursor-pointer"
                      onClick={() => handleCardClick(index)}
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
                              transform: isRevealed
                                ? "rotateY(0deg)"
                                : "rotateY(180deg)",
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
                                  {t.common.tarot}
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
                                  <div className="text-2xl sm:text-3xl mb-1">
                                    🃏
                                  </div>
                                  <div className="text-[8px] sm:text-[10px] text-[rgba(100,200,255,0.6)] font-medium text-center leading-tight">
                                    {getCardName(card, locale)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Name */}
                        <div className="min-h-[20px] flex items-center justify-center">
                          {isRevealed && (
                            <div className="text-xs sm:text-sm font-semibold text-[rgba(100,200,255,0.9)]">
                              {getCardName(card, locale)}
                            </div>
                          )}
                        </div>

                        {/* Card Type */}
                        <div className="min-h-[14px] flex items-center justify-center">
                          {isRevealed && (
                            <>
                              {card.arcana === "major" && (
                                <div className="text-[10px] text-[#9ca3af]">
                                  {locale === "ru"
                                    ? "Старший Аркан"
                                    : "Major Arcana"}
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
                })}
          </div>
        </div>
      )}

      {/* Manual Selection Mode */}
      {mode === "manual" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#9ca3af]">
              {locale === "ru"
                ? `Выбрано: ${currentSelectedCards.length}/3`
                : `Selected: ${currentSelectedCards.length}/3`}
            </p>
            {currentSelectedCards.length > 0 && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (onSelectedCardsChange) {
                    onSelectedCardsChange([]);
                  } else {
                    setInternalSelectedCards([]);
                  }
                }}
              >
                {t.common.clear}
              </Button>
            )}
          </div>

          {/* Selected Cards Display */}
          {currentSelectedCards.length > 0 && (
            <div className="space-y-3 overflow-visible mb-6 sm:mb-8">
              <h3 className="text-sm sm:text-base font-semibold text-white">
                {t.common.selectedCards}
              </h3>
              <div className="grid grid-cols-3 gap-6 sm:gap-8 overflow-visible">
                {currentSelectedCards.map((card, index) => {
                  const cardImageUrl = getCardImageUrl(card.id);
                  const hasImage = card.imageUrl !== undefined;
                  const position = index + 1;

                  return (
                    <Card
                      key={`selected-${card.id}`}
                      className="p-2 sm:p-3 bg-[rgba(26,26,58,0.7)] border-2 border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.5)] overflow-visible"
                    >
                      <div className="text-center space-y-1.5">
                        <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-[rgba(26,26,58,0.9)] border border-[rgba(212,175,55,0.3)]">
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
                              <div className="text-2xl sm:text-3xl mb-1">
                                🃏
                              </div>
                              <div className="text-xs sm:text-sm text-[rgba(100,200,255,0.6)] font-medium text-center leading-tight">
                                {getCardName(card, locale)}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs sm:text-sm font-bold text-[#d4af37]">
                            {locale === "ru"
                              ? `Карта ${position}`
                              : `Card ${position}`}
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-[rgba(100,200,255,0.9)] line-clamp-2">
                            {getCardName(card, locale)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-12 max-h-[600px] overflow-y-auto">
            {allTarotCards.map((card) => {
              const cardImageUrl = getCardImageUrl(card.id);
              const hasImage = card.imageUrl !== undefined;
              const isSelected = currentSelectedCards.some(
                (c) => c.id === card.id
              );
              const canSelect = currentSelectedCards.length < 3 || isSelected;

              return (
                <Card
                  key={card.id}
                  className={cn(
                    "p-1 sm:p-2 bg-[rgba(26,26,58,0.7)] border transition-all cursor-pointer",
                    isSelected
                      ? "border-[#d4af37] border-2 shadow-[0_0_15px_rgba(212,175,55,0.5)]"
                      : canSelect
                      ? "border-[rgba(100,200,255,0.3)] hover:border-[rgba(100,200,255,0.5)]"
                      : "border-[rgba(100,200,255,0.1)] opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => handleManualCardClick(card)}
                >
                  <div className="text-center space-y-3">
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
                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                          <div className="text-4xl sm:text-5xl mb-2">🃏</div>
                          <div className="text-base sm:text-lg text-[rgba(100,200,255,0.6)] font-medium text-center leading-tight">
                            {getCardName(card, locale)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-base sm:text-lg font-semibold text-[rgba(100,200,255,0.9)] line-clamp-2">
                      {getCardName(card, locale)}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
