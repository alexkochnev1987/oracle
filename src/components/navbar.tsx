"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Sparkles,
  User,
  Menu,
  LogOut,
  Globe,
  CreditCard,
  Home,
} from "lucide-react";
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
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const toggleLocale = () => {
    // Cycle through: ru -> en -> by -> ru
    const localeOrder: Locale[] = ["ru", "en", "by"];
    const currentIndex = localeOrder.indexOf(locale);
    const nextIndex = (currentIndex + 1) % localeOrder.length;
    const newLocale = localeOrder[nextIndex];
    setLocale(newLocale);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[rgba(100,200,255,0.2)] bg-[rgba(0,0,0,0.2)] backdrop-blur-md supports-[backdrop-filter]:bg-[rgba(0,0,0,0.1)]">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 min-w-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 sm:gap-2 text-white hover:text-[rgba(100,200,255,0.8)] transition-colors flex-shrink-0 min-w-0"
        >
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-[rgba(100,200,255,0.8)] flex-shrink-0" />
          <span className="text-base sm:text-lg md:text-xl font-bold whitespace-nowrap truncate">
            Oracle
          </span>
        </Link>

        {/* Language Toggle and Credits - Always visible on all screen sizes */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Language Toggle */}
          <button
            onClick={toggleLocale}
            className="px-2 sm:px-2.5 py-2 text-white hover:text-[rgba(100,200,255,0.8)] hover:bg-[rgba(100,200,255,0.1)] rounded-xl transition-colors min-h-[44px] flex items-center gap-1.5 border border-[rgba(100,200,255,0.3)] hover:border-[rgba(100,200,255,0.5)] flex-shrink-0"
            aria-label={t.common.toggleLanguage}
            title={`${t.common.toggleLanguage} (${t.common.language})`}
          >
            <Globe className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium uppercase whitespace-nowrap">
              {t.common.language}
            </span>
          </button>

          {/* Credits - Show when user is logged in */}
          {mounted && status !== "loading" && session && (
            <div className="flex items-center gap-1 sm:gap-1.5 text-white px-1.5 sm:px-2 flex-shrink-0">
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[rgba(100,200,255,0.8)] flex-shrink-0" />
              <span className="text-xs sm:text-sm whitespace-nowrap">
                <span className="hidden sm:inline">{t.nav.credits}: </span>
                <span className="font-semibold text-[rgba(100,200,255,0.9)]">
                  {session.user.credits ?? 0}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Desktop Navigation - Progressive disclosure based on screen size */}
        <div className="hidden md:flex items-center gap-1.5 md:gap-2 lg:gap-2.5 xl:gap-3 flex-shrink-0">
          {mounted && status !== "loading" && session ? (
            <>
              {/* Dashboard - Always show in desktop nav */}
              <Link
                href="/dashboard"
                className={cn(
                  "px-2.5 lg:px-3 xl:px-4 py-2 text-sm lg:text-base text-white hover:text-[rgba(100,200,255,0.8)] hover:bg-[rgba(100,200,255,0.1)] rounded-xl transition-colors min-h-[44px] flex items-center whitespace-nowrap flex-shrink-0",
                  pathname === "/dashboard" && "font-bold"
                )}
                title={t.nav.dashboard}
              >
                {t.nav.dashboard}
              </Link>
              {/* Readings - Always show, most important */}
              <Link
                href="/readings"
                className={cn(
                  "px-2.5 lg:px-3 xl:px-4 py-2 text-sm lg:text-base text-white hover:text-[rgba(100,200,255,0.8)] hover:bg-[rgba(100,200,255,0.1)] rounded-xl transition-colors min-h-[44px] flex items-center whitespace-nowrap flex-shrink-0",
                  pathname.startsWith("/readings") && "font-bold"
                )}
                title={t.nav.readings}
              >
                {t.nav.readings}
              </Link>
              {/* Billing - Show on lg+ (1024px+) */}
              <Link
                href="/billing"
                className={cn(
                  "hidden lg:flex px-3 xl:px-4 py-2 text-base text-white hover:text-[rgba(100,200,255,0.8)] hover:bg-[rgba(100,200,255,0.1)] rounded-xl transition-colors min-h-[44px] items-center whitespace-nowrap flex-shrink-0",
                  pathname.startsWith("/billing") && "font-bold"
                )}
                title={t.billing.title}
              >
                {t.billing.title}
              </Link>
              {/* Sign Out - Icon only on small, text on lg+ */}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSignOut}
                icon={<LogOut className="h-4 w-4" />}
                className="whitespace-nowrap flex-shrink-0 px-2 lg:px-3"
                title={t.nav.signOut}
              >
                <span className="hidden lg:inline ml-1.5 text-sm">
                  {t.nav.signOut}
                </span>
              </Button>
            </>
          ) : mounted && status !== "loading" ? (
            <Link href="/auth/signin" className="flex-shrink-0">
              <Button variant="primary" size="sm" className="whitespace-nowrap">
                {t.nav.signIn}
              </Button>
            </Link>
          ) : null}
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="md:hidden text-white p-2.5 bg-[rgba(100,200,255,0.1)] hover:bg-[rgba(100,200,255,0.2)] rounded-xl transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center border border-[rgba(100,200,255,0.3)] hover:border-[rgba(100,200,255,0.5)]"
              aria-label={t.common.toggleMenu}
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[85vw] sm:w-[400px] bg-[rgba(26,26,58,0.95)] backdrop-blur-md border-[rgba(100,200,255,0.3)] p-0"
          >
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-[rgba(100,200,255,0.2)]">
              <SheetTitle className="text-white">{t.common.menu}</SheetTitle>
            </SheetHeader>
            <div className="p-6 space-y-2">
              {/* Home Link - Always visible */}
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 text-white hover:text-[rgba(100,200,255,0.8)] hover:bg-[rgba(100,200,255,0.1)] rounded-xl transition-colors min-h-[44px]"
              >
                <Home className="h-5 w-5 text-[rgba(100,200,255,0.8)] flex-shrink-0" />
                <span className={cn(pathname === "/" && "font-bold")}>
                  {t.nav.home}
                </span>
              </Link>

              {mounted && status !== "loading" && session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-white hover:text-[rgba(100,200,255,0.8)] hover:bg-[rgba(100,200,255,0.1)] rounded-xl transition-colors min-h-[44px]"
                  >
                    <Sparkles className="h-5 w-5 text-[rgba(100,200,255,0.8)] flex-shrink-0" />
                    <span
                      className={cn(pathname === "/dashboard" && "font-bold")}
                    >
                      {t.nav.dashboard}
                    </span>
                  </Link>
                  <Link
                    href="/readings"
                    className="flex items-center gap-3 px-4 py-3 text-white hover:text-[rgba(100,200,255,0.8)] hover:bg-[rgba(100,200,255,0.1)] rounded-xl transition-colors min-h-[44px]"
                  >
                    <User className="h-5 w-5 text-[rgba(100,200,255,0.8)] flex-shrink-0" />
                    <span
                      className={cn(
                        pathname.startsWith("/readings") && "font-bold"
                      )}
                    >
                      {t.nav.readings}
                    </span>
                  </Link>
                  <Link
                    href="/billing"
                    className="flex items-center gap-3 px-4 py-3 text-white hover:text-[rgba(100,200,255,0.8)] hover:bg-[rgba(100,200,255,0.1)] rounded-xl transition-colors min-h-[44px]"
                  >
                    <CreditCard className="h-5 w-5 text-[rgba(100,200,255,0.8)] flex-shrink-0" />
                    <span
                      className={cn(
                        pathname.startsWith("/billing") && "font-bold"
                      )}
                    >
                      {t.billing.title}
                    </span>
                  </Link>
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
