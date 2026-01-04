import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { PageContainer } from "@/components/page-container";
import { ReadingsList } from "./readings-list";

export default async function ReadingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = (session.user as any).id;
  if (!userId) {
    redirect("/auth/signin");
  }

  const readings = await prisma.reading.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      question: true,
      createdAt: true,
      tarotReaderId: true,
      shareToken: true,
      userImageUrl: true,
      qrCodeId: true,
    },
  });

  return (
    <div className="min-h-screen mystical-gradient">
      <Navbar />
      <PageContainer
        maxWidth="4xl"
        paddingBottom="pb-8 sm:pb-10 lg:pb-12"
        className="px-4 sm:px-6 lg:px-8"
      >
        <ReadingsList initialReadings={readings} />
      </PageContainer>
    </div>
  );
}
