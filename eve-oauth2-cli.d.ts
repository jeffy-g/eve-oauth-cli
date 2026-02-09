/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference types="./lib/eve-oauth/index.d.mts"/>
/// <reference types="./lib/storage.d.ts"/>
/**
 * @file src/eve-oauth2-cli.d.ts
 */
import type { webcrypto, JsonWebKey } from "crypto";
import "colors.ts";
/**
 * @todo __TYPE NAME__
 */
export type TOAuthResponsePayload = {
  code?: string;
  access_token?: string;
};
/**
 * @todo __TYPE NAME__
 */
export type TOAuthResponseHandler = (payload: TOAuthResponsePayload) => void;
export type TDebugFlags<K extends string> = {
  [id in K]?: true;
};
declare global {
  type Falsy = 0 | null | "" | undefined;
  type Conditional<T, A, B> = undefined extends T ? A : B;
  type TDebugFlagIds =
    | "main"
    | "config"
    | "characters"
    | "code"
    | "token"
    | "server";
  /**
   * + MUST set first!
   */
  var DEBUG_Flags: TDebugFlags<TDebugFlagIds>;
  const ProjectResourceStringMap = {
    PACKAGE_NAME: "eve-oauth-cli",
    CLI_BANNER: "EVE OAuth2 CLI Tool",
    DEFAULT_TOKEN_CACHE_NAME: "eve_oauth_tokens_cache",
  } as const;
  var PACKAGE_NAME = ProjectResourceStringMap.PACKAGE_NAME;
  var CLI_BANNER = ProjectResourceStringMap.CLI_BANNER;
  var DEFAULT_TOKEN_CACHE_NAME =
    ProjectResourceStringMap.DEFAULT_TOKEN_CACHE_NAME;
  type TAppCredentialRecord = {
    [name: string]: NsEVEOAuth.TEVEAppCredentials;
  };
  /**
   * @date 2025/2/18 6:50:36
   */
  type TEVEOAuthAppRecord = {
    credentials: TAppCredentialRecord;
  } & {
    characters: TEVEOAuthRecord;
  };
  interface IEVEOAuthMeta {
    issuer: string;
    authorization_endpoint: string;
    token_endpoint: string;
    response_types_supported: string[];
    jwks_uri: string;
    revocation_endpoint: string;
    subject_types_supported: string[];
    revocation_endpoint_auth_methods_supported: string[];
    token_endpoint_auth_methods_supported: string[];
    id_token_signing_alg_values_supported: string[];
    token_endpoint_auth_signing_alg_values_supported: string[];
    code_challenge_methods_supported: string[];
  }
  interface IEVEJwks {
    keys: Array<webcrypto.JsonWebKey & JsonWebKey>;
    SkipUnresolvedJsonWebKeys: boolean;
  }
  /**
   * This type form https://developers.eveonline.com/applications
   *
   *  + `[Application Settings]` -> `[JSON]` button
   *
   * @date 2025/3/21 13:35:11
   */
  interface IEVEAppSettings {
    name: string;
    description: string;
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
    scopes: string[];
  }
}
