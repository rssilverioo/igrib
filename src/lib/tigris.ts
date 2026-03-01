import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let _s3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!_s3Client) {
    _s3Client = new S3Client({
      region: process.env.TIGRIS_REGION || 'auto',
      endpoint: process.env.TIGRIS_ENDPOINT_URL,
      credentials: {
        accessKeyId: process.env.TIGRIS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.TIGRIS_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
    });
  }
  return _s3Client;
}

export function getBucket(): string {
  return process.env.TIGRIS_BUCKET_NAME!;
}

export async function getUploadPresignedUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn: 600 });
}

export async function deleteObject(key: string) {
  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  );
}

export function getPublicUrl(key: string): string {
  return `${process.env.TIGRIS_ENDPOINT_URL}/${getBucket()}/${key}`;
}
