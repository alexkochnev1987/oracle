import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Sparkles, Star, Moon, Gem } from "lucide-react";
import { getTranslations } from "@/lib/i18n";

export default function Home() {
  const t = getTranslations("ru");

  return (
    <div className="min-h-screen mystical-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          {/* Hero Section */}
          <div className="mb-16 space-y-8">
            <div className="flex justify-center">
              <div className="relative">
                <Gem className="h-24 w-24 text-purple-400 mystical-glow" />
                <Star className="absolute -top-2 -right-2 h-8 w-8 animate-pulse text-yellow-400" />
                <Moon className="absolute -bottom-2 -left-2 h-6 w-6 animate-pulse text-blue-400" />
              </div>
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
              {t.landing.title}
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-gray-300 sm:text-2xl">
              {t.landing.subtitle}
            </p>

            <p className="mx-auto max-w-xl text-lg text-gray-400">
              {t.landing.description}
            </p>

            <div className="flex justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="mystical-glow bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6">
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t.landing.cta}
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mt-24 grid gap-8 sm:grid-cols-3">
            <div className="rounded-lg border border-purple-500/20 bg-black/30 p-6 backdrop-blur">
              <Star className="mx-auto mb-4 h-10 w-10 text-yellow-400" />
              <h3 className="mb-2 text-xl font-semibold text-white">
                Персонализированный анализ
              </h3>
              <p className="text-gray-400">
                Уникальный прогноз на основе вашей фотографии и энергетики
              </p>
            </div>

            <div className="rounded-lg border border-purple-500/20 bg-black/30 p-6 backdrop-blur">
              <Moon className="mx-auto mb-4 h-10 w-10 text-blue-400" />
              <h3 className="mb-2 text-xl font-semibold text-white">
                Карты Таро
              </h3>
              <p className="text-gray-400">
                Глубокий анализ расклада карт от профессиональных тарологов
              </p>
            </div>

            <div className="rounded-lg border border-purple-500/20 bg-black/30 p-6 backdrop-blur">
              <Gem className="mx-auto mb-4 h-10 w-10 text-purple-400" />
              <h3 className="mb-2 text-xl font-semibold text-white">
                Прогноз на год
              </h3>
              <p className="text-gray-400">
                Детальный прогноз на все сферы жизни в новом году
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
