import { prisma } from "@/lib/prisma";
import { PublicReadingContent } from "@/components/public-reading-content";
import { PublicReadingError } from "@/components/public-reading-error";

// ISR: Revalidate every 3600 seconds (1 hour)
// Pages are generated on-demand and cached for 1 hour
export const revalidate = 3600;

interface PublicReadingPageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicReadingPage({
  params,
}: PublicReadingPageProps) {
  const { token } = await params;

  if (!token) {
    return <PublicReadingError />;
  }

  try {
    // Fetch reading from database directly on server
    const reading = await prisma.reading.findUnique({
      where: { shareToken: token },
      select: {
        id: true,
        question: true,
        birthDate: true,
        predictionText: true,
        tarotReaderId: true,
        createdAt: true,
        shareToken: true,
        selectedCards: true,
        cardSelectionMode: true,
        userImageUrl: true,
      },
    });

    if (!reading) {
      return <PublicReadingError />;
    }

    // Convert selectedCards from JsonValue to string[] | null
    const selectedCards =
      reading.selectedCards && Array.isArray(reading.selectedCards)
        ? (reading.selectedCards as string[])
        : null;

    return (
      <PublicReadingContent
        reading={{
          ...reading,
          selectedCards,
        }}
        shareToken={token}
      />
    );
  } catch (error) {
    console.error("Error fetching reading by token:", error);
    return <PublicReadingError />;
  }
}
