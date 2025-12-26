"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { QrCode, Trash2 } from "lucide-react";
import { Locale } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Reading {
  id: string;
  question: string;
  createdAt: Date | string;
  tarotReaderId: string;
  shareToken?: string | null;
}

interface ReadingCardProps {
  reading: Reading;
  href: string;
  locale: Locale;
  onShareClick?: (reading: Reading) => void;
  onDeleteClick?: (reading: Reading) => void;
}

export function ReadingCard({ reading, href, locale, onShareClick, onDeleteClick }: ReadingCardProps) {
  const date = typeof reading.createdAt === "string" 
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
    <Link href={href}>
      <Card
        hover
        glow
        className="p-4 sm:p-5 md:p-6 cursor-pointer relative"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white line-clamp-2 flex-1">
            {reading.question}
          </h3>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm text-[#9ca3af] whitespace-nowrap">
              {format(date, "PPP", {
                locale: locale === "ru" ? ru : enUS,
              })}
            </span>
            <div className="flex items-center gap-1">
              {reading.shareToken && onShareClick && (
                <button
                  onClick={handleShareClick}
                  className="p-2 rounded-md hover:bg-[rgba(100,200,255,0.1)] transition-colors text-[rgba(100,200,255,0.8)] hover:text-[rgba(100,200,255,1)]"
                  title="Поделиться"
                >
                  <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
              {onDeleteClick && (
                <button
                  onClick={handleDeleteClick}
                  className="p-2 rounded-md hover:bg-[rgba(239,68,68,0.1)] transition-colors text-[rgba(239,68,68,0.8)] hover:text-[rgba(239,68,68,1)]"
                  title="Удалить"
                >
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-[#9ca3af] mt-2">
          Click to view full reading
        </p>
      </Card>
    </Link>
  );
}

