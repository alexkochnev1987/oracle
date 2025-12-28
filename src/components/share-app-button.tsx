"use client";

import { useState, useRef, useEffect } from "react";
import QRCode from "react-qr-code";
import { Share2, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLocale } from "@/hooks/use-locale";
import { getTranslations } from "@/lib/i18n";

export function ShareAppButton() {
  const [locale] = useLocale();
  const t = getTranslations(locale);
  const [isOpen, setIsOpen] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState(256);

  // Get app URL
  const appUrl =
    typeof window !== "undefined" ? window.location.origin : "";

  // Responsive QR code size
  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== "undefined") {
        const width = window.innerWidth;
        if (width < 640) {
          setQrSize(180); // Mobile
        } else if (width < 1024) {
          setQrSize(220); // Tablet
        } else {
          setQrSize(256); // Desktop
        }
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleDownload = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 512;
    canvas.height = 512;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "oracle-app-qr-code.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!appUrl) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="lg"
          icon={<Share2 className="h-5 w-5" />}
          className="w-full sm:w-auto"
        >
          {t.common.share}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] overflow-y-auto bg-[rgba(26,26,58,0.95)] backdrop-blur-md border-[rgba(100,200,255,0.3)]"
      >
        <SheetHeader>
          <SheetTitle className="text-white text-center">
            {t.common.shareApp}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col items-center">
          <Card className="p-4 sm:p-6 md:p-8 text-center w-full max-w-md mx-auto" glow>
            <p className="mb-4 text-sm sm:text-base text-[#9ca3af]">
              {t.common.shareAppDescription}
            </p>
            <div
              ref={qrRef}
              className="mx-auto mb-4 inline-block rounded-lg border-2 border-[rgba(100,200,255,0.4)] bg-white p-2 sm:p-3 md:p-4 mystical-glow max-w-full"
              style={{ maxWidth: `${qrSize + 32}px` }}
            >
              <QRCode
                value={appUrl}
                size={qrSize}
                level="H"
                bgColor="#ffffff"
                fgColor="#000000"
                style={{ width: "100%", height: "auto", maxWidth: "100%" }}
              />
            </div>
            <div className="mb-4 break-all rounded-md bg-[rgba(26,26,58,0.5)] p-2 sm:p-3 text-xs sm:text-sm text-[#9ca3af] max-w-full overflow-hidden">
              {appUrl}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownload}
                icon={<Download className="h-4 w-4" />}
                className="w-full sm:w-auto sm:min-w-[140px]"
              >
                {t.common.downloadQR}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyLink}
                icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                className="w-full sm:w-auto sm:min-w-[160px]"
              >
                {copied ? t.common.copied : t.common.copyLink}
              </Button>
            </div>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}

