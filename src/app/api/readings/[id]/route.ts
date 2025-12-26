import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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
    const reading = await prisma.reading.findUnique({
      where: { id },
    });

    if (!reading || reading.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(reading);
  } catch (error) {
    console.error("Error fetching reading:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    // Check if reading exists and belongs to user
    const reading = await prisma.reading.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!reading || reading.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete the reading
    await prisma.reading.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting reading:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
