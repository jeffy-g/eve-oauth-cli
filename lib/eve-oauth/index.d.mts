/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2020 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
declare global {
  /**
   * Only available at umd module or web esm module (globalize at background/oauth-mgr.ts)
   * ```html
   * <script src="https://cdn.jsdelivr.net/npm/eve-oauth@latest/umd/index.js"></script>
   * ```
   */
  const EVEOAuth: typeof import("./index.d.mts");
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                                Utilities.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Implemented at 20/01/16
export declare type TCodeVerifier = {
  /** need for authrize `code_verifier` parameter.
   *
   * will be apply "web safe base64" encode.
   *
   *  + length is always 43
   */
  safe_code_verifier: string;
};
export declare type TCodeChallenge = {
  /** need for authrize url `code_challenge` parameter.
   *
   * will be apply "web safe base64" encode.
   *
   *  + length is always 43
   */
  safe_code_challenge: string;
};
export declare type TCodeChallengeContext = TCodeVerifier & TCodeChallenge;

/**
 * @date 2025/2/18 15:36:09
 */
export interface IJwt {
  header: TJwtHeader;
  payload: TJWTPayload;
  signature: string;
}

export declare type TAlgorithm =
  | "HS256"
  | "HS384"
  | "HS512"
  | "RS256"
  | "RS384"
  | "RS512"
  | "ES256"
  | "ES384"
  | "ES512"
  | "PS256"
  | "PS384"
  | "PS512"
  | "none";

/**
 * @date 2025/2/18 15:36:09
 */
export type TJwtHeader = {
  alg: string | TAlgorithm;
  typ?: string;
  cty?: string;
  crit?: Array<string | Exclude<keyof TJwtHeader, "crit">>;
  kid?: string;
  jku?: string;
  x5u?: string | string[];
  "x5t#S256"?: string;
  x5t?: string;
  x5c?: string | string[];
};

/**
 * type of the JWT token `payload` section
 */
export declare type TJWTPayload = {
  /** scopes. */
  scp: string[];
  /** uuid of the token */
  jti: string;
  /** jwt type */
  kid: string;
  /** contains EVE character ID.
   * ```
   * "CHARACTER:EVE:<character_id>"
   * ```
   */
  sub: `CHARACTER:EVE:${number}`;
  /** Application client ID. */
  azp: string;
  /** EVE character name. */
  name: string;
  /** owner hash. */
  owner: string;
  /** expire date as 1/1000. (UNIX timestamp) */
  exp: number;
  /** issuer host name. */
  iss: string;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                           Module types (index).
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * will almost certainly be able to detect if you are in a nodejs environment
 *
 * @date 2025/3/29
 * @since v0.12.2
 */
export const isNode: boolean;
/**
 * (g)enarate (c)ode (c)harenge
 *
 *   + using Web Crypto API.
 *
 * https://developer.mozilla.org/ja/docs/Web/API/Crypto
 * https://developer.mozilla.org/ja/docs/Web/API/SubtleCrypto
 *
 * NOTE: when use for query parameter, need apply "encodeURIComponent" each result values.
 *
 * @see TCodeChallengeContext
 */
export declare function gcc(): Promise<TCodeChallengeContext>;
/**
 *
 * @param accessToken OAuth 2.0 access token
 */
export declare const getJWTPayload: (accessToken: string) => TJWTPayload;
/**
 * @param {string} accessToken
 * @returns {NsEVEOAuth.IJwt}
 */
export declare const toJWT: (accessToken: string) => IJwt;
/**
 * perform a simple validation of the EVE application keys
 *
 *  + 📝 It is impossible to evaluate if it is legitimate.
 *
 * @param clientId `Client ID` obtained from {@link https://developers.eveonline.com/applications EVE Application management page}
 * @param clientSecret `Secret Key` obtained from {@link https://developers.eveonline.com/applications EVE Application management page}
 *   + can be empty string when using `PKCE` flow authentication
 */
export declare const validateAppIdSecret: (
  clientId: string,
  clientSecret?: string | undefined,
) => boolean;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                           Module types (core).
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * final result of exchange the authorization code for an access token
 */
export declare type TEVEOAuthCodeExchangeResult<
  ExtraProps extends Record<string, unknown> = Record<string, unknown>,
> = {
  /** character id like "134429849" */
  characterId: string | number;
  // /** "moh0x659OHKs+SqpeXqPLr3b7Ss=" */
  // character OwnerHash: string;
} & TEVEOAuthRefreshResult &
  ExtraProps;

/**
 * @date 2025/3/10
 */
export type TAccessToken = `${string}.${string}.${string}`;
/**
 * https://www.oauth.com/oauth2-servers/access-tokens/refreshing-access-tokens/
 *
 * @see TOAuthRefreshTokenResult
 */
export declare type TEVEOAuthRefreshResult = {
  /** "CpVaNqrcrIod-......" */
  accessToken: TAccessToken;
  /** "5YeMDuFiXvvu1DVIc1z... */
  refreshToken: string;
  /**
   * ### expires in milliseconds
   */
  expires: number;
};
/**
 * EVE OAuth specific JWT payload definition
 */
export declare type TJWTVerifyResult = {
  /** EVE character ID. */
  characterId: number;
  /** EVE character name. */
  name: string;
  /** ESI scopes. */
  scopes: string[];
  /** unused. (Especially not necessary data */
  type: string;
  // /** unused. (Especially not necessary data */
  // character OwnerHash: string;
};
/**
 * EVE Applications Authentication Settings
 *
 * Each property uses EVE application credentials
 *
 *   + https://developers.eveonline.com/applications
 */
export declare type TEVEAppCredentials = {
  /**
   * EVE application `Client ID`
   */
  clientId: string;
  /**
   * EVE application `Secret Key`
   */
  clientSecret?: string;
  /**
   * EVE application `Callback URL`
   */
  callbackUrl: string;
  /**
   * @date 2025/3/19
   */
  scopes: string[];
};
/**
 * https://tools.ietf.org/html/rfc6749#section-5.2
 */
export declare type TOAuthRefreshErrorResponse = {
  /**
   *   + `invalid_token` is EVE OAuth specific?
   *
   * others, defined at https://tools.ietf.org/html/rfc6749#section-5.2
   */
  error:
    | "invalid_request"
    | "invalid_client"
    | "invalid_grant"
    | "unauthorized_client"
    | "unsupported_grant_type"
    | "invalid_scope"
    | "invalid_token";
  /**
   * optional
   */
  error_description?: string;
  /**
   * optional
   */
  error_uri?: string;
};
/**
 * utility type for authorization etc
 *
 *   + failure reason: "scope", "token", "client", "error"
 */
export declare type TOAuthRequestErrorReason =
  | "scope"
  | "token"
  | "client"
  | "error";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                      Module types (Client interface).
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 * #### EVE OAuth2 client interface
 *
 *   + Basically disposable
 *   + However, you can also cache instances and reuse them
 */
export interface IEVEOAuth2 {
  /**
   * Checks if the token is expired and refreshes it if necessary.
   *
   * @param {TEVEOAuthCodeExchangeResult} oauthData - The OAuth data containing the access token, refresh token, and expiration time.
   * @param {true=} force
   * @returns {Promise<boolean>} - Returns true if the token was refreshed, otherwise false.
   * @throws {TOAuthRefreshErrorResponse | Error} error body as defined in
   *     https://tools.ietf.org/html/rfc6749#section-5.2 or undefined if an unknown error occured
   *
   * @see {@link TOAuthRefreshErrorResponse}
   *
   * @example
   * const oauthData = {
   *   accessToken: 'your-access-token',
   *   refreshToken: 'your-refresh-token',
   *   expires: Date.now() + 3600 * 1000 // 1 hour from now
   * };
   *
   * const client = new OAuthClient({
   *   clientId: 'your-client-id',
   *   clientSecret: 'your-secret-key',
   *   callbackUrl: 'your-redirect-uri'
   * });
   *
   * client.checkTokenExpire(oauthData).then(isRefreshed => {
   *   if (isRefreshed) {
   *     console.log('Token was refreshed');
   *   } else {
   *     console.log('Token is still valid');
   *   }
   * }).catch(error => {
   *   console.error('Error checking token expiration:', error);
   * });
   */
  checkTokenExpire(
    oauthData: TEVEOAuthCodeExchangeResult,
    force?: true,
  ): Promise<boolean>;
  /**
   *
   * @param {"code" | "token"} responseType this value should be "code" or "token". default is `code`
   * @param {string[]=} scopes Allowed scope tokens
   *  + By default it uses {@link TEVEAppCredentials.scopes}, but if you need to customize it you can use a `string[]` containing any scope.
   * @param {string=} state if need
   * @returns {Promise<string>} EVE authentication url
   */
  createAuthorizeUrl(
    responseType?: "code" | "token",
    scopes?: string[],
    state?: string,
  ): Promise<string>;
  /**
   * + see {@link https://github.com/esi/esi-docs/blob/master/docs/sso/sso_authorization_flow.md EVE SSO Authorization Flow}
   *
   * @param code from OAuth 2 server
   * @param callback can obtain code exchanged result
   */
  authCodeExchange(
    code: string,
    callback: (data: TEVEOAuthCodeExchangeResult) => void,
  ): Promise<void>;
  /**
   * Request a new access token using a refresh token
   *
   * @param refreshToken previously issued
   * @returns {Promise<TEVEOAuthRefreshResult>}
   * @throws {TOAuthRefreshErrorResponse | Error} error body as defined in
   *     https://tools.ietf.org/html/rfc6749#section-5.2 or undefined if an unknown error occurred
   * @see {@link TOAuthRefreshErrorResponse}
   */
  refresh(refreshToken: string): Promise<TEVEOAuthRefreshResult>;
  /**
   * + this response always content-length: 0
   *
   * @param refreshToken
   * @date 2020/2/4
   */
  revoke(refreshToken: string): Promise<boolean>;
}

//
// - - - client
//
export declare type TOAuthCallback = (
  data: TEVEOAuthCodeExchangeResult,
) => void;
/**
 * @summary Currently, unused
 */
export declare type TOAuthConfigFragment = {
  /**
   * DEVNOTE:
   */
  appCredentials?: TEVEAppCredentials;
};
/**
 * @param config
 */
export declare const setConfiguration: (config: TEVEAppCredentials) => void;
/**
 * default redirect_uri.
 *
 * auto detect eve sso callback uri.
 * ```
 *  `${location.protocol}//${location.host}/callback/`
 * ```
 * - http(s)://localhost/
 * ```
 * "http(s)://localhost/callback/"
 * ```
 * - http(s)://anomymouse.example.com/
 * ```
 * "http(s)://anomymouse.example.com/callback/"
 * ```
 *
 * NOTE: supported http(s): protocol.
 */
export declare const REDIRECT_URI_DEFAULT: string;
/**
 * The eve-oauth version string
 */
export declare const version: string;
/**
 * **MUST use this function**.
 *
 *   + ⚠️ EVE client id/secret key must be set with `setConfiguration`
 *   + currently, use `PKCE` flow when `client_secret` is not set
 *
 * @return IEVEOAuth2
 * @throws — when invalid configuration
 */
export declare const createOAuthClient: () => IEVEOAuth2;

// DEVNOTE: 2020/4/26 20:20:43 - "mini-semaphore" is now exported from index.js
export declare const MiniSema: typeof import("mini-semaphore");

export as namespace NsEVEOAuth;
