import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserQrCodes } from "@/app/actions/qr";
import { Navbar } from "@/components/navbar";
import { PageContainer } from "@/components/page-container";
import { QrCodesList } from "./qr-codes-list";
import { getTranslations, defaultLocale } from "@/lib/i18n";

export default async function QrCodesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Use default locale on server, client components will use correct locale from localStorage
  const t = getTranslations(defaultLocale);

  const result = await getUserQrCodes();
  const qrCodes = result.success ? result.qrCodes || [] : [];

  return (
    <div className="min-h-screen mystical-gradient">
      <Navbar />
      <PageContainer maxWidth="4xl">
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              {t.qr?.manageTitle || "My QR Codes"}
            </h1>
            <p className="text-sm sm:text-base text-[#9ca3af]">
              {t.qr?.manageSubtitle ||
                "Manage your QR codes and view statistics"}
            </p>
          </div>
        </div>
        <QrCodesList initialQrCodes={qrCodes} />
      </PageContainer>
    </div>
  );
}
