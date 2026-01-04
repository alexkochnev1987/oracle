import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { PageContainer } from "@/components/page-container";
import { CreateQrCodeForm } from "./create-qr-code-form";
import { getTranslations, defaultLocale } from "@/lib/i18n";

export default async function CreateQrCodePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = (session.user as any).id;
  if (!userId) {
    redirect("/auth/signin");
  }

  // Use default locale on server, client components will use correct locale from localStorage
  const t = getTranslations(defaultLocale);

  // Get user credits
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  const userCredits = user?.credits ?? 0;

  return (
    <div className="min-h-screen mystical-gradient">
      <Navbar />
      <PageContainer maxWidth="3xl">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="mb-2 text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            {t.qr?.createTitle || "Create QR Code"}
          </h1>
          <p className="text-sm sm:text-base text-[#9ca3af]">
            {t.qr?.createSubtitle ||
              "Generate a QR code that allows others to submit reading requests"}
          </p>
        </div>
        <CreateQrCodeForm userCredits={userCredits} />
      </PageContainer>
    </div>
  );
}
