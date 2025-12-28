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
import { createReading } from "@/app/actions/reading";
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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [locale] = useLocale();
  const t = getTranslations(locale);
  const [createReadingAttempted, setCreateReadingAttempted] = useState(false);
  const [userImage, setUserImage] = useState<string>("");
  const [skipPhoto, setSkipPhoto] = useState(false);
  const [photoStepCompleted, setPhotoStepCompleted] = useState(false);
  const [spreadCreated, setSpreadCreated] = useState(false);
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

  // Check if date and question are completed
  const dateAndQuestionCompleted =
    birthDate.trim().length > 0 && question.trim().length > 0;

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

  // Handle step 1: create spread - validate only photo, date, question
  const handleCreateSpread = () => {
    // Mark that button was clicked - this will disable fields
    setCreateSpreadAttempted(true);

    // Clear previous errors for these fields
    setErrors({});

    // Mark first 3 fields as touched
    setTouched({ photo: true, birthDate: true, question: true });

    // Collect validation errors for first 3 fields only
    const newErrors: Record<string, string> = {};

    // Validate photo step
    if (!photoStepCompleted) {
      newErrors.photo = t.dashboard.errors.uploadPhoto;
    }

    // Validate birth date
    if (!birthDate.trim()) {
      newErrors.birthDate = t.dashboard.errors.fillBirthDate;
    } else {
      // Use the same validation function
      const validationError = validateDate(birthDate);
      if (validationError) {
        newErrors.birthDate = validationError;
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

    // If validation passed, create spread and lock fields
    setSpreadCreated(true);
    // Reset revealed cards count when creating new spread
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
  };

  // Validate date when user leaves the field (onBlur)
  const handleDateBlur = () => {
    if (!birthDate.trim()) {
      setErrors((prev) => ({
        ...prev,
        birthDate: t.dashboard.errors.fillBirthDate,
      }));
      return;
    }

    const validationError = validateDate(birthDate);
    if (validationError) {
      setErrors((prev) => ({ ...prev, birthDate: validationError }));
    } else {
      // Clear error if date is valid
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors.birthDate) {
          delete newErrors.birthDate;
        }
        return newErrors;
      });
    }
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

  // Unified error management - auto-clear errors when user interactions resolve validation issues
  useEffect(() => {
    const updatedErrors = { ...errors };
    let hasChanges = false;

    // Clear photo error when skip photo checkbox is clicked or photo is uploaded
    if ((photoStepCompleted || skipPhoto) && updatedErrors.photo) {
      delete updatedErrors.photo;
      hasChanges = true;
    }

    // Don't auto-clear birth date error - it should only be cleared on blur or when explicitly validated

    // Clear question error when question is filled
    if (question.trim() && updatedErrors.question) {
      delete updatedErrors.question;
      hasChanges = true;
    }

    // Validate cards in real-time when spread is created
    if (spreadCreated) {
      const cardError = validateCards();
      if (cardError) {
        if (updatedErrors.cards !== cardError) {
          updatedErrors.cards = cardError;
          hasChanges = true;
        }
      } else if (updatedErrors.cards) {
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
    question,
    spreadCreated,
    selectedCards.length,
    revealedCardsCount,
    cardSelectionMode,
    errors,
    t.dashboard.errors,
  ]);

  if (status === "loading") {
    return (
      <div className="min-h-screen mystical-gradient">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="h-96 w-full bg-black/40 rounded-lg animate-pulse" />
        </div>
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

    setIsLoading(true);

    const formData = new FormData();
    if (userImage) {
      formData.append("userImage", userImage);
    }

    // Send selected cards as JSON
    formData.append(
      "selectedCards",
      JSON.stringify(selectedCards.map((card) => card.id))
    );

    formData.append("cardSelectionMode", cardSelectionMode);
    formData.append("birthDate", birthDate);
    formData.append("question", question);
    formData.append("tarotReaderId", selectedReader);
    formData.append("locale", locale);

    const result = await createReading(formData);

    setIsLoading(false);

    if (result.success) {
      router.push(`/readings/${result.readingId}`);
    } else {
      setErrors({ general: result.error || "Failed to create reading" });
    }
  };

  return (
    <div className="min-h-screen mystical-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mx-auto max-w-3xl">
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

          <Card className="p-4 sm:p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Oracle Selection */}
              <FormField label={t.dashboard.selectTarotReader} required>
                <OracleSelector
                  oracles={tarotReaders}
                  selectedId={selectedReader}
                  onSelect={setSelectedReader}
                  locale={locale}
                />
                {selectedReader && (
                  <p className="text-xs sm:text-sm text-[#9ca3af] mt-2">
                    {
                      tarotReaders.find((r) => r.id === selectedReader)
                        ?.description
                    }
                  </p>
                )}
              </FormField>

              {/* User Image Upload */}
              <ImageUpload
                label={t.dashboard.uploadUserPhoto}
                value={userImage}
                onChange={handleImageChange}
                skipPhoto={skipPhoto}
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

              {/* Birth Date */}
              <FormField
                label={t.dashboard.birthDate}
                required
                error={
                  errors.birthDate ||
                  (touched.birthDate && !birthDate.trim()
                    ? t.dashboard.errors.fillBirthDateMessage
                    : undefined)
                }
              >
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
              </FormField>

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

              {/* Cards Selection - Random or Manual - Only show after spread is created */}
              {spreadCreated && (
                <div className="space-y-4">
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
              )}

              {/* Create Spread Button - Show always until spread is created */}
              <div className="flex justify-center">
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
                    loading={isLoading}
                    onClick={() => setCreateReadingAttempted(true)}
                    disabled={!hasCredits || isLoading}
                    icon={<Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />}
                  >
                    {t.dashboard.createReading}
                  </Button>
                )}
              </div>
              {!hasCredits &&
                !isWhitelisted &&
                photoStepCompleted &&
                dateAndQuestionCompleted && (
                  <p className="text-xs text-red-400 mt-2">
                    {t.dashboard.errors.insufficientCredits}
                  </p>
                )}
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
