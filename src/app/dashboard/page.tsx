"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
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
import { getAllTarotReaders } from "@/lib/tarot-readers";
import { type TarotCard, getRandomSpread } from "@/lib/tarot-cards";
import { Sparkles } from "lucide-react";
import { isUserAllowedForAI } from "@/lib/ai-whitelist";
import {
  validateDateString,
  formatDateInput,
  validateDateInput,
} from "@/lib/date-validation";
import { ErrorMessage } from "@/components/ui/error-message";
import { CreditsWarning } from "@/components/credits-warning";
import { LoadingPhrases } from "@/components/loading-phrases";
import { StreamingReadingModal } from "@/components/streaming-reading-modal";
import { Checkbox } from "@/components/ui/checkbox";
import { PageContainer } from "@/components/page-container";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [locale] = useLocale();
  const t = getTranslations(locale);
  const [createReadingAttempted, setCreateReadingAttempted] = useState(false);
  const [userImage, setUserImage] = useState<string>("");
  const [skipPhoto, setSkipPhoto] = useState(true); // Default: skip photo
  const [skipDate, setSkipDate] = useState(true); // Default: skip date
  const [photoStepCompleted, setPhotoStepCompleted] = useState(false);
  const [spreadCreated, setSpreadCreated] = useState(false);
  const [isStreamingModalOpen, setIsStreamingModalOpen] = useState(false);
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [revealedCardsCount, setRevealedCardsCount] = useState<number>(0);
  const [cardSelectionMode, setCardSelectionMode] = useState<
    "random" | "manual"
  >("random");
  const [birthDate, setBirthDate] = useState<string>("");
  const [question, setQuestion] = useState<string>(
    t.dashboard.questionPlaceholder
  );
  const tarotReaders = getAllTarotReaders(locale);
  const [selectedReader, setSelectedReader] = useState<string>(() => {
    const randomIndex = Math.floor(Math.random() * tarotReaders.length);
    return tarotReaders[randomIndex].id;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createSpreadAttempted, setCreateSpreadAttempted] = useState(false);
  const [touched, setTouched] = useState({
    photo: false,
    birthDate: false,
    question: false,
  });

  // Check if date and question are completed (date is optional if skipDate is true)
  const dateAndQuestionCompleted =
    (skipDate || birthDate.trim().length > 0) && question.trim().length > 0;

  // Check if user is in whitelist (unlimited credits)
  const isWhitelisted = session?.user?.email
    ? isUserAllowedForAI(session.user.email)
    : false;
  const userCredits = session?.user?.credits ?? 0;
  const hasCredits = isWhitelisted || userCredits >= 1;

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
      // If unchecking, reset photoStepCompleted if no image
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

  // Reset form function
  const resetForm = () => {
    setUserImage("");
    setSkipPhoto(true);
    setSkipDate(true);
    setPhotoStepCompleted(false);
    setSpreadCreated(false);
    setSelectedCards([]);
    setRevealedCardsCount(0);
    setCardSelectionMode("random");
    setBirthDate("");
    setQuestion(t.dashboard.questionPlaceholder);
    setErrors({});
    setCreateSpreadAttempted(false);
    setCreateReadingAttempted(false);
    setTouched({ photo: false, birthDate: false, question: false });
  };

  // Handle step 1: create spread - validate only photo, date, question
  const handleCreateSpread = () => {
    setCreateSpreadAttempted(true);
    setTouched({ photo: true, birthDate: true, question: true });

    // Collect validation errors
    const newErrors: Record<string, string> = {};

    // Validate photo step only if skipPhoto is false
    if (!skipPhoto && !photoStepCompleted) {
      newErrors.photo = t.dashboard.errors.uploadPhoto;
    }

    // Validate birth date only if skipDate is false
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

    // Validate question
    if (!question.trim()) {
      newErrors.question = t.dashboard.errors.fillQuestion;
    }

    // If there are errors, show them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Validation passed - create spread and lock fields
    setSpreadCreated(true);
    setRevealedCardsCount(0);

    // Generate random spread if in random mode and no cards selected
    if (cardSelectionMode === "random" && selectedCards.length === 0) {
      const newCards = getRandomSpread(3);
      setSelectedCards(newCards);
    }
  };

  // Validate date using shared utility
  const validateDate = (dateString: string): string | null => {
    return validateDateString(dateString, {
      invalidDate: t.dashboard.errors.invalidDate,
      dateInFuture: t.dashboard.errors.dateInFuture,
    });
  };

  // Validate cards based on mode
  const validateCards = (): string | null => {
    if (selectedCards.length !== 3) {
      return t.dashboard.errors.selectCards;
    }

    if (cardSelectionMode === "random") {
      if (revealedCardsCount !== 3) {
        return t.dashboard.errors.revealCards;
      }
    }

    return null;
  };

  // Helper function to update error for a field
  const updateFieldError = (field: string, error: string | null) => {
    setErrors((prev) => {
      if (error) {
        return { ...prev, [field]: error };
      }
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Date input mask handler - formats as dd-mm-yy
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");

    // Validate input during typing
    if (!validateDateInput(rawValue)) {
      return;
    }

    // Format with dashes
    const formatted = formatDateInput(rawValue);
    setBirthDate(formatted);
    setTouched((prev) => ({ ...prev, birthDate: true }));

    // Real-time validation: clear error immediately when valid date is entered
    if (touched.birthDate && errors.birthDate && formatted.trim()) {
      const validationError = validateDate(formatted);
      updateFieldError("birthDate", validationError);
    }
  };

  // Validate date when user leaves the field (onBlur)
  const handleDateBlur = () => {
    if (!birthDate.trim()) {
      updateFieldError("birthDate", t.dashboard.errors.fillBirthDate);
      return;
    }

    const validationError = validateDate(birthDate);
    updateFieldError("birthDate", validationError);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Update question placeholder when locale changes (only if question is still the default)
  useEffect(() => {
    const currentPlaceholder = t.dashboard.questionPlaceholder;
    const defaultQuestions = t.dashboard.defaultQuestions as readonly string[];
    // Update if question is empty, matches placeholder, or is one of the default questions
    if (
      !question ||
      question === currentPlaceholder ||
      (defaultQuestions as string[]).includes(question)
    ) {
      setQuestion(currentPlaceholder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  // Auto-clear errors when user interactions resolve validation issues
  useEffect(() => {
    const updatedErrors = { ...errors };
    let hasChanges = false;

    // Clear photo error when photo step is completed or skipPhoto is true
    if ((photoStepCompleted || skipPhoto) && updatedErrors.photo) {
      delete updatedErrors.photo;
      hasChanges = true;
    }

    // Clear date error when date is filled or skipDate is true
    if ((skipDate || birthDate.trim()) && updatedErrors.birthDate) {
      delete updatedErrors.birthDate;
      hasChanges = true;
    }

    // Clear question error when question is filled
    if (question.trim() && updatedErrors.question) {
      delete updatedErrors.question;
      hasChanges = true;
    }

    // Validate cards in real-time when spread is created
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
    cardSelectionMode,
    errors,
  ]);

  if (status === "loading") {
    return (
      <div className="min-h-screen mystical-gradient">
        <Navbar />
        <PageContainer paddingBottom="pb-16">
          <div className="h-96 w-full bg-black/40 rounded-lg animate-pulse" />
        </PageContainer>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clear previous errors
    setErrors({});

    // Validate only cards (first 3 fields are already validated and locked)
    const newErrors: Record<string, string> = {};

    // Validate that spread is created
    if (!spreadCreated) {
      newErrors.general = t.dashboard.errors.createSpread;
    }

    // Validate cards using shared function
    const cardError = validateCards();
    if (cardError) {
      newErrors.cards = cardError;
    }

    // If there are errors, show them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Open modal immediately with form data
    setIsStreamingModalOpen(true);
  };

  const hasPhoto = !!(userImage && !skipPhoto);

  return (
    <div className="min-h-screen mystical-gradient">
      <Navbar />
      <PageContainer maxWidth="3xl">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="mb-2 text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            {t.dashboard.title}
          </h1>
          <p className="text-sm sm:text-base text-[#9ca3af]">
            {t.dashboard.subtitle}
          </p>
        </div>

        {/* Credits warning */}
        {session && (
          <CreditsWarning
            credits={userCredits}
            isWhitelisted={isWhitelisted}
            locale={locale}
          />
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Oracle Selection - Animated collapse */}
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
              {selectedReader && (
                <p className="text-xs sm:text-sm text-[#9ca3af]">
                  {
                    tarotReaders.find((r) => r.id === selectedReader)
                      ?.description
                  }
                </p>
              )}
            </div>
            {/* Input Fields Section - Animated movement */}
            <div
              className={`flex flex-col gap-2 transition-all duration-500 ease-in-out ${
                spreadCreated ? "-translate-y-2" : "translate-y-0"
              }`}
            >
              {/* User Image Upload with checkbox */}
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
                {/* User Image Upload - hidden if skipPhoto is true */}
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
              {/* Birth Date with checkbox */}
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
                {/* Birth Date Input - hidden if skipDate is true */}
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
                      (touched.birthDate && !birthDate.trim()) ||
                      !!errors.birthDate
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
            {/* Cards Selection - Random or Manual - Animated appearance */}
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
                  mode={cardSelectionMode}
                  locale={locale}
                  onSelectedCardsChange={setSelectedCards}
                  onModeChange={(mode) => {
                    setCardSelectionMode(mode);
                    // Reset revealed cards count when switching modes
                    setRevealedCardsCount(0);
                  }}
                  onRevealedCardsChange={setRevealedCardsCount}
                  allCardsRevealed={false}
                />
              </div>
            )}
            {/* Show errors for photo, birthDate, question above the button if createSpreadAttempted */}
            {createSpreadAttempted &&
              !spreadCreated &&
              (errors.photo || errors.birthDate || errors.question) && (
                <ErrorMessage
                  message={[errors.photo, errors.birthDate, errors.question]
                    .filter(Boolean)
                    .join(", ")}
                />
              )}
            {/* General error message - for errors not tied to specific fields */}
            {errors.general && <ErrorMessage message={errors.general} />}
            {/* Show cards error above button if it exists */}
            {errors.cards && spreadCreated && createReadingAttempted && (
              <ErrorMessage message={errors.cards} />
            )}{" "}
            {!hasCredits &&
              spreadCreated &&
              !isWhitelisted &&
              photoStepCompleted &&
              dateAndQuestionCompleted && (
                <ErrorMessage
                  message={t.dashboard.errors.insufficientCredits}
                />
              )}
            {/* Create Spread Button or Loading Phrases - Fixed position */}
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
              ) : isLoading ? (
                <LoadingPhrases
                  tarotReaderId={selectedReader as any}
                  locale={locale}
                  hasPhoto={hasPhoto}
                />
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  onClick={() => setCreateReadingAttempted(true)}
                  disabled={!hasCredits}
                  icon={<Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />}
                >
                  {t.dashboard.createReading}
                </Button>
              )}
            </div>
          </form>
        </Card>
      </PageContainer>

      {/* Streaming Modal */}
      <StreamingReadingModal
        open={isStreamingModalOpen}
        onOpenChange={setIsStreamingModalOpen}
        userImage={userImage}
        selectedCards={selectedCards}
        birthDate={skipDate ? "" : birthDate}
        question={question}
        tarotReaderId={selectedReader as any}
        cardSelectionMode={cardSelectionMode}
        skipDate={skipDate}
        skipPhoto={skipPhoto}
        locale={locale}
        onResetForm={resetForm}
      />
    </div>
  );
}
