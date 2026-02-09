/*!
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  Copyright (C) 2025 jeffy-g <hirotom1107@gmail.com>
//  Released under the MIT license
//  https://opensource.org/licenses/mit-license.php
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
/**
 * @file callback/index.js
 * @summary for index.html (EVE OAuth2 callback page)
 */
/**
 * @template T
 * @param {string} id
 * @returns {T}
 */
function $dom(id) {
  return /** @type {T} */ (document.getElementById(id));
}
const unity = () => {
  return (Math.random() * 255) | 0;
};
/**
 * @param {number} alpha
 * @returns {string}
 */
function randomHexColorA(alpha = 1) {
  if (alpha < 0) {
    alpha = 0;
  } else if (alpha > 1) {
    alpha = 1;
  }
  return `rgb(${unity()} ${unity()} ${unity()} / ${alpha})`;
}
/** @type {`${string}=${string}&`[]} */
// @ts-expect-error
const q = location.search || location.hash;
if (window.opener !== null) {
  window.addEventListener("load", (e) => {
    window.opener.postMessage(q, "*");
  });
} else {
  if (q) {
    // @ts-expect-error
    const usp = new URLSearchParams(q.substring(1));
    for (const entry of usp.entries()) {
      addParamElement(entry);
    }
    whenOAuthPayload();
  }
}
/**
 *
 */
function whenOAuthPayload() {
  const m = /(?<=https?:\/\/)([^/:]+):?(\d+)?/.exec(location.origin);
  if (m) {
    const host = m[1];
    if (host === "localhost" || host === "127.0.0.1") {
      /** @type {`${string}=${string}${"&" | ""}`[]} */
      const queries = q.slice(1);
      // @ts-expect-error
      const usp = new URLSearchParams(queries);
      /** @type {Record<string, string>} */
      const payload = {};
      for (const [key, value] of usp.entries()) {
        payload[key] = value;
      }
      /** @satisfies {RequestInit} */
      const opt = {
        method: "post",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      };
      try {
        fetch(`${location.origin}/oauth-payload/`, opt)
          .then((res) => console.log(res))
          .catch((reason) => console.log(reason));
      } catch (e) {
        console.log(e);
      }
    }
  }
}
/**
 * @param {[key: string, value: string]} entry
 */
function addParamElement(entry) {
  const [key, value] = entry;
  const div = document.createElement("div");
  div.className = "param-row mrg-2000";
  const label = div.appendChild(document.createElement("label"));
  label.textContent = key;
  label.className = "param-label br3";
  label.style.cssText = `color: ${randomHexColorA()};`;
  const input = div.appendChild(document.createElement("input"));
  input.type = "text";
  input.value = value;
  input.className = "param-text br3";
  input.style.cssText = `color: ${randomHexColorA()};`;
  input.addEventListener("mousedown", function () {
    const text = this.value.trim();
    navigator.clipboard.writeText(text).then(() => {
      /** @type {HTMLElement} */
      // @ts-expect-error
      const parent = this.parentElement;
      let last = parent.lastElementChild;
      if (!(last instanceof HTMLSpanElement)) {
        last = parent.appendChild(document.createElement("span"));
      }
      last.textContent = `copied!! "${text}"`;
      last.classList.remove("animate");
      setTimeout(() => last.classList.add("animate"), 50);
    });
  });
  $dom("params").appendChild(div);
}
