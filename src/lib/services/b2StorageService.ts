import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const endpoint = process.env.S3_ENDPOINT || process.env.B2_ENDPOINT || process.env.AWS_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com';
const region = process.env.S3_REGION || process.env.B2_REGION || process.env.AWS_REGION || 'us-east-005';
const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.B2_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.B2_APPLICATION_KEY || process.env.AWS_SECRET_ACCESS_KEY || '';
const bucketName = process.env.S3_BUCKET_NAME || process.env.B2_BUCKET_NAME || process.env.AWS_S3_BUCKET || '';
const publicUrlPrefix = process.env.S3_PUBLIC_URL_PREFIX || process.env.B2_PUBLIC_URL_PREFIX || '';

export function isB2Configured(): boolean {
  return Boolean(accessKeyId && secretAccessKey && bucketName);
}

function getS3Client(): S3Client {
  return new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function uploadFileToB2(params: {
  fileBuffer: Buffer;
  fileName: string;
  contentType: string;
  entityType: string;
  entityId: string;
}): Promise<{ fileUrl: string; storagePath: string }> {
  if (!isB2Configured()) {
    throw new Error('Backblaze B2 chưa được cấu hình. Vui lòng cung cấp B2_KEY_ID, B2_APPLICATION_KEY và B2_BUCKET_NAME trong .env.local');
  }

  const s3 = getS3Client();

  // Clean filename and create unique storage path
  const cleanName = params.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const storagePath = `attachments/${params.entityType}/${params.entityId}/${timestamp}_${randomSuffix}_${cleanName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: storagePath,
    Body: params.fileBuffer,
    ContentType: params.contentType,
  });

  await s3.send(command);

  // Compute file URL
  let fileUrl = '';
  if (publicUrlPrefix) {
    fileUrl = `${publicUrlPrefix.replace(/\/$/, '')}/${storagePath}`;
  } else {
    // Generate S3 URL or presigned URL
    const cleanEndpoint = endpoint.replace(/\/$/, '');
    fileUrl = `${cleanEndpoint}/${bucketName}/${storagePath}`;
  }

  return {
    fileUrl,
    storagePath,
  };
}

export async function deleteFileFromB2(storagePath: string): Promise<boolean> {
  if (!isB2Configured()) return false;

  try {
    const s3 = getS3Client();
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: storagePath,
    });
    await s3.send(command);
    return true;
  } catch (error) {
    console.error('Failed to delete file from B2:', error);
    return false;
  }
}

export async function getPresignedDownloadUrl(storagePath: string, expiresIn: number = 3600): Promise<string> {
  if (!isB2Configured()) {
    throw new Error('Backblaze B2 chưa được cấu hình');
  }

  const s3 = getS3Client();
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: storagePath,
  });

  return await getSignedUrl(s3, command, { expiresIn });
}
