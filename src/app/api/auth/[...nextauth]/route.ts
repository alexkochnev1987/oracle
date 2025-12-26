import { handlers } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Safely export handlers with error handling
let authHandlers: { GET: any; POST: any };

try {
  authHandlers = handlers;
} catch (error) {
  // Fallback if handlers can't be initialized
  console.warn("NextAuth handlers not initialized, using fallback");
  authHandlers = {
    GET: async (req: NextRequest) => {
      return NextResponse.json(
        { error: "Authentication not configured" },
        { status: 503 }
      );
    },
    POST: async (req: NextRequest) => {
      return NextResponse.json(
        { error: "Authentication not configured" },
        { status: 503 }
      );
    },
  };
}

export const { GET, POST } = authHandlers;

// Configure runtime
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
