"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LoadingPhrases } from "@/components/loading-phrases";
import { TarotReaderId } from "@/lib/tarot-readers";
import { Share2, Plus } from "lucide-react";
import { getTranslations, type Locale } from "@/lib/i18n";

interface StreamingReadingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readingId: string;
  imageAnalysisResult: string | null;
  isAllowed: boolean;
  locale: Locale;
  tarotReaderId: TarotReaderId;
  hasPhoto: boolean;
  onResetForm: () => void;
}

export function StreamingReadingModal({
  open,
  onOpenChange,
  readingId,
  imageAnalysisResult,
  isAllowed,
  locale,
  tarotReaderId,
  hasPhoto,
  onResetForm,
}: StreamingReadingModalProps) {
  const router = useRouter();
  const t = getTranslations(locale);
  const [stage, setStage] = useState<"analyzing" | "streaming" | "completed">(
    "analyzing"
  );
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const hasStartedStreaming = useRef(false);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStage("analyzing");
      setStreamingText("");
      setIsStreaming(false);
      setStreamError(null);
      hasStartedStreaming.current = false;

      // Start streaming after a short delay to show LoadingPhrases
      const timer = setTimeout(() => {
        if (!hasStartedStreaming.current) {
          hasStartedStreaming.current = true;
          setStage("streaming");
          startStreaming();
        }
      }, 2000); // Show LoadingPhrases for 2 seconds

      return () => clearTimeout(timer);
    }
  }, [open]);

  const startStreaming = async () => {
    setIsStreaming(true);
    setStreamError(null);
    setStreamingText("");

    try {
      const response = await fetch(`/api/readings/${readingId}/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageAnalysisResult: imageAnalysisResult || null,
          isAllowed,
          locale,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start streaming");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available");
      }

      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        setStreamingText(accumulatedText);
      }

      setIsStreaming(false);
      setStage("completed");
    } catch (error) {
      console.error("Streaming error:", error);
      setStreamError(
        error instanceof Error ? error.message : "Failed to stream reading"
      );
      setIsStreaming(false);
      setStage("completed");
    }
  };

  const handleShare = () => {
    onOpenChange(false);
    router.push(`/readings/${readingId}`);
  };

  const handleCreateNew = () => {
    onOpenChange(false);
    onResetForm();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        hideCloseButton={true}
        className="h-screen max-h-screen w-screen max-w-screen rounded-none border-0 p-0 overflow-y-auto bg-[rgba(26,26,58,0.95)] backdrop-blur-md"
      >
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-white text-center text-2xl sm:text-3xl">
              {t.dashboard.createReading}
            </SheetTitle>
          </SheetHeader>

          <div>
          {stage === "analyzing" && (
            <LoadingPhrases
              tarotReaderId={tarotReaderId}
              locale={locale}
              hasPhoto={hasPhoto}
            />
          )}

          {stage === "streaming" && (
            <div className="space-y-4">
              {streamError ? (
                <div className="text-red-400 text-center">{streamError}</div>
              ) : (
                <div className="prose prose-invert max-w-none text-[#e5e7eb]">
                  {streamingText ? (
                    <>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {streamingText}
                      </ReactMarkdown>
                      {isStreaming && (
                        <span className="inline-block w-2 h-5 bg-[rgba(100,200,255,0.8)] animate-pulse ml-1" />
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="animate-pulse">●</div>
                      <span className="text-[#9ca3af]">
                        {t.loadingPhrases[tarotReaderId]?.loadingText || t.common.loading}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {stage === "completed" && (
            <div className="space-y-6">
              <div className="prose prose-invert max-w-none text-[#e5e7eb]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {streamingText}
                </ReactMarkdown>
              </div>
              <SheetFooter className="mt-6 gap-3 sm:gap-0">
                <Button
                  onClick={handleShare}
                  variant="primary"
                  className="w-full sm:w-auto"
                  icon={<Share2 className="h-4 w-4" />}
                >
                  {t.common.share}
                </Button>
                <Button
                  onClick={handleCreateNew}
                  variant="secondary"
                  className="w-full sm:w-auto"
                  icon={<Plus className="h-4 w-4" />}
                >
                  {locale === "ru" ? "Создать новый прогноз" : "Create new reading"}
                </Button>
              </SheetFooter>
            </div>
          )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

