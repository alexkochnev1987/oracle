"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { PageContainer } from "@/components/page-container";
import { useLocale } from "@/hooks/use-locale";
import { getTranslations } from "@/lib/i18n";
import { BackgroundNavigation, BACKGROUND_IMAGES } from "@/components/background-navigation";

interface PublicReadingErrorProps {
  message?: string;
}

export function PublicReadingError({ message }: PublicReadingErrorProps) {
  const [locale] = useLocale();
  const t = getTranslations(locale);
  const [backgroundIndex, setBackgroundIndex] = useState(0);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 z-0">
        <Image
          src={BACKGROUND_IMAGES[backgroundIndex]}
          alt="Background"
          fill
          className="object-cover transition-opacity duration-500"
          priority
        />
        <div className="absolute inset-0 bg-[rgba(13,13,26,0.7)]" />
      </div>
      <Navbar />
      <BackgroundNavigation
        currentIndex={backgroundIndex}
        onIndexChange={setBackgroundIndex}
      />
      <PageContainer maxWidth="4xl" className="relative z-10">
        <Card className="p-6 text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">
            {t.common.readingNotFound}
          </h1>
          <p className="text-[#9ca3af]">
            {message || t.common.readingNotFoundOrDeleted}
          </p>
        </Card>
      </PageContainer>
    </div>
  );
}

