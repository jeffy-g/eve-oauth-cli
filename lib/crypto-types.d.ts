/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @file src/lib/crypto-types.d.ts
 */
type CryptoBrand<K, Tag> = {
  /**
   * Value of type of `T`
   */
  v: K;
  /**
   * @internal passphrase
   */
  __p: string;
  _brand: Tag;
};
/**
 * #### CryptoBrand for `ICryptoLoader`
 *
 *  + Use in `ICryptoLoader`
 *
 * @date 2025/2/23 13:12
 */
type TEncrypted = CryptoBrand<string, "enc">;
/**
 * #### CryptoBrand for `ICryptoLoader`
 *
 *  + Use in `ICryptoLoader`
 *
 * @date 2025/2/23 13:12
 */
type TDecrypted = CryptoBrand<string, "dec">;
/**
 * @date 2025/2/23 13:12
 */
declare interface ICryptoLoader {
  load(path: string, pass?: string): Promse<string>;
  save(path: string, data: string, pass?: string): Promse<void>;
}
type TReadlineInterface = import("readline").Interface;
declare interface IPassInput extends TReadlineInterface {
  setMute(is: boolean): void;
}
/**
 * + &#64;types/jsonwebtoken can not works on esm
 *
 * @date 2025/2/23 21:06:35
 */
type TJsonwebtoken = typeof import("jsonwebtoken");
/**
 * + &#64;types/jsonwebtoken can not works on esm
 *
 * @date 2025/2/23 21:06:35
 */
type TJsonwebtoken4Esm = TJsonwebtoken & {
  default: TJsonwebtoken;
};
