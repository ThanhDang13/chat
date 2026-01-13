import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  packagerConfig: {
    icon: path.resolve(__dirname, "assets/icon"),
    followSymlinks: true
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      platforms: ["win32"]
    }
  ],
  hooks: {
    async generateAssets() {
      /* empty */
    }
  }
};
