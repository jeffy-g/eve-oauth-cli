/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference types="../eve-oauth2-cli.d.ts"/>
/**
 * @file src/prompts/oauth-token.mjs
 */
import * as p from "@clack/prompts";
import * as oauth from "../lib/eve-oauth/index.mjs";
import * as utils from "../lib/util.mjs";
import * as svr from "../lib/callback-server.mjs";
const log = utils.getLogger("characters > implicit flow");
/**
 * Verify that the token is valid.
 *
 *  + Here, we only perform the minimum necessary verification.
 *
 * @param {string=} token - The token to validate
 * @returns {string=} - Error message or undefined
 */
function validateToken(token) {
  if (!token) return;
  token = token.trim();
  if (token.length) {
    let count = 0;
    for (let i = 0; i < token.length; ) {
      token[i++] === "." && count++;
    }
    if (count !== 2) {
      return "Invalid token: The token must contain two dots";
    }
  }
}
/**
 * @param {string} url
 * @returns {Promise<NsEVEOAuth.TJWTPayload | void>}
 */
export async function caseImplicitFlow(url) {
  let { ocs, input, tokenPromise } = svr.initOAuthCallbackServer(url);
  if (!input) {
    tokenPromise = p.text({
      message: "paste got accessToken:",
      placeholder: "Plz accessToken",
      validate: validateToken,
    });
  }
  try {
    const accessToken = await tokenPromise;
    if (!accessToken || p.isCancel(accessToken)) {
      p.cancel("return to prev task");
      return;
    }
    return oauth.getJWTPayload(accessToken);
  } catch (e) {
    log(`Error during OAuth flow: ${e}`);
  } finally {
    ocs && ocs.close();
    input && input.destroy();
  }
}
