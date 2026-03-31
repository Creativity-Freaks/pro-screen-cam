const { app, BrowserWindow, desktopCapturer, ipcMain, screen, shell } = require("electron");
const path = require("path");

if (process.platform === "linux") {
  app.commandLine.appendSwitch("enable-features", "WebRTCPipeWireCapturer");
}

let mainWindow = null;
let controlWindow = null;
let sourcePickerWindow = null;
let lastControlState = { state: "idle", duration: 0 };

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    autoHideMenuBar: true,
    backgroundColor: "#0b0f16",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    win.loadURL(devServerUrl);
  } else {
    const indexHtmlPath = path.join(app.getAppPath(), "dist", "index.html");
    win.loadFile(indexHtmlPath);
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.on("closed", () => {
    mainWindow = null;
    if (controlWindow && !controlWindow.isDestroyed()) {
      controlWindow.close();
    }
    if (sourcePickerWindow && !sourcePickerWindow.isDestroyed()) {
      sourcePickerWindow.close();
    }
  });

  return win;
}

function getControlWindowBounds() {
  const display = screen.getPrimaryDisplay();
  const { x, y, width } = display.workArea;
  const controllerWidth = 300;
  const controllerHeight = 96;

  return {
    width: controllerWidth,
    height: controllerHeight,
    x: x + width - controllerWidth - 24,
    y: y + 24,
  };
}

function sendControlState(payload) {
  if (!controlWindow || controlWindow.isDestroyed()) {
    return;
  }
  controlWindow.webContents.send("recording-control:state", payload);
}

function createControlWindow() {
  if (controlWindow && !controlWindow.isDestroyed()) {
    return controlWindow;
  }

  controlWindow = new BrowserWindow({
    ...getControlWindowBounds(),
    frame: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    backgroundColor: "#11141d",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  controlWindow.setAlwaysOnTop(true, "screen-saver");
  controlWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  controlWindow.setMenuBarVisibility(false);
  controlWindow.loadFile(path.join(__dirname, "controller.html"));

  controlWindow.on("closed", () => {
    controlWindow = null;
  });

  controlWindow.webContents.once("did-finish-load", () => {
    sendControlState(lastControlState);
  });

  return controlWindow;
}

function serializeSource(source) {
  const thumbnail = source.thumbnail;
  const thumbnailDataUrl = thumbnail && !thumbnail.isEmpty() ? thumbnail.toDataURL() : null;
  const sourceType = source.id.startsWith("screen:") ? "screen" : "window";

  return {
    id: source.id,
    name: source.name,
    type: sourceType,
    thumbnail: thumbnailDataUrl,
  };
}

function closeSourcePickerWindow() {
  if (sourcePickerWindow && !sourcePickerWindow.isDestroyed()) {
    sourcePickerWindow.close();
  }
  sourcePickerWindow = null;
}

function openSourcePicker(sources) {
  return new Promise((resolve) => {
    closeSourcePickerWindow();

    sourcePickerWindow = new BrowserWindow({
      width: 900,
      height: 620,
      parent: mainWindow,
      modal: true,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      autoHideMenuBar: true,
      backgroundColor: "#0f172a",
      title: "Choose what to record",
      webPreferences: {
        preload: path.join(__dirname, "preload.cjs"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    let settled = false;

    const settle = (value) => {
      if (settled) return;
      settled = true;
      ipcMain.removeListener("desktop-source:selected", onSelected);
      ipcMain.removeListener("desktop-source:cancel", onCancel);
      closeSourcePickerWindow();
      resolve(value);
    };

    const onSelected = (_event, selectedId) => {
      const selected = sources.find((source) => source.id === selectedId);
      if (!selected) {
        settle(null);
        return;
      }
      settle({ id: selected.id, name: selected.name });
    };

    const onCancel = () => {
      settle(null);
    };

    ipcMain.on("desktop-source:selected", onSelected);
    ipcMain.on("desktop-source:cancel", onCancel);

    sourcePickerWindow.on("closed", () => {
      settle(null);
    });

    sourcePickerWindow.loadFile(path.join(__dirname, "source-picker.html"));
    sourcePickerWindow.webContents.once("did-finish-load", () => {
      sourcePickerWindow.webContents.send("desktop-source:data", {
        sources: sources.map(serializeSource),
      });
    });
  });
}

app.whenReady().then(() => {
  mainWindow = createWindow();

  ipcMain.handle("desktop-source:choose", async () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      return null;
    }

    const sources = await desktopCapturer.getSources({
      types: ["screen", "window"],
      thumbnailSize: { width: 0, height: 0 },
      fetchWindowIcons: false,
    });

    const filteredSources = sources.filter((source) => {
      if (source.id.startsWith("screen:")) {
        return true;
      }

      const hiddenWindowPatterns = [
        "Choose what to record",
        "Developer Tools",
      ];

      return !hiddenWindowPatterns.some((pattern) => source.name.includes(pattern));
    });

    if (!filteredSources.length) {
      return null;
    }

    const selectedSource = await openSourcePicker(filteredSources);
    return selectedSource;
  });

  ipcMain.on("recording-control:show", (_event, payload) => {
    lastControlState = {
      state: payload?.state ?? "recording",
      duration: Number.isFinite(payload?.duration) ? payload.duration : 0,
    };
    createControlWindow();
    sendControlState(lastControlState);
  });

  ipcMain.on("recording-control:update", (_event, payload) => {
    lastControlState = {
      state: payload?.state ?? lastControlState.state,
      duration: Number.isFinite(payload?.duration) ? payload.duration : lastControlState.duration,
    };
    sendControlState(lastControlState);
  });

  ipcMain.on("recording-control:hide", () => {
    if (controlWindow && !controlWindow.isDestroyed()) {
      controlWindow.close();
    }
  });

  ipcMain.on("recording-control:action", (_event, action) => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }
    mainWindow.webContents.send("recording-control:action", action);
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
