"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShareAppButton } from "@/components/share-app-button";
import { Sparkles, Star, Moon, Gem } from "lucide-react";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";
import { PageContainer } from "@/components/page-container";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [locale] = useLocale();
  const t = getTranslations(locale);

  const handleButtonClick = (e: React.MouseEvent) => {
    if (status === "unauthenticated") {
      e.preventDefault();
      router.push("/auth/signin");
    }
  };

  return (
    <div className="min-h-screen mystical-gradient">
      <Navbar />
      <PageContainer
        maxWidth="4xl"
        paddingBottom="pb-12 sm:pb-16"
        className="text-center"
      >
        {/* Hero Section */}
        <div className="mb-12 sm:mb-16 space-y-6 sm:space-y-8">
          <div className="flex justify-center">
            <div className="relative">
              <Gem className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-[rgba(100,200,255,0.8)] mystical-glow" />
              <Star className="absolute -top-2 -right-2 h-6 w-6 sm:h-8 sm:w-8 animate-pulse text-yellow-400" />
              <Moon className="absolute -bottom-2 -left-2 h-5 w-5 sm:h-6 sm:w-6 animate-pulse text-[rgba(100,200,255,0.8)]" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white">
            {t.landing.title}
          </h1>

          <p className="mx-auto max-w-2xl text-lg sm:text-xl md:text-2xl text-[#e5e7eb]">
            {t.landing.subtitle}
          </p>

          <p className="mx-auto max-w-xl text-base sm:text-lg text-[#9ca3af]">
            {t.landing.description}
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href={status === "authenticated" ? "/dashboard" : "/auth/signin"}
            >
              <Button
                variant="primary"
                size="lg"
                icon={<Sparkles className="h-5 w-5" />}
                className="w-full sm:w-auto"
                onClick={handleButtonClick}
              >
                {t.landing.cta}
              </Button>
            </Link>
            <ShareAppButton />
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <Card hover glow className="p-4 sm:p-6">
            <Star className="mx-auto mb-4 h-8 w-8 sm:h-10 sm:w-10 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-white">
              {t.features.personalized.title}
            </h3>
            <p className="text-sm sm:text-base text-[#e5e7eb]">
              {t.features.personalized.description}
            </p>
          </Card>

          <Card hover glow className="p-4 sm:p-6">
            <Moon className="mx-auto mb-4 h-8 w-8 sm:h-10 sm:w-10 text-[rgba(100,200,255,0.8)] drop-shadow-[0_0_8px_rgba(100,200,255,0.5)]" />
            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-white">
              {t.features.tarot.title}
            </h3>
            <p className="text-sm sm:text-base text-[#e5e7eb]">
              {t.features.tarot.description}
            </p>
          </Card>

          <Card hover glow className="p-4 sm:p-6">
            <Gem className="mx-auto mb-4 h-8 w-8 sm:h-10 sm:w-10 text-[rgba(124,58,237,0.8)] drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]" />
            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-white">
              {t.features.forecast.title}
            </h3>
            <p className="text-sm sm:text-base text-[#e5e7eb]">
              {t.features.forecast.description}
            </p>
          </Card>
        </div>
      </PageContainer>
    </div>
  );
}
