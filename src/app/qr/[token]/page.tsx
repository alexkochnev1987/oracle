import { redirect } from "next/navigation";
import { validateQrToken } from "@/app/actions/qr";
import { Navbar } from "@/components/navbar";
import { PageContainer } from "@/components/page-container";
import { QrForm } from "./qr-form";
import { getTranslations, defaultLocale } from "@/lib/i18n";
import { getAllTarotReaders } from "@/lib/tarot-readers";
import { Card } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";

interface QrFormPageProps {
  params: Promise<{ token: string }>;
}

export default async function QrFormPage({ params }: QrFormPageProps) {
  const { token } = await params;

  if (!token) {
    return (
      <div className="min-h-screen mystical-gradient">
        <Navbar />
        <PageContainer maxWidth="3xl">
          <Card className="p-6 text-center">
            <ErrorMessage message="QR code token is missing" />
          </Card>
        </PageContainer>
      </div>
    );
  }

  // Validate QR token on server
  const validation = await validateQrToken(token);

  if (!validation.success || !validation.qrCode) {
    return (
      <div className="min-h-screen mystical-gradient">
        <Navbar />
        <PageContainer maxWidth="3xl">
          <Card className="p-6 text-center">
            <ErrorMessage
              message={
                validation.error ||
                "This QR code is invalid, expired, or has reached its usage limit."
              }
            />
          </Card>
        </PageContainer>
      </div>
    );
  }

  // Get initial data on server
  const locale = defaultLocale; // Will be overridden by client-side locale
  const tarotReaders = getAllTarotReaders(locale);
  const t = getTranslations(locale);

  // Select random reader on server
  const randomIndex = Math.floor(Math.random() * tarotReaders.length);
  const initialReaderId = tarotReaders[randomIndex].id;

  return (
    <div className="min-h-screen mystical-gradient">
      <Navbar />
      <PageContainer maxWidth="3xl">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="mb-2 text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            {t.qr?.formTitle || "Tarot Reading Form"}
          </h1>
          <p className="text-sm sm:text-base text-[#9ca3af]">
            {t.qr?.formSubtitle ||
              "Fill out the form below to request a tarot reading"}
          </p>
        </div>
        <QrForm
          token={token}
          initialReaderId={initialReaderId}
          tarotReaders={tarotReaders}
        />
      </PageContainer>
    </div>
  );
}
