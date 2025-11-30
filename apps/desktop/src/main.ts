import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1300,
    height: 700,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../../../dist/apps/web/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
