"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";

interface CreditsWarningProps {
  credits: number;
  isWhitelisted: boolean;
  locale: Locale;
}

export function CreditsWarning({
  credits,
  isWhitelisted,
  locale,
}: CreditsWarningProps) {
  const t = getTranslations(locale);
  
  // Don't show if user is whitelisted
  if (isWhitelisted) {
    return null;
  }

  // No credits warning
  if (credits < 1) {
    return (
      <Card className="mb-6 p-4 border-yellow-500/50 bg-yellow-500/10">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-yellow-200 font-medium mb-1">
              {t.common.outOfCredits}
            </p>
            <p className="text-xs text-yellow-300/80 mb-3">
              {t.common.purchaseCreditsMessage}
            </p>
            <Link href="/billing">
              <Button variant="primary" size="sm">
                {t.common.buyCredits}
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  // Low credits warning (1-3 credits)
  if (credits > 0 && credits <= 3) {
    let creditsText: string;
    if (locale === "ru") {
      const form =
        credits === 1
          ? t.common.credit
          : credits < 5
          ? t.common.credits2to4
          : t.common.credits5plus;
      creditsText = t.common.creditsRemaining
        .replace("{count}", credits.toString())
        .replace("{form}", form);
    } else {
      // English: "You have {count} credit{plural} remaining"
      const plural = credits === 1 ? "" : "s";
      creditsText = t.common.creditsRemaining
        .replace("{count}", credits.toString())
        .replace("{plural}", plural);
    }

    return (
      <Card className="mb-6 p-4 border-[rgba(100,200,255,0.3)] bg-[rgba(100,200,255,0.1)]">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[rgba(100,200,255,0.8)] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-white font-medium mb-1">{creditsText}</p>
            <Link href="/billing">
              <Button variant="secondary" size="sm" className="mt-2">
                {t.common.topUpCredits}
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return null;
}

