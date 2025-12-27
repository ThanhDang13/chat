import { Command } from "@api/shared/commands/command";

type ChangePasswordCommandPayload = {
  id: string;
  oldPassword: string;
  newPassword: string;
};

export class ChangePasswordCommand implements Command<void> {
  static readonly type = "ChangePasswordCommand";
  readonly type = "ChangePasswordCommand";
  constructor(public readonly payload: ChangePasswordCommandPayload) {}
}
