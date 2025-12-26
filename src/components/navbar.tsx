"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
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
    <nav className="border-b border-purple-500/20 bg-black/20 backdrop-blur-md supports-[backdrop-filter]:bg-black/10">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-white hover:text-purple-300 transition-colors">
          <Sparkles className="h-6 w-6 text-purple-400" />
          <span className="text-xl font-bold">Oracle</span>
        </Link>

        <div className="flex items-center gap-4">
          {mounted && status !== "loading" && session ? (
            <>
              <Link 
                href="/dashboard"
                className="px-4 py-2 text-white hover:text-purple-300 hover:bg-purple-500/20 rounded-md transition-colors"
              >
                {t.nav.dashboard}
              </Link>
              <Link 
                href="/readings"
                className="px-4 py-2 text-white hover:text-purple-300 hover:bg-purple-500/20 rounded-md transition-colors"
              >
                {t.nav.readings}
              </Link>
              <div className="flex items-center gap-2 text-white">
                <User className="h-4 w-4 text-purple-400" />
                <span className="text-sm">
                  {t.nav.credits}: <span className="font-semibold text-purple-300">{session.user.credits || 0}</span>
                </span>
              </div>
              <button 
                onClick={() => signOut()}
                className="px-4 py-2 border border-purple-500/30 text-white hover:bg-purple-500/20 hover:border-purple-500/50 rounded-md transition-colors"
              >
                {t.nav.signOut}
              </button>
            </>
          ) : mounted && status !== "loading" ? (
            <Link href="/auth/signin">
              <button className="mystical-glow bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors">
                {t.nav.signIn}
              </button>
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

