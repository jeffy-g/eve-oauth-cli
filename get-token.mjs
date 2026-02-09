/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference types="./eve-oauth2-cli.d.ts"/>
/**
 * @file src/get-token.mjs
 */
import "./globals.js";
import * as oauth from "./lib/eve-oauth/index.mjs";
import { JsonStorage } from "./json-storage.mjs";
import { jsonLoader } from "./lib/json-loader.mjs";
/**
 * @param {string} credentialNickname
 * @param {string} charNameOrId
 * @param {string=} pass
 * @throws {Error} This occurs when `credentialNickname` is invalid or `charNameOrId` is not found.
 *
 * @example
 * const mod = await import("eve-oauth-cli/get-token.mjs");
 * // then force refreshed accessToken
 * const token = await mod.getAccessToken("eve-oauth-prompt", "toney annd", "1234");
 */
export async function getAccessToken(credentialNickname, charNameOrId, pass) {
  const storage = /** @type {IJsonStorage<TEVEOAuth2GlobalStrage>} */ (
    await JsonStorage(jsonLoader).load(pass)
  );
  const { characters, ...appCredentials } = storage.get(credentialNickname);
  if (!characters) {
    throw new Error(
      `The credential nickname "${credentialNickname}" may be invalid, or the character record does not exist.`,
    );
  }
  oauth.setConfiguration(appCredentials);
  /** @type {NsEVEOAuth.TEVEOAuthCodeExchangeResult=} */
  let data;
  if (/^\d+$/.test(charNameOrId)) {
    data = characters[charNameOrId];
  } else {
    charNameOrId = charNameOrId.toLowerCase();
    const charIds = Object.keys(characters);
    for (let idx = 0; idx < charIds.length; ) {
      data = characters[charIds[idx++]];
      const payload = oauth.getJWTPayload(data.accessToken);
      if (payload.name.toLowerCase() === charNameOrId) {
        break;
      }
    }
  }
  if (data) {
    const sso = oauth.createOAuthClient();
    const updated = await sso.checkTokenExpire(data, true);
    console.log(
      `"${charNameOrId}" accessToken ${updated ? "force reset." : " may be invalid..."}`,
    );
    return data.accessToken;
  }
  throw new Error(
    `The EVE character "${charNameOrId}" is not associated with the credential "${credentialNickname}".`,
  );
}
