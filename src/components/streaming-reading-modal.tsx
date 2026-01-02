"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
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
import { type TarotCard } from "@/lib/tarot-cards";
import { Share2, Plus } from "lucide-react";
import { getTranslations, type Locale } from "@/lib/i18n";
import { createReading } from "@/app/actions/reading";

interface StreamingReadingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userImage: string;
  selectedCards: TarotCard[];
  birthDate: string;
  question: string;
  tarotReaderId: TarotReaderId;
  cardSelectionMode: "random" | "manual";
  skipDate: boolean;
  skipPhoto: boolean;
  locale: Locale;
  onResetForm: () => void;
}

export function StreamingReadingModal({
  open,
  onOpenChange,
  userImage,
  selectedCards,
  birthDate,
  question,
  tarotReaderId,
  cardSelectionMode,
  skipDate,
  skipPhoto,
  locale,
  onResetForm,
}: StreamingReadingModalProps) {
  const t = getTranslations(locale);
  const [stage, setStage] = useState<
    "analyzing" | "creating" | "streaming" | "completed"
  >("analyzing");
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [imageAnalysisResult, setImageAnalysisResult] = useState<string | null>(
    null
  );
  const [isAllowed, setIsAllowed] = useState<boolean>(true);
  const hasStartedProcess = useRef(false);

  const hasPhoto = !!(userImage && !skipPhoto);

  const analyzeImage = async (imageBase64: string): Promise<string | null> => {
    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userImage: imageBase64,
          locale,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const data = await response.json();
      return data.success ? data.imageAnalysisResult : null;
    } catch (error) {
      console.error("Image analysis failed:", error);
      return null;
    }
  };

  const createReadingRecord = async (
    analysisResult: string | null
  ): Promise<string | null> => {
    try {
      const formData = new FormData();
      if (userImage && !skipPhoto) {
        formData.append("userImage", userImage);
      }

      formData.append(
        "selectedCards",
        JSON.stringify(selectedCards.map((card) => card.id))
      );

      formData.append("cardSelectionMode", cardSelectionMode);
      formData.append("birthDate", skipDate ? "" : birthDate);
      formData.append("question", question);
      formData.append("tarotReaderId", tarotReaderId);
      formData.append("locale", locale);

      const result = await createReading(formData);

      if (result.success && result.readingId) {
        setIsAllowed(result.isAllowed !== undefined ? result.isAllowed : true);
        return result.readingId;
      } else {
        throw new Error(result.error || "Failed to create reading");
      }
    } catch (error) {
      console.error("Error creating reading:", error);
      setStreamError(
        error instanceof Error ? error.message : "Failed to create reading"
      );
      return null;
    }
  };

  const startStreaming = async (
    readingId: string,
    analysisResult: string | null
  ) => {
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
          imageAnalysisResult: analysisResult || null,
          isAllowed,
          locale,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate reading");
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
      console.error("Reading generation error:", error);
      setStreamError(
        error instanceof Error ? error.message : "Failed to generate reading"
      );
      setIsStreaming(false);
      setStage("completed");
    }
  };

  // Process: analyze image (if photo) -> create reading -> stream
  useEffect(() => {
    if (open && !hasStartedProcess.current) {
      hasStartedProcess.current = true;
      setStreamingText("");
      setIsStreaming(false);
      setStreamError(null);
      setReadingId(null);
      setImageAnalysisResult(null);

      const processReading = async () => {
        let analysisResult: string | null = null;

        // Step 1: Analyze image if photo exists
        if (hasPhoto && userImage) {
          setStage("analyzing");
          analysisResult = await analyzeImage(userImage);
          setImageAnalysisResult(analysisResult);
        }

        // Step 2: Create reading
        setStage("creating");
        const newReadingId = await createReadingRecord(analysisResult);

        if (!newReadingId) {
          setStage("completed");
          return;
        }

        setReadingId(newReadingId);

        // Step 3: Start streaming
        setStage("streaming");
        await startStreaming(newReadingId, analysisResult);
      };

      processReading();
    } else if (!open) {
      // Reset when modal closes
      hasStartedProcess.current = false;
      setStage("analyzing");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hasPhoto, userImage]);

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
            {(stage === "analyzing" ||
              stage === "creating" ||
              (stage === "streaming" && !streamingText)) && (
              <LoadingPhrases
                tarotReaderId={tarotReaderId}
                locale={locale}
                hasPhoto={stage === "analyzing" && hasPhoto}
              />
            )}

            {stage === "streaming" && streamingText && (
              <div className="space-y-4">
                {streamError ? (
                  <div className="text-red-400 text-center">{streamError}</div>
                ) : (
                  <div className="prose prose-invert max-w-none text-[#e5e7eb]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {streamingText}
                    </ReactMarkdown>
                    {isStreaming && (
                      <span className="inline-block w-2 h-5 bg-[rgba(100,200,255,0.8)] animate-pulse ml-1" />
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
                  {readingId ? (
                    <Link
                      href={`/readings/${readingId}`}
                      prefetch={true}
                      onClick={() => onOpenChange(false)}
                      className="w-full sm:w-auto"
                    >
                      <Button
                        variant="primary"
                        className="w-full sm:w-auto"
                        icon={<Share2 className="h-4 w-4" />}
                      >
                        {t.common.share}
                      </Button>
                    </Link>
                  ) : null}
                  <Button
                    onClick={handleCreateNew}
                    variant="secondary"
                    className="w-full sm:w-auto"
                    icon={<Plus className="h-4 w-4" />}
                  >
                    {locale === "ru"
                      ? "Создать новый прогноз"
                      : "Create new reading"}
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
