/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference types="./crypto-types.d.ts"/>
/**
 * @file src/lib/pass-input.mjs
 */
import * as readline from "readline";
import { Writable } from "node:stream";
/**
 * @typedef {import("node:stream").WritableOptions} WritableOptions
 */
const AST = Buffer.alloc(1).fill(0x2a);
/**
 * Creates a readline interface for password input with muted output.
 * @returns {IPassInput} The readline interface with a setMute method.
 */
export function createPassInput() {
  const mutableStdout = new (class extends Writable {
    /**
     * @param {WritableOptions} opt
     */
    constructor(opt) {
      super(opt);
      /** Mute or Not */
      this.muted = false;
    }
  })({
    write: function (chunk, encoding, callback) {
      mutableStdout.muted && (chunk = AST);
      process.stdout.write(chunk, encoding);
      callback();
    },
  });
  /** @type {IPassInput} */
  // @ts-expect-error ignore semantics error
  const rl = readline.createInterface({
    input: process.stdin,
    output: mutableStdout,
    terminal: true,
  });
  rl.setMute = (/** @type {boolean} */ is) => {
    mutableStdout.muted = is;
  };
  return rl;
}
