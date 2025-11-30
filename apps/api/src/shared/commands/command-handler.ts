import { Command } from "@api/shared/commands/command";

export interface CommandHandler<TCommand extends Command<TResponse>, TResponse> {
  execute(command: TCommand): Promise<TResponse>;
}
