"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { useLocale } from "@/hooks/use-locale";
import { getTranslations } from "@/lib/i18n";
import { getTarotReader } from "@/lib/tarot-readers";

export default function ReadingDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const t = getTranslations(locale);
  const [reading, setReading] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && params.id) {
      fetch(`/api/readings/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setReading(data);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [status, params.id, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen mystical-gradient">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !reading) {
    return null;
  }

  const reader = getTarotReader(reading.tarotReaderId);

  return (
    <div className="min-h-screen mystical-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 rounded-lg border border-purple-500/20 bg-black/30 p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">{reading.question}</h1>
              <span className="text-sm text-gray-400">
                {format(new Date(reading.createdAt), "PPP", {
                  locale: locale === "ru" ? ru : enUS,
                })}
              </span>
            </div>
            <div className="mb-4">
              <span className="text-sm text-purple-400">
                {reader.name[locale]} - {reader.description[locale]}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-purple-500/20 bg-black/30 p-8 backdrop-blur">
            <h2 className="mb-4 text-2xl font-semibold text-white">Your Reading</h2>
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                {reading.predictionText}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

