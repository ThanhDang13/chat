import { PresignedUrl } from "@api/modules/upload/application/commands/get-presigned-url/get-presigned-url.dto";
import { Command } from "@api/shared/commands/command";

export type GetPresignedUploadUrlCommandPayload = {
  filename: string;
  contentType: string;
  folder?: string;
};

export class GetPresignedUploadUrlCommand implements Command<PresignedUrl> {
  static readonly type = "GetPresignedUploadUrlCommand";
  readonly type = "GetPresignedUploadUrlCommand";
  constructor(public readonly payload: GetPresignedUploadUrlCommandPayload) {}
}
