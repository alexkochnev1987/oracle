"use client";

import { useState, useRef, useEffect } from "react";
import QRCode from "react-qr-code";
import { Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface QRCodeDisplayProps {
  shareToken: string | null;
  shareUrl: string;
  question?: string;
}

export function QRCodeDisplay({
  shareToken,
  shareUrl,
  question,
}: QRCodeDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState(256);

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
        link.download = `qr-code-${shareToken || "reading"}.png`;
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
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!shareToken) {
    return null;
  }

  return (
    <Card className="p-4 sm:p-6 md:p-8 text-center" glow>
      <h3 className="mb-4 text-lg sm:text-xl font-semibold text-white">
        Поделиться прогнозом
      </h3>
      {question && (
        <p className="mb-4 text-sm sm:text-base text-[#9ca3af] line-clamp-2">
          {question}
        </p>
      )}
      <div
        ref={qrRef}
        className="mx-auto mb-4 inline-block rounded-lg border-2 border-[rgba(100,200,255,0.4)] bg-white p-2 sm:p-3 md:p-4 mystical-glow max-w-full"
        style={{ maxWidth: `${qrSize + 32}px` }}
      >
        <QRCode
          value={shareUrl}
          size={qrSize}
          level="H"
          bgColor="#ffffff"
          fgColor="#000000"
          style={{ width: "100%", height: "auto", maxWidth: "100%" }}
        />
      </div>
      <div className="mb-4 break-all rounded-md bg-[rgba(26,26,58,0.5)] p-2 sm:p-3 text-xs sm:text-sm text-[#9ca3af] max-w-full overflow-hidden">
        {shareUrl}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownload}
          icon={<Download className="h-4 w-4" />}
          className="w-full sm:w-auto sm:min-w-[140px]"
        >
          Скачать QR
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopyLink}
          icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          className="w-full sm:w-auto sm:min-w-[160px]"
        >
          {copied ? "Скопировано!" : "Копировать ссылку"}
        </Button>
      </div>
    </Card>
  );
}

