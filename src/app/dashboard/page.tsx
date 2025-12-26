"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ImageUpload } from "@/components/image-upload";
import { createReading } from "@/app/actions/reading";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";
import { tarotReaders } from "@/lib/tarot-readers";
import { Sparkles } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = getTranslations(locale);

  const [userImage, setUserImage] = useState<string>("");
  const [cardsImage, setCardsImage] = useState<string>("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [question, setQuestion] = useState("");
  const [selectedReader, setSelectedReader] = useState("default");
  const [isLoading, setIsLoading] = useState(false);

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
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userImage || !cardsImage || !birthDate || !question) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("userImage", userImage);
    formData.append("cardsImage", cardsImage);
    formData.append("birthDate", birthDate.toISOString());
    formData.append("question", question);
    formData.append("tarotReaderId", selectedReader);

    const result = await createReading(formData);

    setIsLoading(false);

    if (result.success) {
      alert("Your reading has been created successfully");
      router.push(`/readings/${result.readingId}`);
    } else {
      alert(result.error || "Failed to create reading");
    }
  };

  return (
    <div className="min-h-screen mystical-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold text-white">{t.dashboard.title}</h1>
            <p className="text-gray-400">Create your personalized New Year reading</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-purple-500/30 bg-black/40 p-6 backdrop-blur-md shadow-lg">
            {/* Tarot Reader Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white block">{t.dashboard.selectTarotReader}</label>
              <select 
                value={selectedReader} 
                onChange={(e) => setSelectedReader(e.target.value)}
                className="w-full h-9 rounded-md border border-purple-500/30 bg-black/40 px-3 py-1 text-sm text-white hover:border-purple-500/50 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:outline-none"
              >
                {tarotReaders.map((reader) => (
                  <option 
                    key={reader.id} 
                    value={reader.id}
                    className="bg-black text-white"
                  >
                    {reader.name[locale]}
                  </option>
                ))}
              </select>
              {selectedReader && (
                <p className="text-sm text-purple-200/80">
                  {tarotReaders.find((r) => r.id === selectedReader)?.description[locale]}
                </p>
              )}
            </div>

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
            <div className="space-y-2">
              <label className="text-sm font-medium text-white block">{t.dashboard.birthDate}</label>
              <DatePicker
                selected={birthDate}
                onChange={(date) => setBirthDate(date)}
                dateFormat="yyyy-MM-dd"
                maxDate={new Date()}
                className="flex h-9 w-full rounded-md border border-purple-500/30 bg-black/40 px-3 py-1 text-sm text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:outline-none"
                placeholderText="Select your birth date"
              />
            </div>

            {/* Question */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white block">{t.dashboard.question}</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t.dashboard.questionPlaceholder}
                className="w-full h-9 rounded-md border border-purple-500/30 bg-black/40 px-3 py-1 text-sm text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mystical-glow bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  {t.dashboard.loading}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t.dashboard.createReading}
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

