"use client";

import { useState, useEffect } from "react";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";
import { Sparkles } from "lucide-react";
import { ErrorMessage } from "@/components/ui/error-message";
import { createQrCode } from "@/app/actions/qr";

interface CreateQrCodeFormProps {
  userCredits: number;
}

export function CreateQrCodeForm({ userCredits }: CreateQrCodeFormProps) {
  const [locale] = useLocale();
  const t = getTranslations(locale);

  const [expiresAt, setExpiresAt] = useState<string>("");
  const [maxUses, setMaxUses] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdQrCode, setCreatedQrCode] = useState<{
    token: string;
    id: string;
  } | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (createdQrCode) {
      const baseUrl =
        process.env.NEXT_PUBLIC_NEXTAUTH_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");
      setShareUrl(`${baseUrl}/qr/${createdQrCode.token}`);
    }
  }, [createdQrCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsCreating(true);

    try {
      // Parse max uses
      const maxUsesNum = parseInt(maxUses, 10);
      if (isNaN(maxUsesNum) || maxUsesNum < 1) {
        throw new Error("Max uses must be a positive number");
      }

      if (maxUsesNum > userCredits) {
        throw new Error(
          `Max uses (${maxUsesNum}) cannot exceed available credits (${userCredits})`
        );
      }

      // Parse expiration date
      let expiresAtDate: Date | null = null;
      if (expiresAt.trim()) {
        expiresAtDate = new Date(expiresAt);
        if (isNaN(expiresAtDate.getTime())) {
          throw new Error("Invalid expiration date");
        }
        if (expiresAtDate < new Date()) {
          throw new Error("Expiration date must be in the future");
        }
      }

      const result = await createQrCode(expiresAtDate, maxUsesNum);

      if (result.success && result.qrCode) {
        setCreatedQrCode({
          token: result.qrCode.token,
          id: result.qrCode.id,
        });
        // Reset form
        setExpiresAt("");
        setMaxUses("");
        // Redirect to QR codes page after a short delay
        setTimeout(() => {
          window.location.href = "/qr";
        }, 2000);
      } else {
        setError(result.error || "Failed to create QR code");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create QR code");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4 p-4 bg-[rgba(100,200,255,0.1)] rounded-lg border border-[rgba(100,200,255,0.3)]">
            <p className="text-sm text-[#e5e7eb]">
              <strong className="text-white">
                {t.qr?.availableCredits || "Available Credits"}:
              </strong>{" "}
              {userCredits}
            </p>
            <p className="text-xs text-[#9ca3af] mt-2">
              {t.qr?.creditsHint ||
                "The maximum number of uses cannot exceed your available credits."}
            </p>
          </div>

          <FormField
            label={t.qr?.expirationDate || "Expiration Date (Optional)"}
          >
            <Input
              type="datetime-local"
              className="appearance-none"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={isCreating}
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-[#9ca3af] mt-1">
              {t.qr?.expirationHint || "Leave empty for no expiration date"}
            </p>
          </FormField>

          <FormField label={t.qr?.maxUses || "Maximum Uses"} required>
            <Input
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              disabled={isCreating}
              min="1"
              max={userCredits}
              placeholder={`1-${userCredits}`}
              required
            />
            <p className="text-xs text-[#9ca3af] mt-1">
              {t.qr?.maxUsesHint ||
                `Maximum number of times this QR code can be used (1-${userCredits})`}
            </p>
          </FormField>

          {error && <ErrorMessage message={error} />}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isCreating || !maxUses}
            loading={isCreating}
            icon={<Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />}
            className="w-full"
          >
            {isCreating
              ? t.common.creating || "Creating..."
              : t.qr?.createButton || "Create QR Code"}
          </Button>
        </form>
      </Card>

      {createdQrCode && (
        <div className="mt-8">
          <QRCodeDisplay shareToken={createdQrCode.token} shareUrl={shareUrl} />
        </div>
      )}
    </>
  );
}
