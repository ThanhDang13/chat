import { GetPresignedUploadUrlCommand } from "@api/modules/upload/application/commands/get-presigned-url/get-presigned-url.command";
import { PresignedUrl } from "@api/modules/upload/application/commands/get-presigned-url/get-presigned-url.dto";
import { PresignedUrlService } from "@api/modules/upload/domain/upload.service";
import { CommandHandler } from "@api/shared/commands/command-handler";

export class GetPresignedUploadUrlCommandHandler
  implements CommandHandler<GetPresignedUploadUrlCommand, PresignedUrl>
{
  private readonly presignedUrlService: PresignedUrlService;

  constructor({ presignedUrlService }: { presignedUrlService: PresignedUrlService }) {
    this.presignedUrlService = presignedUrlService;
  }

  async execute(command: GetPresignedUploadUrlCommand) {
    const { filename, contentType, folder } = command.payload;
    return this.presignedUrlService.generateUrl(filename, contentType, folder);
  }
}
