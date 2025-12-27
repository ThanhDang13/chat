import { Command } from "@api/shared/commands/command";

type UpdateProfileCommandPayload = {
  id: string;
  fullname?: string;
  avatar?: string | null;
  bio?: string | null;
  mutedAll?: boolean;
  theme?: string;
};

export class UpdateProfileCommand implements Command<void> {
  static readonly type = "UpdateProfileCommand";
  readonly type = "UpdateProfileCommand";
  constructor(public readonly payload: UpdateProfileCommandPayload) {}
}
