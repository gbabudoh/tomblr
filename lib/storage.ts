import * as Minio from "minio";

// MinIO client configuration
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "",
  secretKey: process.env.MINIO_SECRET_KEY || "",
});

const BUCKET_NAME = process.env.MINIO_BUCKET || "tomblr";

// Ensure bucket exists
export async function ensureBucket() {
  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME);
    console.log(`Bucket '${BUCKET_NAME}' created successfully.`);
  }
}

// Upload a file
export async function uploadFile(
  file: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const storageKey = `${Date.now()}-${fileName}`;
  
  await minioClient.putObject(BUCKET_NAME, storageKey, file, file.length, {
    "Content-Type": mimeType,
  });
  
  return storageKey;
}

// Get a presigned URL for download (valid for 1 hour)
export async function getDownloadUrl(storageKey: string): Promise<string> {
  return await minioClient.presignedGetObject(BUCKET_NAME, storageKey, 60 * 60);
}

// Get a presigned URL for direct upload (valid for 15 minutes)
export async function getUploadUrl(
  fileName: string
): Promise<{ url: string; storageKey: string }> {
  const storageKey = `${Date.now()}-${fileName}`;
  const url = await minioClient.presignedPutObject(BUCKET_NAME, storageKey, 15 * 60);
  return { url, storageKey };
}

// Delete a file
export async function deleteFile(storageKey: string): Promise<void> {
  await minioClient.removeObject(BUCKET_NAME, storageKey);
}

// Get file info
export async function getFileInfo(storageKey: string) {
  return await minioClient.statObject(BUCKET_NAME, storageKey);
}

export { minioClient, BUCKET_NAME };
