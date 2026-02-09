#!/usr/bin/env node
/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference types="./eve-oauth2-cli.d.ts"/>
/// <reference types="./lib/crypto-types.d.ts"/>
/**
 * @file src/index.mjs
 * @command node src/index.mjs
 * @todo https://github.com/statelyai/xstate useful state machine
 * @version 2.0 Cryptographic-compatible
 */
import "./globals.js";
import "colors.ts";
import * as p from "@clack/prompts";
import * as oauth from "./lib/eve-oauth/index.mjs";
import * as utils from "./lib/util.mjs";
import args from "tin-args";
import { caseConfig } from "./prompts/config.mjs";
import { caseCharacters } from "./prompts/characters.mjs";
import { JsonStorage } from "./json-storage.mjs";
import { jsonLoader } from "./lib/json-loader.mjs";
/**
 * @typedef TCliArgs
 * @prop {string=} p The password
 */
/** @type {ReturnType<typeof args<TCliArgs>>} */
const params = args(/* {}, true */);
const log = utils.getLogger();
/** @type {ReturnType<typeof JsonStorage<TEVEOAuth2GlobalStrage>>} */
const storage = JsonStorage(jsonLoader, DEFAULT_TOKEN_CACHE_NAME);
/** @type {p.SelectOptions<"credential" | "characters" | "clear" | "quit">["options"]} */
const TASK_OPTIONs = [
  {
    value: "credential",
    label: "⚙️  Manage credentials",
    hint: "Manage EVE App credentials.",
  },
  {
    value: "characters",
    label: "🔒 Manage tokens",
    hint: "Manage EVE OAuth2 tokens etc.",
  },
  { value: "clear", label: "🔀 Clear prompt", hint: "Clear console." },
  { value: "quit", label: "🔙 Quit prompt", hint: "Exit CLI..." },
];
/**
 * + Means EVE App Credentail "Not selected"
 */
const NOT_NICKNAME = "Not selected";
/**
 * + Here, credential storage will be saved if `nickName` is a valid name.
 *
 * @template {string} N
 * @template {N extends typeof NOT_NICKNAME ? false: true} OK
 * @template {{ okay: OK; nickName: string }} R
 * @param {N} nn The Credential Nickname
 * @returns {Promise<R>}
 */
const getColoredNickname = async (nn) => {
  const okay = /** @type {OK} */ (nn !== NOT_NICKNAME);
  const nickName = okay ? nn.green : nn.hex("EE8833");
  okay && (await storage.save());
  return /** @type {R} */ ({
    okay,
    nickName,
  });
};
async function handleCredential() {
  /**
   * raw string
   * + credential NickName
   */
  let cnn = await caseConfig(storage);
  /**
   * + EVE OAuth token data (characters)
   * @type {TEVEOAuthRecord=}
   */
  let ac;
  if (cnn && !p.isCancel(cnn) && cnn !== "canceled") {
    const { characters, ...appCredentials } = storage.get(cnn);
    oauth.setConfiguration(appCredentials);
    ac = characters;
  } else {
    cnn = NOT_NICKNAME;
    ac = void 0;
  }
  return { ac, cnn };
}
/**
 * @since 1.0
 */
async function main() {
  await storage.load(typeof params.p === "number" ? "" + params.p : params.p);
  console.clear();
  log("Welcome to EVE OAuth2 CLI Tool");
  /**
   * + EVE OAuth token data (characters)
   * @type {TEVEOAuthRecord=}
   */
  let ac;
  /**
   * raw string
   * + credential NickName
   * @type {string}
   */
  let cnn = "";
  let shouldClear = 1;
  $: do {
    if (cnn) {
      const { okay, nickName } = await getColoredNickname(cnn);
      shouldClear && console.clear();
      shouldClear = 1;
      log(
        "ℹ️  Selected App Credential Name:",
        nickName,
        okay ? "✅ storage" : "⚠️",
      );
    }
    const mainSelection = await p.select({
      message: "📝 Please select a task:",
      options: [...TASK_OPTIONs],
    });
    switch (mainSelection) {
      case "credential":
        ({ ac, cnn } = await handleCredential());
        continue;
      case "characters": {
        if (!ac) {
          console.clear();
          log(`First, select App credential in "Manage credentials".`.magenta);
          shouldClear = 0;
          continue;
        }
        /** @type {TEVEOAuth2GlobalStrage[string]} */
        const appRoot = storage.getByPath(`${cnn}`);
        const allowSave = await caseCharacters(appRoot);
        log(
          `characters task: ${allowSave ? "Update complete." : "No changes were made."}`,
        );
        allowSave && (await storage.save());
        break;
      }
      case "clear":
        console.clear();
        continue;
      default: {
        log("Session complete. Goodbye o7!");
        break $;
      }
    }
  } while (1);
  await storage.save();
  process.exit(0);
}
export const version = "v1.5.27";
main().catch(console.error);
