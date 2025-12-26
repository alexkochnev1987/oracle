"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ImageUpload } from "@/components/image-upload";
import { OracleSelector } from "@/components/oracle-selector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { createReading } from "@/app/actions/reading";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";
import { tarotReaders } from "@/lib/tarot-readers";
import { Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [locale] = useLocale();
  const t = getTranslations(locale);

  const [userImage, setUserImage] = useState<string>("");
  const [cardsImage, setCardsImage] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [selectedReader, setSelectedReader] = useState<string>(tarotReaders[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

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

    if (!userImage || !cardsImage || !birthDate || !question) {
      setError("Please fill in all fields");
      return;
    }

    // Validate date format (dd-mm-yy)
    const dateRegex = /^\d{2}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      setError("Please enter date in dd-mm-yy format (e.g., 15-03-90)");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("userImage", userImage);
    formData.append("cardsImage", cardsImage);
    formData.append("birthDate", birthDate);
    formData.append("question", question);
    formData.append("tarotReaderId", selectedReader);

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

          <Card className="p-4 sm:p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Oracle Selection */}
              <FormField
                label={t.dashboard.selectTarotReader}
                required
              >
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
                        ?.description[locale]
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

              {/* Cards Image Upload */}
              <ImageUpload
                label={t.dashboard.uploadCardsPhoto}
                value={cardsImage}
                onChange={setCardsImage}
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
                  onChange={(e) => setBirthDate(e.target.value)}
                  placeholder="dd-mm-yy (e.g., 15-03-90)"
                  pattern="\d{2}-\d{2}-\d{2}"
                />
              </FormField>

              {/* Question */}
              <FormField
                label={t.dashboard.question}
                required
              >
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
                icon={<Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />}
                className="w-full sm:w-auto"
              >
                {t.dashboard.createReading}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
