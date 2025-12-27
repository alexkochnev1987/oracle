"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ImageUpload } from "@/components/image-upload";
import { TarotCardSelector } from "@/components/tarot-card-selector";
import { OracleSelector } from "@/components/oracle-selector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { createReading } from "@/app/actions/reading";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";
import { getAllTarotReaders } from "@/lib/tarot-readers";
import { type TarotCard } from "@/lib/tarot-cards";
import { Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { isUserAllowedForAI } from "@/lib/ai-whitelist";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [locale] = useLocale();
  const t = getTranslations(locale);

  const [userImage, setUserImage] = useState<string>("");
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [cardSelectionMode, setCardSelectionMode] = useState<
    "random" | "manual"
  >("random");
  const [birthDate, setBirthDate] = useState<string>("");
  const [question, setQuestion] = useState("");
  const tarotReaders = getAllTarotReaders(locale);
  const [selectedReader, setSelectedReader] = useState<string>(() => {
    const randomIndex = Math.floor(Math.random() * tarotReaders.length);
    return tarotReaders[randomIndex].id;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Check if user is in whitelist (unlimited credits)
  const isWhitelisted = session?.user?.email
    ? isUserAllowedForAI(session.user.email)
    : false;
  const userCredits = session?.user?.credits ?? 0;
  const hasCredits = isWhitelisted || userCredits >= 1;

  // Date input mask handler - formats as dd-mm-yy
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove all non-digits

    // Limit to 6 digits (ddmmyy)
    if (value.length > 6) {
      value = value.slice(0, 6);
    }

    // Format with dashes
    let formatted = value;
    if (value.length > 2) {
      formatted = value.slice(0, 2) + "-" + value.slice(2);
    }
    if (value.length > 4) {
      formatted =
        value.slice(0, 2) + "-" + value.slice(2, 4) + "-" + value.slice(4);
    }

    setBirthDate(formatted);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

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
    setError("");

    // Validate required fields
    if (!birthDate || !question) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate that 3 cards are selected
    if (selectedCards.length !== 3) {
      setError(
        locale === "ru"
          ? "Пожалуйста, выберите ровно 3 карты"
          : "Please select exactly 3 cards"
      );
      return;
    }

    // Validate date format (dd-mm-yy)
    const dateRegex = /^\d{2}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      setError("Please enter date in dd-mm-yy format (e.g., 12-07-87)");
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
      setError(result.error || "Failed to create reading");
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

          {/* Credits warning - only show if user is not in whitelist */}
          {session && !isWhitelisted && userCredits < 1 && (
            <Card className="mb-6 p-4 border-yellow-500/50 bg-yellow-500/10">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-200 font-medium mb-1">
                    {locale === "ru"
                      ? "У вас закончились кредиты"
                      : "You're out of credits"}
                  </p>
                  <p className="text-xs text-yellow-300/80 mb-3">
                    {locale === "ru"
                      ? "Приобретите кредиты, чтобы создавать новые расклады."
                      : "Purchase credits to create new readings."}
                  </p>
                  <Link href="/billing">
                    <Button variant="primary" size="sm">
                      {locale === "ru" ? "Купить кредиты" : "Buy Credits"}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* Low credits warning - only show if user is not in whitelist */}
          {session && !isWhitelisted && userCredits > 0 && userCredits <= 3 && (
            <Card className="mb-6 p-4 border-[rgba(100,200,255,0.3)] bg-[rgba(100,200,255,0.1)]">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-[rgba(100,200,255,0.8)] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-white font-medium mb-1">
                    {locale === "ru"
                      ? `У вас осталось ${userCredits} ${
                          userCredits === 1
                            ? "кредит"
                            : userCredits < 5
                            ? "кредита"
                            : "кредитов"
                        }`
                      : `You have ${userCredits} credit${
                          userCredits === 1 ? "" : "s"
                        } remaining`}
                  </p>
                  <Link href="/billing">
                    <Button variant="secondary" size="sm" className="mt-2">
                      {locale === "ru" ? "Пополнить баланс" : "Top Up Credits"}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
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
                onChange={setUserImage}
              />

              {/* Cards Selection - Random or Manual */}
              <TarotCardSelector
                label={t.dashboard.uploadCardsPhoto}
                selectedCards={selectedCards}
                mode={cardSelectionMode}
                locale={locale}
                onSelectedCardsChange={setSelectedCards}
                onModeChange={setCardSelectionMode}
              />

              {/* Birth Date */}
              <FormField
                label={t.dashboard.birthDate}
                required
                error={error && error.includes("date") ? error : undefined}
              >
                <Input
                  type="text"
                  value={birthDate}
                  onChange={handleDateChange}
                  placeholder="12-07-87"
                  maxLength={8}
                  pattern="\d{2}-\d{2}-\d{2}"
                />
              </FormField>

              {/* Question */}
              <FormField label={t.dashboard.question} required>
                <Input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={t.dashboard.questionPlaceholder}
                />
              </FormField>

              {/* Error Message */}
              {error && !error.includes("date") && (
                <div className="rounded-md bg-red-500/10 border border-red-500/50 p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={!hasCredits || isLoading}
                icon={<Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />}
                className="w-full sm:w-auto"
              >
                {t.dashboard.createReading}
              </Button>
              {!hasCredits && !isWhitelisted && (
                <p className="text-xs text-red-400 mt-2">
                  {locale === "ru"
                    ? "Недостаточно кредитов для создания расклада"
                    : "Insufficient credits to create a reading"}
                </p>
              )}
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
