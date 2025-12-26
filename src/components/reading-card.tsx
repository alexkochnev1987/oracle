"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { Locale } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Reading {
  id: string;
  question: string;
  createdAt: Date | string;
  tarotReaderId: string;
}

interface ReadingCardProps {
  reading: Reading;
  href: string;
  locale: Locale;
}

export function ReadingCard({ reading, href, locale }: ReadingCardProps) {
  const date = typeof reading.createdAt === "string" 
    ? new Date(reading.createdAt) 
    : reading.createdAt;

  return (
    <Link href={href}>
      <Card
        hover
        glow
        className="p-4 sm:p-5 md:p-6 cursor-pointer"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white line-clamp-2">
            {reading.question}
          </h3>
          <span className="text-xs sm:text-sm text-[#9ca3af] whitespace-nowrap">
            {format(date, "PPP", {
              locale: locale === "ru" ? ru : enUS,
            })}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#9ca3af] mt-2">
          Click to view full reading
        </p>
      </Card>
    </Link>
  );
}

