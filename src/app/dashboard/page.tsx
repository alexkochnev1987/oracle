"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/image-upload";
import { Skeleton } from "@/components/ui/skeleton";
import { createReading } from "@/app/actions/reading";
import { useToast } from "@/components/ui/use-toast";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";
import { tarotReaders } from "@/lib/tarot-readers";
import { Sparkles } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
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
          <Skeleton className="h-96 w-full" />
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
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
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
      toast({
        title: t.dashboard.readingCreated,
        description: "Your reading has been created successfully",
      });
      router.push(`/readings/${result.readingId}`);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to create reading",
        variant: "destructive",
      });
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

          <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-purple-500/20 bg-black/30 p-6 backdrop-blur">
            {/* Tarot Reader Selection */}
            <div className="space-y-2">
              <Label className="text-white">{t.dashboard.selectTarotReader}</Label>
              <Select value={selectedReader} onValueChange={setSelectedReader}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tarotReaders.map((reader) => (
                    <SelectItem key={reader.id} value={reader.id}>
                      {reader.name[locale]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedReader && (
                <p className="text-sm text-gray-400">
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
              <Label className="text-white">{t.dashboard.birthDate}</Label>
              <DatePicker
                selected={birthDate}
                onChange={(date) => setBirthDate(date)}
                dateFormat="yyyy-MM-dd"
                maxDate={new Date()}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                placeholderText="Select your birth date"
              />
            </div>

            {/* Question */}
            <div className="space-y-2">
              <Label className="text-white">{t.dashboard.question}</Label>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t.dashboard.questionPlaceholder}
                className="bg-background"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mystical-glow bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  {t.dashboard.loading}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t.dashboard.createReading}
                </>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}

