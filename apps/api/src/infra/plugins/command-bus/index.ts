import fp from "fastify-plugin";
import { Command } from "@api/shared/commands/command";
import { CommandHandler } from "@api/shared/commands/command-handler";
import { diContainer } from "@fastify/awilix";
import { asValue } from "awilix";
import { FastifyInstance } from "fastify";

export class CommandBus {
  private handlers = new Map<string, CommandHandler<Command<unknown>, unknown>>();

  register<TCommand extends Command<TResponse>, TResponse>(
    type: TCommand["type"],
    handler: CommandHandler<TCommand, TResponse>
  ) {
    this.handlers.set(type, handler);
  }

  async execute<TCommand extends Command<TResponse>, TResponse>(
    command: TCommand
  ): Promise<TResponse> {
    const handler = this.handlers.get(command.type) as
      | CommandHandler<TCommand, TResponse>
      | undefined;

    if (!handler) {
      throw new Error(`No handler registered for command type: ${command.type}`);
    }

    return handler.execute(command);
  }
}

export default fp(
  async function (fastify: FastifyInstance) {
    const bus = new CommandBus();

    diContainer.register({
      commandBus: asValue(bus)
    });

    fastify.decorate("commandBus", bus);
  },
  { name: "command-bus" }
);
