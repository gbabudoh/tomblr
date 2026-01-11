/**
 * Chunked Upload Utility
 * Handles large file uploads by splitting them into smaller chunks
 * Useful for low bandwidth connections and resumable uploads
 */

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

interface ChunkUploadProgress {
  chunksUploaded: number;
  totalChunks: number;
  bytesUploaded: number;
  totalBytes: number;
  percentage: number;
}

interface ChunkUploadResult {
  success: boolean;
  fileId?: string;
  error?: string;
}

export async function uploadFileInChunks(
  file: File,
  userId: string,
  folderId: string | null,
  onProgress?: (progress: ChunkUploadProgress) => void
): Promise<ChunkUploadResult> {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  let chunksUploaded = 0;
  let bytesUploaded = 0;

  try {
    // Upload each chunk
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("chunkIndex", chunkIndex.toString());
      formData.append("totalChunks", totalChunks.toString());
      formData.append("uploadId", uploadId);
      formData.append("fileName", file.name);
      formData.append("fileType", file.type);
      formData.append("fileSize", file.size.toString());
      formData.append("userId", userId);
      if (folderId) {
        formData.append("folderId", folderId);
      }

      const response = await fetch("/api/files/chunk", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Chunk ${chunkIndex} upload failed`);
      }

      chunksUploaded++;
      bytesUploaded += end - start;

      if (onProgress) {
        onProgress({
          chunksUploaded,
          totalChunks,
          bytesUploaded,
          totalBytes: file.size,
          percentage: Math.round((bytesUploaded / file.size) * 100),
        });
      }
    }

    // Finalize upload
    const finalizeResponse = await fetch("/api/files/chunk/finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uploadId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        userId,
        folderId,
      }),
    });

    const result = await finalizeResponse.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to finalize upload");
    }

    return { success: true, fileId: result.fileId };
  } catch (error) {
    console.error("Chunked upload error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Upload failed" 
    };
  }
}

/**
 * Check if a file should use chunked upload
 * Files larger than 10MB should use chunked upload
 */
export function shouldUseChunkedUpload(file: File): boolean {
  return file.size > 10 * 1024 * 1024; // 10MB threshold
}

/**
 * Get upload progress percentage
 */
export function getUploadPercentage(loaded: number, total: number): number {
  return Math.round((loaded / total) * 100);
}
