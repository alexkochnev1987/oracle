"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Sparkles, User, Menu, LogOut, Globe } from "lucide-react";
import { getTranslations, locales, type Locale } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session, status } = useSession();
  const [locale, setLocale] = useLocale();
  const t = getTranslations(locale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const toggleLocale = () => {
    const newLocale: Locale = locale === "ru" ? "en" : "ru";
    setLocale(newLocale);
  };

  return (
    <nav className="border-b border-[rgba(100,200,255,0.2)] bg-[rgba(0,0,0,0.2)] backdrop-blur-md supports-[backdrop-filter]:bg-[rgba(0,0,0,0.1)]">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-white hover:text-[rgba(100,200,255,0.8)] transition-colors"
        >
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-[rgba(100,200,255,0.8)]" />
          <span className="text-lg sm:text-xl font-bold">Oracle</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Language Toggle */}
          <button
            onClick={toggleLocale}
            className="px-3 py-2 text-sm text-white hover:text-[rgba(100,200,255,0.8)] hover:bg-[rgba(100,200,255,0.1)] rounded-xl transition-colors min-h-[44px] flex items-center gap-2 border border-[rgba(100,200,255,0.3)] hover:border-[rgba(100,200,255,0.5)]"
            aria-label="Toggle language"
          >
            <Globe className="h-4 w-4" />
            <span className="uppercase font-medium">{locale}</span>
          </button>

          {mounted && status !== "loading" && session ? (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2.5 text-sm sm:text-base text-white hover:text-[rgba(100,200,255,0.8)] hover:bg-[rgba(100,200,255,0.1)] rounded-xl transition-colors min-h-[44px] flex items-center"
              >
                {t.nav.dashboard}
              </Link>
              <Link
                href="/readings"
                className="px-4 py-2.5 text-sm sm:text-base text-white hover:text-[rgba(100,200,255,0.8)] hover:bg-[rgba(100,200,255,0.1)] rounded-xl transition-colors min-h-[44px] flex items-center"
              >
                {t.nav.readings}
              </Link>
              <div className="flex items-center gap-2.5 text-white">
                <User className="h-5 w-5 text-[rgba(100,200,255,0.8)] flex-shrink-0" />
                <span className="text-sm whitespace-nowrap">
                  {t.nav.credits}:{" "}
                  <span className="font-semibold text-[rgba(100,200,255,0.9)]">
                    {session.user.credits || 0}
                  </span>
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSignOut}
                icon={<LogOut className="h-4 w-4" />}
              >
                {t.nav.signOut}
              </Button>
            </>
          ) : mounted && status !== "loading" ? (
            <Link href="/auth/signin">
              <Button variant="primary" size="sm">
                {t.nav.signIn}
              </Button>
            </Link>
          ) : null}
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="sm:hidden text-white p-2.5 bg-[rgba(100,200,255,0.1)] hover:bg-[rgba(100,200,255,0.2)] rounded-xl transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center border border-[rgba(100,200,255,0.3)] hover:border-[rgba(100,200,255,0.5)]"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[85vw] sm:w-[400px] bg-[rgba(26,26,58,0.95)] backdrop-blur-md border-[rgba(100,200,255,0.3)] p-0"
          >
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-[rgba(100,200,255,0.2)]">
              <SheetTitle className="text-white">Menu</SheetTitle>
            </SheetHeader>
            <div className="p-6 space-y-2">
              {/* Language Toggle */}
              <button
                onClick={toggleLocale}
                className="flex items-center gap-3 px-4 py-3 text-white hover:text-[rgba(100,200,255,0.8)] hover:bg-[rgba(100,200,255,0.1)] rounded-xl transition-colors min-h-[44px] w-full"
              >
                <Globe className="h-5 w-5 text-[rgba(100,200,255,0.8)] flex-shrink-0" />
                <span>{locale === "ru" ? "English" : "Русский"}</span>
              </button>

              {mounted && status !== "loading" && session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-white hover:text-[rgba(100,200,255,0.8)] hover:bg-[rgba(100,200,255,0.1)] rounded-xl transition-colors min-h-[44px]"
                  >
                    <Sparkles className="h-5 w-5 text-[rgba(100,200,255,0.8)] flex-shrink-0" />
                    <span>{t.nav.dashboard}</span>
                  </Link>
                  <Link
                    href="/readings"
                    className="flex items-center gap-3 px-4 py-3 text-white hover:text-[rgba(100,200,255,0.8)] hover:bg-[rgba(100,200,255,0.1)] rounded-xl transition-colors min-h-[44px]"
                  >
                    <User className="h-5 w-5 text-[rgba(100,200,255,0.8)] flex-shrink-0" />
                    <span>{t.nav.readings}</span>
                  </Link>
                  <div className="flex items-center gap-3 px-4 py-3 text-white rounded-xl bg-[rgba(100,200,255,0.05)]">
                    <User className="h-5 w-5 text-[rgba(100,200,255,0.8)] flex-shrink-0" />
                    <span className="text-sm">
                      {t.nav.credits}:{" "}
                      <span className="font-semibold text-[rgba(100,200,255,0.9)]">
                        {session.user.credits || 0}
                      </span>
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[rgba(100,200,255,0.2)]">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={handleSignOut}
                      icon={<LogOut className="h-4 w-4" />}
                    >
                      {t.nav.signOut}
                    </Button>
                  </div>
                </>
              ) : mounted && status !== "loading" ? (
                <Link href="/auth/signin">
                  <Button variant="primary" size="sm" className="w-full">
                    {t.nav.signIn}
                  </Button>
                </Link>
              ) : null}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
