import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

const server = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  //Vite server for dev
  // const win = new BrowserWindow({
  //   width: 1300,
  //   height: 700,
  //   titleBarStyle: "hidden",
  //   webPreferences: {
  //     preload: path.join(__dirname, "preload.js")
  //   }
  // });
  // win.loadURL("http://localhost");
  const distPath = path.join(__dirname, "../dist/client");

  server.use(express.static(distPath));

  server.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  server.listen(5174, () => {
    const win = new BrowserWindow({
      width: 1300,
      height: 700,
      titleBarStyle: "hidden",
      webPreferences: {
        preload: path.join(__dirname, "preload.js")
      }
    });

    win.loadURL("http://localhost:5174");
    // win.webContents.openDevTools();
  });
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
