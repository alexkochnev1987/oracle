import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeUserImage } from "@/lib/openai";
import { type Locale, defaultLocale, locales } from "@/lib/i18n";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userImage, locale } = body;

    if (!userImage) {
      return NextResponse.json(
        { error: "User image is required" },
        { status: 400 }
      );
    }

    const validLocale: Locale = (locales as readonly string[]).includes(
      locale as string
    )
      ? (locale as Locale)
      : defaultLocale;

    const analysisResult = await analyzeUserImage(userImage, validLocale);

    return NextResponse.json({
      success: true,
      imageAnalysisResult: analysisResult,
    });
  } catch (error) {
    console.error("Error analyzing image:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to analyze image",
      },
      { status: 500 }
    );
  }
}
