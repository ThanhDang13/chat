import fp from "fastify-plugin";
import path from "path";
import AutoLoad from "@fastify/autoload";
import { FastifyInstance } from "fastify";
import { ModuleOptions } from "@api/app";
import { diContainer } from "@fastify/awilix";
import { asClass, asValue } from "awilix";
import { S3Client } from "@aws-sdk/client-s3";
import { PresignedUrlService } from "@api/modules/upload/domain/upload.service";
import { GetPresignedUploadUrlCommandHandler } from "@api/modules/upload/application/commands/get-presigned-url/get-presigned-url.handler";
import { GetPresignedUploadUrlCommand } from "@api/modules/upload/application/commands/get-presigned-url/get-presigned-url.command";
import env from "@api/infra/config/env";

export default fp(async (fastify: FastifyInstance, opts: ModuleOptions) => {
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "application"),
    indexPattern: /\.route\.(ts|js)$/,
    dirNameRoutePrefix: false,
    options: {
      ...opts,
      apiTag: "uploads",
      apiPrefix: `${opts.apiPrefix}/v1`
    }
  });

  const s3 = new S3Client({
    region: "ap-southeast-1",
    endpoint: env.S3_ENDPOINT,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY,
      secretAccessKey: env.S3_SECRET_KEY
    },
    forcePathStyle: true
  });

  diContainer.register({
    s3: asValue(s3),
    bucket: asValue(env.S3_BUCKET),
    presignedUrlService: asClass(PresignedUrlService).singleton(),
    getPresignedUploadUrlCommandHandler: asClass(GetPresignedUploadUrlCommandHandler).scoped()
  });

  fastify.commandBus.register(
    GetPresignedUploadUrlCommand.type,
    fastify.diContainer.cradle.getPresignedUploadUrlCommandHandler
  );
});
