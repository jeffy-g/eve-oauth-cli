/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference types="../eve-oauth2-cli.d.ts"/>
/**
 * @file src/prompts/oauth-config.mjs
 */
import * as p from "@clack/prompts";
import * as utils from "../lib/util.mjs";
import * as rmcMod from "rm-cstyle-cmts";
const rmc = rmcMod.default;
const log = utils.getLogger("credential");
const { text, confirm, cancel } = p;
const CANCEL_TASK_MSG = "❌ The task has been canceled.";
/**
 * ```
 * 0b0011
 * ```
 * + Select `SELECT_Flag`, `EDIT_Flag`
 */
const SELECT_MASK = 0b0011;
/**
 * ```
 * 0b0010
 * ```
 */
const SELECTorAsNew_Flag = 0b0010;
/**
 * ```
 * 0b0001
 * ```
 */
const EDIT_Flag = 0b0001;
/**
 * ```
 * 0b1100
 * ```
 * + Select `VIEW_Flag`, `REMOVE_Flag`
 */
const REMOVE_MASK = 0b1100;
/**
 * ```
 * 0b1000
 * ```
 */
const VIEW_Flag = 0b1000;
/**
 * ```
 * 0b0100
 * ```
 */
const REMOVE_Flag = 0b0100;
/**
 * @typedef {"clientId" | "callbackUrl" | "clientSecret" | "scopes" | "nickName"} TAppCredentialOptKeys
 * @typedef {{ [x in TAppCredentialOptKeys]: string | symbol }} TAppCredentialResult
 * @typedef {{ [k in TAppCredentialOptKeys]: [msg: string, place?: string, defa?: string, valid?: p.TextOptions["validate"]] }} TCredentialPromptGroup
 * @typedef {p.PromptGroup<TAppCredentialResult & { isOk: boolean }>} TCredentialPromptGroupOptions
 */
/** @type {(msg: string, arrowEmpty: number) => (v?: string) => string | undefined} */
const validateS = (msg, arrowEmpty) => (value) => {
  if (!value || (!value.length && arrowEmpty)) {
    return;
  } else {
    return !value.length ? msg : void 0;
  }
};
/** @type {(re: RegExp, msg: string, arrowEmpty: number) => (v?: string) => string | undefined} */
const validateR = (re, msg, arrowEmpty) => (value) => {
  if (!value || (!value.length && arrowEmpty)) {
    return;
  } else {
    return !re.test(value) ? msg : void 0;
  }
};
/**
 * @param {string=} jsonString
 */
const validateScopes = (jsonString) => {
  if (!jsonString || !jsonString.length) {
    return;
  } else {
    if (/\[(?:"[\w.-]+",?)+\]/.test(jsonString)) {
      try {
        JSON.parse(jsonString);
      } catch (e) {
        return "Invalid scope array";
      }
    }
  }
};
/**
 * ---
 * + select
 *   + __asNew__
 *   + __nickName(s)__
 * + view
 *   + __nickName(s)__
 * + edit
 *   + __nickName(s)__
 * + remove
 *   + __nickName(s)__
 * ---
 *
 * @param {TEVEOAuth2GlobalStrage} root
 * @param {true=} asNew
 */
const createCredentialNicknamesOpt = (root, asNew) => {
  /** app credential nick names */
  const nickNames = Object.keys(root);
  /** @type {p.SelectOptions<string>["options"]} */
  const options = (
    !asNew ? [] : [{ value: "asNew", label: `🖌️  Register new App credential` }]
  ).concat(
    nickNames.map((nickName) => {
      const data = root[nickName];
      return {
        value: nickName,
        label: `🔒  "${nickName}", ${`characters: ${Object.keys(data.characters).length}`.blue}`,
      };
    }),
  );
  return options;
};
/**
 * ### For `nickNameOr === "asNew"` || `mode === EDIT_Flag`
 * @param {TEVEOAuth2GlobalEntry} e
 * @param {string} nickName
 * @param {true=} isSelect Not `true` then means `edit` mode
 * @returns {TCredentialPromptGroup}
 */
function createCredentialPromptGroup(e, nickName, isSelect) {
  const tobe = isSelect ? "enter" : "edit";
  const allowEmpty = +!isSelect;
  /**
   * @type {TCredentialPromptGroup}
   */
  const map = {
    clientId: [
      `Please ${tobe} the value of \`clientId\`.`,
      "cdcac47...",
      "0621c18b86944c4a8ed9e318e0b6c779",
      validateR(/\w{32}/, "Invalid Client ID", allowEmpty),
    ],
    callbackUrl: [
      `Please ${tobe} the value of \`callbackUrl\`.`,
      "https://oauth-...",
      "http://localhost:33333/callback/",
      validateS("Invalid Callback URL", allowEmpty),
    ],
    clientSecret: [
      `Please ${tobe} the value of \`clientSecret\`.`,
      "This is optional, allows empty string or undefined",
      void 0,
      validateR(/\w{40}/, "Invalid Secret Key", 1),
    ],
    scopes: [
      `Please ${tobe} the value of \`scopes\`.`,
      "Obtain from https://developers.eveonline.com/applications, Credentail Edit -> Enabled Scopes copy button etc",
      void 0,
      validateScopes,
    ],
    nickName: [
      "Please give this app credential a nickname.",
      "This is required",
      void 0,
      validateS("Invalid nick name", allowEmpty),
    ],
  };
  if (!isSelect) {
    map.clientId[1] = e.clientId;
    map.clientId[2] = e.clientId;
    map.callbackUrl[1] = e.callbackUrl;
    map.callbackUrl[2] = e.callbackUrl;
    map.clientSecret[1] = e.clientSecret;
    map.clientSecret[2] = e.clientSecret;
    const scopeString = JSON.stringify(e.scopes);
    map.scopes[1] =
      scopeString.length > 120
        ? scopeString.substring(0, 117) + "..."
        : scopeString;
    map.scopes[2] = scopeString;
    map.nickName[1] = nickName;
    map.nickName[2] = nickName;
  }
  return map;
}
/**
 * ### For `nickNameOr === "asNew"` || `mode === EDIT_Flag`
 * @param {TEVEOAuth2GlobalEntry} e
 * @param {string} nickName
 * @param {true=} isSelect
 * @returns {TCredentialPromptGroupOptions}
 */
function createCredentialPromptOpt(e, nickName, isSelect) {
  const map = createCredentialPromptGroup(e, nickName, isSelect);
  const options = /** @type {TAppCredentialOptKeys[]} */ (
    Object.keys(map)
  ).reduce((acc, key) => {
    const entry = map[key];
    acc[key] = (/*{ results }*/) =>
      text({
        message: entry[0],
        placeholder: entry[1],
        defaultValue: entry[2],
        validate: entry[3],
      });
    return acc;
  }, /** @type {TCredentialPromptGroupOptions} */ ({}));
  options.isOk = async ({ results }) => {
    const s = p.spinner();
    s.start("> Wait for select save or not...");
    const ok = await confirm({
      message: `These are Okay? ${JSON.stringify(results, null, 2)}`,
    });
    s.stop();
    return ok === true;
  };
  return options;
}
/**
 * @param {TEVEOAuth2GlobalStrage } root
 * @returns {Promise<string>}
 * @date 2025/3/21
 */
async function caseImportJson(root) {
  let selectedNickName = "";
  /** @type {IEVEAppSettings=} */
  let json;
  const jsonPath = await p.text({
    message: "📄 Enter the JSON file path",
    validate: (jsonPath) => {
      if (jsonPath) {
        try {
          let data = utils.readText(jsonPath);
          data = rmc(data);
          json = /** @type {IEVEAppSettings} */ JSON.parse(data);
        } catch (e) {
          log(e);
          return "Invalie json file path";
        }
      }
    },
  });
  if (!p.isCancel(jsonPath) && json) {
    log(json);
    const s = p.spinner();
    let stopMsg = "> Okay, this settings data ";
    s.start("> Wait for select save or not...");
    const allow = await p.confirm({
      message: "📥 Would you like to import this JSON data?",
    });
    if (allow) {
      const { description, name, ...rest } = json;
      root[name] = { ...rest, characters: {} };
      selectedNickName = name;
      stopMsg += "save it";
    } else {
      stopMsg += "are ignored";
    }
    s.stop(stopMsg[allow ? "green" : "yellow"]);
  }
  return selectedNickName;
}
/**
 * @param {TEVEOAuth2GlobalEntry} entry
 */
function caseView(entry) {
  const { characters, ...rest } = entry;
  const l = rest.clientSecret?.length;
  rest.clientSecret = l ? "".padStart(l, "*") : "(not set)";
  log(rest);
}
/**
 * @param {IStorage<TEVEOAuth2GlobalStrage>} storage
 * @returns {Promise<string | void>}
 */
export async function caseConfig(storage) {
  let selectedNickName = "";
  /** @type {(msg?: string) => void} */
  const bridgeToContinue = (msg) => {
    console.clear();
    msg && log(msg);
  };
  do {
    const mode = await p.select({
      message: "❓ What would you like to do with EVE App credentials?",
      options: [
        { value: SELECTorAsNew_Flag, label: "🏷️  Select / New Credential" },
        { value: VIEW_Flag, label: "ℹ️  View Credential by selection" },
        { value: EDIT_Flag, label: "🖌️  Edit Credential by selection" },
        { value: REMOVE_Flag, label: "❌ Remove Credential by selection" },
        { value: 0, label: "🔙  Return to prev menu" },
      ],
    });
    if (mode === 0) break;
    if (p.isCancel(mode)) {
      continue;
    }
    /** global root data */
    const root = storage.getData();
    const asNew = mode === SELECTorAsNew_Flag || void 0;
    const isRemove = mode === REMOVE_Flag;
    const options = createCredentialNicknamesOpt(root, asNew);
    const nickNameOr = await p.select({
      message:
        `Which EVE App credential would you like to select?${isRemove ? " (remove)" : ""}`[
          isRemove ? "yellow" : "reset"
        ],
      options,
    });
    if (p.isCancel(nickNameOr)) {
      continue;
    }
    if (mode & SELECT_MASK) {
      if (nickNameOr === "asNew" || mode === EDIT_Flag) {
        if (nickNameOr === "asNew") {
          const howTo = await p.select({
            message:
              "🔄 Choose a method: Import from a JSON file or Enter items manually.",
            options: [
              {
                value: "json",
                label: "📂  Importing from a json file",
                hint: `${"Retrieve from developers.eveonline.com/applications `[JSON]` in `[Application Settings]`".blue}, ${`Use the "name" as "nickName"`.green} and ${`ignore "description".`.hex("444444")}`,
              },
              {
                value: "manual",
                label: "✏️  Input each item individually",
                hint: "You enter each item manually. This is useful if you want to check the information as you enter it."
                  .blue,
              },
            ],
          });
          if (
            p.isCancel(howTo) ||
            (howTo === "json" &&
              (selectedNickName = await caseImportJson(root)) === "")
          ) {
            bridgeToContinue(CANCEL_TASK_MSG.yellow);
            continue;
          }
          if (selectedNickName) break;
        }
        /** @type {TEVEOAuth2GlobalEntry=} */
        const entry = root[nickNameOr];
        const groupOpts = createCredentialPromptOpt(entry, nickNameOr, asNew);
        let result;
        try {
          result = await p.group(groupOpts, {
            onCancel: (/* { results } */) => {
              cancel("Operation cancelled.");
              throw new Error(CANCEL_TASK_MSG);
            },
          });
        } catch (/** @type {any} */ e) {
          bridgeToContinue(e?.message.red);
          continue;
        }
        if (result.isOk) {
          const { isOk, nickName, ...rest } = result;
          /** @type {TEVEOAuthRecord } */
          let characters;
          if (mode === EDIT_Flag) {
            delete root[nickNameOr];
            characters = entry.characters;
          } else {
            characters = {};
          }
          let { clientId, clientSecret, callbackUrl, scopes: scopeStr } = rest;
          clientId = clientId.trim();
          // @ts-expect-error
          clientSecret = (clientSecret && clientSecret.trim()) || void 0;
          callbackUrl = callbackUrl.trim();
          /** @type {NsEVEOAuth.TEVEAppCredentials} */
          const appCredential = {
            clientId,
            clientSecret,
            callbackUrl,
            scopes: /** @type {string[]} */ (
              scopeStr ? JSON.parse(scopeStr) : []
            ),
          };
          root[nickName] = { ...appCredential, characters };
          selectedNickName = nickName;
        } else {
          bridgeToContinue("Edit discarded".yellow);
          continue;
        }
      } else {
        // @ts-expect -error nickNameOr is string
        selectedNickName = nickNameOr;
      }
      break;
    } else {
      if (typeof nickNameOr === "string" && nickNameOr.length) {
        if (mode === REMOVE_Flag) {
          const allow =
            (await p.confirm({
              message: `Are you sure you want to delete the nickname ${nickNameOr.yellow}?`,
            })) === true || void 0;
          if (allow) {
            delete root[nickNameOr];
            await storage.save();
          }
          log(
            `The nickname ${nickNameOr[allow ? "red" : "green"]} was ${allow ? "removed" : "kept"}`,
          );
          continue;
        } else /*if (mode === "view")*/ {
          caseView(root[nickNameOr]);
          continue;
        }
      }
      // @ts-expect -error targetName is string
      selectedNickName = nickNameOr;
      break;
    }
  } while (1);
  return selectedNickName;
}
