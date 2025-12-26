"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { Sparkles, User } from "lucide-react";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";
import { useEffect, useState } from "react";

export function Navbar() {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const t = getTranslations(locale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Oracle</span>
        </Link>

        <div className="flex items-center gap-4">
          {mounted && status !== "loading" && session ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">{t.nav.dashboard}</Button>
              </Link>
              <Link href="/readings">
                <Button variant="ghost">{t.nav.readings}</Button>
              </Link>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">
                  {t.nav.credits}: {session.user.credits || 0}
                </span>
              </div>
              <Button variant="outline" onClick={() => signOut()}>
                {t.nav.signOut}
              </Button>
            </>
          ) : mounted && status !== "loading" ? (
            <Link href="/auth/signin">
              <Button>{t.nav.signIn}</Button>
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

