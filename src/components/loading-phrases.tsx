"use client";

import { useEffect, useState, useMemo } from "react";
import { Locale, getTranslations } from "@/lib/i18n";
import { TarotReaderId } from "@/lib/tarot-readers";
import { cn } from "@/lib/utils";

interface LoadingPhrasesProps {
  tarotReaderId: TarotReaderId;
  locale: Locale;
  hasPhoto: boolean;
}

// Interval timings for each archetype (in milliseconds)
const ARCHETYPE_INTERVALS: Record<TarotReaderId, number> = {
  "cosmic-oracle": 3500, // Slow fade (3-4 sec)
  "astral-sorcerer": 2500, // Ritual steps (2-3 sec)
  "alien-seer": 1750, // Sharp switches (1.5-2 sec)
  "mechanical-prophet": 1250, // Log lines (1-1.5 sec)
};

// Stage duration estimates (in milliseconds)
const IMAGE_ANALYSIS_DURATION = 3000; // ~3 seconds
const TEXT_GENERATION_DURATION = 5000; // ~5 seconds

// Shuffle array function (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function LoadingPhrases({
  tarotReaderId,
  locale,
  hasPhoto,
}: LoadingPhrasesProps) {
  const [currentPhrase, setCurrentPhrase] = useState<string>("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [currentStage, setCurrentStage] = useState<"imageAnalysis" | "textGeneration">(
    hasPhoto ? "imageAnalysis" : "textGeneration"
  );

  const translations = getTranslations(locale);
  const loadingPhrases = translations.loadingPhrases?.[tarotReaderId];
  const interval = ARCHETYPE_INTERVALS[tarotReaderId];

  // Prepare phrases for current stage
  const stagePhrases = useMemo(() => {
    if (!loadingPhrases) return [];
    
    const phrases = loadingPhrases[currentStage];
    if (!phrases || phrases.length < 2) return [];

    // First 2 phrases are always in order (initialization)
    const initializationPhrases = phrases.slice(0, 2);
    // Rest are shuffled randomly
    const randomPhrases = phrases.length > 2 ? shuffleArray(phrases.slice(2)) : [];

    return [...initializationPhrases, ...randomPhrases];
  }, [loadingPhrases, currentStage]);

  // Initialize with first phrase
  useEffect(() => {
    if (stagePhrases.length > 0) {
      setCurrentPhrase(stagePhrases[0]);
      setPhraseIndex(0);
      setIsFading(false);
    }
  }, [stagePhrases]);

  // Handle phrase rotation
  useEffect(() => {
    if (stagePhrases.length === 0) return;

    const fadeOutDuration = 500; // 500ms for fade out
    const fadeInDuration = 500; // 500ms for fade in

    // Stage transition logic - only if we have photo and are in imageAnalysis stage
    let stageTransitionTimer: NodeJS.Timeout | null = null;
    if (hasPhoto && currentStage === "imageAnalysis") {
      stageTransitionTimer = setTimeout(() => {
        setCurrentStage("textGeneration");
        setPhraseIndex(0);
        setIsFading(false);
      }, IMAGE_ANALYSIS_DURATION);
    }

    // Phrase rotation timer
    const phraseTimer = setInterval(() => {
      setIsFading(true); // Start fade out

      setTimeout(() => {
        setPhraseIndex((prev) => {
          const nextIndex = (prev + 1) % stagePhrases.length;
          setCurrentPhrase(stagePhrases[nextIndex]);
          setIsFading(false); // Start fade in
          return nextIndex;
        });
      }, fadeOutDuration);
    }, interval);

    return () => {
      clearInterval(phraseTimer);
      if (stageTransitionTimer) {
        clearTimeout(stageTransitionTimer);
      }
    };
  }, [stagePhrases, interval, hasPhoto, currentStage]);

  // Update phrase when stage changes
  useEffect(() => {
    if (stagePhrases.length > 0) {
      setCurrentPhrase(stagePhrases[0]);
      setPhraseIndex(0);
      setIsFading(false);
    }
  }, [currentStage, stagePhrases]);

  if (stagePhrases.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="text-lg text-[#9ca3af]">{translations.common.loading}</div>
      </div>
    );
  }

  return (
    <div className="text-center py-4 space-y-4">
      <div
        className={cn(
          "text-base sm:text-lg md:text-xl font-medium text-white transition-opacity duration-500",
          isFading ? "opacity-0" : "opacity-100"
        )}
      >
        {currentPhrase}
      </div>
      
      {/* Loading indicator */}
      <div className="flex justify-center">
        <div className="h-1 w-48 sm:w-64 bg-[rgba(100,200,255,0.2)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[rgba(100,200,255,0.6)] to-[rgba(124,58,237,0.6)] transition-all duration-300 animate-pulse"
            style={{
              width: "60%",
            }}
          />
        </div>
      </div>
    </div>
  );
}

