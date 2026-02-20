/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/// <reference types="../eve-oauth2-cli.d.ts"/>
/**
 * @file src/lib/callback-server.mjs
 */
import * as http from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";
import { Readable } from "node:stream";
import * as utils from "./util.mjs";
const log = utils.getLogger("[callback-server]".hex("444444"), "server");
/**
 * no last separator
 */
const CALLBACK_ROOT = utils.resolveThisPackageRoot();
const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".woff": "application/font-woff",
  ".ttf": "application/font-ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "application/font-otf",
  ".wasm": "application/wasm",
};
/**
 * HTTP headers to enable Cross-Origin Resource Sharing (CORS).
 * These headers allow any origin to send requests to the server
 * and support multiple HTTP methods and headers.
 * @constant
 */
const CORS_HEADERs = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};
/**
 * Path used to handle OAuth payloads received via HTTP requests.
 * This represents the endpoint where clients send data related to
 * the OAuth authentication process.
 *
 * ```js
 * "/oauth-payload/"
 * ```
 *
 * @constant
 * @date 2025/2/21 23:00:46
 */
const OAUTH_PAYLOAD_PATH = "/oauth-payload/";
/**
 * Represents the structure of the payload received after a successful OAuth operation.
 * @typedef {import("../eve-oauth2-cli").TOAuthResponsePayload} TOAuthResponsePayload
 */
/**
 * Function type for handling OAuth response payloads, typically by processing
 * or storing the received data.
 * @typedef {import("../eve-oauth2-cli").TOAuthResponseHandler} TOAuthResponseHandler
 */
/**
 * Represents the parameter types expected by the HTTP server listener function.
 * @typedef {Parameters<http.RequestListener>} TCreateServerListener
 */
/**
 * Handles incoming HTTP requests on the OAuth payload endpoint.
 * Processes the data received in the request body and invokes the provided
 * handler function with the parsed payload.
 *
 * @param {TCreateServerListener[0]} request - The incoming HTTP request object.
 * @param {TCreateServerListener[1]} response - The HTTP response object for sending back a response.
 * @param {TOAuthResponseHandler} handleOAuthResponse - Function to process the parsed OAuth payload.
 */
function onOAuthPayload(request, response, handleOAuthResponse) {
  log(`IN ${OAUTH_PAYLOAD_PATH}`);
  let buffer = "";
  request
    .on("data", (chunk /*: Buffer*/) => {
      buffer += chunk;
    })
    .on("end", () => {
      response.writeHead(204, CORS_HEADERs).end();
      handleOAuthResponse(JSON.parse(buffer));
    });
}
/**
 * Creates a handler function to process OAuth payloads and emit them as
 * input for further processing, such as CLI workflows or user-defined tasks.
 *
 * @param {Readable} input - Writable stream where processed OAuth data will be pushed.
 * @date 2025/2/21 22:50:38
 * @returns {(payload: TOAuthResponsePayload) => void} A function to handle OAuth payloads.
 */
function emitOAuthPayloadHandler(input) {
  /**
   * Processes the received OAuth payload and pushes relevant data
   * (e.g., code or access token) to the input stream for subsequent actions.
   * If neither `code` nor `access_token` are present, an empty string is pushed.
   * Finally, marks the end of input stream.
   *
   * @param {TOAuthResponsePayload} payload - The OAuth response payload containing data like authorization code or access token.
   */
  return (payload) => {
    const which = payload.code || payload.access_token || "";
    input.push(which);
    input.push(null);
  };
}
let cbPrefix = "";
/**
 * Parses a given request URL to normalize it for specific callback handling.
 * Adjusts the URL based on recognized patterns and caches prefix paths where needed.
 * This function is primarily designed to handle OAuth callback URLs or static file requests.
 *
 * Behavior:
 * - For URLs containing OAuth query parameters (`code`, `state`), the URL is forcibly rewritten to `/callback/index.html`.
 * - For URLs matching certain file patterns (`index.js`, `index.css`), the function updates the URL to align with the cached prefix path.
 * - For all other URLs, it strips query parameters and hash fragments to extract the base path.
 *
 * @param {string} rqUrl - The request URL to parse and normalize.
 * @returns {string} The parsed and normalized request URL.
 * @since v1.5.22
 *
 * Example:
 * ```js
 * const url = parseRequestUrl("/?code=exampleCode&state=exampleState");
 * console.log(url); // -> "/callback/index.html"
 * ```
 */
function parseRequestUrl(rqUrl) {
  if (utils.RE_CallbackQuerys.test(rqUrl)) {
    const m = /(.+\/)/.exec(rqUrl);
    if (m) {
      const prefix = m[1];
      if (prefix !== "/callback/") {
        cbPrefix = prefix;
      }
    } else cbPrefix = "";
    rqUrl = "/callback/index.html";
  } else if (utils.RE_IndexJsCss.test(rqUrl)) {
    // @ts-expect-error rqUrl is exact matches (utils.RE_IndexJsCss)
    const file = utils.RE_IndexJsCss.exec(rqUrl)[0];
    if (!cbPrefix || (cbPrefix && `${cbPrefix}${file}` === rqUrl)) {
      rqUrl = `/callback/${file}`;
    }
  } else {
    const m = /([^?#]+)[?#].+/.exec(rqUrl);
    if (m) {
      rqUrl = m[1];
    }
  }
  return rqUrl;
}
/**
 * Initializes an OAuth callback server if the `redirect_uri` in the provided OAuth2 request URL points to localhost.
 * This function decodes the URL, extracts the `redirect_uri`, and starts a local server if the host is `localhost` or `127.0.0.1`.
 *
 * Behavior:
 * - Extracts the `redirect_uri` from the query parameters of the OAuth2 request URL.
 * - Starts a local server on the specified port to handle OAuth callbacks.
 * - Returns an object containing the input stream, the server instance, and a Promise for the token or access data.
 *
 * @param {string} url - The OAuth2 request URL containing the `redirect_uri` parameter.
 * @returns {{
 *   input?: Readable,
 *   ocs?: ReturnType<typeof launchOAuthCallbackServer>,
 *   tokenPromise?: Promise<string | symbol>
 * }} An object containing:
 * - `input`: A Readable stream to facilitate OAuth data handling.
 * - `ocs`: The launched callback server instance.
 * - `tokenPromise`: A Promise that resolves with the received token or access data.
 */
export function initOAuthCallbackServer(url) {
  const decodeUrl = decodeURIComponent(url);
  // @ts-expect-error pick from like http://localhost:33333/callback/
  const redirect_uri = /(?<=redirect_uri=)([^&]+)/.exec(decodeUrl)[1];
  const m = /(?<=https?:\/\/)([^/:]+):?(\d+)?/.exec(redirect_uri);
  if (m) {
    const [, host, port = "80"] = m;
    if (host === "localhost" || host === "127.0.0.1") {
      /**
       * + Writes a string for auto completion to standard input
       * @type {Readable}
       */
      const input = new Readable({
        read() {},
      });
      /**
       * + OAuth local callback server
       * @type {ReturnType<typeof launchOAuthCallbackServer> | undefined}
       */
      let ocs;
      try {
        ocs = launchOAuthCallbackServer(+port, emitOAuthPayloadHandler(input));
      } catch (e) {
        log(e);
      }
      if (ocs) {
        /** @type {Promise<string | symbol>} */
        const tokenPromise = new Promise((resolve, reject) => {
          input
            .on("data", (chunk) => {
              resolve(chunk.toString());
            })
            .on("error", reject);
        });
        return {
          input,
          ocs,
          tokenPromise,
        };
      }
    }
  }
  return {};
}
/**
 * Launches an OAuth callback server to handle incoming requests for project updates.
 * This server listens for specific OAuth payloads or static file requests on the provided port.
 *
 * Behavior:
 * - Processes OAuth callback payloads sent to `/oauth-payload/` endpoint.
 * - Serves static files based on request paths, including MIME-type handling.
 * - Responds with 404 for unknown paths or missing files.
 *
 * @param {number} port - The port number on which the server should listen.
 * @param {TOAuthResponseHandler} handleOAuthResponse - Callback function to process OAuth payloads.
 * @returns {http.Server} The HTTP server instance.
 * @date 2025/2/21 16:59:10
 */
export const launchOAuthCallbackServer = (port, handleOAuthResponse) => {
  /**
   * + need cache as module scope.
   * @type {http.Server}
   */
  const server = http
    .createServer((request, response) => {
      const rqUrl = parseRequestUrl(/** @type {string} */ (request.url));
      /** @type {string} */
      let filePath;
      log("request:", rqUrl, request.method);
      CaseOAuthPayload: {
        const isOAuthPayload = rqUrl === OAUTH_PAYLOAD_PATH;
        if (isOAuthPayload) {
          if (request.method === "POST") {
            return onOAuthPayload(request, response, handleOAuthResponse);
          }
          if (request.method === "OPTIONS") {
            response.writeHead(200, CORS_HEADERs).end();
            return;
          }
        }
      }
      filePath = CALLBACK_ROOT + rqUrl;
      if (filePath.endsWith("/")) {
        filePath += "index.html";
      }
      const ext = /** @type {keyof typeof mimeTypes} */ (
        path.extname(filePath).toLowerCase()
      );
      const contentType = mimeTypes[ext] || "application/octet-stream";
      if (fs.existsSync(filePath)) {
        fs.readFile(filePath, (err, content) => {
          response
            .writeHead(200, { "Content-Type": contentType })
            .end(content, "utf-8");
        });
      } else {
        response
          .writeHead(404, { "Content-Type": "text/html" })
          .end(`${filePath} not found`, "utf-8");
      }
    })
    .listen(port)
    .on("error", (err) => {
      log(err.message);
    });
  log(`Server running at http://127.0.0.1:${port}/`);
  server.on("close", () => {
    log(`closed, port: ${port}`);
  });
  return server;
};
