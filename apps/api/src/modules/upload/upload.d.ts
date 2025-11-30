import { GetPresignedUploadUrlCommandHandler } from "@api/modules/upload/application/commands/get-presigned-url/get-presigned-url.handler";
import type { PresignedUrlService } from "@api/modules/upload/domain/upload.service";
import type { S3Client } from "@aws-sdk/client-s3";

declare module "@fastify/awilix" {
  interface Cradle {
    s3: S3Client;
    bucket: string;
    presignedUrlService: PresignedUrlService;
  }
  interface Cradle {
    getPresignedUploadUrlCommandHandler: GetPresignedUploadUrlCommandHandler;
  }
}

// Treat this file as a module
export {};
