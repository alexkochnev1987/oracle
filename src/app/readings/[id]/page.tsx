import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ReadingDetailContent } from "./reading-detail-content";

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

export default async function ReadingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  // Middleware already checks authentication, but we verify ownership here
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { id } = await params;
  const userId = (session.user as any).id;

  // Fetch reading from database
  const reading = await prisma.reading.findUnique({
    where: { id },
  });

  // Check if reading exists and belongs to user
  if (!reading || reading.userId !== userId) {
    redirect("/readings");
  }

  return <ReadingDetailContent reading={reading} />;
}
