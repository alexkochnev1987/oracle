"use client";

import { useState, useEffect } from "react";
import { ImageUpload } from "@/components/image-upload";
import { TarotCardSelector } from "@/components/tarot-card-selector";
import { OracleSelector } from "@/components/oracle-selector";
import { QuestionSelector } from "@/components/question-selector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";
import { type TarotCard, getRandomSpread } from "@/lib/tarot-cards";
import { type TarotReader } from "@/lib/tarot-readers";
import { Sparkles, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  validateDateString,
  formatDateInput,
  validateDateInput,
} from "@/lib/date-validation";
import { ErrorMessage } from "@/components/ui/error-message";
import { Checkbox } from "@/components/ui/checkbox";

interface QrFormProps {
  token: string;
  initialReaderId: string;
  tarotReaders: TarotReader[];
}

export function QrForm({ token, initialReaderId, tarotReaders }: QrFormProps) {
  const [locale] = useLocale();
  const t = getTranslations(locale);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [streamError, setStreamError] = useState<string | null>(null);

  const [userImage, setUserImage] = useState<string>("");
  const [skipPhoto, setSkipPhoto] = useState(true);
  const [skipDate, setSkipDate] = useState(true);
  const [photoStepCompleted, setPhotoStepCompleted] = useState(false);
  const [spreadCreated, setSpreadCreated] = useState(false);
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [revealedCardsCount, setRevealedCardsCount] = useState<number>(0);
  const [birthDate, setBirthDate] = useState<string>("");
  const [question, setQuestion] = useState<string>(
    t.dashboard.questionPlaceholder
  );
  const [selectedReader, setSelectedReader] = useState<string>(initialReaderId);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createSpreadAttempted, setCreateSpreadAttempted] = useState(false);
  const [touched, setTouched] = useState({
    photo: false,
    birthDate: false,
    question: false,
  });

  // Update selected reader when locale changes
  useEffect(() => {
    const readers = tarotReaders;
    if (readers.length > 0) {
      const currentReader = readers.find((r) => r.id === selectedReader);
      if (!currentReader) {
        // If current reader doesn't exist in new locale, select first one
        setSelectedReader(readers[0].id);
      }
    }
  }, [locale, tarotReaders, selectedReader]);

  // Handle photo upload
  const handleImageChange = (base64: string) => {
    setUserImage(base64);
    if (base64) {
      setPhotoStepCompleted(true);
      setSkipPhoto(false);
    }
    setTouched((prev) => ({ ...prev, photo: true }));
  };

  // Handle skip photo checkbox
  const handleSkipPhotoChange = (skip: boolean) => {
    setSkipPhoto(skip);
    if (skip) {
      setPhotoStepCompleted(true);
      setUserImage("");
    } else {
      if (!userImage) {
        setPhotoStepCompleted(false);
      }
    }
    setTouched((prev) => ({ ...prev, photo: true }));
  };

  // Handle skip date checkbox
  const handleSkipDateChange = (skip: boolean) => {
    setSkipDate(skip);
    if (skip) {
      setBirthDate("");
    }
    setTouched((prev) => ({ ...prev, birthDate: true }));
  };

  // Validate date
  const validateDate = (dateString: string): string | null => {
    return validateDateString(dateString, {
      invalidDate: t.dashboard.errors.invalidDate,
      dateInFuture: t.dashboard.errors.dateInFuture,
    });
  };

  // Handle step 1: create spread
  const handleCreateSpread = () => {
    setCreateSpreadAttempted(true);
    setTouched({ photo: true, birthDate: true, question: true });

    const newErrors: Record<string, string> = {};

    if (!skipPhoto && !photoStepCompleted) {
      newErrors.photo = t.dashboard.errors.uploadPhoto;
    }

    if (!skipDate) {
      if (!birthDate.trim()) {
        newErrors.birthDate = t.dashboard.errors.fillBirthDate;
      } else {
        const validationError = validateDate(birthDate);
        if (validationError) {
          newErrors.birthDate = validationError;
        }
      }
    }

    if (!question.trim()) {
      newErrors.question = t.dashboard.errors.fillQuestion;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSpreadCreated(true);
    setRevealedCardsCount(0);

    // Generate random spread
    if (selectedCards.length === 0) {
      const newCards = getRandomSpread(3);
      setSelectedCards(newCards);
    }
  };

  // Validate cards
  const validateCards = (): string | null => {
    if (selectedCards.length !== 3) {
      return t.dashboard.errors.selectCards;
    }

    if (revealedCardsCount !== 3) {
      return t.dashboard.errors.revealCards;
    }

    return null;
  };

  // Date input handler
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");

    if (!validateDateInput(rawValue)) {
      return;
    }

    const formatted = formatDateInput(rawValue);
    setBirthDate(formatted);
    setTouched((prev) => ({ ...prev, birthDate: true }));

    if (touched.birthDate && errors.birthDate && formatted.trim()) {
      const validationError = validateDate(formatted);
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (validationError) {
          newErrors.birthDate = validationError;
        } else {
          delete newErrors.birthDate;
        }
        return newErrors;
      });
    }
  };

  const handleDateBlur = () => {
    if (!birthDate.trim()) {
      setErrors((prev) => ({
        ...prev,
        birthDate: t.dashboard.errors.fillBirthDate,
      }));
      return;
    }

    const validationError = validateDate(birthDate);
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (validationError) {
        newErrors.birthDate = validationError;
      } else {
        delete newErrors.birthDate;
      }
      return newErrors;
    });
  };

  // Auto-clear errors
  useEffect(() => {
    const updatedErrors = { ...errors };
    let hasChanges = false;

    if ((photoStepCompleted || skipPhoto) && updatedErrors.photo) {
      delete updatedErrors.photo;
      hasChanges = true;
    }

    if ((skipDate || birthDate.trim()) && updatedErrors.birthDate) {
      delete updatedErrors.birthDate;
      hasChanges = true;
    }

    if (question.trim() && updatedErrors.question) {
      delete updatedErrors.question;
      hasChanges = true;
    }

    if (spreadCreated) {
      const cardError = validateCards();
      if (cardError && updatedErrors.cards !== cardError) {
        updatedErrors.cards = cardError;
        hasChanges = true;
      } else if (!cardError && updatedErrors.cards) {
        delete updatedErrors.cards;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      setErrors(updatedErrors);
    }
  }, [
    photoStepCompleted,
    skipPhoto,
    skipDate,
    birthDate,
    question,
    spreadCreated,
    selectedCards.length,
    revealedCardsCount,
    errors,
  ]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!spreadCreated) {
      newErrors.general = t.dashboard.errors.createSpread;
    }

    const cardError = validateCards();
    if (cardError) {
      newErrors.cards = cardError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (userImage && !skipPhoto) {
        formData.append("userImage", userImage);
      }
      formData.append(
        "selectedCards",
        JSON.stringify(selectedCards.map((card) => card.id))
      );
      formData.append("cardSelectionMode", "random");
      formData.append("birthDate", skipDate ? "" : birthDate);
      formData.append("question", question);
      formData.append("tarotReaderId", selectedReader);
      formData.append("locale", locale);

      const response = await fetch(`/api/qr/${token}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to submit form");
      }

      // Handle streaming response
      setIsStreaming(true);
      setStreamError(null);
      setStreamingText("");

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
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({
        general: error instanceof Error ? error.message : "Failed to submit",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isStreaming) {
    return (
      <Card className="p-8" glow>
        <div className="space-y-4">
          {streamError ? (
            <div className="text-red-400 text-center">{streamError}</div>
          ) : (
            <>
              {streamingText ? (
                <div className="prose prose-invert max-w-none text-[#e5e7eb]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {streamingText}
                  </ReactMarkdown>
                  <span className="inline-block w-2 h-5 bg-[rgba(100,200,255,0.8)] animate-pulse ml-1" />
                </div>
              ) : (
                <div className="text-center text-[#e5e7eb]">
                  <Sparkles className="mx-auto mb-4 h-12 w-12 animate-pulse text-purple-400" />
                  <p>{t.qr.generating}</p>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="p-8" glow>
        <div className="space-y-6">
          <div className="text-center">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-400" />
            <h2 className="mb-4 text-2xl font-bold text-white">
              {t.qr?.successTitle || "Reading completed!"}
            </h2>
          </div>
          {streamingText && (
            <div className="prose prose-invert max-w-none text-[#e5e7eb]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {streamingText}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Oracle Selection */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            spreadCreated
              ? "max-h-0 opacity-0 -translate-y-4 pointer-events-none"
              : "max-h-[800px] opacity-100 translate-y-0"
          }`}
        >
          <FormField label={t.dashboard.selectTarotReader} required>
            <OracleSelector
              oracles={tarotReaders}
              selectedId={selectedReader}
              onSelect={setSelectedReader}
              locale={locale}
            />
          </FormField>
        </div>

        {/* Input Fields */}
        <div
          className={`flex flex-col gap-2 transition-all duration-500 ease-in-out ${
            spreadCreated ? "-translate-y-2" : "translate-y-0"
          }`}
        >
          {/* Photo Upload */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              {!skipPhoto && (
                <label className="block text-sm sm:text-base font-medium text-white">
                  {t.dashboard.uploadUserPhoto}
                </label>
              )}
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={skipPhoto}
                  onChange={(e) => handleSkipPhotoChange(e.target.checked)}
                  disabled={spreadCreated}
                />
                <label className="text-sm text-[rgba(100,200,255,0.8)] cursor-pointer">
                  {t.dashboard.skipPhoto}
                </label>
              </div>
            </div>
            {!skipPhoto && (
              <ImageUpload
                label=""
                value={userImage}
                onChange={handleImageChange}
                skipPhoto={false}
                onSkipPhotoChange={handleSkipPhotoChange}
                skipPhotoLabel={t.dashboard.skipPhoto}
                error={touched.photo && !userImage && !skipPhoto}
                errorMessage={
                  errors.photo ||
                  (touched.photo && !userImage && !skipPhoto
                    ? t.dashboard.errors.uploadPhotoMessage
                    : undefined)
                }
                disabled={spreadCreated}
              />
            )}
          </div>

          {/* Birth Date */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              {!skipDate && (
                <label className="block text-sm sm:text-base font-medium text-white">
                  {t.dashboard.birthDate}
                </label>
              )}
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={skipDate}
                  onChange={(e) => handleSkipDateChange(e.target.checked)}
                  disabled={spreadCreated}
                />
                <label className="text-sm text-[rgba(100,200,255,0.8)] cursor-pointer">
                  {t.dashboard.skipDate}
                </label>
              </div>
            </div>
            {!skipDate && (
              <Input
                type="text"
                value={birthDate}
                onChange={handleDateChange}
                onBlur={handleDateBlur}
                placeholder="12-07-87"
                maxLength={8}
                pattern="\d{2}-\d{2}-\d{2}"
                disabled={spreadCreated}
                error={
                  (touched.birthDate && !birthDate.trim()) || !!errors.birthDate
                }
              />
            )}
            {errors.birthDate && (
              <p className="text-xs sm:text-sm text-red-400">
                {errors.birthDate}
              </p>
            )}
          </div>

          {/* Question */}
          <div>
            <QuestionSelector
              label={t.dashboard.question}
              value={question}
              onChange={(q) => {
                setQuestion(q);
                setTouched((prev) => ({ ...prev, question: true }));
              }}
              locale={locale}
              disabled={spreadCreated}
              error={
                (touched.question && !question.trim()) || !!errors.question
              }
            />
            {errors.question && (
              <p className="text-xs sm:text-sm text-red-400 mt-1.5">
                {errors.question}
              </p>
            )}
          </div>
        </div>

        {/* Cards Selection - Only Random Mode */}
        {spreadCreated && (
          <div
            className="space-y-4"
            style={{
              animation: "fadeInUpCards 0.6s ease-out 0.2s forwards",
              opacity: 0,
              transform: "translateY(20px)",
            }}
          >
            <TarotCardSelector
              label={t.dashboard.uploadCardsPhoto}
              selectedCards={selectedCards}
              mode="random"
              locale={locale}
              onSelectedCardsChange={setSelectedCards}
              onModeChange={() => {}} // Disable mode change
              onRevealedCardsChange={setRevealedCardsCount}
              allCardsRevealed={false}
            />
          </div>
        )}

        {/* Errors */}
        {createSpreadAttempted &&
          !spreadCreated &&
          (errors.photo || errors.birthDate || errors.question) && (
            <ErrorMessage
              message={[errors.photo, errors.birthDate, errors.question]
                .filter(Boolean)
                .join(", ")}
            />
          )}
        {errors.general && <ErrorMessage message={errors.general} />}
        {errors.cards && spreadCreated && (
          <ErrorMessage message={errors.cards} />
        )}

        {/* Buttons */}
        <div className="flex justify-center relative min-h-[60px]">
          {!spreadCreated ? (
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleCreateSpread}
              icon={<Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />}
            >
              {t.dashboard.createSpread}
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              loading={isSubmitting}
              icon={<Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />}
            >
              {isSubmitting
                ? t.common.submitting || "Submitting..."
                : t.qr?.submitButton || "Submit Reading Request"}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
