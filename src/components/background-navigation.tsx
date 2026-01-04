"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const BACKGROUND_IMAGES = [
  "/alien/ai.png",
  "/alien/alien.png",
  "/alien/door.png",
  "/alien/light.png",
  "/alien/space.png",
  "/alien/star.png",
];

interface BackgroundNavigationProps {
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export function BackgroundNavigation({
  currentIndex,
  onIndexChange,
}: BackgroundNavigationProps) {
  const handlePrevious = () => {
    const newIndex =
      currentIndex === 0 ? BACKGROUND_IMAGES.length - 1 : currentIndex - 1;
    onIndexChange(newIndex);
  };

  const handleNext = () => {
    const newIndex =
      currentIndex === BACKGROUND_IMAGES.length - 1 ? 0 : currentIndex + 1;
    onIndexChange(newIndex);
  };

  return (
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
  );
}

export { BACKGROUND_IMAGES };

