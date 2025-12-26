"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { useLocale } from "@/hooks/use-locale";
import { getTranslations } from "@/lib/i18n";

export default function ReadingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = getTranslations(locale);
  const [readings, setReadings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
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
        <div className="container mx-auto px-4 py-16">
          <div className="space-y-4">
            <div className="h-32 w-full bg-black/40 rounded-lg animate-pulse" />
            <div className="h-32 w-full bg-black/40 rounded-lg animate-pulse" />
            <div className="h-32 w-full bg-black/40 rounded-lg animate-pulse" />
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
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-4xl font-bold text-white">{t.nav.readings}</h1>

          {readings.length === 0 ? (
            <div className="rounded-lg border border-purple-500/30 bg-black/40 p-8 text-center backdrop-blur-md shadow-lg">
              <p className="text-gray-300">No readings yet. Create your first reading!</p>
              <Link href="/dashboard" className="mt-4 inline-block text-purple-400 hover:text-purple-300 transition-colors font-semibold">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {readings.map((reading) => (
                <Link key={reading.id} href={`/readings/${reading.id}`}>
                  <div className="rounded-lg border border-purple-500/30 bg-black/40 p-6 backdrop-blur-md transition-all hover:border-purple-500/50 hover:bg-black/50 hover:shadow-lg hover:shadow-purple-500/20">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">{reading.question}</h3>
                      <span className="text-sm text-purple-300">
                        {format(new Date(reading.createdAt), "PPP", {
                          locale: locale === "ru" ? ru : enUS,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">Click to view full reading</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

