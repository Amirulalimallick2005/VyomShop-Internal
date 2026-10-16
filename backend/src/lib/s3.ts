import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

// S3-compatible client configuration
// Works with AWS S3, Cloudflare R2, DigitalOcean Spaces, MinIO, Backblaze B2, etc.
const s3Config: any = {
  region: process.env.S3_REGION || "auto",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
};

// If custom endpoint is provided (for R2, Spaces, MinIO, Backblaze B2, etc.)
if (process.env.S3_ENDPOINT) {
  s3Config.endpoint = process.env.S3_ENDPOINT;
  // Force path-style URLs for non-AWS S3 providers (Backblaze B2, MinIO, etc.)
  s3Config.forcePathStyle = true;
}

export const s3Client = new S3Client(s3Config);
export const BUCKET_NAME = process.env.S3_BUCKET_NAME || "vyom-shop-uploads";

// Check if bucket is private (no public URL configured)
const IS_PRIVATE_BUCKET = !!process.env.S3_ENDPOINT && !process.env.S3_PUBLIC_URL;

/**
 * Generate a unique file name with original extension
 */
export function generateUniqueFileName(originalName: string): string {
  const ext = originalName.split(".").pop();
  const timestamp = Date.now();
  const uuid = randomUUID().split("-")[0];
  return `${timestamp}-${uuid}.${ext}`;
}

/**
 * Upload a file to S3 and return appropriate URL (public or signed)
 * For private buckets, returns signed URL valid for 30 days
 */
export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = "uploads"
): Promise<string> {
  const key = `${folder}/${fileName}`;

  // Upload file to S3
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Return signed URL for private buckets, public URL for public buckets
  if (IS_PRIVATE_BUCKET) {
    return await getSignedUrlForObject(key, 30 * 24 * 60 * 60); // 30 days
  } else {
    return getPublicUrl(key);
  }
}

/**
 * Generate a signed URL for private bucket access
 */
export async function getSignedUrlForObject(
  key: string,
  expirationSeconds: number = 30 * 24 * 60 * 60 // 30 days default
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expirationSeconds,
  });

  return signedUrl;
}

/**
 * Get public URL for an S3 object (for public buckets only)
 */
function getPublicUrl(key: string): string {
  if (process.env.S3_PUBLIC_URL) {
    return `${process.env.S3_PUBLIC_URL}/${key}`;
  }

  if (!process.env.S3_ENDPOINT) {
    const region = process.env.S3_REGION || "us-east-1";
    return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
  }

  return `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${key}`;
}

/**
 * Delete a file from S3-compatible storage
 */
export async function deleteFromS3(fileUrl: string): Promise<void> {
  try {
    const key = extractKeyFromUrl(fileUrl);
    if (!key) return;

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting file from S3:", error);
  }
}

/**
 * Extract S3 key from full URL
 */
function extractKeyFromUrl(url: string): string | null {
  try {
    if (url.includes(BUCKET_NAME)) {
      const parts = url.split(BUCKET_NAME + "/");
      return parts[1] || null;
    }

    if (process.env.S3_PUBLIC_URL && url.startsWith(process.env.S3_PUBLIC_URL)) {
      return url.replace(process.env.S3_PUBLIC_URL + "/", "");
    }

    // Handle signed URLs - extract key from path
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    if (pathParts.length >= 3) {
      // Path format: /bucket-name/folder/file
      return pathParts.slice(2).join("/");
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if S3 is properly configured
 */
export function isS3Configured(): boolean {
  return !!(
    process.env.S3_BUCKET_NAME &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY
  );
}
