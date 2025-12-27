import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { generateEmailHTML, generateEmailText } from "@/lib/email-template";
import { Locale } from "@/lib/i18n";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { email, locale = "ru" } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Get reading
    const reading = await prisma.reading.findUnique({
      where: { id },
    });

    if (!reading || reading.userId !== userId) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 });
    }

    // Generate share URL if token exists
    const shareUrl = reading.shareToken
      ? `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/readings/share/${reading.shareToken}`
      : undefined;

    // Generate email content
    const htmlContent = generateEmailHTML(
      {
        question: reading.question,
        predictionText: reading.predictionText,
        createdAt: reading.createdAt,
        tarotReaderId: reading.tarotReaderId,
        selectedCards: reading.selectedCards as string[] | null,
        shareUrl,
      },
      locale as Locale
    );

    const textContent = generateEmailText(
      {
        question: reading.question,
        predictionText: reading.predictionText,
        createdAt: reading.createdAt,
        tarotReaderId: reading.tarotReaderId,
        selectedCards: reading.selectedCards as string[] | null,
        shareUrl,
      },
      locale as Locale
    );

    // Send email
    const subject =
      locale === "ru"
        ? `✨ Ваш прогноз Таро: ${reading.question}`
        : `✨ Your Tarot Reading: ${reading.question}`;

    const result = await sendEmail({
      to: email,
      subject,
      html: htmlContent,
      text: textContent,
    });

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

