"use client";

import { Locale } from "@/lib/i18n";
import { TarotReader } from "@/lib/tarot-readers";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface OracleSelectorProps {
  oracles: TarotReader[];
  selectedId?: string;
  onSelect: (id: string) => void;
  locale: Locale;
}

export function OracleSelector({
  oracles,
  selectedId,
  onSelect,
  locale,
}: OracleSelectorProps) {
  return (
    <div className="p-3 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {oracles.map((oracle) => {
        const isSelected = selectedId === oracle.id;
        return (
          <button
            key={oracle.id}
            type="button"
            onClick={() => onSelect(oracle.id)}
            className={cn(
              "relative group aspect-square rounded-lg overflow-visible transition-all duration-300 ease-in-out",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent",
              isSelected
                ? "border-2 border-[#d4af37] gold-glow bg-[rgba(212,175,55,0.1)] scale-105"
                : "border-2 border-[rgba(100,200,255,0.4)] hover:border-[rgba(100,200,255,0.7)] hover:scale-105 hover:shadow-[0_0_20px_rgba(100,200,255,0.4)]"
            )}
            aria-label={oracle.name}
          >
            <div className="relative w-full h-full overflow-hidden rounded-lg">
              <Image
                src={oracle.imagePath}
                alt={oracle.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                quality={85}
                loading="lazy"
                unoptimized={oracle.imagePath.startsWith("http")}
              />
              {/* <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20",
                  "transition-opacity duration-300"
                )}
              /> */}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3  text-center z-10">
              <div className="bg-gradient-to-t from-black/95 via-black/80 to-transparent rounded-b-lg -mx-3 sm:-mx-4 -mb-3 sm:-mb-4 px-3 sm:px-4 pb-3 sm:pb-4 pt-2">
                <h3
                  className={cn(
                    "text-xs sm:text-xs font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
                    isSelected &&
                      "text-[#d4af37] drop-shadow-[0_2px_4px_rgba(212,175,55,0.5)]"
                  )}
                >
                  {oracle.name}
                </h3>
              </div>
            </div>
            {isSelected && (
              <div className="absolute top-2 right-2">
                <div className="h-6 w-6 rounded-full bg-[#d4af37] flex items-center justify-center">
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
