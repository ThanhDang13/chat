const path = require("path");

module.exports = {
  packagerConfig: {
    icon: path.resolve(__dirname, "assets/icon")
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      platforms: ["win32"]
    }
  ],
  hooks: {
    generateAssets: async () => {
      /* empty */
    }
  }
};
