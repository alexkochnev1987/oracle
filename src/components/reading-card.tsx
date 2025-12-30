"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { QrCode, Trash2 } from "lucide-react";
import { Locale, getTranslations } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Reading {
  id: string;
  question: string;
  createdAt: Date | string;
  tarotReaderId: string;
  shareToken?: string | null;
  userImageUrl?: string | null;
}

interface ReadingCardProps {
  reading: Reading;
  href: string;
  locale: Locale;
  onShareClick?: (reading: Reading) => void;
  onDeleteClick?: (reading: Reading) => void;
}

export function ReadingCard({
  reading,
  href,
  locale,
  onShareClick,
  onDeleteClick,
}: ReadingCardProps) {
  const t = getTranslations(locale);
  const date =
    typeof reading.createdAt === "string"
      ? new Date(reading.createdAt)
      : reading.createdAt;

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShareClick && reading.shareToken) {
      onShareClick(reading);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDeleteClick) {
      onDeleteClick(reading);
    }
  };

  return (
    <Link href={href} prefetch={true}>
      <Card
        hover
        glow
        className="p-5 sm:p-6 md:p-7 lg:p-8 cursor-pointer relative"
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5">
          {/* User Image - show if exists */}
          {reading.userImageUrl && (
            <div className="relative w-full sm:w-32 md:w-40 lg:w-48 h-32 sm:h-32 md:h-40 lg:h-48 flex-shrink-0 rounded-lg overflow-hidden border border-[rgba(100,200,255,0.4)] bg-[rgba(26,26,58,0.7)]">
              <Image
                src={reading.userImageUrl}
                alt={t.readings.userPhoto}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 160px, 192px"
                quality={85}
                unoptimized={reading.userImageUrl.startsWith("http")}
              />
            </div>
          )}

          <div className="flex-1 flex flex-col gap-3 sm:gap-4 md:gap-5 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 md:gap-5">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white line-clamp-2 flex-1 pr-2 sm:pr-4">
                {reading.question}
              </h3>
              <div className="flex items-center gap-3 sm:gap-4 md:gap-5 flex-shrink-0">
                <span className="text-xs sm:text-sm md:text-base text-[#9ca3af] whitespace-nowrap">
                  {format(date, "PPP", {
                    locale: locale === "ru" ? ru : enUS,
                  })}
                </span>
                <div className="flex items-center gap-1 sm:gap-2">
                  {reading.shareToken && onShareClick && (
                    <button
                      onClick={handleShareClick}
                      className="p-2 sm:p-2.5 rounded-md hover:bg-[rgba(100,200,255,0.1)] transition-colors text-[rgba(100,200,255,0.8)] hover:text-[rgba(100,200,255,1)]"
                      title={t.common.share}
                    >
                      <QrCode className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                    </button>
                  )}
                  {onDeleteClick && (
                    <button
                      onClick={handleDeleteClick}
                      className="p-2 sm:p-2.5 rounded-md hover:bg-[rgba(239,68,68,0.1)] transition-colors text-[rgba(239,68,68,0.8)] hover:text-[rgba(239,68,68,1)]"
                      title={t.readings.delete}
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-[#9ca3af]">
              Click to view full reading
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
