import { DataBase } from "@api/infra/database";
import Redis from "ioredis";
import "fastify";

declare module "@fastify/awilix" {
  interface Cradle {
    db: DataBase;
    redis: Redis;
  }
}
