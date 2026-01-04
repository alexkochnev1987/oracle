"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";
import { QrCode, Eye, Power, PowerOff, Copy, Check } from "lucide-react";
import {
  getUserQrCodes,
  deactivateQrCode,
  activateQrCode,
  type QrCodeData,
} from "@/app/actions/qr";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";

interface QrCodesListProps {
  initialQrCodes: QrCodeData[];
}

export function QrCodesList({ initialQrCodes }: QrCodesListProps) {
  const router = useRouter();
  const [locale] = useLocale();
  const t = getTranslations(locale);

  const [qrCodes, setQrCodes] = useState<QrCodeData[]>(initialQrCodes);
  const [selectedQrCode, setSelectedQrCode] = useState<QrCodeData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const loadQrCodes = async () => {
    try {
      const result = await getUserQrCodes();
      if (result.success && result.qrCodes) {
        setQrCodes(result.qrCodes);
      }
    } catch (error) {
      console.error("Error loading QR codes:", error);
    }
  };

  const handleViewQr = (qrCode: QrCodeData) => {
    setSelectedQrCode(qrCode);
    setIsSheetOpen(true);
  };

  const handleToggleActive = async (qrCode: QrCodeData) => {
    try {
      if (qrCode.isActive) {
        await deactivateQrCode(qrCode.id);
      } else {
        await activateQrCode(qrCode.id);
      }
      await loadQrCodes();
    } catch (error) {
      console.error("Error toggling QR code:", error);
    }
  };

  const handleCopyLink = async (token: string) => {
    const url = `${
      process.env.NEXT_PUBLIC_NEXTAUTH_URL ||
      (typeof window !== "undefined" ? window.location.origin : "")
    }/qr/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getStatusText = (qrCode: QrCodeData): string => {
    if (!qrCode.isActive) {
      return t.qr?.statusInactive || "Inactive";
    }
    if (qrCode.expiresAt && new Date(qrCode.expiresAt) < new Date()) {
      return t.qr?.statusExpired || "Expired";
    }
    if (qrCode.currentUses >= qrCode.maxUses) {
      return t.qr?.statusLimitReached || "Limit Reached";
    }
    return t.qr?.statusActive || "Active";
  };

  const getStatusColor = (qrCode: QrCodeData): string => {
    if (!qrCode.isActive) {
      return "text-gray-400";
    }
    if (qrCode.expiresAt && new Date(qrCode.expiresAt) < new Date()) {
      return "text-red-400";
    }
    if (qrCode.currentUses >= qrCode.maxUses) {
      return "text-yellow-400";
    }
    return "text-green-400";
  };

  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (selectedQrCode) {
      const baseUrl =
        process.env.NEXT_PUBLIC_NEXTAUTH_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");
      setShareUrl(`${baseUrl}/qr/${selectedQrCode.token}`);
    }
  }, [selectedQrCode]);

  return (
    <>
      <div className="mb-6 sm:mb-8 flex justify-end">
        <Button
          variant="primary"
          onClick={() => router.push("/qr/create")}
          icon={<QrCode className="h-4 w-4" />}
        >
          {t.qr?.createNew || "Create New"}
        </Button>
      </div>

      {qrCodes.length === 0 ? (
        <EmptyState
          icon={<QrCode className="h-12 w-12 sm:h-16 sm:w-16" />}
          title={t.qr?.emptyTitle || "No QR codes yet"}
          description={
            t.qr?.emptyDescription ||
            "Create your first QR code to allow others to submit reading requests"
          }
          action={
            <Button
              variant="primary"
              onClick={() => router.push("/qr/create")}
              icon={<QrCode className="h-4 w-4" />}
            >
              {t.qr?.createFirst || "Create First QR Code"}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {qrCodes.map((qrCode) => (
            <Card key={qrCode.id} className="p-4 sm:p-6" glow>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">
                      {t.qr?.qrCode || "QR Code"}
                    </h3>
                    <span
                      className={`text-xs sm:text-sm font-medium ${getStatusColor(
                        qrCode
                      )}`}
                    >
                      {getStatusText(qrCode)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-sm">
                    <div>
                      <p className="text-[#9ca3af]">
                        {t.qr?.createdAt || "Created"}
                      </p>
                      <p className="text-white">
                        {format(new Date(qrCode.createdAt), "dd MMM yyyy", {
                          locale: locale === "ru" ? ru : enUS,
                        })}
                      </p>
                    </div>

                    {qrCode.expiresAt && (
                      <div>
                        <p className="text-[#9ca3af]">
                          {t.qr?.expiresAt || "Expires"}
                        </p>
                        <p className="text-white">
                          {format(new Date(qrCode.expiresAt), "dd MMM yyyy", {
                            locale: locale === "ru" ? ru : enUS,
                          })}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-[#9ca3af]">{t.qr?.uses || "Uses"}</p>
                      <p className="text-white">
                        {qrCode.currentUses} / {qrCode.maxUses}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#9ca3af]">
                        {t.qr?.readings || "Readings"}
                      </p>
                      <p className="text-white">{qrCode.readingsCount || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewQr(qrCode)}
                    icon={<Eye className="h-4 w-4" />}
                  >
                    {t.common.view || "View"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopyLink(qrCode.token)}
                    icon={
                      copiedToken === qrCode.token ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )
                    }
                  >
                    {copiedToken === qrCode.token
                      ? t.common.copied || "Copied"
                      : t.common.copy || "Copy"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleToggleActive(qrCode)}
                    icon={
                      qrCode.isActive ? (
                        <PowerOff className="h-4 w-4" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )
                    }
                  >
                    {qrCode.isActive
                      ? t.qr?.deactivate || "Deactivate"
                      : t.qr?.activate || "Activate"}
                  </Button>
                </div>
              </div>
            </Card>
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
              {t.common.shareReading || "Share QR Code"}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex flex-col items-center">
            {selectedQrCode && (
              <div className="w-full max-w-md">
                <QRCodeDisplay
                  shareToken={selectedQrCode.token}
                  shareUrl={shareUrl}
                />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
