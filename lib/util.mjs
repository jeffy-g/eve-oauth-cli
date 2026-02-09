/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference types="../eve-oauth2-cli.d.ts"/>
/**
 * @file src/util.mjs
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as cp from "node:child_process";
const CI = !!process.env.CI;
const log = (() => {
  return CI ? () => ({}) : console.log;
})();
/**
 * @template T
 * @typedef {Record<string, T>} TypedRecord<T>
 */
/**
 * @template T
 * @typedef {(err: any, data: TypedRecord<T>) => void=} TReadJsonCallback
 */
/**
 * @typedef {(err: any, data: string) => void} TFsCallback
 */
/**
 * https://regex101.com/r/v5ZUnU/2
 *
 * ```
 * /(?:code|access_token)=(?:[^&]+)/
 * ```
 */
export const RE_CallbackQuerys = /(?:code|access_token)=(?:[^&]+)/;
/**
 * https://regex101.com/r/yx6AQQ/4
 *
 * ```
 * /(?<!\/callback\/)index\.(css|js)/
 * ```
 */
export const RE_IndexJsCss = /(?<!\/callback\/)index\.(css|js)/;
/**
 * @param {string} s
 * @returns
 */
export const isColordString = (s) => /\\033\[\d+m/.test(s);
/**
 * e.g - "2ff9ea0e-065c-4a84-a805-0a5015717c8f"
 * @returns UUID
 */
export function createUUID() {
  return (1e7 + "" + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (ch) => {
    const n = +ch;
    return (n ^ (((Math.random() * 255) | 0) & (15 >> (n / 4)))).toString(16);
  });
}
/**
 * By specifying a valid string for `flagName`, you can switch whether to log output
 * or not depending on the value of `global.DEBUG_Flags[flagName]`.
 *
 * If `flagName` is not specified, a logger that outputs logs by default will be obtained.
 * @param {string=} banner
 * @param {TDebugFlagIds=} flagName see {@link DEBUG_Flags}
 * @returns {typeof console.log}
 */
export function getLogger(banner = CLI_BANNER, flagName) {
  if (!flagName || (flagName && DEBUG_Flags[flagName])) {
    const isColord = isColordString(banner);
    const isExpand = banner !== CLI_BANNER && !isColord;
    if (isExpand) {
      banner = `[${CLI_BANNER} > ${banner}]:`;
    } else if (!isColord) {
      banner = `[${CLI_BANNER}]:`;
    }
    const colored = isColord ? banner : banner.cyan;
    return console.log.bind(console, colored);
  }
  return () => {};
}
/**
 * @param {string} command
 * @param {true=} allowCb
 */
export function runCommand(command, allowCb) {
  const childProc = cp.exec(
    command,
    allowCb
      ? (err, stdout) => {
          if (err) {
            console.error(err);
          } else {
            console.log(stdout);
          }
        }
      : void 0,
  );
  return childProc;
}
/**
 * ### command:
 *
 *   + windows - chcp 65001 && clip
 *   + others  - xclip
 *
 * @param {string} content the copy terget content as string.
 * @param {string} [message] default: "text copied!"
 * @param {boolean} [chcp65001] default `true`
 */
export function copyText(content, message = "text copied!", chcp65001 = false) {
  const command =
    os.platform() === "win32"
      ? `${chcp65001 ? "chcp 65001 && " : ""}clip`
      : "xclip";
  const clipTask = () => {
    const childProc = cp.exec(command, (err, stdout) => {
      if (err) {
        console.error(err);
      } else {
        console.log(message, stdout);
      }
    });
    // @ts-ignore
    childProc.stdin.write(content, (error) => {
      if (error) {
        console.error(error);
      }
      // @ts-ignore
      childProc.stdin.end();
    });
  };
  try {
    clipTask();
  } catch (e) {
    console.warn(e);
  }
}
/**
 * @template {TFsCallback | undefined} C description
 * @template {Conditional<C, string, void>} R description
 * @param {string} from file path.
 * @param {C} [callback]
 * @returns {R} description
 * @throws {void} means **no throw**
 */
export function readText(from, callback) {
  if (typeof callback === "function") {
    fs.readFile(from, "utf8", callback);
  } else {
    return /** @type {R} */ (fs.readFileSync(from, "utf8"));
  }
  return /** @type {R} */ (undefined);
}
/**
 * NOTE: when callback specified, returns undefined
 *
 * @template T
 * @template {TReadJsonCallback<T>} C description
 * @template {Conditional<C, TypedRecord<T>, void>} R description
 * @param {string} path file path.
 * @param {C} [callback]
 * @returns {R} description
 */
export function readJson(path, callback) {
  if (typeof callback === "function") {
    readText(path, (err, data) => {
      callback(err, JSON.parse(data));
    });
  } else {
    const data = readText(path);
    return JSON.parse(data);
  }
  return /** @type {R} */ (undefined);
}
/**
 * Resolves the root directory of the project by searching for the package.json file.
 * The search starts from the current directory and moves up the directory tree until
 * it finds a package.json file with the name "eve-oauth-cli".
 *
 * + If the root is successfully determined, the directory path will be without the last separator.
 * ```js
 * "F:\\my_work\\develop\\javascript\\eve_online\\prompts"
 * ```
 *
 * @returns {string} The resolved root directory path.
 * @throws {Error} If the root directory cannot be resolved.
 */
export function resolveCallbackRoot() {
  let cwd = path.resolve(import.meta.dirname, "..");
  /** @type {{ name: string }} */
  let pkgJson;
  do {
    let jsonPath = `${cwd}/package.json`;
    if (fs.existsSync(jsonPath)) {
      pkgJson = readJson(jsonPath);
      if (pkgJson.name === PACKAGE_NAME) {
        return cwd;
      }
    }
    const parent = path.resolve(cwd, "..");
    if (parent === cwd) break;
    cwd = parent;
  } while (1);
  throw new Error("Could not resolve callback root!!");
}
/**
 * @param {string} dest
 */
export function cpd(dest) {
  const parent = path.dirname(dest);
  if (!fs.existsSync(parent)) {
    fs.mkdirSync(parent, { recursive: true });
  }
}
/**
 * write text content to dest path.
 * when not exists parent directory, creat it.
 *
 * @param {string|NodeJS.ReadableStream|Buffer} content text? content.
 * @param {string} dest content output path
 * @param {() => void} [callback] the callback function
 */
export function writeText(content, dest, callback) {
  cpd(dest);
  const ws = fs.createWriteStream(dest);
  ws.on("error", function (err) {
    log("WriteStream.error evnet!", arguments);
  }).on("close", function (/*no args*/) {
    callback && callback();
  });
  if (content instanceof Buffer) {
    content = content.toString();
  }
  if (typeof content === "string") {
    const success = ws.write(content);
    if (!success) {
      ws.once("drain", function () {
        ws.end();
      });
    } else {
      callback && callback();
    }
  } else if ("readable" in content) {
    content.pipe(ws);
  }
}
