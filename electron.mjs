/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @file src/electron.mjs
 */
import * as path from "node:path";
import { app, BrowserWindow } from "electron";
import tinArgs from "tin-args";
const params = tinArgs(/* {}, true */);
const RE_CallbackQuerys = /(?:code|access_token)=(?:[^&]+)/;
/** @type {BrowserWindow} */
let browserWindow;
const cleanup = () => {
  browserWindow.close();
  app.exit(0);
};
app.on("ready", () => {
  browserWindow = new BrowserWindow();
  if (params.args?.length) {
    const url = params.args[0];
    browserWindow.loadURL(url);
  } else {
    browserWindow.loadFile(path.join(__dirname, "src/index.html"));
  }
  browserWindow.webContents
    .on("did-fail-load", (e, code, des, validUrl, isMain, fid) => {
      console.log(`ERROR: Did not laad URL: ${validUrl}`);
    })
    .on("will-redirect", function (event, url) {
      if (0) {
        console.log("will-redirect", arguments);
      }
      if (RE_CallbackQuerys.test(url)) {
        // @ts-expect-error url is already matched
        const pair = RE_CallbackQuerys.exec(url)[0].split("=");
        console.log(
          "detect callback url on `will-redirect`, [parameters]",
          `${pair[0]}: ${pair[1]}`,
        );
      }
    });
});
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("SIGQUIT", cleanup);
