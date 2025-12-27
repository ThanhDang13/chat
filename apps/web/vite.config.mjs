/// <reference types='vitest' />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import { nxCopyAssetsPlugin } from "@nx/vite/plugins/nx-copy-assets.plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    root: __dirname,
    cacheDir: "../../node_modules/.vite/apps/web",
    server: {
      port: 4200,
      host: true,
      allowedHosts: [
        process.env.VITE_SERVER_URL ? new URL(process.env.VITE_SERVER_URL).hostname : "localhost"
      ]
    },
    preview: {
      port: 4200,
      host: process.env.VITE_SERVER_URL
        ? new URL(process.env.VITE_SERVER_URL).hostname
        : "localhost"
    },
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true
      }),
      react(),
      tailwindcss(),
      nxViteTsPaths(),
      nxCopyAssetsPlugin(["*.md"])
    ],
    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },
    build: {
      outDir: "../../dist/apps/web",
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true
      }
    }
  });
};
