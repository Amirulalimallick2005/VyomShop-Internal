import { NextRequest, NextResponse } from "next/server";
import { uploadToS3, generateUniqueFileName, isS3Configured } from "@/lib/s3";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

/**
 * POST /api/upload
 * Upload single or multiple files to S3-compatible storage
 * Automatically handles private buckets with signed URLs
 */
export async function POST(request: NextRequest) {
  try {
    // Check if S3 is configured
    if (!isS3Configured()) {
      return NextResponse.json(
        {
          success: false,
          error: "S3 storage is not configured. Please check environment variables.",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const folder = (formData.get("folder") as string) || "uploads";

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files provided" },
        { status: 400 }
      );
    }

    // Validate files
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_TYPES.join(", ")}`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `File ${file.name} exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          },
          { status: 400 }
        );
      }
    }

    // Upload files and get URLs (automatically signed for private buckets)
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = generateUniqueFileName(file.name);
      const url = await uploadToS3(buffer, fileName, file.type, folder);
      uploadedUrls.push(url);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      message: `Successfully uploaded ${uploadedUrls.length} file(s)`,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to upload files",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload
 * Check if upload service is available
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    configured: isS3Configured(),
    maxFileSize: MAX_FILE_SIZE,
    allowedTypes: ALLOWED_TYPES,
  });
}
