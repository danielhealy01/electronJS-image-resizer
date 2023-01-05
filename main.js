const path = require("path");
const os = require("os");
const fs = require("fs");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const resizeImg = require("resize-img");

process.env.NODE_ENV = "dev";

const isMac = process.platform === "darwin";
const isDev = process.env.NODE_ENV !== "prod";

console.log(isDev)

let mainWindow;

// create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
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

  mainWindow.on("closed", () => (mainWindow = null));

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

//catch render resize request
ipcMain.on("image:resize", (e, options) => {
  options.dest = path.join(os.homedir(), "imageResizer");
  resizeImage(options);
});

// resize the image
async function resizeImage({ imgPath, width, height, dest }) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
      //cast string to number with +
    });
    const fileName = path.basename(imgPath);

    //create dest folder if !exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    //write file to dest
    fs.writeFileSync(path.join(dest, fileName), newPath);

    //send success to renderer
    mainWindow.webContents.send("image:done");

    //open dest folder to view
    shell.openPath(dest);
  } catch (error) {
    console.log(error);
  }
}



app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});
