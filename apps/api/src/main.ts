import Fastify from "fastify";
import { app } from "./app";

const host = process.env.HOST ?? "0.0.0.0";
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

async function bootstrap() {
  const server = Fastify({
    logger: {
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname"
        }
      }
    },
    trustProxy: true
  });


  await server.register(app, { encapsulate: true });

  // Start server
  server.listen({ port, host }, (err) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
  });



  // Handle shutdown
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
  for (const signal of signals) {
    process.on(signal, async () => {
      server.log.info(`Received ${signal}, shutting down gracefully...`);
      await server.close();
      process.exit(0);
    });
  }
}

bootstrap().catch((err) => {
  console.error("❌ Failed to start server", err);
  process.exit(1);
});
