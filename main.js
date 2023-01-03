const path = require("path");
const { app, BrowserWindow, Menu } = require("electron");

const isMac = process.platform === "darwin";
const isDev = process.env.NODE_ENV !== "development";

// create main window
function createWindow() {
  const mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 1000 : 500,
    height: 600,
  });

  // open dev tools if dev env
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
  // __dirname === cwd
}

// create about window
function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: "Image Resizer",
    width: 300,
    height: 300,
  });

  aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

// app ready
app.whenReady().then(() => {
  createWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Menu template
// const menu = [{
// 	label: 'file',
// 	submenu: [{
// 		label: 'quit',
// 		click: () => app.quit(),
// 		accelerator: 'CmdOrCtrl+W',
// 	}]
// }];

const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  { role: "fileMenu" },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
];

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});
