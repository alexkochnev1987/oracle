import { NextResponse } from "next/server";
import { analyzeUserImage } from "@/lib/openai";
import { readFile } from "fs/promises";
import { join } from "path";

// Only available in development mode
const isDevelopment = process.env.NODE_ENV === "development";

// Oracle images to test
const TEST_IMAGES = [
  "/girl-oracle.png", // cosmic-oracle
  "/man-oracle.png", // astral-sorcerer
  "/alien.png", // alien-seer
  "/robot.png", // mechanical-prophet
  "/girl-oracle.png", // repeat for consistency check
];

/**
 * Convert image file to base64 data URI
 */
async function imageToBase64(imagePath: string): Promise<string> {
  try {
    const fullPath = join(process.cwd(), "public", imagePath);
    const imageBuffer = await readFile(fullPath);
    const base64 = imageBuffer.toString("base64");

    // Determine MIME type from file extension
    const ext = imagePath.split(".").pop()?.toLowerCase();
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";

    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`Error reading image ${imagePath}:`, error);
    throw new Error(`Failed to read image: ${imagePath}`);
  }
}

export async function GET(request: Request) {
  if (!isDevelopment) {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    // Get locale from query params, default to "ru"
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get("locale") || "ru") as "ru" | "en";

    const results = [];

    // Process each image sequentially
    for (let i = 0; i < TEST_IMAGES.length; i++) {
      const imagePath = TEST_IMAGES[i];

      try {
        // Convert image to base64
        const imageBase64 = await imageToBase64(imagePath);

        // Analyze image
        const analysis = await analyzeUserImage(imageBase64, locale);

        results.push({
          imageIndex: i + 1,
          imagePath,
          analysis: analysis || null,
          success: analysis !== null,
          error: null,
        });
      } catch (error) {
        results.push({
          imageIndex: i + 1,
          imagePath,
          analysis: null,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      locale,
      results,
    });
  } catch (error) {
    console.error("Error in image prompt test API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isDevelopment) {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const locale = (body.locale || "ru") as "ru" | "en";

    const results = [];

    // Process each image sequentially
    for (let i = 0; i < TEST_IMAGES.length; i++) {
      const imagePath = TEST_IMAGES[i];

      try {
        // Convert image to base64
        const imageBase64 = await imageToBase64(imagePath);

        // Analyze image
        const analysis = await analyzeUserImage(imageBase64, locale);

        results.push({
          imageIndex: i + 1,
          imagePath,
          analysis: analysis || null,
          success: analysis !== null,
          error: null,
        });
      } catch (error) {
        results.push({
          imageIndex: i + 1,
          imagePath,
          analysis: null,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      locale,
      results,
    });
  } catch (error) {
    console.error("Error in image prompt test API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
