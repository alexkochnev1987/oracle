"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ReadingCard } from "@/components/reading-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/use-locale";
import { getTranslations } from "@/lib/i18n";
import { BookOpen } from "lucide-react";

export default function ReadingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [locale] = useLocale();
  const t = getTranslations(locale);
  const [readings, setReadings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && session?.user?.id) {
      fetch("/api/readings")
        .then((res) => res.json())
        .then((data) => {
          setReadings(data);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [status, session, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen mystical-gradient">
        <Navbar />
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="mx-auto max-w-4xl space-y-4">
            <LoadingSkeleton variant="card" count={3} />
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen mystical-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 sm:mb-8 text-3xl sm:text-4xl font-bold text-white">
            {t.nav.readings}
          </h1>

          {readings.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-12 w-12 sm:h-16 sm:w-16" />}
              title={t.readings.emptyTitle}
              description={t.readings.emptyDescription}
              action={
                <Button
                  variant="primary"
                  onClick={() => router.push("/dashboard")}
                >
                  {t.readings.goToDashboard}
                </Button>
              }
            />
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {readings.map((reading) => (
                <ReadingCard
                  key={reading.id}
                  reading={reading}
                  href={`/readings/${reading.id}`}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
