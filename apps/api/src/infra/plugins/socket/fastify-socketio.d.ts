import "fastify";
import type { Server as SocketIOServer } from "socket.io";

declare module "socket.io" {
  interface SocketData {
    user: {
      id: string;
      name?: string;
    };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    io: SocketIOServer;
  }
}

declare module "@fastify/awilix" {
  interface Cradle {
    io: SocketIOServer;
  }
}
