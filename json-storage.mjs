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
 * @file src/json-storage.mjs
 */
/**
 * Simple IStorage implementation
 * @template {Record<string, any>} T
 * @param {ICryptoLoader} loader - The loader for cryptographic operations
 * @param {string=} storageId - The ID of the storage
 * @param {string} [rootPath="."] - The root path for storage, default is `"."`
 * @returns {IJsonStorage<T>} The JSON storage instance
 * @version 2.0 Cryptographic-compatible
 */
export const JsonStorage = (
  loader,
  storageId = "eve_oauth_tokens_cache",
  rootPath = ".",
) => {
  /** @type {`${string}/${string}.json`} */
  const localFilePath = `${rootPath}/${storageId}.json`;
  return /** @type {IJsonStorage<T>} */ ({
    src: /** @type {unknown} */ (void 0),
    /** @type {(pass?: string) => Promise<IJsonStorage<T>>} */
    async load(pass) {
      const jsonString = /** @type {string} */ (
        await loader.load(localFilePath, pass)
      );
      this.src = /** @type {T} */ (JSON.parse(jsonString));
      return this;
    },
    async setData(source) {
      this.src = source;
      await this.save();
    },
    set(fieldName, data) {
      this.src[fieldName] = data;
    },
    getData() {
      return this.src;
    },
    get(fieldName) {
      return this.src[fieldName];
    },
    getByPath(path) {
      const paths = path.split("/");
      const src = this.src;
      /** @type {any} */
      let obj;
      for (const p of paths) {
        if (obj && typeof obj === "object" && p in obj) {
          obj = obj[p];
        } else {
          obj = src[p];
          if (!obj) break;
        }
      }
      return obj;
    },
    async save() {
      const src = this.src;
      if (typeof src === "object") {
        await loader.save(localFilePath, JSON.stringify(src));
      }
    },
  });
};
