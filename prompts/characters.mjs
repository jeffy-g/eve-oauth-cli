/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference types="../eve-oauth2-cli.d.ts"/>
/**
 * @file src/prompts/characters.mjs
 */
import * as p from "@clack/prompts";
import * as utils from "../lib/util.mjs";
import * as oauth from "../lib/eve-oauth/index.mjs";
import { caseImplicitFlow } from "./token.mjs";
import { casePKCE } from "./code.mjs";
import * as jwtTool from "../lib/validate-jwt.mjs";
const log = utils.getLogger("characters");
/**
 * @param {number} expires
 */
const isExpired = (expires) => (expires || 0) < Date.now();
/** @type {p.SelectOptions<"code" | "token" | "refresh" | "view" | "revoke" | "goback">["options"]} */
const TASK_OPTIONs = [
  {
    value: "refresh",
    label: "🔀 Refresh OAuth2 Token",
    hint: "Refresh your OAuth2 token to ensure uninterrupted access.".green,
  },
  {
    value: "code",
    label: "🔏 Obtain OAuth2 Token via PKCE",
    hint: "You will receive a refreshable access token that is valid for 20 minutes."
      .green,
  },
  {
    value: "view",
    label: "❓ View JWT Payload",
    hint: "View and analyze the JWT Payload".blue,
  },
  {
    value: "token",
    label: "🔒 Obtain OAuth2 Token via Implicit Flow".hex("776666"),
    hint: "You will receive an access token that is valid for 20 minutes.".hex(
      "353535",
    ),
  },
  {
    value: "revoke",
    label: "❌ Revoke OAuth2 Token",
    hint: "Revoke your OAuth2 token to ensure security and prevent unauthorized access."
      .red,
  },
  {
    value: "goback",
    label: "🔙 Return to Main Menu",
    hint: "Exiting the current task.".yellow,
  },
];
/**
 * Splits a given string into chunks of 150 characters.
 *
 * @param {string} token - The input string to be split.
 * @returns {string[]} An array of strings, each containing up to 150 characters.
 */
function cutToken(token) {
  const chunkSize = 150;
  const chunks = [];
  for (let i = 0; i < token.length; i += chunkSize) {
    chunks.push(token.slice(i, i + chunkSize));
  }
  return chunks;
}
/**
 * @param {string} token
 * @returns {string}
 */
function tokenToTemplateString(token) {
  return `\`${cutToken(token).join("\\\n")}\`;`;
}
/**
 * @param {TEVEOAuthRecord} characters
 * @param {boolean} isview
 * @date 2025/2/19
 */
const getCharactersSelection = (characters, isview) => {
  const charIds = Object.keys(characters);
  if (!charIds.length) {
    console.clear();
    log("No OAuth token data found. Please add the data first.".red);
    return {};
  }
  /** @type {oauth.TJWTPayload[]} */
  const payloads = [];
  /** @type {p.SelectOptions<oauth.TJWTPayload["sub"] | "all">["options"]} */
  const options = charIds.map((cid) => {
    const data = characters[cid];
    const invalid = isExpired(data.expires);
    const prefix = invalid ? "⚠️  " : "✅ ";
    const color = invalid ? "red" : "green";
    const payload = oauth.getJWTPayload(data.accessToken);
    payloads.push(payload);
    return {
      value: payload.sub,
      label: `${prefix}${payload.name}`,
      hint: `expires at: ${new Date(data.expires).toLocaleString()[color]}, ${payload.kid}`,
    };
  });
  !isview &&
    options.push({
      value: "all",
      label: "*All of it*",
      hint: "Processes all EVE character tokens.",
    });
  return {
    options,
    payloads,
  };
};
/**
 * Extracts and logs character names from the access tokens in the characters object.
 * @param {TEVEOAuthRecord} characters
 */
function logCharacterNames(characters) {
  /** @type {string[]} */
  const names = [];
  Object.keys(characters).forEach((cid) => {
    const data = characters[cid];
    const payload = oauth.getJWTPayload(data.accessToken);
    names.push(payload.name);
  });
  log("Currently available EVE character names", names);
}
/**
 * @param {TEVEOAuth2GlobalStrage[string]} appRoot
 * @returns {Promise<true | void>}
 */
export async function caseCharacters(appRoot) {
  /** @type {NsEVEOAuth.IEVEOAuth2} */
  let sso;
  /** @type {true | void} */
  let resultValue = void 0;
  log("Please select task:");
  do {
    const taskType = await p.select({
      message: "📝 Select response type, refresh token, or revoke token.",
      options: [...TASK_OPTIONs],
    });
    if (taskType === "goback") {
      console.clear();
      break;
    }
    // @ts-expect-error
    if (!sso) {
      sso = oauth.createOAuthClient();
      log("ℹ️  OAuth Wrapper created" /* , sso */);
    }
    const { characters = {}, ...credentials } = appRoot;
    if (taskType === "code" || taskType === "token") {
      const url = await sso.createAuthorizeUrl(
        taskType,
        credentials.scopes,
        utils.createUUID(),
      );
      log(url);
      const proc = utils.runCommand(`electron ./electron.mjs "${url}"`);
      proc.on("exit", (code, sig) => {});
      proc.stdout?.pipe(process.stdout);
      log("ℹ️  Proceeding to the next step.");
      if (taskType === "token") {
        const jwtPayload = await caseImplicitFlow(url);
        if (jwtPayload) {
          log(jwtPayload);
        } else {
          log("Task canceled");
        }
      } else {
        const allowSave = await casePKCE(sso, characters, url);
        if (allowSave) {
          logCharacterNames(characters);
          resultValue = true;
        }
      }
      proc.kill("SIGTERM");
      continue;
    } else if (!p.isCancel(taskType)) {
      if (!Object.keys(characters).length) {
        log(`OAuth token data is nothing.`.magenta);
        continue;
      }
      const { options, payloads } = getCharactersSelection(
        characters,
        taskType === "view",
      );
      if (!options) {
        continue;
      }
      charSelection: do {
        const whichChar = await p.select({
          message: `Which EVE character to ${taskType.magenta} is entirely up to your mood!`,
          options,
        });
        if (!p.isCancel(whichChar)) {
          if (whichChar === "all") {
            if (taskType !== "view") {
              const spin = p.spinner({ indicator: "timer" });
              spin.start(`Start ${taskType}`);
              const results = await runAll(sso, taskType, characters);
              spin.stop("Done");
              let msg = `Processing all EVE characters: ${taskType}`,
                post;
              if (!results.length) {
                post = " was unnecessary.".hex("555555");
              } else if (results.every((v) => v === true)) {
                post = " succeeded.".green;
                resultValue = true;
              } else {
                post = " failed.".red;
              }
              log(msg + post);
            }
          } else {
            const cid = whichChar.split(":")[2];
            const charData = characters[cid];
            const payload = /** @type {oauth.TJWTPayload} */ (
              payloads.find((p) => p.sub === whichChar)
            );
            if (taskType === "refresh" && !isExpired(charData.expires)) {
              console.clear();
              log(
                `EVE character "${payload.name}": accessToken is still valid, expires on ${new Date(charData.expires).toLocaleString().green}`,
              );
              continue;
            } else if (taskType === "view") {
              const chToken = charData.accessToken;
              const jwt = jwtTool.toJWT(chToken);
              const ok = await jwtTool.isTokenValid(chToken, appRoot.clientId);
              log(
                `EVE character "${payload.name}": accessToken is ${ok ? "healthy" : "invalid"}`[
                  ok ? "green" : "red"
                ],
                jwt,
              );
              /** @type {string} */
              let msg;
              if (ok) {
                utils.copyText(
                  chToken,
                  "accessToken copied to clipboard!".green.bold + "\n",
                );
                msg = "valid".green;
              } else {
                msg = "expired".yellow;
              }
              log(
                `"${payload.name.magenta}" accessToken(${msg}):\n${ok ? (chToken.slice(0, 120) + "...").cyan : tokenToTemplateString(chToken).gray(12)}`,
              );
              continue;
            }
            const task = await runAll(sso, taskType, characters, true);
            await task(cid);
            console.clear();
            const color = taskType === "refresh" ? "green" : "red";
            log(
              `EVE character "${payload.name}": accessToken ${taskType} OK`[
                color
              ],
            );
            resultValue = true;
          }
        } else break charSelection;
      } while (1);
    }
  } while (1);
  return resultValue;
}
/**
 * Runs the specified task for all characters.
 *
 * + Executes the provided task type (refresh or revoke) for all EVE characters in the specified collection.
 *
 * @template {true=} B
 * @template {Conditional<B, boolean[], (cid: string) => Promise<boolean>>} R
 * @param {NsEVEOAuth.IEVEOAuth2} sso - The OAuth2 wrapper instance or `Falsy`.
 * @param {"refresh" | "revoke"} taskType - The type of task to perform, either "refresh" or "revoke".
 * @param {TEVEOAuthRecord} characters - The record of characters and their OAuth tokens.
 * @param {B=} plzTaskBody - If true, returns the task body function instead of executing it.
 * @returns {Promise<R>} - A promise that resolves to the result of the task.
 *
 * @example
 * // Refresh tokens for all characters
 * await runAll(sso, "refresh", characters);
 *
 * @example
 * // Return a custom task body for refresh
 * const taskBody = await runAll(sso, "refresh", characters, true);
 * await taskBody(<characterId>);
 */
async function runAll(sso, taskType, characters, plzTaskBody) {
  /**
   * + Performs the specified task for a given character.
   * @param {string} cid The character ID.
   * @returns {Promise<boolean>} - A promise that resolves to true if the task was successful, false otherwise.
   */
  const taskBody = async (cid) => {
    const charData = characters[cid];
    /** @type {NsEVEOAuth.TEVEOAuthRefreshResult | boolean} */
    let result;
    try {
      result = await sso[taskType](charData.refreshToken);
    } catch (e) {
      log(e);
      return false;
    }
    if (typeof result === "boolean") {
      result && delete characters[cid];
    } else {
      charData.expires = result.expires;
      charData.accessToken = result.accessToken;
      charData.refreshToken = result.refreshToken;
    }
    return true;
  };
  if (plzTaskBody) return /** @type {R} */ (taskBody);
  const ms = oauth.MiniSema.create(50);
  /** @type {Promise<boolean>[]} */
  const promises = [];
  Object.keys(characters).forEach((cid) => {
    const charData = characters[cid];
    if (taskType === "refresh" && !isExpired(charData.expires)) {
      return;
    }
    promises.push(ms.flow(async () => taskBody(cid), true));
  });
  return /** @type {R} */ (await Promise.all(promises));
}
