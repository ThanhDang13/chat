import env from "@api/infra/config/env";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class PresignedUrlService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor({ s3, bucket }: { s3: S3Client; bucket?: string }) {
    this.s3 = s3;
    this.bucket = bucket || "bucket";
  }
  async generateUrl(filename: string, contentType: string, folder = "uploads") {
    const key = `${folder}/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 60 });
    const publicUrl = `http://${env.S3_PUBLIC_HOST}/${this.bucket}/${key}`;

    return { uploadUrl, publicUrl, key };
  }
}
