"use client";

import { useState } from "react";
import { Mail, Send, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLocale } from "@/hooks/use-locale";
import { getTranslations } from "@/lib/i18n";

interface EmailReadingFormProps {
  readingId?: string;
  shareToken?: string;
  onSuccess?: () => void;
}

export function EmailReadingForm({
  readingId,
  shareToken,
  onSuccess,
}: EmailReadingFormProps) {
  const [locale] = useLocale();
  const t = getTranslations(locale);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const endpoint = readingId
        ? `/api/readings/${readingId}/email`
        : `/api/readings/share/${shareToken}/email`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, locale }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show more specific error message if available
        const errorMessage = data.message || data.error || t.readings.emailError;
        throw new Error(errorMessage);
      }

      setIsSuccess(true);
      setEmail("");
      if (onSuccess) {
        onSuccess();
      }

      // Reset success message after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.readings.emailError
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 sm:p-6" glow>
      <div className="mb-4 flex items-center gap-2">
        <Mail className="h-5 w-5 text-[#64c8ff]" />
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          {t.readings.sendEmail}
        </h3>
      </div>
      <p className="mb-4 text-sm sm:text-base text-[#9ca3af]">
        {t.readings.sendEmailDescription}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder={t.readings.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || isSuccess}
            required
            error={!!error}
            className="w-full"
          />
          {error && (
            <p className="mt-2 text-sm text-red-400">{error}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || isSuccess || !email}
          className="w-full sm:w-auto"
          icon={
            isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSuccess ? (
              <Check className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )
          }
        >
          {isLoading
            ? t.readings.sending
            : isSuccess
            ? t.readings.emailSent
            : t.readings.sendButton}
        </Button>
      </form>
    </Card>
  );
}

