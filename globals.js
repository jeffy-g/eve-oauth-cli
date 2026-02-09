/// <reference types="./eve-oauth2-cli.d.ts"/>
"use strict";
/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @file src/globals.js
 */
/**
 * @type {import("./eve-oauth2-cli").TDebugFlags<TDebugFlagIds>}
 */
globalThis.DEBUG_Flags = {};
globalThis.PACKAGE_NAME =
  /** @type {typeof ProjectResourceStringMap.PACKAGE_NAME} */ ("eve-oauth-cli");
globalThis.CLI_BANNER =
  /** @type {typeof ProjectResourceStringMap.CLI_BANNER} */ (
    "EVE OAuth2 CLI Tool"
  );
globalThis.DEFAULT_TOKEN_CACHE_NAME =
  /** @type {typeof ProjectResourceStringMap.DEFAULT_TOKEN_CACHE_NAME} */ (
    "eve_oauth_tokens_cache"
  );
