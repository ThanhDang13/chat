import fp from "fastify-plugin";
import Redis from "ioredis";
import { FastifyInstance } from "fastify";
import { diContainer } from "@fastify/awilix";
import { asValue } from "awilix";

import { IEventHandler } from "@api/shared/events/event-handler";
import { Event } from "@api/shared/events/events";

type Handler<E extends Event> = (event: E) => void | Promise<void>;

export class RedisEventBus {
  private handlers = new Map<string, Array<IEventHandler<Event> | Handler<Event>>>();

  constructor(
    private pub: Redis,
    private sub: Redis
  ) {
    this.sub.on("message", async (channel, message) => {
      const event = JSON.parse(message) as Event;
      const handlers = this.handlers.get(event.type) ?? [];
      for (const handler of handlers) {
        if (typeof handler === "function") {
          await handler(event);
        } else {
          await handler.handle(event);
        }
      }
    });
  }

  async subscribe<E extends Event>(eventType: E["type"], handler: Handler<E>) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
      await this.sub.subscribe(eventType);
    }
    // Cast is safe because E["type"] guarantees correct eventType
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.handlers.get(eventType)!.push(handler as Handler<Event>);
  }

  async register<E extends Event>(eventType: E["type"], handler: IEventHandler<E>) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
      await this.sub.subscribe(eventType);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.handlers.get(eventType)!.push(handler as IEventHandler<Event>);
  }

  async publish<E extends Event>(event: E) {
    await this.pub.publish(event.type, JSON.stringify(event));
  }
}

export default fp(
  async function (fastify: FastifyInstance) {
    const pub = new Redis({
      host: process.env.REDIS_HOST ?? "127.0.0.1",
      port: Number(process.env.REDIS_PORT ?? 6379)
    });

    const sub = new Redis({
      host: process.env.REDIS_HOST ?? "127.0.0.1",
      port: Number(process.env.REDIS_PORT ?? 6379)
    });

    const bus = new RedisEventBus(pub, sub);

    diContainer.register({
      eventBus: asValue(bus),
      redisPub: asValue(pub),
      redisSub: asValue(sub)
    });

    fastify.decorate("eventBus", bus);
  },
  { name: "event-bus" }
);
