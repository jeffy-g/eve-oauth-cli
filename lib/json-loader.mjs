/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference types="./crypto-types.d.ts"/>
/**
 * @file src/lib/json-loader.mjs
 */
import * as cryptoUtil from "./crypto-util.mjs";
import * as utils from "./util.mjs";
/** @type {ICryptoLoader & { pass?: string }} */
export const jsonLoader = {
  pass: void 0,
  async load(path, pass) {
    let data;
    try {
      data = utils.readText(path + ".crypto");
    } catch (e) {
      return "{}";
    }
    let source = "";
    try {
      const decrypted = await cryptoUtil.of(data, false, pass);
      this.pass = decrypted.__p;
      source = decrypted.v;
    } catch (/** @type {any} */ e) {
      if (/bad decrypt/.test(e.message)) {
        console.log(
          "It looks like your password is incorrect, please try again with the correct password."
            .red,
        );
      } else {
        console.warn(e);
      }
    }
    return source;
  },
  async save(path, data, pass) {
    try {
      const encrypted = await cryptoUtil.of(data, true, this.pass);
      if (!this.pass) {
        this.pass = encrypted.__p;
      }
      utils.writeText(encrypted.v, path + ".crypto");
    } catch (e) {
      console.error("Failed to save data:", e);
    }
  },
};
