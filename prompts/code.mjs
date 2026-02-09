/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference types="../eve-oauth2-cli.d.ts"/>
/**
 * @file src/prompts/oauth-code.mjs
 */
import * as p from "@clack/prompts";
import * as oauth from "../lib/eve-oauth/index.mjs";
import * as utils from "../lib/util.mjs";
import * as svr from "../lib/callback-server.mjs";
const { text, isCancel, confirm, spinner } = p;
const log = utils.getLogger("characters > code");
/**
 * @param {NsEVEOAuth.IEVEOAuth2} sso
 * @param {TEVEOAuth2GlobalStrage[string]["characters"]} characters
 * @param {string} url
 * @returns {Promise<true | void>}
 */
export async function casePKCE(sso, characters, url) {
  let { ocs, input, tokenPromise } = svr.initOAuthCallbackServer(url);
  if (!input) {
    tokenPromise = text({
      message: "Paste the exchangeCode you received:",
      placeholder: "Please enter the exchange code...",
      validate(value) {
        if (!value) return;
        value = value.trim();
        if (!/[\w=+/-]{22}/.test(value)) {
          return "This exchange code are invalid";
        }
      },
    });
  }
  log("Waiting for exchangeCode...");
  const code = await tokenPromise;
  if (!code || isCancel(code)) {
    p.cancel("return to prev task");
    return;
  }
  log("Exchange code obtained, moving to the next step.");
  try {
    /** @type {NsEVEOAuth.TEVEOAuthCodeExchangeResult} */
    let exchangeResult;
    /** @type {NsEVEOAuth.TJWTPayload} */
    let jwt;
    await sso.authCodeExchange(code.trim(), (data) => {
      jwt = oauth.getJWTPayload(data.accessToken);
      exchangeResult = data;
      const dummy = { ...data };
      // @ts-expect-error ignore
      dummy.accessToken = dummy.accessToken.slice(0, 40) + "...";
      console.log("Got result: ", dummy);
      console.log(jwt);
    });
    const s = spinner();
    s.start("> Wait for select save or not...");
    const allowSave = await confirm({
      // @ts-expect-error jwt is ok
      message: `Do you want to save this person's data? ${jwt.name}`,
    });
    if (allowSave === true) {
      // @ts-expect-error exchangeResult is ok
      characters[exchangeResult.characterId] = exchangeResult;
      s.stop("> Okay, this person's data save it");
      return true;
    }
    s.stop("> Okay, this person's data are ignored");
  } catch (e) {
  } finally {
    ocs && ocs.close();
    input && input.destroy();
  }
}
