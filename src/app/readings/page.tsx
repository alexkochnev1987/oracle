"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ReadingCard } from "@/components/reading-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { DeleteConfirmation } from "@/components/delete-confirmation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  const [selectedReading, setSelectedReading] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [deleteReading, setDeleteReading] = useState<any | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="mx-auto max-w-4xl flex flex-col gap-3 sm:gap-3 md:gap-4 lg:gap-5">
            <LoadingSkeleton variant="card" count={3} />
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const handleShareClick = (reading: any) => {
    setSelectedReading(reading);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (reading: any) => {
    setDeleteReading(reading);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteReading) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/readings/${deleteReading.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete reading");
      }

      // Remove from local state
      setReadings((prev) => prev.filter((r) => r.id !== deleteReading.id));
      setIsDeleteOpen(false);
      setDeleteReading(null);
    } catch (error) {
      console.error("Error deleting reading:", error);
      alert(t.readings.deleteError);
    } finally {
      setIsDeleting(false);
    }
  };

  const shareUrl = selectedReading?.shareToken
    ? typeof window !== "undefined"
      ? `${window.location.origin}/readings/share/${selectedReading.shareToken}`
      : `/readings/share/${selectedReading.shareToken}`
    : "";

  return (
    <div className="min-h-screen mystical-gradient">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 sm:mb-10 lg:mb-12 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            {t.nav.readings}
          </h1>

          {readings.length === 0 ? (
            <div className="mt-8 sm:mt-12">
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
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:gap-3 md:gap-4 lg:gap-5">
              {readings.map((reading) => (
                <ReadingCard
                  key={reading.id}
                  reading={reading}
                  href={`/readings/${reading.id}`}
                  locale={locale}
                  onShareClick={handleShareClick}
                  onDeleteClick={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[90vh] overflow-y-auto bg-[rgba(26,26,58,0.95)] backdrop-blur-md border-[rgba(100,200,255,0.3)]"
        >
          <SheetHeader>
            <SheetTitle className="text-white text-center">
              {t.common.shareReading}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex flex-col items-center">
            {selectedReading && (
              <div className="w-full max-w-md">
                <QRCodeDisplay
                  shareToken={selectedReading.shareToken}
                  shareUrl={shareUrl}
                  question={selectedReading.question}
                />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {deleteReading && (
        <DeleteConfirmation
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={handleDeleteConfirm}
          title={t.readings.deleteTitle}
          description={t.readings.deleteDescription}
          locale={locale}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
