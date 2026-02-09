/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference types="./crypto-types.d.ts"/>
/**
 * @file src/lib/crypto-util.mjs
 * @command node src/lib/crypto-util.mjs -test
 * @command node src/lib/crypto-util.mjs ./sample.json
 * @command node src/lib/crypto-util.mjs ./sample.json.crypto
 */
import * as crypto from "crypto";
import * as utils from "./util.mjs";
import * as readline from "readline";
import * as passInput from "./pass-input.mjs";
import tinArgs from "tin-args";
/**
 * Encrypts a string using a password.
 * @param {string} source - The string to encrypt.
 * @param {string} pass - The password to use for encryption.
 * @returns {string} The encrypted string in base64 format.
 */
export function encryptString(source, pass) {
  const key = crypto.scryptSync(pass, "salt", 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(source, "utf8", "base64");
  encrypted += cipher.final("base64");
  return iv.toString("base64") + ":" + encrypted;
}
/**
 * Decrypts a base64 encoded string using a password.
 * @param {string} b64 - The base64 encoded string to decrypt.
 * @param {string} pass - The password to use for decryption.
 * @returns {string} The decrypted string.
 */
export function decryptString(b64, pass) {
  const [iv, encrypted] = b64.split(":");
  const key = crypto.scryptSync(pass, "salt", 32);
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    key,
    Buffer.from(iv, "base64"),
  );
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
const EXT = ".crypto";
/**
 * #### Get encryption / decryption of `data`
 *
 * @template {boolean} B
 * @template {false extends B ? TDecrypted: TEncrypted} R
 * @param {string} data
 * @param {B} encrypt use encrypt or not
 * @param {string=} pass
 * @returns {Promise<R>}
 * @version 1.0
 * @date 2025/2/23 16:22:22
 */
export async function of(data, encrypt, pass) {
  const fn = !encrypt ? decryptString : encryptString;
  if (typeof pass === "string") {
    const v = fn(data, pass);
    return /** @type {R} */ ({ v, __p: pass });
  } else {
    const pinput = passInput.createPassInput();
    /** @type {R} */
    const result = await new Promise((resolve) => {
      pinput.question("Enter the pass word: ", (pass) => {
        pinput.close();
        let v;
        try {
          v = fn(data, pass);
        } catch (e) {
          resolve(e);
        }
        resolve(/** @type {R} */ ({ v, __p: pass }));
      });
      pinput.setMute(true);
    }).catch((reason) => {
      return reason;
    });
    if (typeof result === "object" && "__p" in result) {
      return /** @type {R} */ (result);
    }
    throw result;
  }
}
/**
 * #### Write of encryption / decryption `data`
 *
 * @param {string} path
 * @param {boolean} isEncrypted
 * @param {string=} pass
 */
export function cryptoOf(path, isEncrypted, pass) {
  /** @type {ReturnType<typeof readline.createInterface>} */
  let rl;
  const actualTo = isEncrypted ? path.slice(0, -EXT.length) : path + EXT;
  const fn = isEncrypted ? decryptString : encryptString;
  /** @type {(pass: string) => void} */
  const cb = (pass) => {
    rl && rl.close();
    const out = fn(source, pass);
    utils.writeText(out, actualTo);
  };
  /** @type {string} */
  let source;
  try {
    source = utils.readText(path);
  } catch (e) {
    console.warn(e);
    return;
  }
  if (!pass) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Enter the pass word: ", cb);
  } else {
    cb(pass);
  }
}
function test() {
  const text = `/**
 * Encrypts a string using a password.
 * @param {string} source - The string to encrypt.
 * @param {string} pass - The password to use for encryption.
 * @returns {string} The encrypted string in base64 format.
 */
export function encryptString(source, pass) {
    const key = crypto.scryptSync(pass, "salt", 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(source, "utf8", "base64");
    encrypted += cipher.final("base64");
    return iv.toString("base64") + ":" + encrypted;
}`;
  const encrypted = encryptString(text, "1234");
  console.log(encrypted);
  const decrypted = decryptString(encrypted, "1234");
  console.log(`decrypted same as text? ${decrypted === text}`);
}
/**
 * @typedef TArgs
 * @prop {string=} pass
 * @prop {true=} test
 */
/** @type {ReturnType<typeof tinArgs<TArgs>>} */
const params = tinArgs();
if (params.test) {
  test();
} else if (params.args && params.args.length) {
  const file = params.args[0];
  const pass =
    typeof params.pass === "number"
      ? params.pass + ""
      : typeof params.pass === "string" /*  && params.pass.length */
        ? params.pass
        : void 0;
  cryptoOf(file, file.endsWith(EXT), pass);
} else {
}
