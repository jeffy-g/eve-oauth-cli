/*! For license information please see index.js.LICENSE.txt */
var e,
  t,
  r = {
    7: (e, t, r) => {
      (r.r(t), r.d(t, { gcc: () => o }));
      const n = (e) =>
        e
          .toString("base64")
          .replace(/[+/=]/g, (e) => ("+" === e ? "-" : "/" === e ? "_" : ""));
      let s;
      async function o() {
        s || (s = await import("crypto"));
        const e = n(s.randomBytes(32));
        return {
          safe_code_verifier: e,
          safe_code_challenge: n(s.createHash("sha256").update(e).digest()),
        };
      }
    },
    8: (e, t, r) => {
      (r.r(t), r.d(t, { gcc: () => i }));
      const n = Array,
        s = Uint8Array,
        o = (e) =>
          btoa(String.fromCharCode.apply(null, e)).replace(/[+/=]/g, (e) =>
            "+" === e ? "-" : "/" === e ? "_" : "",
          ),
        i = async () => {
          const e = o(
              (() => {
                let e = 32;
                const t = n(e);
                do {
                  t[--e] = (255 * Math.random()) | 0;
                } while (e);
                return t;
              })(),
            ),
            t = await crypto.subtle
              .digest(
                "sha-256",
                ((e) => {
                  let t = e.length;
                  const r = n(t);
                  for (; t--; ) r[t] = e.charCodeAt(t);
                  return s.from(r);
                })(e),
              )
              .then((e) => new s(e));
          return { safe_code_verifier: e, safe_code_challenge: o(t) };
        };
    },
    9: (e) => {
      e.exports = require("crypto");
    },
  },
  n = {};
function s(e) {
  var t = n[e];
  if (void 0 !== t) return t.exports;
  var o = (n[e] = { exports: {} });
  return (r[e](o, o.exports, s), o.exports);
}
((t = Object.getPrototypeOf
  ? (e) => Object.getPrototypeOf(e)
  : (e) => e.__proto__),
  (s.t = function (r, n) {
    if ((1 & n && (r = this(r)), 8 & n)) return r;
    if ("object" == typeof r && r) {
      if (4 & n && r.__esModule) return r;
      if (16 & n && "function" == typeof r.then) return r;
    }
    var o = Object.create(null);
    s.r(o);
    var i = {};
    e = e || [null, t({}), t([]), t(t)];
    for (var a = 2 & n && r; "object" == typeof a && !~e.indexOf(a); a = t(a))
      Object.getOwnPropertyNames(a).forEach((e) => (i[e] = () => r[e]));
    return ((i.default = () => r), s.d(o, i), o);
  }),
  (s.d = (e, t) => {
    for (var r in t)
      s.o(t, r) &&
        !s.o(e, r) &&
        Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
  }),
  (s.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
  (s.r = (e) => {
    ("undefined" != typeof Symbol &&
      Symbol.toStringTag &&
      Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
      Object.defineProperty(e, "__esModule", { value: !0 }));
  }));
var o = {};
(s.r(o),
  s.d(o, { iw: () => h, wC: () => p, Ll: () => c, pY: () => f, tf: () => d }));
var i = {};
(s.r(i), s.d(i, { C: () => z }));
var a = {};
(s.r(a),
  s.d(a, {
    Deque: () => b,
    MiniSemaphore: () => z,
    create: () => O,
    restrictor: () => M,
    version: () => D,
  }));
const c =
    "object" == typeof process &&
    "object" == typeof process.versions &&
    /\d+\.\d+\.\d+/.test(process.versions.node),
  l = (async () =>
    c
      ? (await Promise.resolve().then(s.bind(s, 7))).gcc
      : (await Promise.resolve().then(s.bind(s, 8))).gcc)(),
  h = () => l.then((e) => e()),
  d = (e, t) => {
    let r = +/^[a-z0-9]{32}$/.test(e);
    return (t && (r &= +/^[a-zA-Z0-9]{40}$/.test(t)), !!r);
  },
  p = (e) => {
    const t = atob(e.split(".")[1]);
    return JSON.parse(t);
  };
function u(e, t) {
  let r = e.replace(/[-_]/g, (e) => ("-" === e ? "+" : "_" === e ? "/" : ""));
  const n = r.length % 4;
  return (2 === n ? (r += "==") : 3 === n && (r += "="), t ? r : atob(r));
}
const f = (e) => {
    const t = e.split(".");
    return {
      header: JSON.parse(u(t[0])),
      payload: JSON.parse(u(t[1])),
      signature: u(t[2], !0),
    };
  },
  _ = () => {
    throw new Error("mini-semaphore: inconsistent occurred");
  },
  y = (e, t) => {
    e.capacity > 0 ? (e.capacity--, t()) : e.q.push(t);
  },
  w = (e, t = !0) =>
    new Promise((r) => {
      t ? setTimeout(() => y(e, r), 4) : y(e, r);
    }),
  g = (e) => {
    (e.q.length ? (e.q.shift() || _)() : e.capacity++,
      e.capacity > e.limit &&
        (console.warn("inconsistent release!"), (e.capacity = e.limit)));
  },
  m = (e) =>
    ((e) => (
      (e >>>= 0),
      (e -= 1),
      (e |= e >> 1),
      (e |= e >> 2),
      (e |= e >> 4),
      (e |= e >> 8),
      1 + (e |= e >> 16)
    ))(Math.min(Math.max(16, 0 | e), 1073741824));
class b {
  constructor(e) {
    ((this._c = m(e)), (this._l = 0), (this._f = 0), (this._a = []));
  }
  push(e) {
    const t = this._l;
    this._c < t + 1 && k(this, m(1.5 * this._c + 16));
    const r = (this._f + t) & (this._c - 1);
    ((this._a[r] = e), (this._l = t + 1));
  }
  shift() {
    const e = this._l;
    if (0 === e) return;
    const t = this._f,
      r = this._a[t];
    return (
      (this._a[t] = void 0),
      (this._f = (t + 1) & (this._c - 1)),
      (this._l = e - 1),
      r
    );
  }
  get length() {
    return this._l;
  }
}
const k = (e, t) => {
    const r = e._c;
    e._c = t;
    const n = e._f + e._l;
    if (n > r) {
      const t = n & (r - 1);
      ((e, t, r, n, s) => {
        for (let o = 0; o < s; ++o)
          ((r[o + n] = e[o + t]), (e[o + t] = void 0));
      })(e._a, 0, e._a, r, t);
    }
  },
  v = w,
  $ = g,
  O = (e) => ({
    capacity: e,
    limit: e,
    q: new b(e),
    acquire(e) {
      return v(this, e);
    },
    release() {
      $(this);
    },
    setRestriction(e) {
      this.limit = this.capacity = e;
    },
    get pending() {
      return this.q.length;
    },
    async flow(e, t) {
      await v(this, t);
      try {
        return await e();
      } finally {
        $(this);
      }
    },
  }),
  { iw: j, tf: x, wC: S } = o,
  q = "login.eveonline.com",
  T = `https://${q}/v2/oauth`,
  C = O(5),
  P = O(20);
class E extends Error {}
class I {
  constructor(e) {
    const { clientId: t, clientSecret: r, callbackUrl: n, scopes: s } = e;
    let o = "";
    if (
      (x(t, r) || (o += "EVE clientId/clientSecret is invalid\n"),
      n || (o += "`callbackUrl` is required\n"),
      (s && s.length) || (o += "scopes is required\n"),
      o)
    )
      throw new E(o);
    ((this.clientId = t),
      (this.callbackUrl = n),
      (this.scopes = s),
      r && (this.appCredentials = btoa(`${t}:${r}`)));
  }
  cfo(e, t) {
    const r = {
        method: "POST",
        mode: "cors",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          host: q,
        },
      },
      n = encodeURIComponent(e);
    let s, o;
    if ("authorization_code" === t) {
      o = `grant_type=authorization_code&code=${n}`;
      const e = this.challenge;
      if ((s = !!e))
        o += `&client_id=${this.clientId}&code_verifier=${e.safe_code_verifier}`;
      else if (!this.appCredentials)
        throw new Error("createFetchOptions: unintended flow has been occurs");
    } else
      ((o = `grant_type=refresh_token&refresh_token=${n}`),
        (s = !this.appCredentials) && (o += `&client_id=${this.clientId}`));
    return (
      (r.body = o),
      s || (r.headers.authorization = `Basic ${this.appCredentials}`),
      r
    );
  }
  async checkTokenExpire(e, t) {
    if (t || (e.expires || 0) <= Date.now() + 2e4) {
      await P.acquire();
      try {
        const t = await this.refresh(e.refreshToken);
        return (
          (e.accessToken = t.accessToken),
          (e.refreshToken = t.refreshToken),
          (e.expires = t.expires),
          !0
        );
      } finally {
        P.release();
      }
    }
    return !1;
  }
  async createAuthorizeUrl(e, t = [], r = "login") {
    (e || (e = "code"), t.length || (t = this.scopes));
    const n = {
      response_type: e,
      redirect_uri: this.callbackUrl,
      client_id: this.clientId,
      scope: t.join(" "),
      state: r,
    };
    if ("code" === e && !this.appCredentials) {
      const e = await j();
      ((n.code_challenge = e.safe_code_challenge),
        (n.code_challenge_method = "S256"),
        (this.challenge = e));
    }
    return `${T}/authorize/?${new URLSearchParams(n) + ""}`;
  }
  async refresh(e) {
    const t = this.cfo(e, "refresh_token");
    let r;
    await C.acquire();
    try {
      r = await fetch(`${T}/token/`, t);
    } finally {
      C.release();
    }
    const n = await r.json();
    let s = null;
    switch (r.status) {
      case 200: {
        const e = Date.now() + 1e3 * n.expires_in;
        return {
          accessToken: n.access_token,
          refreshToken: n.refresh_token,
          expires: e,
        };
      }
      case 400:
      case 401:
      case 403:
        s = n && n.error ? n : `ERROR: code=${r.status}`;
        break;
      default:
        s = `unkown error, code=${r.status}`;
    }
    if (null !== s) throw "string" == typeof s ? new Error(s) : s;
    throw new Error("SSO refresh token failed...");
  }
  async revoke(e) {
    const t = {
      method: "POST",
      mode: "cors",
      headers: { "content-type": "application/x-www-form-urlencoded", host: q },
      body: `token_type_hint=refresh_token&token=${encodeURIComponent(e)}&client_id=${this.clientId}`,
    };
    let r;
    await C.acquire();
    try {
      r = await fetch(`${T}/revoke/`, t);
    } finally {
      C.release();
    }
    return 200 === r?.status;
  }
  async authCodeExchange(e, t) {
    const r = this.cfo(e, "authorization_code"),
      n = await fetch(`${T}/token/`, r).then((e) => e.json());
    t({
      characterId: ((e) => {
        const t = S(e);
        if (
          /(?:https:\/\/)?\b(?:sisilogin\.testeveonline|login\.eveonline)\.com/.test(
            t.iss,
          )
        )
          return {
            characterId: +t.sub.split(":")[2],
            name: t.name,
            scopes: t.scp,
            type: t.kid,
          };
        throw new Error(
          "The issuer claim was not from login.eveonline.com or sisilogin.testeveonline.com",
        );
      })(n.access_token).characterId,
      accessToken: n.access_token,
      refreshToken: n.refresh_token,
      expires: Date.now() + 1e3 * n.expires_in,
    });
  }
}
const U = w,
  R = g;
class z {
  constructor(e) {
    ((this.limit = this.capacity = e), (this.q = new b(e)));
  }
  acquire(e) {
    return U(this, e);
  }
  release() {
    R(this);
  }
  setRestriction(e) {
    this.limit = this.capacity = e;
  }
  get pending() {
    return this.q.length;
  }
  async flow(e, t) {
    await U(this, t);
    try {
      return await e();
    } finally {
      R(this);
    }
  }
}
var M;
!(function (e) {
  const { C: t } = i,
    r = new t(1);
  let n = Object.create(null);
  async function s(e, s, o) {
    const i = await (async (e, s) => {
        await r.acquire(!1);
        let o = n[e];
        if ((o || (n[e] = o = new t(s)), o.limit !== s))
          throw (
            r.release(),
            new ReferenceError(
              `Cannot get object with different restriction: key: '${e}', lock.limit: ${o.limit} <-> restriction: ${s},`,
            )
          );
        return (r.release(), o);
      })(e, s),
      a = i.flow(o);
    return ((i.last = Date.now()), a);
  }
  ((e.getLockByKey = async (e) => {
    await r.acquire(!1);
    const t = n[e];
    return (r.release(), t);
  }),
    (e.cleanup = async (e, t) => {
      await r.acquire(!1);
      const s = n,
        o = Object.create(null),
        i = Object.keys(s);
      let a,
        c = 0;
      (!e && (e = 1), (e *= 1e3), t && (a = []));
      for (let r = 0, n = i.length; r < n; ) {
        const n = i[r++],
          l = s[n];
        l.last && Date.now() - l.last >= e ? (c++, t && a.push(n)) : (o[n] = l);
      }
      return (
        (n = o),
        r.release(),
        t &&
          console.log(
            `eliminated: [\n${a.join(",\n")}\n]\nlived: [\n${Object.keys(o).join(",\n")}\n]`,
          ),
        c
      );
    }),
    (e.multi = s),
    (e.one = async function (e, t) {
      return s(e, 1, t);
    }));
})(M || (M = {}));
const D = "v1.3.13",
  A = c,
  J = h,
  N = f,
  B = p,
  L = d,
  W = "v0.15.10";
let F;
const H = (e) => {
    F = e;
  },
  K = c
    ? ""
    : location.host.length > 0 && location.protocol.startsWith("http")
      ? `${location.protocol}//${location.host}/callback/`
      : "http://localhost/callback/",
  V = () => {
    const e = { ...F };
    return (e.callbackUrl || (e.callbackUrl = K), new I(e));
  };
export {
  a as MiniSema,
  K as REDIRECT_URI_DEFAULT,
  V as createOAuthClient,
  J as gcc,
  B as getJWTPayload,
  A as isNode,
  H as setConfiguration,
  N as toJWT,
  L as validateAppIdSecret,
  W as version,
};
