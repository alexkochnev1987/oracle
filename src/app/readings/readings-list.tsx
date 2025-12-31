"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReadingCard } from "@/components/reading-card";
import { EmptyState } from "@/components/ui/empty-state";
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

interface Reading {
  id: string;
  question: string;
  createdAt: Date | string;
  tarotReaderId: string;
  shareToken?: string | null;
  userImageUrl?: string | null;
  qrCodeId?: string | null;
}

interface ReadingsListProps {
  initialReadings: Reading[];
}

export function ReadingsList({ initialReadings }: ReadingsListProps) {
  const router = useRouter();
  const [locale] = useLocale();
  const t = getTranslations(locale);
  const [readings, setReadings] = useState<Reading[]>(initialReadings);
  const [allReadings, setAllReadings] = useState<Reading[]>(initialReadings);
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [deleteReading, setDeleteReading] = useState<Reading | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [qrCodeFilter, setQrCodeFilter] = useState<string>("all"); // "all" | "qr" | "no-qr"

  // Update readings when initialReadings changes
  useEffect(() => {
    setAllReadings(initialReadings);
    setReadings(initialReadings);
  }, [initialReadings]);

  const handleShareClick = (reading: Reading) => {
    setSelectedReading(reading);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (reading: Reading) => {
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
      setAllReadings((prev) => prev.filter((r) => r.id !== deleteReading.id));
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

  // Filter readings by QR code
  useEffect(() => {
    if (qrCodeFilter === "all") {
      setReadings(allReadings);
    } else if (qrCodeFilter === "qr") {
      setReadings(allReadings.filter((r) => r.qrCodeId));
    } else if (qrCodeFilter === "no-qr") {
      setReadings(allReadings.filter((r) => !r.qrCodeId));
    }
  }, [qrCodeFilter, allReadings]);

  const shareUrl = selectedReading?.shareToken
    ? typeof window !== "undefined"
      ? `${window.location.origin}/readings/share/${selectedReading.shareToken}`
      : `/readings/share/${selectedReading.shareToken}`
    : "";

  return (
    <>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
          {t.nav.readings}
        </h1>

        {/* QR Code Filter */}
        {allReadings.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-[#9ca3af] whitespace-nowrap">
              {t.readings?.filterByQr || "Filter:"}
            </label>
            <select
              value={qrCodeFilter}
              onChange={(e) => setQrCodeFilter(e.target.value)}
              className="px-3 py-2 bg-[rgba(100,200,255,0.1)] border border-[rgba(100,200,255,0.3)] rounded-lg text-white text-sm focus:outline-none focus:border-[rgba(100,200,255,0.5)]"
            >
              <option value="all">{t.readings?.filterAll || "All"}</option>
              <option value="qr">
                {t.readings?.filterQrOnly || "QR Codes Only"}
              </option>
              <option value="no-qr">
                {t.readings?.filterNoQr || "No QR Code"}
              </option>
            </select>
          </div>
        )}
      </div>

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
    </>
  );
}

