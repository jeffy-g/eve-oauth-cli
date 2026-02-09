/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference types="../eve-oauth2-cli.d.ts"/>
/**
 * @file src/validate-jwt-token.mjs
 */
const jwt = await (async () => {
  const mod = /** @type {TJsonwebtoken4Esm} */ (await import("jsonwebtoken"));
  return mod.default || mod;
})();
// @ts-expect- error "jsonwebtoken" is cjs module
import { KeyObject } from "crypto";
const METADATA_URL =
  "https://login.eveonline.com/.well-known/oauth-authorization-server";
const METADATA_CACHE_TIME = 1000 * 60 * 60;
/** @type {["logineveonline.com", "https://login.eveonline.com"]} */
const ACCEPTED_ISSUERS = ["logineveonline.com", "https://login.eveonline.com"];
const EXPECTED_AUDIENCE = "EVE Online";
const DEBUG = 0;
/** @type {IEVEJwks} */
export let jwks_metadata;
let jwks_metadata_ttl = 0;
async function fetchJwksMetadata() {
  if (jwks_metadata === null || jwks_metadata_ttl < Date.now() / 1000) {
    const resp = await fetch(METADATA_URL);
    if (!resp.ok) throw new Error("Failed to fetch metadata");
    /** @type {IEVEOAuthMeta} */
    const metadata = await resp.json();
    const jwks_uri = metadata.jwks_uri;
    const jwks_resp = await fetch(jwks_uri);
    if (!jwks_resp.ok) throw new Error("Failed to fetch JWKS");
    jwks_metadata = await jwks_resp.json();
    jwks_metadata_ttl = Date.now() / 1000 + METADATA_CACHE_TIME;
  }
  return jwks_metadata;
}
/**
 * @param {string} ws64string
 * @param {true=} asb64
 */
function fromWsBase64(ws64string, asb64) {
  let b64 = ws64string.replace(
    /[-_]/g,
    /* istanbul ignore next */
    ($0) => ($0 === "-" ? "+" : $0 === "_" ? "/" : ""),
  );
  const rem = b64.length % 4;
  if (rem === 2) b64 += "==";
  else if (rem === 3) b64 += "=";
  return asb64 ? b64 : atob(b64);
}
/**
 * @param {string} accessToken
 * @returns {NsEVEOAuth.IJwt}
 * @date 2025/2/18 15:42:29
 */
export const toJWT = (accessToken) => {
  const b64s = accessToken.split(".");
  const header = JSON.parse(fromWsBase64(b64s[0]));
  const payload = JSON.parse(fromWsBase64(b64s[1]));
  const signature = fromWsBase64(b64s[2], true);
  return {
    header,
    payload,
    signature,
  };
};
/**
 * @param {string} token
 * @throws {Error}
 * @returns
 */
async function validateJwtToken(token) {
  const metadata = await fetchJwksMetadata();
  const keys = metadata.keys;
  const header = toJWT(token).header;
  const key = keys.find((item) => {
    return item.kid === header.kid && item.alg === header.alg;
  });
  if (!key) throw new Error("Key not found");
  const publicKey = await crypto.subtle.importKey(
    "jwk",
    key,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: { name: "SHA-256" },
    },
    true,
    ["verify"],
  );
  const verifyKey = KeyObject.from(publicKey);
  if (DEBUG) {
    console.log(publicKey);
    console.log(verifyKey);
  }
  return jwt.verify(token, verifyKey, {
    algorithms: [/** @type {NsEVEOAuth.TAlgorithm} */ (header.alg)],
    issuer: ACCEPTED_ISSUERS,
    audience: EXPECTED_AUDIENCE,
  });
}
/**
 * @param {string} token
 * @param {string} client_id
 * @returns
 */
async function isTokenValid(token, client_id) {
  try {
    const claims = await validateJwtToken(token);
    // @ts-expect-error
    if ("aud" in claims) {
      const ret = claims.aud?.includes(client_id);
      return ret || false;
    }
  } catch (err) {}
  return false;
}
export { validateJwtToken, isTokenValid };
