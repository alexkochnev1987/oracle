"use client";

import { signIn } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTranslations } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";
import { PageContainer } from "@/components/page-container";

export default function SignInPage() {
  const [locale] = useLocale();
  const t = getTranslations(locale);

  return (
    <div className="min-h-screen mystical-gradient">
      <Navbar />
      <PageContainer className="flex min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] items-center justify-center">
        <Card className="w-full max-w-md p-6 sm:p-8">
          <h1 className="mb-4 sm:mb-6 text-center text-2xl sm:text-3xl font-bold text-white">
            {t.auth.signInTitle}
          </h1>
          <p className="mb-4 sm:mb-6 text-center text-sm sm:text-base text-[#9ca3af]">
            {t.auth.signInDescription}
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full"
          >
            {t.auth.signInWithGoogle}
          </Button>
        </Card>
      </PageContainer>
    </div>
  );
}
