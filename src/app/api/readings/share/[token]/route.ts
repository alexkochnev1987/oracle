import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

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
      },
    });

    if (!reading) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 });
    }

    return NextResponse.json(reading);
  } catch (error) {
    console.error("Error fetching reading by token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

