import * as path from "path";
import { FastifyInstance } from "fastify";
import AutoLoad from "@fastify/autoload";

export interface AppOptions {
  encapsulate?: boolean;
}

export interface ModuleOptions extends AppOptions {
  apiPrefix: string;
  apiTag?: string;
}

export async function app(fastify: FastifyInstance, opts: AppOptions) {
  // Load all plugins

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "infra/plugins"),
    options: { ...opts, apiPrefix: "api" },
    dirNameRoutePrefix: false
  });

  // Load all modules
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "modules"),
    indexPattern: /\.module\.(ts|js)$/,
    dirNameRoutePrefix: false,
    matchFilter: (filePath) => {
      return filePath.endsWith(".module.ts") || filePath.endsWith(".module.js");
    },
    options: { ...opts, apiPrefix: "api", apiTag: "default" }
  });
}
