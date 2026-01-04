import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

// Lazy initialization of S3 client to avoid errors during build
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || "us-east-1";

    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        "AWS credentials are not set. Please provide AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your environment variables."
      );
    }

    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return s3Client;
}

/**
 * Converts base64 image string to Buffer
 * Handles both data URI format (data:image/jpeg;base64,...) and plain base64
 */
function base64ToBuffer(base64: string): Buffer {
  // Remove data URI prefix if present
  const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;

  return Buffer.from(base64Data, "base64");
}

/**
 * Detects image MIME type from base64 string
 */
function detectImageType(base64: string): string {
  if (base64.startsWith("data:image/")) {
    const match = base64.match(/data:image\/([^;]+)/);
    if (match) {
      return match[1];
    }
  }
  // Default to jpeg if cannot detect
  return "jpeg";
}

/**
 * Uploads an image to AWS S3 and returns the public URL
 * @param base64 - Base64 encoded image (with or without data URI prefix)
 * @param userId - User ID for organizing files
 * @param readingId - Optional reading ID for better organization
 * @returns Public URL of the uploaded image, or null if upload fails
 */
export async function uploadImageToS3(
  base64: string,
  userId: string,
  readingId?: string
): Promise<string | null> {
  try {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const bucketUrl = process.env.AWS_S3_BUCKET_URL;

    if (!bucketName) {
      throw new Error(
        "AWS_S3_BUCKET_NAME is not set. Please provide it in your environment variables."
      );
    }

    // Convert base64 to buffer
    const imageBuffer = base64ToBuffer(base64);
    const imageType = detectImageType(base64);
    const contentType = `image/${imageType}`;

    // Generate unique file name
    const timestamp = Date.now();
    const uuid = randomUUID();
    const fileName = readingId
      ? `${userId}/${readingId}/${timestamp}-${uuid}.${imageType}`
      : `${userId}/${timestamp}-${uuid}.${imageType}`;

    // Upload to S3
    // Note: ACL is not used as modern S3 buckets use bucket policies instead
    // Make sure your bucket policy allows public read access if needed
    const s3Client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: imageBuffer,
      ContentType: contentType,
      // Public access should be configured via bucket policy, not ACL
    });

    await s3Client.send(command);

    // Construct public URL
    // If AWS_S3_BUCKET_URL is provided, use it; otherwise construct from bucket name
    const publicUrl = bucketUrl
      ? `${bucketUrl}/${fileName}`
      : `https://${bucketName}.s3.${
          process.env.AWS_REGION || "us-east-1"
        }.amazonaws.com/${fileName}`;

    console.log(`Image uploaded to S3: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    // Return null instead of throwing to not block the main flow
    return null;
  }
}
