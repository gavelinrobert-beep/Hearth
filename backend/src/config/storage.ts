import { Client as MinioClient } from 'minio';

/**
 * MinIO/S3 Storage Configuration
 * Provides file storage capabilities for user uploads (avatars, attachments, etc.)
 */

const minioEndpoint = process.env.MINIO_ENDPOINT || 'localhost';
const minioPort = parseInt(process.env.MINIO_PORT || '9000');
const minioAccessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const minioSecretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';
const minioUseSsl = process.env.MINIO_USE_SSL === 'true';
const minioBucket = process.env.MINIO_BUCKET || 'hearth-files';

// Initialize MinIO client
const minioClient = new MinioClient({
  endPoint: minioEndpoint,
  port: minioPort,
  useSSL: minioUseSsl,
  accessKey: minioAccessKey,
  secretKey: minioSecretKey,
});

/**
 * Initialize storage bucket
 * Creates the bucket if it doesn't exist
 */
export async function initializeStorage(): Promise<void> {
  try {
    const exists = await minioClient.bucketExists(minioBucket);
    if (!exists) {
      await minioClient.makeBucket(minioBucket, 'us-east-1');
      console.log(`✓ MinIO bucket '${minioBucket}' created`);
    } else {
      console.log(`✓ MinIO bucket '${minioBucket}' already exists`);
    }
  } catch (error) {
    console.error('MinIO initialization error:', error);
    // Don't throw - allow app to start even if MinIO is not available
    console.warn('⚠ MinIO not available - file uploads will be stored locally');
  }
}

/**
 * Upload a file to MinIO storage
 * @param fileName - Name of the file to store
 * @param fileStream - Readable stream or buffer of the file content
 * @param contentType - MIME type of the file
 * @returns URL to access the uploaded file
 */
export async function uploadFile(
  fileName: string,
  fileStream: Buffer,
  contentType: string
): Promise<string> {
  try {
    const metaData = {
      'Content-Type': contentType,
    };
    await minioClient.putObject(minioBucket, fileName, fileStream, fileStream.length, metaData);
    
    // Generate presigned URL valid for 7 days
    const url = await minioClient.presignedGetObject(minioBucket, fileName, 7 * 24 * 60 * 60);
    return url;
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Delete a file from MinIO storage
 * @param fileName - Name of the file to delete
 */
export async function deleteFile(fileName: string): Promise<void> {
  try {
    await minioClient.removeObject(minioBucket, fileName);
  } catch (error) {
    console.error('File deletion error:', error);
    throw new Error('Failed to delete file');
  }
}

/**
 * Get a presigned URL for a file
 * @param fileName - Name of the file
 * @param expiry - Expiry time in seconds (default: 7 days)
 * @returns Presigned URL
 */
export async function getFileUrl(fileName: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
  try {
    const url = await minioClient.presignedGetObject(minioBucket, fileName, expiry);
    return url;
  } catch (error) {
    console.error('Get file URL error:', error);
    throw new Error('Failed to get file URL');
  }
}

export default minioClient;
