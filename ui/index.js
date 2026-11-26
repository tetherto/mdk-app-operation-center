import { useMdkApp as oe, useQuery as Ie, useQueryClient as Ls, useMutation as Fs, defineMdkApp as Us, MDK_APP_PANEL_SLOT as Ws } from "@tetherto/mdk-react-adapter";
import { generatePath as To, useParams as js, useNavigate as $n, Link as ko, useSearchParams as xs } from "react-router";
import { jsx as l, jsxs as m, Fragment as We } from "react/jsx-runtime";
import { ExportIcon as Oo, ErrorCard as ne, HeaderStatsBar as Hs, HeaderMinersBox as Ks, HeaderHashrateBox as Bs, HeaderConsumptionBox as Vs, HeaderEfficiencyBox as Js, Typography as K, Loader as Co, LineChartCard as Ys, CHART_COLORS as an, DateRangePicker as Gs, Select as Xe, SelectTrigger as Qe, SelectValue as et, SelectContent as tt, SelectItem as ke, AlertDialog as qs, AlertDialogContent as Xs, AlertDialogHeader as Qs, AlertDialogTitle as ea, AlertDialogDescription as ta, AlertDialogFooter as na, AlertDialogCancel as ra, AlertDialogAction as oa, useNotification as Io, Button as J, Input as No, Slider as lt, Spinner as at, Tabs as Po, TabsList as Ro, TabsTrigger as cn, TabsContent as $e, Pagination as ia, DataTable as zn, Card as ae, EmptyState as sa, MinersActivityChart as aa, SingleStatCard as ut } from "@tetherto/mdk-react-devkit";
import { mdkFetch as Ao, MdkFetchError as ze, authStore as ca } from "@tetherto/mdk-ui-foundation";
import { useRef as Mn, useEffect as Me, useState as R, useMemo as de, useCallback as $o, useId as la, useLayoutEffect as zo, useReducer as ua } from "react";
const se = {
  DASHBOARD: "",
  SITE_OVERVIEW: "site-overview",
  SITE_EFFICIENCY: "site-efficiency",
  EXPLORER: "explorer",
  CONTAINER_DETAIL: "explorer/containers/:id/:tab?"
}, Mo = (e) => `../${To(se.CONTAINER_DETAIL, { id: e })}`, X = {
  LAYOUT: "layout",
  POWER_ADJUSTMENT: "power-adjustment",
  CHARTS: "charts",
  HEATMAP: "heatmap"
}, da = Object.values(X), Zo = (e) => e !== void 0 && da.includes(e), hr = {
  explorer: `../${se.EXPLORER}`,
  siteOverview: `../${se.SITE_OVERVIEW}`,
  tab: (e, t) => `../${To(se.CONTAINER_DETAIL, { id: e, tab: t })}`
};
function ln(e) {
  const t = Object.values(e).filter((r) => typeof r == "number");
  return Object.entries(e).filter(([r, o]) => t.indexOf(+r) === -1).map(([r, o]) => o);
}
function pr(e, t = "|") {
  return e.map((n) => Wo(n)).join(t);
}
function un(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
class fa {
  constructor(t) {
    this._getter = t, this._value = void 0;
  }
  get value() {
    const t = this._getter;
    return t !== void 0 && (this._value = t(), this._getter = void 0), this._value;
  }
}
function Pt(e) {
  return new fa(e);
}
function ha(e) {
  return e == null;
}
function Zn(e) {
  const t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, n);
}
function pa(e, t) {
  const n = e / t, r = Math.round(n), o = 4 * Number.EPSILON * Math.max(Math.abs(n), 1);
  return Math.abs(n - r) < o ? 0 : n - r;
}
function ve(e, t, n) {
  Object.defineProperty(e, t, {
    value: n,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function Dn(e) {
  const t = Object.getOwnPropertyDescriptor(e, "shape");
  return t?.get ? t.get.raw : t?.value;
}
function le(e) {
  return Dn(e._zod.def) ?? e._zod.def.shape;
}
function Do(e, t, n) {
  Object.defineProperty(e, t, {
    get() {
      const r = n();
      return ve(this, t, r), r;
    },
    enumerable: !0,
    configurable: !0
  });
}
function Lo(e, t, n) {
  t in e ? ve(e, t, n) : e[t] = n;
}
function Oe(e, t, n, r) {
  const o = le(t);
  for (const i of n) {
    const s = Object.getOwnPropertyDescriptor(o, i);
    s.enumerable && (s.get ? Do(e, i, () => {
      const a = t._zod.def.shape[i];
      return r ? r(a, i) : a;
    }) : Lo(e, i, r ? r(s.value, i) : s.value));
  }
}
function ma(e, t) {
  for (const n of Reflect.ownKeys(t)) {
    const r = Object.getOwnPropertyDescriptor(t, n);
    r.enumerable && (r.get ? Do(e, n, () => t[n]) : Lo(e, n, r.value));
  }
}
function H(...e) {
  const t = {};
  for (const n of e) {
    const r = Object.getOwnPropertyDescriptors(n);
    Object.assign(t, r);
  }
  return Object.defineProperties({}, t);
}
function _a(e) {
  return JSON.stringify(e);
}
function ga(e) {
  return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const Fo = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {
};
function nt(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const va = /* @__PURE__ */ Pt(() => {
  if (re.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare"))
    return !1;
  try {
    const e = Function;
    return new e(""), !0;
  } catch {
    return !1;
  }
});
function rt(e) {
  if (nt(e) === !1)
    return !1;
  const t = e.constructor;
  if (t === void 0 || typeof t != "function")
    return !0;
  const n = t.prototype;
  return !(nt(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
function Uo(e) {
  return rt(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
const ba = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function Ze(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function be(e, t, n) {
  const r = new e._zod.constr(t ?? e._zod.def);
  return (!t || n?.parent) && (r._zod.parent = e), r;
}
function b(e) {
  const t = e;
  if (!t)
    return {};
  if (typeof t == "string")
    return { error: () => t };
  if (t?.message !== void 0) {
    if (t?.error !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    t.error = t.message;
  }
  return delete t.message, typeof t.error == "string" ? { ...t, error: () => t.error } : t;
}
function Wo(e) {
  return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function ya(e) {
  return Object.keys(e).filter((t) => e[t]._zod.optin !== void 0 && e[t]._zod.optout === "optional");
}
const jo = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, wa = {
  int64: [/* @__PURE__ */ BigInt("-9223372036854775808"), /* @__PURE__ */ BigInt("9223372036854775807")],
  uint64: [/* @__PURE__ */ BigInt(0), /* @__PURE__ */ BigInt("18446744073709551615")]
};
function Ea(e, t) {
  const n = e._zod.def, r = n.checks;
  if (r && r.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  const i = {};
  return Oe(i, e, Rt(e, t)), be(e, H(n, { shape: i, checks: [] }));
}
function Rt(e, t) {
  const n = le(e), r = [];
  for (const o of Reflect.ownKeys(t)) {
    if (!Object.getOwnPropertyDescriptor(n, o)?.enumerable)
      throw new Error(`Unrecognized key: "${String(o)}"`);
    t[o] && r.push(o);
  }
  return r;
}
function Sa(e, t) {
  const n = e._zod.def, r = n.checks;
  if (r && r.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const i = new Set(Rt(e, t)), s = {};
  return Oe(s, e, Reflect.ownKeys(le(e)).filter((a) => !i.has(a))), be(e, H(n, { shape: s, checks: [] }));
}
function Ta(e, t) {
  if (!rt(t))
    throw new Error("Invalid input to extend: expected a plain object");
  const n = e._zod.def.checks;
  if (n && n.length > 0) {
    const o = le(e);
    for (const i of Reflect.ownKeys(t))
      if (Object.getOwnPropertyDescriptor(o, i) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  return be(e, H(e._zod.def, { shape: xo(e, t) }));
}
function xo(e, t) {
  const n = {};
  return Oe(n, e, Reflect.ownKeys(le(e))), ma(n, t), n;
}
function ka(e, t) {
  if (!rt(t))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  return be(e, H(e._zod.def, { shape: xo(e, t) }));
}
function Oa(e, t) {
  if (!t?._zod?.def)
    throw new Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
  if (e._zod.def.checks?.length)
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  const n = {};
  Oe(n, e, Reflect.ownKeys(le(e))), Oe(n, t, Reflect.ownKeys(le(t)));
  const r = H(e._zod.def, {
    shape: n,
    get catchall() {
      return t._zod.def.catchall;
    },
    checks: t._zod.def.checks ?? []
  });
  return be(e, r);
}
function mr(e, t, n, r = "partial") {
  const i = t._zod.def.checks;
  if (i && i.length > 0)
    throw new Error(`.${r}() cannot be used on object schemas containing refinements`);
  const a = n ? new Set(Rt(t, n)) : void 0, c = {};
  return Oe(c, t, Reflect.ownKeys(le(t)), e && ((u, d) => a && !a.has(d) ? u : new e({ type: "optional", innerType: u }))), be(t, H(t._zod.def, { shape: c, checks: [] }));
}
function Ca(e, t, n) {
  const r = n ? new Set(Rt(t, n)) : void 0, o = {};
  return Oe(o, t, Reflect.ownKeys(le(t)), (i, s) => (
    // overwrite with non-optional
    r && !r.has(s) ? i : new e({ type: "nonoptional", innerType: i })
  )), be(t, H(t._zod.def, { shape: o }));
}
function ce(e, t = 0) {
  if (e.aborted === !0)
    return !0;
  for (let n = t; n < e.issues.length; n++)
    if (e.issues[n]?.continue !== !0)
      return !0;
  return !1;
}
function Ia(e, t = 0) {
  if (e.aborted === !0)
    return !0;
  for (let n = t; n < e.issues.length; n++)
    if (e.issues[n]?.continue === !1)
      return !0;
  return !1;
}
function Ho(e, t) {
  return t.map((n) => {
    var r;
    return (r = n).path ?? (r.path = []), n.path.unshift(e), n;
  });
}
function Ke(e) {
  return typeof e == "string" ? e : e?.message;
}
function _r(e) {
  const t = [];
  for (const n of e ?? []) {
    const r = n._zod.def;
    if (!/_(length|size)$|_equals$/.test(r.check))
      break;
    const o = r.maximum ?? r.length ?? r.size;
    o >= 0 && t.push([o, n]);
  }
  return t;
}
function dn(e, t, n) {
  var r;
  for (let o = t; o < e.length; o++)
    (r = e[o]).schema ?? (r.schema = n);
}
function je(e, t, n) {
  var r;
  const o = e.inst?._zod?.traits;
  o?.has("$ZodType") && (o.has("$ZodCheck") ? (r = e).schema ?? (r.schema = e.inst) : e.schema = e.inst);
  const i = e.schema !== e.inst ? e.schema?._zod.def?.error : void 0, s = e.message ? e.message : Ke(e.inst?._zod.def?.error?.(e)) ?? Ke(i?.(e)) ?? Ke(t?.error?.(e)) ?? Ke(n.customError?.(e)) ?? Ke(n.localeError?.(e)) ?? "Invalid input", a = {};
  for (const c of Object.keys(e))
    c === "inst" || c === "schema" || c === "continue" || c === "input" || c === "__proto__" || (a[c] = e[c]);
  return a.path ?? (a.path = []), a.message = s, t?.reportInput && (a.input = e.input), a;
}
const Na = /[\uD800-\uDBFF]/;
function Ln(e) {
  const t = e.length;
  if (!Na.test(e))
    return t;
  let n = t;
  for (let r = 0; r < t - 1; r++)
    (e.charCodeAt(r) & 64512) === 55296 && (e.charCodeAt(r + 1) & 64512) === 56320 && (n--, r++);
  return n;
}
function Fn(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Pa(e) {
  const t = typeof e;
  switch (t) {
    case "number":
      return Number.isNaN(e) ? "nan" : "number";
    case "object": {
      if (e === null)
        return "null";
      if (Array.isArray(e))
        return "array";
      const n = e;
      if (n && Object.getPrototypeOf(n) !== Object.prototype && "constructor" in n && n.constructor)
        return n.constructor.name;
    }
  }
  return t;
}
function ot(...e) {
  const [t, n, r] = e;
  return typeof t == "string" ? {
    message: t,
    code: "custom",
    input: n,
    inst: r
  } : { ...t };
}
function Ra(e, t) {
  for (const n in t) {
    const r = Object.getOwnPropertyDescriptor(t, n);
    r.get ? Object.defineProperty(e, n, { ...r, enumerable: !1 }) : Aa(e, n, r.value);
  }
}
function me(e, t, n, r = !0) {
  return Object.defineProperty(e, t, { configurable: !0, writable: !0, enumerable: r, value: n }), n;
}
function Ko(e, t, n) {
  return me(e, t, n, !1);
}
function Bo(e, t) {
  for (const n in e) {
    const r = e[n];
    Object.defineProperty(t, n, {
      configurable: !0,
      enumerable: !0,
      get() {
        return me(this, n, r(this));
      },
      set(o) {
        me(this, n, o);
      }
    });
  }
  return t;
}
function Aa(e, t, n) {
  Object.defineProperty(e, t, {
    configurable: !0,
    get() {
      return this == null ? n : me(this, t, n.bind(this));
    },
    set(r) {
      me(this, t, r);
    }
  });
}
function $a(e, t) {
  const n = Object.getPrototypeOf(e);
  return t in n ? void 0 : n;
}
let Kt, pe = !1;
const za = {
  configurable: !0,
  get() {
    pe = !0;
  }
};
function k(e, t, n) {
  const r = Object.getPrototypeOf(e._zod);
  if (t in r && Kt !== e._zod) {
    Kt = void 0;
    return;
  }
  Kt = e._zod, Object.defineProperty(r, t, {
    configurable: !0,
    get() {
      Object.defineProperty(this, t, za);
      const o = pe;
      pe = !1;
      try {
        const i = n(this);
        return pe ? delete this[t] : Object.defineProperty(this, t, { configurable: !0, writable: !0, value: i }), pe = pe || o, i;
      } catch (i) {
        throw delete this[t], pe = pe || o, i;
      }
    },
    set(o) {
      Object.defineProperty(this, t, { configurable: !0, writable: !0, value: o });
    }
  });
}
function Ma(e, t, n, r) {
  const o = $a(e, t);
  o && Object.defineProperty(o, t, {
    configurable: !0,
    get() {
      const i = { configurable: !0, writable: !0, enumerable: r, value: void 0 };
      return Object.defineProperty(this, t, i), i.value = n(this), Object.defineProperty(this, t, i), i.value;
    },
    set(i) {
      Object.defineProperty(this, t, { configurable: !0, writable: !0, enumerable: r, value: i });
    }
  });
}
const Za = "~constantCatch";
function Da(e) {
  const t = () => e;
  return t[Za] = !0, t;
}
var gr;
const Bt = { value: void 0, enumerable: !1 };
let vr = "captureStackTrace" in Error ? Error : null;
function La(e) {
  const t = vr;
  if (t) {
    const n = t.stackTraceLimit;
    if (typeof n == "number") {
      try {
        t.stackTraceLimit = 0;
      } catch {
        return vr = null, new e();
      }
      try {
        return new e();
      } finally {
        t.stackTraceLimit = n;
      }
    }
  }
  return new e();
}
function f(e, t, n, r) {
  const o = {};
  function i(p) {
    this.def = p, this.constr = h, this.traits = /* @__PURE__ */ new Set();
  }
  i.prototype = o;
  const s = n, a = s && /* @__PURE__ */ new WeakSet();
  function c(p, g) {
    if (p._zod) {
      if (p._zod.traits.has(e))
        return;
    } else {
      Bt.value = new i(g);
      try {
        Object.defineProperty(p, "_zod", Bt);
      } finally {
        Bt.value = void 0;
      }
    }
    if (p._zod.traits.add(e), t(p, g), a) {
      const y = Object.getPrototypeOf(p), v = p._zod.constr.prototype;
      let T = y;
      for (; T && T !== v; )
        T = Object.getPrototypeOf(T);
      const U = T ?? y;
      a.has(U) || (a.add(U), Ra(U, s));
    }
    const _ = h.prototype;
    for (const y in _)
      Object.prototype.hasOwnProperty.call(_, y) && (y in p || (p[y] = _[y].bind(p)));
  }
  const u = r?.Parent ?? Object;
  class d extends u {
  }
  Object.defineProperty(d, "name", { value: e });
  function h(p) {
    const g = r?.Parent ? La(d) : this;
    c(g, p);
    const _ = g._zod.deferred;
    if (_) {
      for (const v of _)
        v();
      g._zod.deferred = void 0;
    }
    const y = globalThis.__zod_globalConfig?.postProcessor;
    return y && y(g), g;
  }
  return Object.defineProperty(h, "init", { value: c }), Object.defineProperty(h, Symbol.hasInstance, {
    value: (p) => r?.Parent && p instanceof r.Parent ? !0 : p?._zod?.traits?.has(e)
  }), Object.defineProperty(h, "name", { value: e }), h;
}
class Te extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class Vo extends Error {
  constructor(t) {
    super(`Encountered unidirectional transform during encode: ${t}`), this.name = "ZodEncodeError";
  }
}
(gr = globalThis).__zod_globalConfig ?? (gr.__zod_globalConfig = {});
const re = globalThis.__zod_globalConfig;
function ye(e) {
  return e && Object.assign(re, e), re;
}
function Fa() {
  const e = this._zod;
  return e.message ?? (e.message = JSON.stringify(e.def, un, 2)), e.message;
}
function Ua(e) {
  this._zod.message = e;
}
const Wa = {
  get: Fa,
  set: Ua,
  enumerable: !0,
  configurable: !0
}, Vt = { value: void 0, enumerable: !1 }, br = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]), ja = (e, t) => {
  e.name = "$ZodError", Vt.value = t, Object.defineProperty(e, "issues", Vt), Vt.value = void 0, Object.defineProperty(e, "message", Wa);
  const n = Object.getPrototypeOf(e);
  br.has(n) || (br.add(n), Object.defineProperty(n, "toString", {
    configurable: !0,
    enumerable: !1,
    get() {
      const r = () => this.message;
      return Object.defineProperty(this, "toString", { value: r, configurable: !0, writable: !0 }), r;
    },
    set(r) {
      Object.defineProperty(this, "toString", { value: r, configurable: !0, writable: !0 });
    }
  }));
}, xa = f("$ZodError", ja);
function Ha(e, t, n) {
  return Object.prototype.hasOwnProperty.call(e, t) || (t === "__proto__" ? Object.defineProperty(e, t, { value: n(), writable: !0, enumerable: !0, configurable: !0 }) : e[t] = n()), e[t];
}
function Ka(e, t = (n) => n.message) {
  const n = {}, r = [];
  for (const o of e.issues)
    o.path.length > 0 ? Ha(n, o.path[0], () => []).push(t(o)) : r.push(t(o));
  return { formErrors: r, fieldErrors: n };
}
function Ba(e, t = (n) => n.message) {
  const n = { _errors: [] }, r = (o, i = []) => {
    for (const s of o.issues)
      if (s.code === "invalid_union" && s.errors.length)
        s.errors.map((a) => r({ issues: a }, [...i, ...s.path]));
      else if (s.code === "invalid_key")
        r({ issues: s.issues }, [...i, ...s.path]);
      else if (s.code === "invalid_element")
        r({ issues: s.issues }, [...i, ...s.path]);
      else {
        const a = [...i, ...s.path];
        if (a.length === 0)
          n._errors.push(t(s));
        else {
          let c = n, u = 0;
          for (; u < a.length; ) {
            const d = a[u], h = u === a.length - 1;
            if (d === "_errors") {
              h && c._errors.push(t(s)), u++;
              continue;
            }
            Object.prototype.hasOwnProperty.call(c, d) || Object.defineProperty(c, d, {
              value: { _errors: [] },
              enumerable: !0,
              writable: !0,
              configurable: !0
            });
            const p = c[d];
            h && p._errors.push(t(s)), c = p, u++;
          }
        }
      }
  };
  return r(e), n;
}
function At(e, t) {
  return { callee: t?.callee ?? e, Err: t?.Err };
}
const Un = (e) => {
  const t = (n, r, o, i) => {
    const s = o ? { ...o, async: !1 } : { async: !1 }, a = n._zod.run({ value: r, issues: [] }, s);
    if (a instanceof Promise)
      throw new Te();
    if (a.issues.length) {
      const c = new (i?.Err ?? e)(a.issues.map((u) => je(u, s, ye())));
      throw Fo(c, i?.callee ?? t), c;
    }
    return a.value;
  };
  return t;
}, Wn = (e) => {
  const t = async (n, r, o, i) => {
    const s = o ? { ...o, async: !0 } : { async: !0 };
    let a = n._zod.run({ value: r, issues: [] }, s);
    if (a instanceof Promise && (a = await a), a.issues.length) {
      const c = new (i?.Err ?? e)(a.issues.map((u) => je(u, s, ye())));
      throw Fo(c, i?.callee ?? t), c;
    }
    return a.value;
  };
  return t;
}, jn = (e) => (t, n, r) => {
  const o = r ? { ...r, async: !1 } : { async: !1 }, i = t._zod.run({ value: n, issues: [] }, o);
  if (i instanceof Promise)
    throw new Te();
  return i.issues.length ? Jo(e, i.issues, o) : { success: !0, data: i.value };
};
function Jo(e, t, n) {
  let r;
  return {
    success: !1,
    get error() {
      return r || (r = new e(t.map((o) => je(o, n, ye()))), t = void 0, n = void 0), r;
    },
    set error(o) {
      r = o, t = void 0, n = void 0;
    }
  };
}
const xn = (e) => async (t, n, r) => {
  const o = r ? { ...r, async: !0 } : { async: !0 };
  let i = t._zod.run({ value: n, issues: [] }, o);
  return i instanceof Promise && (i = await i), i.issues.length ? Jo(e, i.issues, o) : { success: !0, data: i.value };
}, Va = /* @__PURE__ */ Symbol.for("zod.compile.invalid"), Ja = /* @__PURE__ */ Symbol.for("zod.compile.fallback"), Ya = ((e, t, n) => {
  const r = e._zod.bag.validator;
  if (r !== void 0) {
    if (r(t) !== Va)
      return !0;
    if (r.definite === !0 && n === void 0)
      return !1;
  }
  return Ga(e, t, n);
});
function Ga(e, t, n) {
  const r = n ? { ...n, async: !1, abortEarly: !0 } : { async: !1, abortEarly: !0 }, o = e._zod.bag.fallbackRun;
  let i;
  if (o ? (r[Ja] = !0, i = o({ value: t, issues: [] }, r)) : i = e._zod.run({ value: t, issues: [] }, r), i instanceof Promise)
    throw new Te();
  return i.issues.length === 0;
}
const qa = async (e, t, n) => {
  const r = n ? { ...n, async: !0, abortEarly: !0 } : { async: !0, abortEarly: !0 };
  let o = e._zod.run({ value: t, issues: [] }, r);
  return o instanceof Promise && (o = await o), o.issues.length === 0;
}, Xa = (e) => {
  const t = Un(e), n = (r, o, i, s) => {
    const a = i ? { ...i, direction: "backward" } : { direction: "backward" };
    return t(r, o, a, At(n, s));
  };
  return n;
}, Qa = (e) => {
  const t = Un(e), n = (r, o, i, s) => t(r, o, i, At(n, s));
  return n;
}, ec = (e) => {
  const t = Wn(e), n = async (r, o, i, s) => {
    const a = i ? { ...i, direction: "backward" } : { direction: "backward" };
    return await t(r, o, a, At(n, s));
  };
  return n;
}, tc = (e) => {
  const t = Wn(e), n = async (r, o, i, s) => await t(r, o, i, At(n, s));
  return n;
}, nc = (e) => (t, n, r) => {
  const o = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return jn(e)(t, n, o);
}, rc = (e) => (t, n, r) => jn(e)(t, n, r), oc = (e) => async (t, n, r) => {
  const o = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return xn(e)(t, n, o);
}, ic = (e) => async (t, n, r) => xn(e)(t, n, r), sc = /^[cC][0-9a-z]{6,}$/, ac = /^[0-9a-z]+$/, cc = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/, lc = /^[0-9a-vA-V]{20}$/, uc = /^[A-Za-z0-9]{27}$/, dc = /^[a-zA-Z0-9_-]{21}$/;
function fc(e) {
  return new RegExp(`^[a-zA-Z0-9_-]{${e}}$`);
}
const hc = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, pc = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, yr = (e) => e ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, mc = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, _c = "^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$";
function gc() {
  return new RegExp(_c, "u");
}
const vc = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, bc = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, yc = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, wc = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Ec = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, Sc = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/, Tc = /^https?$/, kc = /^\+[1-9]\d{6,14}$/, Yo = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
function Oc(e) {
  return new RegExp(`^${e}$`);
}
const Cc = /* @__PURE__ */ Oc(Yo);
function fn(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : e.seconds ? `${t}:[0-5]\\d(?:\\.\\d+)?` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function Ic(e) {
  return new RegExp(`^${fn(e)}$`);
}
function Nc(e) {
  const t = ["Z"];
  e.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const n = `${fn({ precision: e.precision, seconds: !0 })}(?:${t.join("|")})`, r = e.local ? `${n}|${fn({ precision: e.precision })}` : n;
  return new RegExp(`^${Yo}T(?:${r})$`);
}
const Pc = /^[\s\S]{0,}$/, Rc = /^-?\d+(?:\.\d+)?$/, Ac = /^(?:true|false)$/i, $c = /^[^A-Z]*$/, zc = /^[^a-z]*$/, x = /* @__PURE__ */ f("$ZodCheck", (e, t) => {
  var n;
  e._zod ?? (e._zod = {}), e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), Hn = (e) => {
  const t = e.value;
  return !ha(t) && t.length !== void 0;
}, wt = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, Go = /* @__PURE__ */ f("$ZodCheckLessThan", (e, t) => {
  x.init(e, t);
  const n = wt[typeof t.value];
  e._zod.check = (r) => {
    (t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
      origin: wt[typeof r.value] ?? n,
      code: "too_big",
      maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
      input: r.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), qo = /* @__PURE__ */ f("$ZodCheckGreaterThan", (e, t) => {
  x.init(e, t);
  const n = wt[typeof t.value];
  e._zod.check = (r) => {
    (t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
      origin: wt[typeof r.value] ?? n,
      code: "too_small",
      minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
      input: r.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), Mc = /* @__PURE__ */ f("$ZodCheckMultipleOf", (e, t) => {
  x.init(e, t), e._zod.check = (n) => {
    if (typeof n.value != typeof t.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof n.value == "bigint" ? (
      // `value % 0n` throws, and nothing is a multiple of zero — the number branch already fails this way via NaN
      t.value !== BigInt(0) && n.value % t.value === BigInt(0)
    ) : pa(n.value, t.value) === 0) || n.issues.push({
      origin: typeof n.value,
      code: "not_multiple_of",
      divisor: t.value,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Zc = /* @__PURE__ */ f("$ZodCheckNumberFormat", (e, t) => {
  x.init(e, t), t.format = t.format || "float64";
  const n = t.format?.includes("int"), r = n ? "int" : "number", [o, i] = jo[t.format];
  e._zod.check = (s) => {
    const a = s.value;
    if (n) {
      if (!Number.isInteger(a)) {
        s.issues.push({
          expected: r,
          format: t.format,
          code: "invalid_type",
          continue: !1,
          input: a,
          inst: e
        });
        return;
      }
      if (!Number.isSafeInteger(a)) {
        a > 0 ? s.issues.push({
          input: a,
          code: "too_big",
          maximum: Number.MAX_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: r,
          inclusive: !0,
          continue: !t.abort
        }) : s.issues.push({
          input: a,
          code: "too_small",
          minimum: Number.MIN_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: r,
          inclusive: !0,
          continue: !t.abort
        });
        return;
      }
    }
    a < o && s.issues.push({
      origin: "number",
      input: a,
      code: "too_small",
      minimum: o,
      inclusive: !0,
      inst: e,
      continue: !t.abort
    }), a > i && s.issues.push({
      origin: "number",
      input: a,
      code: "too_big",
      maximum: i,
      inclusive: !0,
      inst: e,
      continue: !t.abort
    });
  };
}), Dc = /* @__PURE__ */ f("$ZodCheckMaxLength", (e, t) => {
  var n;
  x.init(e, t), (n = e._zod.def).when ?? (n.when = Hn), e._zod.check = (r) => {
    const o = r.value, i = o.length;
    if ((typeof o == "string" && i > t.maximum ? Ln(o) : i) <= t.maximum)
      return;
    const a = Fn(o);
    r.issues.push({
      origin: a,
      code: "too_big",
      maximum: t.maximum,
      inclusive: !0,
      input: o,
      inst: e,
      continue: !t.abort
    });
  };
}), Lc = /* @__PURE__ */ f("$ZodCheckMinLength", (e, t) => {
  var n;
  x.init(e, t), (n = e._zod.def).when ?? (n.when = Hn), e._zod.check = (r) => {
    const o = r.value, i = o.length;
    if ((typeof o == "string" && i >= t.minimum && i < t.minimum * 2 ? Ln(o) : i) >= t.minimum)
      return;
    const a = Fn(o);
    r.issues.push({
      origin: a,
      code: "too_small",
      minimum: t.minimum,
      inclusive: !0,
      input: o,
      inst: e,
      continue: !t.abort
    });
  };
}), Fc = /* @__PURE__ */ f("$ZodCheckLengthEquals", (e, t) => {
  var n;
  x.init(e, t), (n = e._zod.def).when ?? (n.when = Hn), e._zod.check = (r) => {
    const o = r.value, i = o.length, s = typeof o == "string" && i >= t.length && i <= t.length * 2 ? Ln(o) : i;
    if (s === t.length)
      return;
    const a = Fn(o), c = s > t.length;
    r.issues.push({
      origin: a,
      ...c ? { code: "too_big", maximum: t.length } : { code: "too_small", minimum: t.length },
      inclusive: !0,
      exact: !0,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), $t = /* @__PURE__ */ f("$ZodCheckStringFormat", (e, t) => {
  var n, r;
  x.init(e, t), t.pattern ? (n = e._zod).check ?? (n.check = (o) => {
    t.pattern.lastIndex = 0, !t.pattern.test(o.value) && o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: t.format,
      input: o.value,
      ...t.pattern ? { pattern: t.pattern.toString() } : {},
      inst: e,
      continue: !t.abort
    });
  }) : (r = e._zod).check ?? (r.check = () => {
  });
}), Uc = /* @__PURE__ */ f("$ZodCheckRegex", (e, t) => {
  $t.init(e, t), e._zod.check = (n) => {
    t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: n.value,
      pattern: t.pattern.toString(),
      inst: e,
      continue: !t.abort
    });
  };
}), Wc = /* @__PURE__ */ f("$ZodCheckLowerCase", (e, t) => {
  t.pattern ?? (t.pattern = $c), $t.init(e, t);
}), jc = /* @__PURE__ */ f("$ZodCheckUpperCase", (e, t) => {
  t.pattern ?? (t.pattern = zc), $t.init(e, t);
}), xc = /* @__PURE__ */ f("$ZodCheckIncludes", (e, t) => {
  x.init(e, t);
  const n = Ze(t.includes), r = new RegExp(typeof t.position == "number" ? `^.{${t.position},}${n}` : n);
  t.pattern = r, e._zod.check = (o) => {
    o.value.includes(t.includes, t.position) || o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: t.includes,
      input: o.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Hc = /* @__PURE__ */ f("$ZodCheckStartsWith", (e, t) => {
  x.init(e, t);
  const n = new RegExp(`^${Ze(t.prefix)}.*`);
  t.pattern ?? (t.pattern = n), e._zod.check = (r) => {
    r.value.startsWith(t.prefix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: t.prefix,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Kc = /* @__PURE__ */ f("$ZodCheckEndsWith", (e, t) => {
  x.init(e, t);
  const n = new RegExp(`.*${Ze(t.suffix)}$`);
  t.pattern ?? (t.pattern = n), e._zod.check = (r) => {
    r.value.endsWith(t.suffix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: t.suffix,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Bc = /* @__PURE__ */ f("$ZodCheckOverwrite", (e, t) => {
  x.init(e, t), e._zod.check = (n) => {
    n.value = t.tx(n.value);
  };
});
class Vc {
  constructor(t = [], n = {}) {
    this.content = [], this.indent = 0, this.args = t, this.closed = n;
  }
  // the compiler catches a child's throw and keeps writing into this doc, so the indent has to unwind with it
  indented(t) {
    this.indent += 1;
    try {
      t(this);
    } finally {
      this.indent -= 1;
    }
  }
  write(t) {
    if (typeof t == "function") {
      t(this, { execution: "sync" }), t(this, { execution: "async" });
      return;
    }
    const r = t.split(`
`).filter((s) => s), o = Math.min(...r.map((s) => s.length - s.trimStart().length)), i = r.map((s) => s.slice(o)).map((s) => " ".repeat(this.indent * 2) + s);
    for (const s of i)
      this.content.push(s);
  }
  compile() {
    const t = Function, n = this?.content ?? [""];
    return new t(...Object.keys(this.closed), `return function (${this.args.join(", ")}) {
${n.join(`
`)}
};`)(...Object.values(this.closed));
  }
}
const Jc = {
  major: 4,
  minor: 6,
  patch: 7
}, $ = /* @__PURE__ */ f("$ZodType", (e, t) => {
  var n;
  e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = Jc;
  const r = e._zod.def.checks, o = e._zod.traits.has("$ZodCheck") ? [e, ...r ?? []] : r?.length ? [...r] : [];
  for (const i of o)
    for (const s of i._zod.onattach)
      s(e);
  if (o.length === 0)
    (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
      e._zod.run = e._zod.parse;
    });
  else {
    const i = (a, c, u) => {
      if (a.memo)
        return a;
      let d = ce(a), h;
      for (const p of c) {
        if (p._zod.def.when) {
          if (Ia(a) || !p._zod.def.when(a))
            continue;
        } else if (d)
          continue;
        const g = a.issues.length, _ = p._zod.check(a);
        if (_ instanceof Promise && u?.async === !1)
          throw new Te();
        if (h || _ instanceof Promise)
          h = (h ?? Promise.resolve()).then(async () => {
            await _, a.issues.length !== g && (dn(a.issues, g, e), d || (d = ce(a, g)));
          });
        else {
          if (a.issues.length === g)
            continue;
          dn(a.issues, g, e), d || (d = ce(a, g));
        }
      }
      return h ? h.then(() => a) : a;
    }, s = (a, c, u) => {
      if (ce(a))
        return a.aborted = !0, a;
      const d = i(c, o, u);
      if (d instanceof Promise) {
        if (u.async === !1)
          throw new Te();
        return d.then((h) => e._zod.parse(h, u));
      }
      return e._zod.parse(d, u);
    };
    e._zod.run = (a, c) => {
      if (c.skipChecks)
        return e._zod.parse(a, c);
      if (c.direction === "backward") {
        const d = e._zod.parse({ value: a.value, issues: [] }, { ...c, skipChecks: !0 });
        return d instanceof Promise ? d.then((h) => s(h, a, c)) : s(d, a, c);
      }
      const u = e._zod.parse(a, c);
      if (u instanceof Promise) {
        if (c.async === !1)
          throw new Te();
        return u.then((d) => i(d, o, c));
      }
      return i(u, o, c);
    };
  }
}, {
  // Wrappers extend this by installing a richer factory over it; reading it eagerly would defeat the laziness.
  get "~standard"() {
    return Ko(this, "~standard", Qo(this));
  },
  set "~standard"(e) {
    me(this, "~standard", e);
  }
}), Xo = (e, t) => e.issues.length ? { issues: e.issues.map((n) => je(n, t, ye())) } : { value: e.value };
async function Yc(e, t) {
  const n = { async: !0 };
  return Xo(await e._zod.run({ value: t, issues: [] }, n), n);
}
function Qo(e) {
  return {
    validate: (t) => {
      const n = { async: !1 };
      try {
        const r = e._zod.run({ value: t, issues: [] }, n);
        if (!(r instanceof Promise))
          return Xo(r, n);
      } catch {
      }
      return Yc(e, t);
    },
    vendor: "zod",
    version: 1
  };
}
const Kn = /* @__PURE__ */ f("$ZodString", (e, t) => {
  $.init(e, t), e._zod.pattern = t.pattern ?? Pc, e._zod.parse = (n, r) => {
    if (t.coerce)
      try {
        n.value = String(n.value);
      } catch {
      }
    return typeof n.value == "string" || n.issues.push({
      expected: "string",
      code: "invalid_type",
      input: n.value,
      inst: e
    }), n;
  };
}), P = /* @__PURE__ */ f("$ZodStringFormat", (e, t) => {
  $t.init(e, t), Kn.init(e, t);
}), Gc = /* @__PURE__ */ f("$ZodGUID", (e, t) => {
  t.pattern ?? (t.pattern = pc), P.init(e, t);
}), qc = /* @__PURE__ */ f("$ZodUUID", (e, t) => {
  if (t.version) {
    const r = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    }[t.version];
    if (r === void 0)
      throw new Error(`Invalid UUID version: "${t.version}"`);
    t.pattern ?? (t.pattern = yr(r));
  } else
    t.pattern ?? (t.pattern = yr());
  P.init(e, t);
}), Xc = /* @__PURE__ */ f("$ZodEmail", (e, t) => {
  t.pattern ?? (t.pattern = mc), P.init(e, t);
}), ei = 1, Et = 2;
function ti(e) {
  try {
    return typeof URL < "u" && typeof URL.canParse == "function" ? URL.canParse(e) : (new URL(e), !0);
  } catch {
    return !1;
  }
}
function Qc(e, t) {
  return !("normalize" in t) && !("hostname" in t) && !("protocol" in t) ? ti(e) || Et : el(e, t);
}
function el(e, t) {
  if (!t.normalize && t.protocol?.source === Tc.source && !/^https?:\/\//i.test(e))
    return ei;
  try {
    if (typeof URL < "u") {
      const n = URL;
      if (typeof n.parse == "function")
        return n.parse(e) ?? Et;
    }
    return new URL(e);
  } catch {
    return Et;
  }
}
const tl = /[\t\n\r]/g;
function wr(e) {
  return e.replace(tl, "");
}
function nl(e, t) {
  return t.lastIndex = 0, t.test(e.hostname);
}
function rl(e, t) {
  return t.lastIndex = 0, t.test(e.protocol.endsWith(":") ? e.protocol.slice(0, -1) : e.protocol);
}
const ol = /* @__PURE__ */ f("$ZodURL", (e, t) => {
  P.init(e, t), e._zod.check = (n) => {
    try {
      const r = n.value.trim(), o = Qc(r, t);
      if (o === ei) {
        n.issues.push({
          code: "invalid_format",
          format: "url",
          note: "Invalid URL format",
          input: n.value,
          inst: e,
          continue: !t.abort
        });
        return;
      }
      if (o === Et) {
        n.issues.push({
          code: "invalid_format",
          format: "url",
          input: n.value,
          inst: e,
          continue: !t.abort
        });
        return;
      }
      if (o === !0) {
        n.value = wr(r);
        return;
      }
      t.hostname && !nl(o, t.hostname) && n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: t.hostname.source,
        input: n.value,
        inst: e,
        continue: !t.abort
      }), t.protocol && !rl(o, t.protocol) && n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: t.protocol.source,
        input: n.value,
        inst: e,
        continue: !t.abort
      }), n.value = t.normalize ? o.href : wr(r);
      return;
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "url",
        input: n.value,
        inst: e,
        continue: !t.abort
      });
    }
  };
}), il = /* @__PURE__ */ f("$ZodEmoji", (e, t) => {
  t.pattern ?? (t.pattern = gc()), P.init(e, t);
}), sl = /* @__PURE__ */ f("$ZodNanoID", (e, t) => {
  if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1))
    throw new Error(`Invalid nanoid length: ${t.length}`);
  t.pattern ?? (t.pattern = t.length === void 0 ? dc : fc(t.length)), P.init(e, t);
}), al = /* @__PURE__ */ f("$ZodCUID", (e, t) => {
  t.pattern ?? (t.pattern = sc), P.init(e, t);
}), cl = /* @__PURE__ */ f("$ZodCUID2", (e, t) => {
  t.pattern ?? (t.pattern = ac), P.init(e, t);
}), ll = /* @__PURE__ */ f("$ZodULID", (e, t) => {
  t.pattern ?? (t.pattern = cc), P.init(e, t);
}), ul = /* @__PURE__ */ f("$ZodXID", (e, t) => {
  t.pattern ?? (t.pattern = lc), P.init(e, t);
}), dl = /* @__PURE__ */ f("$ZodKSUID", (e, t) => {
  t.pattern ?? (t.pattern = uc), P.init(e, t);
}), fl = /* @__PURE__ */ f("$ZodISODateTime", (e, t) => {
  t.pattern ?? (t.pattern = Nc(t)), P.init(e, t);
}), hl = /* @__PURE__ */ f("$ZodISODate", (e, t) => {
  t.pattern ?? (t.pattern = Cc), P.init(e, t);
}), pl = /* @__PURE__ */ f("$ZodISOTime", (e, t) => {
  t.pattern ?? (t.pattern = Ic(t)), P.init(e, t);
}), ml = /* @__PURE__ */ f("$ZodISODuration", (e, t) => {
  t.pattern ?? (t.pattern = hc), P.init(e, t);
}), _l = /* @__PURE__ */ f("$ZodIPv4", (e, t) => {
  t.pattern ?? (t.pattern = vc), P.init(e, t);
}), gl = /^[0-9a-fA-F:.]+$/;
function ni(e) {
  return gl.test(e) ? ti(`http://[${e}]`) : !1;
}
const vl = /* @__PURE__ */ f("$ZodIPv6", (e, t) => {
  t.pattern ?? (t.pattern = bc), P.init(e, t), e._zod.check = (n) => {
    ni(n.value) || n.issues.push({
      code: "invalid_format",
      format: "ipv6",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), bl = /* @__PURE__ */ f("$ZodCIDRv4", (e, t) => {
  t.pattern ?? (t.pattern = yc), P.init(e, t);
});
function yl(e) {
  const t = e.split("/");
  if (t.length !== 2)
    return !1;
  const [n, r] = t;
  if (!r)
    return !1;
  const o = Number(r);
  return `${o}` !== r || o < 0 || o > 128 ? !1 : ni(n);
}
const wl = /* @__PURE__ */ f("$ZodCIDRv6", (e, t) => {
  t.pattern ?? (t.pattern = wc), P.init(e, t), e._zod.check = (n) => {
    yl(n.value) || n.issues.push({
      code: "invalid_format",
      format: "cidrv6",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
});
function ri(e) {
  if (e === "")
    return !0;
  if (/\s/.test(e) || e.length % 4 !== 0)
    return !1;
  try {
    return atob(e), !0;
  } catch {
    return !1;
  }
}
const oi = /^[0-9a-zA-Z+/]*={0,2}$/, El = /* @__PURE__ */ f("$ZodBase64", (e, t) => {
  t.pattern ?? (t.pattern = oi), P.init(e, t), e._zod.check = (n) => {
    ri(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Bn = /^[A-Za-z0-9_-]*$/;
function Sl(e) {
  if (!Bn.test(e))
    return !1;
  const t = e.replace(/[-_]/g, (r) => r === "-" ? "+" : "/"), n = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return ri(n);
}
const Tl = /* @__PURE__ */ f("$ZodBase64URL", (e, t) => {
  t.pattern ?? (t.pattern = Bn), P.init(e, t), e._zod.check = (n) => {
    Sl(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), kl = /* @__PURE__ */ f("$ZodE164", (e, t) => {
  t.pattern ?? (t.pattern = kc), P.init(e, t);
});
function Ol(e, t = null) {
  try {
    const n = e.split(".");
    if (n.length !== 3)
      return !1;
    const [r] = n;
    if (!r)
      return !1;
    const o = JSON.parse(atob(r));
    return !("typ" in o && o?.typ !== "JWT" || !o.alg || t && (!("alg" in o) || o.alg !== t));
  } catch {
    return !1;
  }
}
const Cl = /* @__PURE__ */ f("$ZodJWT", (e, t) => {
  P.init(e, t), e._zod.check = (n) => {
    Ol(n.value, t.alg) || n.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), ii = /* @__PURE__ */ f("$ZodNumber", (e, t) => {
  $.init(e, t), e._zod.pattern = Rc, e._zod.parse = (n, r) => {
    if (t.coerce)
      try {
        n.value = Number(n.value);
      } catch {
      }
    const o = n.value;
    if (typeof o == "number" && !Number.isNaN(o) && Number.isFinite(o))
      return n;
    const i = typeof o == "number" ? Number.isNaN(o) ? "NaN" : Number.isFinite(o) ? void 0 : String(o) : void 0;
    return n.issues.push({
      expected: "number",
      code: "invalid_type",
      input: o,
      inst: e,
      ...i ? { received: i } : {}
    }), n;
  };
}), Il = /* @__PURE__ */ f("$ZodNumberFormat", (e, t) => {
  Zc.init(e, t), ii.init(e, t);
}), Nl = /* @__PURE__ */ f("$ZodBoolean", (e, t) => {
  $.init(e, t), e._zod.pattern = Ac, e._zod.parse = (n, r) => {
    if (t.coerce)
      try {
        n.value = !!n.value;
      } catch {
      }
    const o = n.value;
    return typeof o == "boolean" || n.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input: o,
      inst: e
    }), n;
  };
}), Pl = /* @__PURE__ */ f("$ZodUnknown", (e, t) => {
  $.init(e, t), e._zod.parse = (n) => n;
}), Rl = /* @__PURE__ */ f("$ZodNever", (e, t) => {
  $.init(e, t), e._zod.parse = (n, r) => (n.issues.push({
    expected: "never",
    code: "invalid_type",
    input: n.value,
    inst: e
  }), n);
});
function Al(e, t) {
  const n = _r(e._zod.def.checks);
  if (!n.length)
    return;
  const r = Math.min(...n.map((i) => i[0])), o = e._zod.parse;
  e._zod.parse = (i, s) => {
    const a = t(i.value);
    if (a > r && !s?.skipChecks && s?.direction !== "backward") {
      for (const [c, u] of _r(e._zod.def.checks))
        if (a > c && u._zod.def.when(i)) {
          const d = i.issues.length;
          return u._zod.check(i), i.issues[d].continue = !1, dn(i.issues, d, e), i;
        }
    }
    return o(i, s);
  };
}
const $l = (e) => Array.isArray(e) ? e.length : -1;
function Er(e, t, n) {
  e.issues.length && t.issues.push(...Ho(n, e.issues)), t.value[n] = e.value;
}
const zl = /* @__PURE__ */ f("$ZodArray", (e, t) => {
  $.init(e, t);
  const n = re.memoizer;
  n?.attach(e), e._zod.parse = (r, o) => {
    const i = r.value;
    if (!Array.isArray(i))
      return r.issues.push({
        expected: "array",
        code: "invalid_type",
        input: i,
        inst: e
      }), r;
    r.value = n ? n.alloc(e, r, Array(i.length), o) : Array(i.length);
    const s = [], a = o?.abortEarly;
    for (let c = 0; c < i.length; c++) {
      const u = i[c], d = t.element._zod.run({
        value: u,
        issues: []
      }, o);
      if (d instanceof Promise)
        s.push(d.then((h) => Er(h, r, c)));
      else if (Er(d, r, c), a && d.issues.length !== 0 && ce(d))
        break;
    }
    return s.length ? Promise.all(s).then(() => r) : r;
  }, Al(e, $l);
});
function St(e, t, n, r, o, i) {
  const s = n in r, a = i === "optional";
  if (!(!s && a && o === "optional")) {
    if (e.issues.length) {
      if (o !== void 0 && a && !s)
        return;
      t.issues.push(...Ho(n, e.issues));
    }
    if (!s && o === void 0) {
      e.issues.length || t.issues.push({
        code: "invalid_type",
        expected: "nonoptional",
        input: void 0,
        path: [n]
      });
      return;
    }
    e.value === void 0 ? (s || o === "defaulted" && !a) && (t.value[n] = void 0) : t.value[n] = e.value;
  }
}
const Ml = [];
function si(e) {
  const t = Object.keys(e.shape), n = Object.getOwnPropertySymbols(e.shape), r = n.length ? n : Ml, o = r.length ? [...t, ...r] : t;
  for (const s of o)
    if (!e.shape?.[s]?._zod?.traits?.has("$ZodType"))
      throw new Error(`Invalid element at key "${String(s)}": expected a Zod schema`);
  const i = ya(e.shape);
  return {
    ...e,
    allKeys: o,
    symbolKeys: r,
    // string-only: handleCatchall matches it against `for...in`, which never yields a symbol
    keySet: new Set(t),
    numKeys: t.length,
    optionalKeys: new Set(i)
  };
}
function ai(e, t, n, r, o, i, s) {
  const a = [], c = o.keySet, u = o.catchall._zod, d = u.def.type, h = u.optin, p = u.optout;
  let g = 0;
  for (const _ in t) {
    if (s && n.issues.length !== g) {
      if (ce(n, g))
        break;
      g = n.issues.length;
    }
    if (c.has(_))
      continue;
    if (_ === "__proto__") {
      d === "never" && a.push(_);
      continue;
    }
    if (d === "never") {
      a.push(_);
      continue;
    }
    const y = u.run({ value: t[_], issues: [] }, r);
    y instanceof Promise ? e.push(y.then((v) => St(v, n, _, t, h, p))) : St(y, n, _, t, h, p);
  }
  return a.length && n.issues.push({
    code: "unrecognized_keys",
    keys: a,
    input: t,
    inst: i,
    // Describes the shape of the input, not the validity of the parsed value, so it never aborts. The parse still fails; the schema's own checks just get to run first, and an enclosing intersection can reconcile the key against a sibling operand.
    continue: !0
  }), e.length ? Promise.all(e).then(() => n) : n;
}
const Zl = /* @__PURE__ */ f("$ZodObject", (e, t) => {
  $.init(e, t);
  const n = Object.getOwnPropertyDescriptor(t, "shape"), r = n?.get ? n.get.raw : t.shape ?? {};
  if (r) {
    const u = () => {
      const d = { ...r };
      return Object.defineProperty(t, "shape", { value: d }), u.raw = d, d;
    };
    u.raw = r, Object.defineProperty(t, "shape", { get: u });
  }
  const o = Pt(() => si(t));
  k(e, "propValues", (u) => {
    const d = u.def.shape, h = {};
    for (const p in d) {
      const g = d[p]._zod;
      if (g.values) {
        Object.prototype.hasOwnProperty.call(h, p) || ve(h, p, /* @__PURE__ */ new Set());
        for (const _ of g.values)
          h[p].add(_);
        g.optin !== void 0 && h[p].add(void 0);
      }
    }
    return h;
  });
  const i = nt, s = t.catchall;
  let a;
  const c = re.memoizer;
  c?.attach(e), e._zod.parse = (u, d) => {
    a ?? (a = o.value);
    const h = u.value;
    if (!i(h))
      return u.issues.push({
        expected: "object",
        code: "invalid_type",
        input: h,
        inst: e
      }), u;
    u.value = c ? c.alloc(e, u, {}, d) : {};
    const p = [], g = a.shape, _ = d?.abortEarly;
    let y = u.issues.length;
    for (const v of a.allKeys) {
      if (_ && u.issues.length !== y) {
        if (ce(u, y))
          break;
        y = u.issues.length;
      }
      if (v === "__proto__")
        continue;
      const T = g[v], U = T._zod.optin, he = T._zod.optout, ie = T._zod.run({ value: h[v], issues: [] }, d);
      ie instanceof Promise ? p.push(ie.then((M) => St(M, u, v, h, U, he))) : St(ie, u, v, h, U, he);
    }
    return s ? ai(p, h, u, d, o.value, e, _ === !0) : p.length ? Promise.all(p).then(() => u) : u;
  };
}), Dl = /* @__PURE__ */ f("$ZodObjectJIT", (e, t) => {
  Zl.init(e, t);
  const n = e._zod.parse, r = Pt(() => si(t)), o = re.memoizer, i = (g) => {
    const _ = r.value, y = _.symbolKeys, v = new Vc(["payload", "ctx"], { shape: g, inst: e, memo: o, syms: y }), T = (M) => `shape[${M}]._zod.run({ value: input[${M}], issues: [] }, ctx)`, U = (M, N) => `
          let ${M}_ab = false;
          for (let i = 0; i < ${M}.issues.length; i++) {
            const iss = ${M}.issues[i];
            iss.path = iss.path ? [${N}, ...iss.path] : [${N}];
            payload.issues.push(iss);
            if (iss.continue !== true) ${M}_ab = true;
          }
          if (${M}_ab && ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }`;
    v.write("const input = payload.value;");
    const he = /* @__PURE__ */ Object.create(null);
    let ie = 0;
    for (const M of _.allKeys)
      he[M] = `key_${ie++}`;
    v.write(o ? "const newResult = memo.alloc(inst, payload, {}, ctx);" : "const newResult = {};");
    for (const M of _.allKeys) {
      if (M === "__proto__")
        continue;
      const N = he[M], q = typeof M == "symbol" ? `syms[${y.indexOf(M)}]` : _a(M), xt = `${q} in input`, dr = g[M], Ht = dr?._zod?.optin, fr = Ht !== void 0, Zs = dr?._zod?.optout === "optional";
      if (v.write(`const ${N} = ${T(q)};`), fr && Zs) {
        const Ds = Ht === "optional" ? `${N}_present` : `${N}.value !== undefined || ${N}_present`;
        v.write(`
        const ${N}_present = ${xt};
        if (!${N}.issues.length || ${N}_present) {
          if (${N}.issues.length) {${U(N, q)}
          }

          if (${Ds}) {
            newResult[${q}] = ${N}.value;
          }
        }

      `);
      } else fr ? (v.write(`
        if (${N}.issues.length) {${U(N, q)}
        }
      `), Ht === "defaulted" ? v.write(`newResult[${q}] = ${N}.value;`) : v.write(`
        if (${N}.value !== undefined || ${xt}) {
          newResult[${q}] = ${N}.value;
        }
      `)) : v.write(`
        const ${N}_present = ${xt};
        if (${N}.issues.length) {${U(N, q)}
        }
        if (!${N}_present && !${N}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${q}]
          });
          if (ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }
        }

        if (${N}_present) {
          newResult[${q}] = ${N}.value;
        }

      `);
    }
    return v.write("payload.value = newResult;"), v.write("return payload;"), v.compile();
  };
  let s;
  const a = nt, c = !re.jitless, d = c && va.value, h = t.catchall;
  let p;
  e._zod.parse = (g, _) => {
    p ?? (p = r.value);
    const y = g.value;
    return a(y) ? c && d && _?.async === !1 && _.jitless !== !0 ? (s || (s = i(t.shape)), g = s(g, _), h ? ai([], y, g, _, p, e, _?.abortEarly === !0) : g) : n(g, _) : (g.issues.push({
      expected: "object",
      code: "invalid_type",
      input: y,
      inst: e
    }), g);
  };
});
function Sr(e, t, n, r) {
  for (const i of e)
    if (i.issues.length === 0)
      return t.value = i.value, t;
  const o = e.filter((i) => !ce(i));
  return o.length === 1 ? (t.value = o[0].value, o[0]) : (t.issues.push({
    code: "invalid_union",
    input: t.value,
    inst: n,
    errors: e.map((i) => i.issues.map((s) => je(s, r, ye())))
  }), t);
}
const ci = /* @__PURE__ */ f("$ZodUnion", (e, t) => {
  $.init(e, t), k(e, "optin", (r) => r.def.options.some((o) => o._zod.optin === "defaulted") ? "defaulted" : r.def.options.some((o) => o._zod.optin !== void 0) ? "optional" : void 0), k(e, "optout", (r) => r.def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0), k(e, "values", (r) => {
    if (r.def.options.every((o) => o._zod.values))
      return new Set(r.def.options.flatMap((o) => Array.from(o._zod.values)));
  }), k(e, "pattern", (r) => {
    if (r.def.options.every((o) => o._zod.pattern)) {
      const o = r.def.options.map((i) => i._zod.pattern);
      return new RegExp(`^(${o.map((i) => Zn(i.source)).join("|")})$`);
    }
  });
  const n = t.options.length === 1 ? t.options[0]._zod.run : null;
  e._zod.parse = (r, o) => {
    if (n)
      return n(r, o);
    let i = !1;
    const s = [];
    for (const a of t.options) {
      const c = a._zod.run({
        value: r.value,
        issues: []
      }, o);
      if (c instanceof Promise)
        s.push(c), i = !0;
      else {
        if (c.issues.length === 0)
          return c;
        s.push(c);
      }
    }
    return i ? Promise.all(s).then((a) => Sr(a, r, e, o)) : Sr(s, r, e, o);
  };
});
function Ll(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e.options) {
    const r = n._zod.propValues?.[e.discriminator];
    if (!r || r.size === 0)
      throw new Error(`Invalid discriminated union option at index "${e.options.indexOf(n)}"`);
    for (const o of r)
      if (t.has(o)) {
        if (o !== void 0)
          throw new Error(`Duplicate discriminator value "${String(o)}"`);
        t.set(o, null);
      } else
        t.set(o, n);
  }
  return t;
}
const Fl = /* @__PURE__ */ f("$ZodDiscriminatedUnion", (e, t) => {
  t.inclusive = !1, ci.init(e, t);
  const n = e._zod.parse;
  k(e, "propValues", (o) => {
    const i = {};
    let s = 0;
    for (const a of o.def.options) {
      const c = a._zod.propValues;
      if (!c || Object.keys(c).length === 0)
        throw new Error(`Invalid discriminated union option at index "${o.def.options.indexOf(a)}"`);
      c[o.def.discriminator]?.has(void 0) && s++;
      for (const [u, d] of Object.entries(c)) {
        Object.prototype.hasOwnProperty.call(i, u) || ve(i, u, /* @__PURE__ */ new Set());
        for (const h of d)
          i[u].add(h);
      }
    }
    return !o.def.unionFallback && s > 1 && i[o.def.discriminator]?.delete(void 0), i;
  }), t.options.forEach((o, i) => {
    const s = Dn(o._zod.def);
    if (s && !Object.prototype.hasOwnProperty.call(s, t.discriminator))
      throw new Error(`Invalid discriminated union option at index "${i}"`);
  });
  const r = Pt(() => Ll(t));
  e._zod.parse = (o, i) => {
    const s = o.value;
    if (!nt(s))
      return o.issues.push({
        code: "invalid_type",
        expected: "object",
        input: s,
        inst: e
      }), o;
    const a = s?.[t.discriminator], c = r.value.get(a);
    return c && (a !== void 0 || i.direction !== "backward") ? c._zod.run(o, i) : t.unionFallback || i.direction === "backward" ? n(o, i) : (o.issues.push({
      code: "invalid_union",
      errors: [],
      note: "No matching discriminator",
      discriminator: t.discriminator,
      options: Array.from(r.value.keys()).filter((u) => r.value.get(u) !== null),
      input: s,
      path: [t.discriminator],
      inst: e
    }), o);
  };
}), Ul = /* @__PURE__ */ f("$ZodIntersection", (e, t) => {
  $.init(e, t), e._zod.parse = (n, r) => {
    const o = n.value, i = t.left._zod.run({ value: o, issues: [] }, r), s = t.right._zod.run({ value: o, issues: [] }, r);
    return i instanceof Promise || s instanceof Promise ? Promise.all([i, s]).then(([c, u]) => Tr(n, c, u)) : Tr(n, i, s);
  };
});
function hn(e, t) {
  if (e === t)
    return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t)
    return { valid: !0, data: e };
  if (rt(e) && rt(t)) {
    const n = Object.keys(t), r = Object.keys(e).filter((i) => n.indexOf(i) !== -1), o = { ...e, ...t };
    Object.prototype.hasOwnProperty.call(o, "__proto__") && delete o.__proto__;
    for (const i of r) {
      if (i === "__proto__")
        continue;
      const s = hn(e[i], t[i]);
      if (!s.valid)
        return {
          valid: !1,
          mergeErrorPath: [i, ...s.mergeErrorPath]
        };
      o[i] = s.data;
    }
    return { valid: !0, data: o };
  }
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length)
      return { valid: !1, mergeErrorPath: [] };
    const n = [];
    for (let r = 0; r < e.length; r++) {
      const o = e[r], i = t[r], s = hn(o, i);
      if (!s.valid)
        return {
          valid: !1,
          mergeErrorPath: [r, ...s.mergeErrorPath]
        };
      n.push(s.data);
    }
    return { valid: !0, data: n };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function Tr(e, t, n) {
  const r = /* @__PURE__ */ new Map();
  let o;
  const i = /* @__PURE__ */ new Map(), s = (u, d) => {
    let h;
    if (u.code === "unrecognized_keys" && !u.path?.length)
      o ?? (o = u), h = u.keys;
    else if (u.code === "invalid_key" && u.origin === "record" && u.path?.length === 1) {
      const p = String(u.path[0]);
      i.has(p) || i.set(p, u), h = [p];
    } else
      return !1;
    for (const p of h)
      r.has(p) || r.set(p, {}), r.get(p)[d] = !0;
    return !0;
  };
  for (const u of t.issues)
    s(u, "l") || e.issues.push(u);
  for (const u of n.issues)
    s(u, "r") || e.issues.push(u);
  const a = [...r].filter(([, u]) => u.l && u.r).map(([u]) => u);
  if (a.length) {
    const u = o ? a.filter((d) => o.keys.includes(d)) : [];
    u.length && e.issues.push({ ...o, keys: u });
    for (const d of a)
      !u.includes(d) && i.has(d) && e.issues.push(i.get(d));
  }
  const c = hn(t.value, n.value);
  if (!c.valid) {
    if (ce(e))
      return e;
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(c.mergeErrorPath)}`);
  }
  return e.value = c.data, e;
}
const Wl = /* @__PURE__ */ f("$ZodEnum", (e, t) => {
  $.init(e, t);
  const n = ln(t.entries), r = new Set(n);
  e._zod.values = r, k(e, "pattern", (o) => {
    const i = ln(o.def.entries).filter((s) => ba.has(typeof s));
    return new RegExp(i.length ? `^(${i.map((s) => Ze(s.toString())).join("|")})$` : "^[^\\s\\S]$");
  }), e._zod.parse = (o, i) => {
    const s = o.value;
    return r.has(s) || o.issues.push({
      code: "invalid_value",
      values: n,
      input: s,
      inst: e
    }), o;
  };
}), jl = /* @__PURE__ */ f("$ZodLiteral", (e, t) => {
  $.init(e, t);
  const n = new Set(t.values);
  e._zod.values = n, k(e, "pattern", (r) => {
    const o = r.def.values;
    return new RegExp(o.length ? `^(${o.map((i) => typeof i == "string" ? Ze(i) : i ? Ze(i.toString()) : String(i)).join("|")})$` : "^[^\\s\\S]$");
  }), e._zod.parse = (r, o) => {
    const i = r.value;
    return n.has(i) || r.issues.push({
      code: "invalid_value",
      values: t.values,
      input: i,
      inst: e
    }), r;
  };
}), xl = /* @__PURE__ */ f("$ZodTransform", (e, t) => {
  $.init(e, t), e._zod.optin = "optional", re.memoizer?.guard(e), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      throw new Vo(e.constructor.name);
    const o = t.transform(n.value, n);
    if (r.async)
      return (o instanceof Promise ? o : Promise.resolve(o)).then((s) => (n.value = s, n));
    if (o instanceof Promise)
      throw new Te();
    return n.value = o, n;
  };
});
function kr(e, t) {
  return e.value = t.issues.length ? void 0 : t.value, e;
}
const li = /* @__PURE__ */ f("$ZodOptional", (e, t) => {
  $.init(e, t), k(e, "optin", (n) => n.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e._zod.optout = "optional", k(e, "values", (n) => {
    const r = n.def.innerType._zod.values;
    return r ? /* @__PURE__ */ new Set([...r, void 0]) : void 0;
  }), k(e, "pattern", (n) => {
    const r = n.def.innerType._zod.pattern;
    return r ? new RegExp(`^(${Zn(r.source)})?$`) : void 0;
  }), e._zod.parse = (n, r) => {
    if (n.value === void 0) {
      if (t.innerType._zod.optin !== "defaulted")
        return n;
      const o = t.innerType._zod.run({ value: n.value, issues: [] }, r);
      return o instanceof Promise ? o.then((i) => kr(n, i)) : kr(n, o);
    }
    return t.innerType._zod.run(n, r);
  };
}), Hl = /* @__PURE__ */ f("$ZodExactOptional", (e, t) => {
  li.init(e, t), k(e, "values", (n) => n.def.innerType._zod.values), k(e, "pattern", (n) => n.def.innerType._zod.pattern), e._zod.parse = (n, r) => t.innerType._zod.run(n, r);
}), Kl = /* @__PURE__ */ f("$ZodNullable", (e, t) => {
  $.init(e, t), k(e, "optin", (n) => n.def.innerType._zod.optin), k(e, "optout", (n) => n.def.innerType._zod.optout), k(e, "pattern", (n) => {
    const r = n.def.innerType._zod.pattern;
    return r ? new RegExp(`^(${Zn(r.source)}|null)$`) : void 0;
  }), k(e, "values", (n) => n.def.innerType._zod.values ? /* @__PURE__ */ new Set([...n.def.innerType._zod.values, null]) : void 0), e._zod.parse = (n, r) => n.value === null ? n : t.innerType._zod.run(n, r);
}), Bl = /* @__PURE__ */ f("$ZodDefault", (e, t) => {
  $.init(e, t), e._zod.optin = "defaulted", k(e, "values", (n) => n.def.innerType._zod.values), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    if (n.value === void 0)
      return n.value = t.defaultValue, n;
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((i) => Or(i, t)) : Or(o, t);
  };
});
function Or(e, t) {
  return e.value === void 0 && (e.value = t.defaultValue), e;
}
const Vl = /* @__PURE__ */ f("$ZodPrefault", (e, t) => {
  $.init(e, t), e._zod.optin = "defaulted", k(e, "values", (n) => n.def.innerType._zod.values), e._zod.parse = (n, r) => (r.direction === "backward" || n.value === void 0 && (n.value = t.defaultValue), t.innerType._zod.run(n, r));
}), Jl = /* @__PURE__ */ f("$ZodNonOptional", (e, t) => {
  $.init(e, t), k(e, "values", (n) => {
    const r = n.def.innerType._zod.values;
    return r ? new Set([...r].filter((o) => o !== void 0)) : void 0;
  }), e._zod.parse = (n, r) => {
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((i) => Cr(i, e)) : Cr(o, e);
  };
});
function Cr(e, t) {
  return !e.issues.length && e.value === void 0 && e.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: e.value,
    inst: t
  }), e;
}
function Ir(e, t, n, r) {
  return t.issues.length ? (e.value = n.catchValue({
    ...t,
    value: e.value,
    error: {
      issues: t.issues.map((o) => je(o, r, ye()))
    },
    input: e.value
  }), e) : (e.value = t.value, t.memo && (e.memo = !0), e);
}
const Yl = /* @__PURE__ */ f("$ZodCatch", (e, t) => {
  $.init(e, t), k(e, "optin", (n) => n.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), k(e, "optout", (n) => n.def.innerType._zod.optout), k(e, "values", (n) => n.def.innerType._zod.values), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    const o = t.innerType._zod.run({ value: n.value, issues: [] }, r);
    return o instanceof Promise ? o.then((i) => Ir(n, i, t, r)) : Ir(n, o, t, r);
  };
}), Gl = /* @__PURE__ */ f("$ZodPipe", (e, t) => {
  $.init(e, t), k(e, "values", (n) => n.def.in._zod.values), k(e, "optin", (n) => n.def.in._zod.optin), k(e, "optout", (n) => n.def.out._zod.optout), k(e, "propValues", (n) => n.def.in._zod.propValues), e._zod.parse = (n, r) => {
    if (r.direction === "backward") {
      const i = t.out._zod.run(n, r);
      return i instanceof Promise ? i.then((s) => dt(s, t.in, r)) : dt(i, t.in, r);
    }
    const o = t.in._zod.run(n, r);
    return o instanceof Promise ? o.then((i) => dt(i, t.out, r)) : dt(o, t.out, r);
  };
});
function dt(e, t, n) {
  return e.issues.some((r) => r.code !== "unrecognized_keys") ? (e.aborted = !0, e) : t._zod.run({ value: e.value, issues: e.issues }, n);
}
const ql = /* @__PURE__ */ f("$ZodReadonly", (e, t) => {
  $.init(e, t), k(e, "propValues", (n) => n.def.innerType._zod.propValues), k(e, "values", (n) => n.def.innerType._zod.values), k(e, "optin", (n) => n.def.innerType?._zod?.optin), k(e, "optout", (n) => n.def.innerType?._zod?.optout), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then(Nr) : Nr(o);
  };
});
function Nr(e) {
  return e.memo || (e.value = Object.freeze(e.value)), e;
}
const Xl = /* @__PURE__ */ f("$ZodCustom", (e, t) => {
  x.init(e, t), $.init(e, t), e._zod.parse = (n, r) => n, e._zod.check = (n) => {
    const r = n.value, o = t.fn(r);
    if (o instanceof Promise)
      return o.then((i) => Pr(i, n, r, e));
    Pr(o, n, r, e);
  };
});
function Pr(e, t, n, r) {
  if (!e) {
    const o = {
      code: "custom",
      input: n,
      inst: r,
      // incorporates params.error into issue reporting
      path: [...r._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !r._zod.def.abort
      // params: inst._zod.def.params,
    };
    r._zod.def.params && (o.params = r._zod.def.params), t.issues.push(ot(o));
  }
}
class Ql extends Error {
  constructor() {
    super("Cannot parse a reference cycle that closes through a transform"), this.name = "ZodCyclicError";
  }
}
const pn = "~memo", Rr = [];
function ui(e) {
  return e !== null && typeof e == "object";
}
function Jt(e) {
  return e.map((t) => t.path ? { ...t, path: t.path.slice() } : { ...t });
}
const di = /* @__PURE__ */ new WeakMap(), Ve = 0, vt = 1, Ye = 2;
function bt(e, t, n) {
  const r = di.get(e);
  if (r !== void 0)
    return r ? Ye : Ve;
  if (t.has(e))
    return Ye;
  t.add(e);
  let o = Ve;
  const i = (d) => {
    if (o !== Ye && d?._zod) {
      const h = bt(d, t);
      h > o && (o = h);
    }
  }, s = (d, h) => {
    let p = Ve;
    for (const g of Reflect.ownKeys(d)) {
      const _ = Object.getOwnPropertyDescriptor(d, g);
      if (!_.enumerable)
        continue;
      const y = _.get ? vt : _.value?._zod ? bt(_.value, t) : Ve;
      y > p && (p = y);
    }
    return p;
  }, a = (d) => {
    d > o && (o = d);
  }, c = e._zod.def;
  switch (c.type) {
    case "object": {
      const d = Dn(c);
      a(d ? s(d) : vt), i(c.catchall);
      break;
    }
    case "array":
      i(c.element);
      break;
    case "tuple":
      for (const d of c.items)
        i(d);
      i(c.rest);
      break;
    case "record":
    case "map":
      i(c.keyType), i(c.valueType);
      break;
    case "set":
      i(c.valueType);
      break;
    case "union":
      for (const d of c.options)
        i(d);
      break;
    case "intersection":
      i(c.left), i(c.right);
      break;
    case "optional":
    case "nullable":
    case "default":
    case "prefault":
    case "catch":
    case "readonly":
    case "nonoptional":
    case "promise":
    case "success":
      i(c.innerType);
      break;
    case "pipe":
      i(c.in), i(c.out);
      break;
    case "function":
      i(c.input), i(c.output);
      break;
    // `$ZodLazy` caches its inner on the def, so a resolved edge is followed exactly
    case "lazy": {
      const d = c._cachedInner ?? void 0;
      a(d ? bt(d, t) : vt);
      break;
    }
    // a leaf by choice: `parts` are regex fragments, not data positions
    case "template_literal":
    // leaves
    case "string":
    case "number":
    case "int":
    case "boolean":
    case "bigint":
    case "symbol":
    case "undefined":
    case "null":
    case "void":
    case "never":
    case "any":
    case "unknown":
    case "date":
    case "nan":
    case "enum":
    case "literal":
    case "file":
    case "transform":
    case "custom":
      break;
    default:
      for (const d in c) {
        const h = Object.getOwnPropertyDescriptor(c, d);
        if (!h || h.get)
          continue;
        const p = h.value;
        if (!(!p || typeof p != "object")) {
          if (p._zod)
            i(p);
          else if (Array.isArray(p))
            for (const g of p)
              i(g);
        }
      }
  }
  return t.delete(e), eu(e, o);
}
function eu(e, t) {
  return t !== vt && di.set(e, t === Ye), t;
}
function tu(e, t) {
  let n = e.buckets.get(t);
  return n || (n = /* @__PURE__ */ new WeakMap(), e.buckets.set(t, n)), n;
}
let ft;
const ht = [], nu = {
  alloc(e, t, n) {
    const r = ft;
    if (!r)
      return n;
    ft = void 0;
    const o = { value: n, issues: null };
    return r.set(t.value, o), ht.push(o), n;
  },
  guard(e) {
    var t;
    (t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
      const n = e._zod.parse, r = (o, i) => {
        if (i.direction !== "backward" && ou(i, o.value))
          throw new Ql();
        return n(o, i);
      };
      e._zod.parse = r, e._zod.run === n && (e._zod.run = r);
    });
  },
  attach(e) {
    var t;
    let n, r = !1, o, i;
    (t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
      const s = e._zod.parse, a = (c, u) => {
        if (n === void 0) {
          const T = bt(e, /* @__PURE__ */ new Set());
          if (T === Ve)
            return e._zod.parse = s, e._zod.run === a && (e._zod.run = s), s(c, u);
          T === Ye || r ? n = !0 : r = !0;
        }
        const d = c.value;
        if (!ui(d))
          return s(c, u);
        let h = u[pn];
        h || (h = { buckets: /* @__PURE__ */ new WeakMap(), backEdges: void 0 }, u[pn] = h);
        let p;
        o === u ? p = i : (p = tu(h, e), o = u, i = p);
        const g = p.get(d);
        if (g)
          return c.value = g.value, g.issues ? g.issues.length && c.issues.push(...Jt(g.issues)) : (c.memo = !0, h.backEdges ?? (h.backEdges = /* @__PURE__ */ new WeakSet()), h.backEdges.add(g.value)), c;
        ft = p;
        const _ = ht.length, y = s(c, u);
        ft = void 0;
        const v = ht.length > _ ? ht.pop() : void 0;
        return y instanceof Promise ? y.then((T) => (v && (v.issues = T.issues.length ? Jt(T.issues) : Rr), T)) : (v && (v.issues = y.issues.length ? Jt(y.issues) : Rr), y);
      };
      e._zod.parse = a, e._zod.run === s && (e._zod.run = a);
    });
  }
};
function ru() {
  return nu;
}
function ou(e, t) {
  const n = e[pn]?.backEdges;
  return n !== void 0 && ui(t) && n.has(t);
}
const iu = () => {
  const e = {
    string: { unit: "characters", verb: "to have" },
    file: { unit: "bytes", verb: "to have" },
    array: { unit: "items", verb: "to have" },
    set: { unit: "items", verb: "to have" },
    map: { unit: "entries", verb: "to have" }
  };
  function t(i) {
    return e[i] ?? null;
  }
  const n = {
    regex: "input",
    email: "email address",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO datetime",
    date: "ISO date",
    time: "ISO time",
    duration: "ISO duration",
    ipv4: "IPv4 address",
    ipv6: "IPv6 address",
    mac: "MAC address",
    cidrv4: "IPv4 range",
    cidrv6: "IPv6 range",
    base64: "base64-encoded string",
    base64url: "base64url-encoded string",
    json_string: "JSON string",
    e164: "E.164 number",
    currency_code: "currency code",
    credit_card: "credit card number",
    iban: "IBAN",
    jwt: "JWT",
    template_literal: "input"
  }, r = {
    // Compatibility: "nan" -> "NaN" for display
    nan: "NaN"
    // All other type names omitted - they fall back to raw values via ?? operator
  };
  function o(i, s) {
    return i === "number" && typeof s == "number" && !Number.isFinite(s) ? String(s) : r[i] ?? i;
  }
  return (i) => {
    switch (i.code) {
      case "invalid_type": {
        const s = o(i.expected), a = Pa(i.input), c = o(a, i.input);
        return `Invalid input: expected ${s}, received ${c}`;
      }
      case "invalid_value":
        return i.values.length === 1 ? `Invalid input: expected ${Wo(i.values[0])}` : `Invalid option: expected one of ${pr(i.values, "|")}`;
      case "too_big": {
        const s = i.exact ? "exactly " : i.inclusive ? "<=" : "<", a = t(i.origin);
        return a ? `Too big: expected ${i.origin ?? "value"} to have ${s}${i.maximum.toString()} ${a.unit ?? "elements"}` : `Too big: expected ${i.origin ?? "value"} to be ${s}${i.maximum.toString()}`;
      }
      case "too_small": {
        const s = i.exact ? "exactly " : i.inclusive ? ">=" : ">", a = t(i.origin);
        return a ? `Too small: expected ${i.origin} to have ${s}${i.minimum.toString()} ${a.unit}` : `Too small: expected ${i.origin} to be ${s}${i.minimum.toString()}`;
      }
      case "invalid_format": {
        const s = i;
        return s.format === "starts_with" ? `Invalid string: must start with "${s.prefix}"` : s.format === "ends_with" ? `Invalid string: must end with "${s.suffix}"` : s.format === "includes" ? `Invalid string: must include "${s.includes}"` : s.format === "regex" ? `Invalid string: must match pattern ${s.pattern}` : `Invalid ${n[s.format] ?? i.format}`;
      }
      case "not_multiple_of":
        return `Invalid number: must be a multiple of ${i.divisor}`;
      case "unrecognized_keys":
        return `Unrecognized key${i.keys.length > 1 ? "s" : ""}: ${pr(i.keys, ", ")}`;
      case "invalid_key":
        return `Invalid key in ${i.origin}`;
      case "invalid_union":
        return i.options && Array.isArray(i.options) && i.options.length > 0 ? `Invalid discriminator value. Expected ${i.options.map((a) => `'${a}'`).join(" | ")}` : i.inclusive === !1 ? "Invalid input: more than one option matched" : "Invalid input";
      case "invalid_element":
        return `Invalid value in ${i.origin}`;
      default:
        return "Invalid input";
    }
  };
};
function su() {
  return {
    localeError: iu()
  };
}
var Ar;
class au {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(t, ...n) {
    const r = n[0];
    return this._map.set(t, r), r && typeof r == "object" && "id" in r && this._idmap.set(r.id, t), this;
  }
  clear() {
    return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
  }
  remove(t) {
    const n = this._map.get(t);
    return n && typeof n == "object" && "id" in n && this._idmap.delete(n.id), this._map.delete(t), this;
  }
  get(t) {
    const n = t._zod.parent;
    if (n) {
      const r = { ...this.get(n) ?? {} };
      delete r.id;
      const o = { ...r, ...this._map.get(t) };
      return Object.keys(o).length ? o : void 0;
    }
    return this._map.get(t);
  }
  has(t) {
    return this._map.has(t);
  }
}
function cu() {
  return new au();
}
(Ar = globalThis).__zod_globalRegistry ?? (Ar.__zod_globalRegistry = cu());
const Je = globalThis.__zod_globalRegistry;
function fi(e) {
  return e.checks && (e.checks = [...e.checks]), e;
}
// @__NO_SIDE_EFFECTS__
function lu(e, t) {
  return new e(fi({ type: "string", ...b(t) }));
}
// @__NO_SIDE_EFFECTS__
function uu(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function du(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function fu(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function hu(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function pu(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function mu(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function hi(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function _u(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function gu(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function vu(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function bu(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function yu(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function wu(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Eu(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Su(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Tu(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ku(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ou(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Cu(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Iu(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Nu(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Pu(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ru(e, t) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Au(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function $u(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function zu(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Mu(e, t) {
  return new e(fi({ type: "number", checks: [], ...b(t) }));
}
// @__NO_SIDE_EFFECTS__
function Zu(e, t) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Du(e, t) {
  return new e({
    type: "boolean",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Lu(e) {
  return new e({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function Fu(e, t) {
  return new e({
    type: "never",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function $r(e, t) {
  return new Go({
    check: "less_than",
    ...b(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Yt(e, t) {
  return new Go({
    check: "less_than",
    ...b(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function zr(e, t) {
  return new qo({
    check: "greater_than",
    ...b(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Gt(e, t) {
  return new qo({
    check: "greater_than",
    ...b(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function Mr(e, t) {
  return new Mc({
    check: "multiple_of",
    ...b(t),
    value: e
  });
}
// @__NO_SIDE_EFFECTS__
function pi(e, t) {
  return new Dc({
    check: "max_length",
    ...b(t),
    maximum: e
  });
}
// @__NO_SIDE_EFFECTS__
function Tt(e, t) {
  return new Lc({
    check: "min_length",
    ...b(t),
    minimum: e
  });
}
// @__NO_SIDE_EFFECTS__
function mi(e, t) {
  return new Fc({
    check: "length_equals",
    ...b(t),
    length: e
  });
}
// @__NO_SIDE_EFFECTS__
function Uu(e, t) {
  return new Uc({
    check: "string_format",
    format: "regex",
    ...b(t),
    pattern: e
  });
}
// @__NO_SIDE_EFFECTS__
function Wu(e) {
  return new Wc({
    check: "string_format",
    format: "lowercase",
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function ju(e) {
  return new jc({
    check: "string_format",
    format: "uppercase",
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function xu(e, t) {
  return new xc({
    check: "string_format",
    format: "includes",
    ...b(t),
    includes: e
  });
}
// @__NO_SIDE_EFFECTS__
function Hu(e, t) {
  return new Hc({
    check: "string_format",
    format: "starts_with",
    ...b(t),
    prefix: e
  });
}
// @__NO_SIDE_EFFECTS__
function Ku(e, t) {
  return new Kc({
    check: "string_format",
    format: "ends_with",
    ...b(t),
    suffix: e
  });
}
// @__NO_SIDE_EFFECTS__
function xe(e) {
  return new Bc({
    check: "overwrite",
    tx: e
  });
}
// @__NO_SIDE_EFFECTS__
function Bu(e) {
  return /* @__PURE__ */ xe((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function Vu() {
  return /* @__PURE__ */ xe((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function Ju() {
  return /* @__PURE__ */ xe((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Yu() {
  return /* @__PURE__ */ xe((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function Gu() {
  return /* @__PURE__ */ xe((e) => ga(e));
}
// @__NO_SIDE_EFFECTS__
function qu(e, t, n) {
  return new e({
    type: "array",
    element: t,
    // get element() {
    //   return element;
    // },
    ...b(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Xu(e, t, n) {
  return new e({
    type: "custom",
    check: "custom",
    fn: t,
    ...b(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Qu(e, t) {
  const n = /* @__PURE__ */ ed((r) => (r.addIssue = (o) => {
    if (typeof o == "string")
      r.issues.push(ot(o, r.value, n._zod.def));
    else {
      const i = o;
      i.fatal && (i.continue = !1), i.code ?? (i.code = "custom"), "input" in i || (i.input = r.value), i.inst ?? (i.inst = n), i.continue ?? (i.continue = !n._zod.def.abort), r.issues.push(ot(i));
    }
  }, e(r.value, r)), t);
  return n;
}
// @__NO_SIDE_EFFECTS__
function ed(e, t) {
  const n = new x({
    check: "custom",
    ...b(t)
  });
  return n._zod.check = e, n;
}
function Ge(e, ...t) {
  for (const n of t)
    for (const r of Reflect.ownKeys(n))
      Object.prototype.propertyIsEnumerable.call(n, r) && ve(e, r, n[r]);
  return e;
}
function _i(e) {
  let t = e?.target ?? "draft-2020-12";
  return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
    processors: e.processors ?? {},
    metadataRegistry: e?.metadata ?? Je,
    target: t,
    unrepresentable: e?.unrepresentable ?? "throw",
    override: e?.override ?? (() => {
    }),
    io: e?.io ?? "output",
    counter: 0,
    seen: /* @__PURE__ */ new Map(),
    sharedDefsExtractedFor: void 0,
    sharedEmitDoneFor: void 0,
    cycles: e?.cycles ?? "ref",
    reused: e?.reused ?? "inline",
    intersections: [],
    deferred: [],
    external: e?.external ?? void 0
  };
}
function _e(e, t, n, r, o) {
  const i = typeof t.unrepresentable == "function" ? t.unrepresentable({ zodSchema: e, path: r.path, message: o }) : t.unrepresentable;
  if (i === "any")
    return !1;
  if (i === void 0 || i === "throw")
    throw new Error(o);
  return Object.assign(n, i), !0;
}
function D(e, t, n = { path: [], schemaPath: [] }) {
  var r;
  const o = e._zod.def, i = t.seen.get(e);
  if (i)
    return i.count++, n.schemaPath.includes(e) && (i.cycle = n.path), i.schema;
  const s = { schema: {}, count: 1, cycle: void 0, path: n.path };
  t.seen.set(e, s), t.sharedDefsExtractedFor = void 0, t.sharedEmitDoneFor = void 0;
  const a = e._zod.toJSONSchema?.();
  if (a)
    s.schema = a;
  else {
    const d = {
      ...n,
      schemaPath: [...n.schemaPath, e],
      path: n.path
    };
    if (e._zod.processJSONSchema)
      e._zod.processJSONSchema(t, s.schema, d);
    else {
      const p = s.schema, g = t.processors[o.type];
      if (!g)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${o.type}`);
      g(e, t, p, d);
    }
    const h = e._zod.parent;
    h && (s.ref || (s.ref = h), D(h, t, d), t.seen.get(h).isParent = !0);
  }
  const c = t.metadataRegistry.get(e);
  return c && Ge(s.schema, c), t.io === "input" && L(e) && (delete s.schema.examples, delete s.schema.default), t.io === "input" && "_prefault" in s.schema && ((r = s.schema).default ?? (r.default = s.schema._prefault)), delete s.schema._prefault, t.seen.get(e).schema;
}
function Zr(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function gi(e, t) {
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  if (e.external && e.sharedDefsExtractedFor === e.external)
    return;
  const r = /* @__PURE__ */ new Map();
  for (const s of e.seen.entries()) {
    const a = e.metadataRegistry.get(s[0])?.id;
    if (a) {
      const c = r.get(a);
      if (c && c !== s[0])
        throw new Error(`Duplicate schema id "${a}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      r.set(a, s[0]);
    }
  }
  const o = (s) => {
    const a = e.target === "draft-2020-12" ? "$defs" : "definitions";
    if (e.external) {
      const h = e.external.registry.get(s[0])?.id, p = e.external.uri ?? ((_) => _);
      if (h)
        return { ref: p(h) };
      const g = s[1].defId ?? s[1].schema.id ?? `schema${e.counter++}`;
      return s[1].defId = g, { defId: g, ref: `${p("__shared")}#/${a}/${Zr(g)}` };
    }
    const c = "#", u = `${c}/${a}/`;
    if (s[1] === n && !s[1].schema.id)
      return { ref: c };
    const d = s[1].schema.id ?? `__schema${e.counter++}`;
    return { defId: d, ref: u + Zr(d) };
  }, i = (s) => {
    if (s[1].schema.$ref)
      return;
    const a = s[1], { ref: c, defId: u } = o(s);
    a.def = { ...a.schema }, u && (a.defId = u);
    const d = a.schema;
    for (const h in d)
      delete d[h];
    d.$ref = c;
  };
  if (e.cycles === "throw")
    for (const s of e.seen.entries()) {
      const a = s[1];
      if (a.cycle)
        throw new Error(`Cycle detected: #/${a.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (const s of e.seen.entries()) {
    const a = s[1];
    if (t === s[0]) {
      i(s);
      continue;
    }
    if (e.external) {
      const u = e.external.registry.get(s[0])?.id;
      if (t !== s[0] && u) {
        i(s);
        continue;
      }
    }
    if (e.metadataRegistry.get(s[0])?.id) {
      i(s);
      continue;
    }
    if (a.cycle) {
      i(s);
      continue;
    }
    a.count > 1 && e.reused === "ref" && i(s);
  }
  e.external && (e.sharedDefsExtractedFor = e.external);
}
function vi(e) {
  const t = e.anyOf;
  if (!Array.isArray(t) || t.length === 0 || e.type !== void 0)
    return;
  const n = [];
  for (const r of t) {
    if (!r || typeof r != "object")
      return;
    vi(r);
    const o = Object.keys(r);
    if (o.length !== 1 || o[0] !== "type")
      return;
    const i = r.type;
    for (const s of Array.isArray(i) ? i : [i]) {
      if (typeof s != "string")
        return;
      n.includes(s) || n.push(s);
    }
  }
  delete e.anyOf, e.type = n.length === 1 ? n[0] : n;
}
const bi = /* @__PURE__ */ new Set(["type", "properties", "required", "additionalProperties"]), Dr = ["oneOf", "anyOf"];
function Lr(e) {
  const t = e.additionalProperties;
  return t === void 0 || t === !1 || typeof t != "object" || t === null ? null : Object.keys(t).length ? t : null;
}
function mn(e) {
  const t = [];
  for (const i of e) {
    if (typeof i != "object" || i.type !== "object")
      return null;
    for (const s in i)
      if (!bi.has(s))
        return null;
    t.push(i);
  }
  const n = {}, r = /* @__PURE__ */ new Set();
  for (const i of t) {
    for (const s in i.properties) {
      if (Object.prototype.hasOwnProperty.call(n, s))
        continue;
      const a = [];
      for (const u of t) {
        const d = u.properties?.[s] ?? Lr(u);
        d != null && (a.some((h) => JSON.stringify(h) === JSON.stringify(d)) || a.push(d));
      }
      const c = a.length === 1 ? a[0] : mn(a) ?? { allOf: a };
      ve(n, s, c);
    }
    for (const s of i.required ?? [])
      r.add(s);
  }
  const o = { type: "object", properties: n };
  if (r.size && (o.required = [...r]), t.every((i) => i.additionalProperties === !1))
    o.additionalProperties = !1;
  else {
    const i = [];
    for (const s of t) {
      const a = Lr(s);
      a && !i.some((c) => JSON.stringify(c) === JSON.stringify(a)) && i.push(a);
    }
    i.length === 1 ? o.additionalProperties = i[0] : i.length > 1 && (o.additionalProperties = { allOf: i });
  }
  return o;
}
function td(e) {
  const t = e.allOf;
  if (!Array.isArray(t) || t.length < 2)
    return;
  for (const o of bi)
    if (o in e)
      return;
  const n = t.filter((o) => Dr.some((i) => Array.isArray(o[i])));
  let r = null;
  if (!n.length)
    r = mn(t);
  else {
    const o = n[0], i = Dr.find((c) => Array.isArray(o[c]));
    if (Object.keys(o).length !== 1)
      return;
    const s = t.filter((c) => c !== o), a = o[i].map((c) => mn([...s, c]));
    if (a.some((c) => !c))
      return;
    r = { [i]: a };
  }
  r && (delete e.allOf, Ge(e, r));
}
function yi(e, t) {
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = (a) => {
    const c = e.seen.get(a);
    if (c.ref === null)
      return;
    const u = c.def ?? c.schema, d = { ...u }, h = c.ref;
    if (c.ref = null, h) {
      r(h);
      const g = e.seen.get(h), _ = g.schema;
      if (_.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (u.allOf = u.allOf ?? [], u.allOf.push(_)) : Ge(u, _), Ge(u, d), a._zod.parent === h)
        for (const v in u)
          v === "$ref" || v === "allOf" || v in d || delete u[v];
      if (_.$ref && g.def)
        for (const v in u)
          v === "$ref" || v === "allOf" || v in g.def && JSON.stringify(u[v]) === JSON.stringify(g.def[v]) && delete u[v];
    }
    const p = a._zod.parent;
    if (p && p !== h) {
      r(p);
      const g = e.seen.get(p);
      if (g?.schema.$ref && (u.$ref = g.schema.$ref, g.def))
        for (const _ in u)
          _ === "$ref" || _ === "allOf" || _ in g.def && JSON.stringify(u[_]) === JSON.stringify(g.def[_]) && delete u[_];
    }
    e.override({
      zodSchema: a,
      jsonSchema: u,
      path: c.path ?? []
    });
  };
  if (!e.external || e.sharedEmitDoneFor !== e.external) {
    for (const a of [...e.seen.entries()].reverse())
      r(a[0]);
    if (e.target !== "openapi-3.0")
      for (const a of e.seen.entries())
        vi(a[1].def ?? a[1].schema);
    for (const a of e.deferred)
      a();
    if (e.intersections.length) {
      const a = /* @__PURE__ */ new Map();
      for (const c of e.seen.values())
        for (const u of [c.schema, c.def]) {
          const d = u?.allOf;
          if (!Array.isArray(d))
            continue;
          const h = a.get(d);
          h ? h.push(u) : a.set(d, [u]);
        }
      for (const c of e.intersections)
        for (const u of a.get(c) ?? [])
          td(u);
    }
  }
  const o = {};
  if (e.target === "draft-2020-12" ? o.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? o.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? o.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
    const a = e.external.registry.get(t)?.id;
    if (!a)
      throw new Error("Schema is missing an `id` property");
    o.$id = e.external.uri(a);
  }
  Ge(o, n.defId ? n.schema : n.def ?? n.schema);
  const i = e.metadataRegistry.get(t)?.id;
  i !== void 0 && o.id === i && delete o.id;
  const s = e.external?.defs ?? {};
  if (!e.external || e.sharedEmitDoneFor !== e.external)
    for (const a of e.seen.entries()) {
      const c = a[1];
      c.def && c.defId && (c.def.id === c.defId && delete c.def.id, ve(s, c.defId, c.def));
    }
  e.external && (e.sharedEmitDoneFor = e.external), e.external || Object.keys(s).length > 0 && (e.target === "draft-2020-12" ? o.$defs = s : o.definitions = s);
  try {
    const a = JSON.parse(JSON.stringify(o));
    return Object.defineProperty(a, "~standard", {
      value: {
        ...t["~standard"],
        jsonSchema: {
          input: kt(t, "input", e.processors),
          output: kt(t, "output", e.processors)
        }
      },
      enumerable: !1,
      writable: !1
    }), a;
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function L(e, t) {
  const n = t ?? { seen: /* @__PURE__ */ new Set() };
  if (n.seen.has(e))
    return !1;
  n.seen.add(e);
  const r = e._zod.def;
  if (r.type === "transform")
    return !0;
  if (r.type === "array")
    return L(r.element, n);
  if (r.type === "set")
    return L(r.valueType, n);
  if (r.type === "lazy")
    return L(r.getter(), n);
  if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault" || r.type === "catch")
    return L(r.innerType, n);
  if (r.type === "intersection")
    return L(r.left, n) || L(r.right, n);
  if (r.type === "record" || r.type === "map")
    return L(r.keyType, n) || L(r.valueType, n);
  if (r.type === "pipe")
    return e._zod.traits.has("$ZodCodec") ? !0 : L(r.in, n) || L(r.out, n);
  if (r.type === "object") {
    for (const o in r.shape)
      if (L(r.shape[o], n))
        return !0;
    return !1;
  }
  if (r.type === "union") {
    for (const o of r.options)
      if (L(o, n))
        return !0;
    return !1;
  }
  if (r.type === "tuple") {
    for (const o of r.items)
      if (L(o, n))
        return !0;
    return !!(r.rest && L(r.rest, n));
  }
  return !1;
}
const nd = (e, t = {}) => (n) => {
  const r = _i({ ...n, processors: t });
  return D(e, r), gi(r, e), yi(r, e);
}, kt = (e, t, n = {}) => (r) => {
  const { libraryOptions: o, target: i } = r ?? {}, s = _i({ ...o ?? {}, target: i, io: t, processors: n });
  return D(e, s), gi(s, e), yi(s, e);
}, De = (e, t, n) => {
  (e[t] === void 0 || n > e[t]) && (e[t] = n);
}, Le = (e, t, n) => {
  (e[t] === void 0 || n < e[t]) && (e[t] = n);
}, Fr = (e, t) => {
  De(e, "minimum", t), Le(e, "maximum", t);
}, wi = (e, t) => {
  e.multipleOf ?? (e.multipleOf = []), e.multipleOf.includes(t) || e.multipleOf.push(t);
}, Ei = (e, t) => {
  e.patterns ?? (e.patterns = /* @__PURE__ */ new Set()), e.patterns.add(t);
}, Si = (e, t) => {
  e.mime = e.mime ? e.mime.filter((n) => t.includes(n)) : [...t];
}, Ti = (e, t) => {
  e.format = t, t.includes("int") && (e.isInt = !0);
}, Ur = (e, t) => De(e, "minimum", t.minimum), Wr = (e, t) => Le(e, "maximum", t.maximum), jr = (e) => (t, n) => {
  Ti(t, n.format);
  const [r, o] = e[n.format];
  De(t, "minimum", r), Le(t, "maximum", o);
}, rd = {
  greater_than: (e, t) => De(e, t.inclusive ? "minimum" : "exclusiveMinimum", t.value),
  less_than: (e, t) => Le(e, t.inclusive ? "maximum" : "exclusiveMaximum", t.value),
  multiple_of: (e, t) => wi(e, t.value),
  number_format: jr(jo),
  bigint_format: jr(wa),
  min_length: Ur,
  max_length: Wr,
  length_equals: (e, t) => Fr(e, t.length),
  min_size: Ur,
  max_size: Wr,
  size_equals: (e, t) => Fr(e, t.size),
  string_format: (e, t) => {
    Ti(e, t.format), t.pattern && Ei(e, t.pattern), (t.format === "base64" || t.format === "base64url") && (e.contentEncoding = t.format), (t.local || t.precision === -1) && (e.laxFormat = !0);
  },
  mime_type: (e, t) => Si(e, t.mime)
};
function Q(e) {
  const t = {}, n = e._zod.def, r = e._zod.traits.has("$ZodCheck") ? [e, ...n.checks ?? []] : n.checks ?? [];
  for (const i of r)
    rd[i._zod.def.check]?.(t, i._zod.def);
  const o = e._zod.bag;
  o.minimum !== void 0 && De(t, "minimum", o.minimum), o.exclusiveMinimum !== void 0 && De(t, "exclusiveMinimum", o.exclusiveMinimum), o.maximum !== void 0 && Le(t, "maximum", o.maximum), o.exclusiveMaximum !== void 0 && Le(t, "exclusiveMaximum", o.exclusiveMaximum), o.multipleOf !== void 0 && wi(t, o.multipleOf), o.format !== void 0 && (t.format ?? (t.format = o.format), o.format.includes("int") && (t.isInt = !0)), o.mime && Si(t, o.mime);
  for (const i of o.patterns ?? [])
    Ei(t, i);
  return t;
}
const od = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
}, id = /* @__PURE__ */ new Map([
  [oi, Ec],
  [Bn, Sc]
]), sd = (e) => id.get(e) ?? e, ad = (e, t, n, r) => {
  const o = n;
  o.type = "string";
  const { minimum: i, maximum: s, format: a, patterns: c, contentEncoding: u, laxFormat: d } = Q(e);
  if (typeof i == "number" && (o.minLength = i), typeof s == "number" && (o.maxLength = s), a && (o.format = od[a] ?? a, o.format === "" && delete o.format, (a === "time" || d) && delete o.format), u && (o.contentEncoding = u), c && c.size > 0) {
    const h = [...c].map(sd);
    h.length === 1 ? o.pattern = h[0].source : h.length > 1 && (o.allOf = [
      ...h.map((p) => ({
        ...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: p.source
      }))
    ]);
  }
}, cd = (e, t, n, r) => {
  const o = n, { minimum: i, maximum: s, multipleOf: a, exclusiveMaximum: c, exclusiveMinimum: u, isInt: d } = Q(e);
  o.type = d ? "integer" : "number";
  const h = typeof u == "number" && u >= (i ?? Number.NEGATIVE_INFINITY), p = typeof c == "number" && c <= (s ?? Number.POSITIVE_INFINITY), g = t.target === "draft-04" || t.target === "openapi-3.0";
  if (h ? g ? (o.minimum = u, o.exclusiveMinimum = !0) : o.exclusiveMinimum = u : typeof i == "number" && (o.minimum = i), p ? g ? (o.maximum = c, o.exclusiveMaximum = !0) : o.exclusiveMaximum = c : typeof s == "number" && (o.maximum = s), a) {
    const _ = /* @__PURE__ */ new Set();
    for (const T of a)
      Number.isFinite(T) && T !== 0 ? _.add(Math.abs(T)) : _e(e, t, o, r, `A multipleOf divisor of ${T} cannot be represented in JSON Schema`);
    const [y, ...v] = _;
    y !== void 0 && (o.multipleOf = y), v.length && (o.allOf = [...o.allOf ?? [], ...v.map((T) => ({ multipleOf: T }))]);
  }
}, ld = (e, t, n, r) => {
  n.type = "boolean";
}, ud = (e, t, n, r) => {
  n.not = {};
}, dd = (e, t, n, r) => {
}, fd = (e, t, n, r) => {
  const o = e._zod.def, i = ln(o.entries);
  if (i.length === 0) {
    n.not = {};
    return;
  }
  i.every((s) => typeof s == "number") && (n.type = "number"), i.every((s) => typeof s == "string") && (n.type = "string"), n.enum = i;
}, hd = (e, t, n, r) => {
  const o = e._zod.def;
  if (o.values.length === 0) {
    n.not = {};
    return;
  }
  const i = [];
  for (const s of o.values)
    if (s === void 0) {
      if (_e(e, t, n, r, "Literal `undefined` cannot be represented in JSON Schema"))
        return;
    } else if (typeof s == "bigint") {
      if (_e(e, t, n, r, "BigInt literals cannot be represented in JSON Schema"))
        return;
      i.push(Number(s));
    } else
      i.push(s);
  if (i.length !== 0) if (i.length === 1) {
    const s = i[0];
    n.type = s === null ? "null" : typeof s, t.target === "draft-04" || t.target === "openapi-3.0" ? n.enum = [s] : n.const = s;
  } else
    i.every((s) => typeof s == "number") && (n.type = "number"), i.every((s) => typeof s == "string") && (n.type = "string"), i.every((s) => typeof s == "boolean") && (n.type = "boolean"), i.every((s) => s === null) && (n.type = "null"), n.enum = i;
}, pd = (e, t, n, r) => {
  _e(e, t, n, r, "Custom types cannot be represented in JSON Schema");
}, md = (e, t, n, r) => {
  _e(e, t, n, r, "Transforms cannot be represented in JSON Schema");
}, _d = (e, t, n, r) => {
  const o = n, i = e._zod.def, { minimum: s, maximum: a } = Q(e);
  typeof s == "number" && (o.minItems = s), typeof a == "number" && (o.maxItems = a), o.type = "array", o.items = D(i.element, t, {
    ...r,
    path: [...r.path, "items"]
  });
};
function _n(e) {
  const t = e._zod.def;
  return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? _n(t.out) : t.type === "catch" ? _n(t.innerType) : e._zod.optin;
}
const gd = (e, t, n, r) => {
  const o = n, i = e._zod.def, s = i.shape;
  if (Object.getOwnPropertySymbols(s).length && _e(e, t, o, r, "Symbol keys cannot be represented in JSON Schema"))
    return;
  o.type = "object", o.properties = {};
  for (const u in s)
    ve(o.properties, u, D(s[u], t, {
      ...r,
      path: [...r.path, "properties", u]
    }));
  const c = [];
  for (const u of Object.keys(s)) {
    const d = i.shape[u];
    (t.io === "input" ? _n(d) === void 0 : d._zod.optout === void 0) && c.push(u);
  }
  c.length > 0 && (o.required = c), i.catchall?._zod.def.type === "never" ? o.additionalProperties = !1 : i.catchall ? i.catchall && (o.additionalProperties = D(i.catchall, t, {
    ...r,
    path: [...r.path, "additionalProperties"]
  })) : t.io === "output" && (o.additionalProperties = !1);
}, vd = (e, t, n, r) => {
  const o = e._zod.def, i = o.inclusive === !1, s = o.options.map((a, c) => D(a, t, {
    ...r,
    path: [...r.path, i ? "oneOf" : "anyOf", c]
  }));
  i ? n.oneOf = s : n.anyOf = s;
}, bd = (e, t, n, r) => {
  const o = e._zod.def, i = D(o.left, t, {
    ...r,
    path: [...r.path, "allOf", 0]
  }), s = D(o.right, t, {
    ...r,
    path: [...r.path, "allOf", 1]
  }), a = (u) => "allOf" in u && Object.keys(u).length === 1, c = [
    ...a(i) ? i.allOf : [i],
    ...a(s) ? s.allOf : [s]
  ];
  n.allOf = c, t.intersections.push(c);
}, yd = (e, t, n, r) => {
  const o = e._zod.def, i = D(o.innerType, t, r), s = t.seen.get(e);
  t.target === "openapi-3.0" ? (s.ref = o.innerType, n.nullable = !0) : n.anyOf = [i, { type: "null" }];
}, wd = (e, t, n, r) => {
  const o = e._zod.def;
  D(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType;
}, Vn = /* @__PURE__ */ Symbol();
function ki(e, t, n, r, o) {
  let i = !1;
  const s = JSON.stringify(e, (a, c) => typeof c != "bigint" ? c : (i = !0, null));
  return i ? (_e(t, n, r, o, "BigInt defaults cannot be represented in JSON Schema"), Vn) : JSON.parse(s);
}
const Ed = (e, t, n, r) => {
  const o = e._zod.def;
  D(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType;
  const s = ki(o.defaultValue, e, t, n, r);
  s !== Vn && (n.default = s);
}, Sd = (e, t, n, r) => {
  const o = e._zod.def;
  D(o.innerType, t, r);
  const i = t.seen.get(e);
  if (i.ref = o.innerType, t.io !== "input")
    return;
  const s = ki(o.defaultValue, e, t, n, r);
  s !== Vn && (n._prefault = s);
}, Td = (e, t, n, r) => {
  const o = e._zod.def;
  D(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType;
  let s;
  try {
    s = o.catchValue(void 0);
  } catch {
    _e(e, t, n, r, "Dynamic catch values are not supported in JSON Schema");
    return;
  }
  n.default = s;
}, kd = (e, t, n, r) => {
  const o = e._zod.def, i = o.in._zod.traits.has("$ZodTransform"), s = t.io === "input" ? i ? o.out : o.in : o.out;
  D(s, t, r);
  const a = t.seen.get(e);
  a.ref = s;
}, Od = (e, t, n, r) => {
  const o = e._zod.def;
  D(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType, n.readOnly = !0;
}, Oi = (e, t, n, r) => {
  const o = e._zod.def;
  D(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType;
}, xr = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function pt(e, t, n) {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    get() {
      const r = n(this);
      return Object.defineProperty(this, t, { value: r, configurable: !0, writable: !0 }), r;
    },
    set(r) {
      Object.defineProperty(this, t, { value: r, configurable: !0, writable: !0 });
    }
  });
}
const Ci = (e, t) => {
  xa.init(e, t), e.name = "ZodError";
  const n = Object.getPrototypeOf(e);
  xr.has(n) || (xr.add(n), pt(n, "format", (r) => (o) => Ba(r, o)), pt(n, "flatten", (r) => (o) => Ka(r, o)), pt(n, "addIssue", (r) => (o) => {
    r.issues.push(o), r.message = JSON.stringify(r.issues, un, 2);
  }), pt(n, "addIssues", (r) => (o) => {
    r.issues.push(...o), r.message = JSON.stringify(r.issues, un, 2);
  }), Object.defineProperty(n, "isEmpty", {
    configurable: !0,
    enumerable: !1,
    get() {
      return this.issues.length === 0;
    }
  }));
}, Cd = /* @__PURE__ */ f("ZodError", Ci), V = /* @__PURE__ */ f("ZodError", Ci, void 0, {
  Parent: Error
}), Id = /* @__PURE__ */ Un(V), Nd = /* @__PURE__ */ Wn(V), Pd = /* @__PURE__ */ jn(V), Rd = /* @__PURE__ */ xn(V), Ad = /* @__PURE__ */ Xa(V), $d = /* @__PURE__ */ Qa(V), zd = /* @__PURE__ */ ec(V), Md = /* @__PURE__ */ tc(V), Zd = /* @__PURE__ */ nc(V), Dd = /* @__PURE__ */ rc(V), Ld = /* @__PURE__ */ oc(V), Fd = /* @__PURE__ */ ic(V);
function Ud() {
  re.localeError || ye(su());
}
function Jn() {
  re.memoizer || ye({ memoizer: ru() });
}
const z = /* @__PURE__ */ f("ZodType", (e, t) => (Ud(), $.init(e, t), e.def = t, e.type = t.type, e), {
  check(...e) {
    const t = this.def;
    return this.clone(H(t, {
      checks: [
        ...t.checks ?? [],
        ...e.map((n) => typeof n == "function" ? { _zod: { check: n, def: { check: "custom" }, onattach: [] } } : n)
      ]
    }), { parent: !0 });
  },
  with(...e) {
    return this.check(...e);
  },
  clone(e, t) {
    return be(this, e, t);
  },
  brand() {
    return this;
  },
  register(e, t) {
    return e.add(this, t), this;
  },
  refine(e, t) {
    return this.check(Lf(e, t));
  },
  superRefine(e, t) {
    return this.check(Ff(e, t));
  },
  overwrite(e) {
    return this.check(/* @__PURE__ */ xe(e));
  },
  optional() {
    return Br(this);
  },
  exactOptional() {
    return kf(this);
  },
  nullable() {
    return Vr(this);
  },
  nullish() {
    return Br(Vr(this));
  },
  nonoptional(e) {
    return Rf(this, e);
  },
  array() {
    return F(this);
  },
  or(e) {
    return Gn([this, e]);
  },
  and(e) {
    return wf(this, e);
  },
  transform(e) {
    return Jr(this, Tf(e));
  },
  default(e) {
    return If(this, e);
  },
  prefault(e) {
    return Pf(this, e);
  },
  catch(e) {
    return $f(this, e);
  },
  pipe(e) {
    return Jr(this, e);
  },
  readonly() {
    return Zf(this);
  },
  describe(e) {
    const t = this.clone();
    return Je.add(t, { description: e }), t;
  },
  meta(...e) {
    if (e.length === 0)
      return Je.get(this);
    const t = this.clone();
    return Je.add(t, e[0]), t;
  },
  isOptional() {
    return this.safeParse(void 0).success;
  },
  isNullable() {
    return this.safeParse(null).success;
  },
  apply(e, ...t) {
    return t.length === 0 ? e(this) : e(this, ...t);
  },
  // Overrides core's `~standard` to add `jsonSchema`. Must stay a prototype entry: redefining it per instance demotes instances to dictionary mode.
  get "~standard"() {
    return Ko(this, "~standard", {
      ...Qo(this),
      jsonSchema: {
        input: kt(this, "input"),
        output: kt(this, "output")
      }
    });
  },
  set "~standard"(e) {
    me(this, "~standard", e);
  },
  parse: function e(t, n) {
    return Id(this, t, n, { callee: e });
  },
  parseAsync: async function e(t, n) {
    return await Nd(this, t, n, { callee: e });
  },
  safeParse(e, t) {
    return Pd(this, e, t);
  },
  async safeParseAsync(e, t) {
    return Rd(this, e, t);
  },
  // `spa` is an alias: same function object as `safeParseAsync`, as before.
  get spa() {
    return this?.safeParseAsync;
  },
  set spa(e) {
    me(this, "spa", e);
  },
  validate(e, t) {
    return Ya(this, e, t);
  },
  validateAsync(e, t) {
    return qa(this, e, t);
  },
  encode: function e(t, n) {
    return Ad(this, t, n, { callee: e });
  },
  decode: function e(t, n) {
    return $d(this, t, n, { callee: e });
  },
  encodeAsync: async function e(t, n) {
    return await zd(this, t, n, { callee: e });
  },
  decodeAsync: async function e(t, n) {
    return await Md(this, t, n, { callee: e });
  },
  safeEncode(e, t) {
    return Zd(this, e, t);
  },
  safeDecode(e, t) {
    return Dd(this, e, t);
  },
  async safeEncodeAsync(e, t) {
    return Ld(this, e, t);
  },
  async safeDecodeAsync(e, t) {
    return Fd(this, e, t);
  },
  toJSONSchema(e) {
    return nd(this, {})(e);
  },
  // Reads through to the registry on every access, so it must not cache.
  get description() {
    return Je.get(this)?.description;
  },
  // No setter: `schema._def = x` throws, as it did when `_def` was a non-writable own property.
  get _def() {
    return this._zod.def;
  }
}), Ii = /* @__PURE__ */ f(
  "_ZodString",
  (e, t) => {
    Kn.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => ad(e, n, r);
  },
  /* @__PURE__ */ Bo({
    format: (e) => Q(e).format ?? null,
    minLength: (e) => Q(e).minimum ?? null,
    maxLength: (e) => Q(e).maximum ?? null
  }, {
    regex(...e) {
      return this.check(/* @__PURE__ */ Uu(...e));
    },
    includes(...e) {
      return this.check(/* @__PURE__ */ xu(...e));
    },
    startsWith(...e) {
      return this.check(/* @__PURE__ */ Hu(...e));
    },
    endsWith(...e) {
      return this.check(/* @__PURE__ */ Ku(...e));
    },
    min(...e) {
      return this.check(/* @__PURE__ */ Tt(...e));
    },
    max(...e) {
      return this.check(/* @__PURE__ */ pi(...e));
    },
    length(...e) {
      return this.check(/* @__PURE__ */ mi(...e));
    },
    nonempty(...e) {
      return this.check(/* @__PURE__ */ Tt(1, ...e));
    },
    lowercase(e) {
      return this.check(/* @__PURE__ */ Wu(e));
    },
    uppercase(e) {
      return this.check(/* @__PURE__ */ ju(e));
    },
    trim() {
      return this.check(/* @__PURE__ */ Vu());
    },
    normalize(...e) {
      return this.check(/* @__PURE__ */ Bu(...e));
    },
    toLowerCase() {
      return this.check(/* @__PURE__ */ Ju());
    },
    toUpperCase() {
      return this.check(/* @__PURE__ */ Yu());
    },
    slugify() {
      return this.check(/* @__PURE__ */ Gu());
    }
  })
), Wd = /* @__PURE__ */ f("ZodString", (e, t) => {
  Kn.init(e, t), Ii.init(e, t);
}, {
  email(e) {
    return this.check(/* @__PURE__ */ uu(Bd, e));
  },
  url(e) {
    return this.check(/* @__PURE__ */ hi(Ni, e));
  },
  jwt(e) {
    return this.check(/* @__PURE__ */ Pu(uf, e));
  },
  emoji(e) {
    return this.check(/* @__PURE__ */ _u(Yd, e));
  },
  guid(e) {
    return this.check(/* @__PURE__ */ du(Vd, e));
  },
  uuid(e) {
    return this.check(/* @__PURE__ */ fu(mt, e));
  },
  uuidv4(e) {
    return this.check(/* @__PURE__ */ hu(mt, e));
  },
  uuidv6(e) {
    return this.check(/* @__PURE__ */ pu(mt, e));
  },
  uuidv7(e) {
    return this.check(/* @__PURE__ */ mu(mt, e));
  },
  nanoid(e) {
    return this.check(/* @__PURE__ */ gu(Gd, e));
  },
  cuid(e) {
    return this.check(/* @__PURE__ */ vu(qd, e));
  },
  cuid2(e) {
    return this.check(/* @__PURE__ */ bu(Xd, e));
  },
  ulid(e) {
    return this.check(/* @__PURE__ */ yu(Qd, e));
  },
  base64(e) {
    return this.check(/* @__PURE__ */ Cu(af, e));
  },
  base64url(e) {
    return this.check(/* @__PURE__ */ Iu(cf, e));
  },
  xid(e) {
    return this.check(/* @__PURE__ */ wu(ef, e));
  },
  ksuid(e) {
    return this.check(/* @__PURE__ */ Eu(tf, e));
  },
  ipv4(e) {
    return this.check(/* @__PURE__ */ Su(nf, e));
  },
  ipv6(e) {
    return this.check(/* @__PURE__ */ Tu(rf, e));
  },
  cidrv4(e) {
    return this.check(/* @__PURE__ */ ku(of, e));
  },
  cidrv6(e) {
    return this.check(/* @__PURE__ */ Ou(sf, e));
  },
  e164(e) {
    return this.check(/* @__PURE__ */ Nu(lf, e));
  },
  datetime(e) {
    return this.check(/* @__PURE__ */ Ru(jd, e));
  },
  date(e) {
    return this.check(/* @__PURE__ */ Au(xd, e));
  },
  time(e) {
    return this.check(/* @__PURE__ */ $u(Hd, e));
  },
  duration(e) {
    return this.check(/* @__PURE__ */ zu(Kd, e));
  }
});
function w(e) {
  return /* @__PURE__ */ lu(Wd, e);
}
const A = /* @__PURE__ */ f("ZodStringFormat", (e, t) => {
  P.init(e, t), Ii.init(e, t);
}), jd = /* @__PURE__ */ f("ZodISODateTime", (e, t) => {
  fl.init(e, t), A.init(e, t);
}), xd = /* @__PURE__ */ f("ZodISODate", (e, t) => {
  hl.init(e, t), A.init(e, t);
}), Hd = /* @__PURE__ */ f("ZodISOTime", (e, t) => {
  pl.init(e, t), A.init(e, t);
}), Kd = /* @__PURE__ */ f("ZodISODuration", (e, t) => {
  ml.init(e, t), A.init(e, t);
}), Bd = /* @__PURE__ */ f("ZodEmail", (e, t) => {
  Xc.init(e, t), A.init(e, t);
}), Vd = /* @__PURE__ */ f("ZodGUID", (e, t) => {
  Gc.init(e, t), A.init(e, t);
}), mt = /* @__PURE__ */ f("ZodUUID", (e, t) => {
  qc.init(e, t), A.init(e, t);
}), Ni = /* @__PURE__ */ f("ZodURL", (e, t) => {
  ol.init(e, t), A.init(e, t);
});
function Jd(e) {
  return /* @__PURE__ */ hi(Ni, e);
}
const Yd = /* @__PURE__ */ f("ZodEmoji", (e, t) => {
  il.init(e, t), A.init(e, t);
}), Gd = /* @__PURE__ */ f("ZodNanoID", (e, t) => {
  sl.init(e, t), A.init(e, t);
}), qd = /* @__PURE__ */ f("ZodCUID", (e, t) => {
  al.init(e, t), A.init(e, t);
}), Xd = /* @__PURE__ */ f("ZodCUID2", (e, t) => {
  cl.init(e, t), A.init(e, t);
}), Qd = /* @__PURE__ */ f("ZodULID", (e, t) => {
  ll.init(e, t), A.init(e, t);
}), ef = /* @__PURE__ */ f("ZodXID", (e, t) => {
  ul.init(e, t), A.init(e, t);
}), tf = /* @__PURE__ */ f("ZodKSUID", (e, t) => {
  dl.init(e, t), A.init(e, t);
}), nf = /* @__PURE__ */ f("ZodIPv4", (e, t) => {
  _l.init(e, t), A.init(e, t);
}), rf = /* @__PURE__ */ f("ZodIPv6", (e, t) => {
  vl.init(e, t), A.init(e, t);
}), of = /* @__PURE__ */ f("ZodCIDRv4", (e, t) => {
  bl.init(e, t), A.init(e, t);
}), sf = /* @__PURE__ */ f("ZodCIDRv6", (e, t) => {
  wl.init(e, t), A.init(e, t);
}), af = /* @__PURE__ */ f("ZodBase64", (e, t) => {
  El.init(e, t), A.init(e, t);
}), cf = /* @__PURE__ */ f("ZodBase64URL", (e, t) => {
  Tl.init(e, t), A.init(e, t);
}), lf = /* @__PURE__ */ f("ZodE164", (e, t) => {
  kl.init(e, t), A.init(e, t);
}), uf = /* @__PURE__ */ f("ZodJWT", (e, t) => {
  Cl.init(e, t), A.init(e, t);
}), Pi = /* @__PURE__ */ f(
  "ZodNumber",
  (e, t) => {
    ii.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => cd(e, n, r, o), e.isFinite = !0;
  },
  /* @__PURE__ */ Bo({
    minValue: (e) => {
      const { minimum: t, exclusiveMinimum: n } = Q(e);
      return Math.max(t ?? Number.NEGATIVE_INFINITY, n ?? Number.NEGATIVE_INFINITY);
    },
    maxValue: (e) => {
      const { maximum: t, exclusiveMaximum: n } = Q(e);
      return Math.min(t ?? Number.POSITIVE_INFINITY, n ?? Number.POSITIVE_INFINITY);
    },
    isInt: (e) => {
      const { isInt: t, multipleOf: n } = Q(e);
      return !!t || !!n?.some(Number.isSafeInteger);
    },
    format: (e) => Q(e).format ?? null
  }, {
    gt(e, t) {
      return this.check(/* @__PURE__ */ zr(e, t));
    },
    gte(e, t) {
      return this.check(/* @__PURE__ */ Gt(e, t));
    },
    min(e, t) {
      return this.check(/* @__PURE__ */ Gt(e, t));
    },
    lt(e, t) {
      return this.check(/* @__PURE__ */ $r(e, t));
    },
    lte(e, t) {
      return this.check(/* @__PURE__ */ Yt(e, t));
    },
    max(e, t) {
      return this.check(/* @__PURE__ */ Yt(e, t));
    },
    int(e) {
      return this.check(Hr(e));
    },
    safe(e) {
      return this.check(Hr(e));
    },
    positive(e) {
      return this.check(/* @__PURE__ */ zr(0, e));
    },
    nonnegative(e) {
      return this.check(/* @__PURE__ */ Gt(0, e));
    },
    negative(e) {
      return this.check(/* @__PURE__ */ $r(0, e));
    },
    nonpositive(e) {
      return this.check(/* @__PURE__ */ Yt(0, e));
    },
    multipleOf(e, t) {
      return this.check(/* @__PURE__ */ Mr(e, t));
    },
    step(e, t) {
      return this.check(/* @__PURE__ */ Mr(e, t));
    },
    finite() {
      return this;
    }
  })
);
function I(e) {
  return /* @__PURE__ */ Mu(Pi, e);
}
const df = /* @__PURE__ */ f("ZodNumberFormat", (e, t) => {
  Il.init(e, t), Pi.init(e, t);
});
function Hr(e) {
  return /* @__PURE__ */ Zu(df, e);
}
const ff = /* @__PURE__ */ f("ZodBoolean", (e, t) => {
  Nl.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => ld(e, n, r);
});
function Yn(e) {
  return /* @__PURE__ */ Du(ff, e);
}
const hf = /* @__PURE__ */ f("ZodUnknown", (e, t) => {
  Pl.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => dd();
});
function Kr() {
  return /* @__PURE__ */ Lu(hf);
}
const pf = /* @__PURE__ */ f("ZodNever", (e, t) => {
  Rl.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => ud(e, n, r);
});
function mf(e) {
  return /* @__PURE__ */ Fu(pf, e);
}
const _f = /* @__PURE__ */ f("ZodArray", (e, t) => {
  Jn(), zl.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => _d(e, n, r, o), e.element = t.element;
}, {
  min(e, t) {
    return this.check(/* @__PURE__ */ Tt(e, t));
  },
  nonempty(e) {
    return this.check(/* @__PURE__ */ Tt(1, e));
  },
  max(e, t) {
    return this.check(/* @__PURE__ */ pi(e, t));
  },
  length(e, t) {
    return this.check(/* @__PURE__ */ mi(e, t));
  },
  unwrap() {
    return this.element;
  }
});
function F(e, t) {
  return /* @__PURE__ */ qu(_f, e, t);
}
const gf = /* @__PURE__ */ f("ZodObject", (e, t) => {
  Jn(), Dl.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => gd(e, n, r, o), Ma(e, "shape", (n) => n._zod.def.shape, !1);
}, {
  keyof() {
    return ct(Object.keys(this._zod.def.shape));
  },
  catchall(e) {
    return this.clone(H(this._zod.def, { catchall: e }));
  },
  passthrough() {
    return this.clone(H(this._zod.def, { catchall: Kr() }));
  },
  loose() {
    return this.clone(H(this._zod.def, { catchall: Kr() }));
  },
  strict() {
    return this.clone(H(this._zod.def, { catchall: mf() }));
  },
  strip() {
    return this.clone(H(this._zod.def, { catchall: void 0 }));
  },
  extend(e) {
    return Ta(this, e);
  },
  safeExtend(e) {
    return ka(this, e);
  },
  merge(e) {
    return Oa(this, e);
  },
  pick(e) {
    return Ea(this, e);
  },
  omit(e) {
    return Sa(this, e);
  },
  partial(...e) {
    return mr(Ai, this, e[0]);
  },
  exactPartial(...e) {
    return mr($i, this, e[0], "exactPartial");
  },
  required(...e) {
    return Ca(zi, this, e[0]);
  }
});
function C(e, t) {
  const n = {
    type: "object",
    shape: e ?? {},
    ...b(t)
  };
  return new gf(n);
}
const Ri = /* @__PURE__ */ f("ZodUnion", (e, t) => {
  ci.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => vd(e, n, r, o), e.options = t.options;
});
function Gn(e, t) {
  return new Ri({
    type: "union",
    options: e,
    ...b(t)
  });
}
const vf = /* @__PURE__ */ f("ZodDiscriminatedUnion", (e, t) => {
  Ri.init(e, t), Fl.init(e, t);
});
function bf(e, t, n) {
  return new vf({
    type: "union",
    options: t,
    discriminator: e,
    ...b(n)
  });
}
const yf = /* @__PURE__ */ f("ZodIntersection", (e, t) => {
  Ul.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => bd(e, n, r, o);
});
function wf(e, t) {
  return new yf({
    type: "intersection",
    left: e,
    right: t
  });
}
const gn = /* @__PURE__ */ f("ZodEnum", (e, t) => {
  Wl.init(e, t), z.init(e, t), e._zod.processJSONSchema = (r, o, i) => fd(e, r, o), e.enum = t.entries, e.options = [...e._zod.values];
  const n = new Set(Object.keys(t.entries));
  e.extract = (r, o) => {
    const i = {};
    for (const s of r)
      if (n.has(s))
        i[s] = t.entries[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new gn({
      ...t,
      checks: [],
      ...b(o),
      entries: i
    });
  }, e.exclude = (r, o) => {
    const i = { ...t.entries };
    for (const s of r)
      if (n.has(s))
        delete i[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new gn({
      ...t,
      checks: [],
      ...b(o),
      entries: i
    });
  };
});
function ct(e, t) {
  const n = Array.isArray(e) ? Object.fromEntries(e.map((r) => [r, r])) : e;
  return new gn({
    type: "enum",
    entries: n,
    ...b(t)
  });
}
const Ef = /* @__PURE__ */ f("ZodLiteral", (e, t) => {
  jl.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => hd(e, n, r, o), e.values = new Set(t.values), Object.defineProperty(e, "value", {
    get() {
      if (t.values.length > 1)
        throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
      return t.values[0];
    }
  });
});
function _t(e, t) {
  return new Ef({
    type: "literal",
    values: Array.isArray(e) ? e : [e],
    ...b(t)
  });
}
const Sf = /* @__PURE__ */ f("ZodTransform", (e, t) => {
  Jn(), xl.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => md(e, n, r, o), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      throw new Vo(e.constructor.name);
    n.addIssue = (i) => {
      if (typeof i == "string")
        n.issues.push(ot(i, n.value, t));
      else {
        const s = i;
        s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), "input" in s || (s.input = n.value), s.inst ?? (s.inst = e), n.issues.push(ot(s));
      }
    };
    const o = t.transform(n.value, n);
    return o instanceof Promise ? o.then((i) => (n.value = i, n)) : (n.value = o, n);
  };
});
function Tf(e) {
  return new Sf({
    type: "transform",
    transform: e
  });
}
const Ai = /* @__PURE__ */ f("ZodOptional", (e, t) => {
  li.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => Oi(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Br(e) {
  return new Ai({
    type: "optional",
    innerType: e
  });
}
const $i = /* @__PURE__ */ f("ZodExactOptional", (e, t) => {
  Hl.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => Oi(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function kf(e) {
  return new $i({
    type: "optional",
    innerType: e
  });
}
const Of = /* @__PURE__ */ f("ZodNullable", (e, t) => {
  Kl.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => yd(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Vr(e) {
  return new Of({
    type: "nullable",
    innerType: e
  });
}
const Cf = /* @__PURE__ */ f("ZodDefault", (e, t) => {
  Bl.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => Ed(e, n, r, o), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function If(e, t) {
  return new Cf({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : Uo(t);
    }
  });
}
const Nf = /* @__PURE__ */ f("ZodPrefault", (e, t) => {
  Vl.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => Sd(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Pf(e, t) {
  return new Nf({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : Uo(t);
    }
  });
}
const zi = /* @__PURE__ */ f("ZodNonOptional", (e, t) => {
  Jl.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => wd(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Rf(e, t) {
  return new zi({
    type: "nonoptional",
    innerType: e,
    ...b(t)
  });
}
const Af = /* @__PURE__ */ f("ZodCatch", (e, t) => {
  Yl.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => Td(e, n, r, o), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function $f(e, t) {
  return new Af({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : Da(t)
  });
}
const zf = /* @__PURE__ */ f("ZodPipe", (e, t) => {
  Gl.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => kd(e, n, r, o), e.in = t.in, e.out = t.out;
});
function Jr(e, t) {
  return new zf({
    type: "pipe",
    in: e,
    out: t
    // ...util.normalizeParams(params),
  });
}
const Mf = /* @__PURE__ */ f("ZodReadonly", (e, t) => {
  ql.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => Od(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Zf(e) {
  return new Mf({
    type: "readonly",
    innerType: e
  });
}
const Df = /* @__PURE__ */ f("ZodCustom", (e, t) => {
  Xl.init(e, t), z.init(e, t), e._zod.processJSONSchema = (n, r, o) => pd(e, n, r, o);
});
function Lf(e, t = {}) {
  return /* @__PURE__ */ Xu(Df, e, t);
}
function Ff(e, t) {
  return /* @__PURE__ */ Qu(e, t);
}
const Uf = ["sleep", "low", "normal", "high"], Mi = ["offline", "error", "sleep", "low", "normal", "high"], Wf = ["hashrate", "power"], vn = ["1m", "5m", "30m", "3h", "1d"], it = ct(Uf), jf = ct(Mi), xf = ct(Wf), bn = ct(vn), Z = I().nonnegative(), Zi = 200, qn = I().min(0).max(Zi), Fe = I().int().nonnegative(), Di = C({
  offline: I().int().nonnegative(),
  error: I().int().nonnegative(),
  sleep: I().int().nonnegative(),
  low: I().int().nonnegative(),
  normal: I().int().nonnegative(),
  high: I().int().nonnegative(),
  empty: I().int().nonnegative()
});
C({
  statusCode: I().int(),
  error: w(),
  message: w()
});
const Hf = C({
  siteName: w(),
  /** False on the hosted demo: the UI shows live data but disables every command. */
  commandsEnabled: Yn(),
  /** Where the hosted demo's "Download the App" button points; null shows no button. */
  downloadUrl: Jd({ protocol: /^https?$/ }).nullable()
}), Kf = C({
  miners: C({
    total: I().int().nonnegative(),
    online: I().int().nonnegative(),
    error: I().int().nonnegative(),
    offline: I().int().nonnegative()
  }),
  hashrateThs: Z,
  powerW: Z
}), Bf = C({
  id: w(),
  name: w(),
  containerId: w(),
  hashrateThs: Z,
  powerW: Z,
  minerStatus: Di
}), Li = C({
  id: w(),
  name: w(),
  /** Miner model shown under the container name, e.g. "MicroBT WhatsMiner M56". */
  model: w(),
  hashrateThs: Z,
  powerW: Z,
  /** The container-wide power mode; null when its miners run in mixed modes. */
  powerMode: it.nullable(),
  /** The container-wide power percentage; null when mixed. */
  powerPct: qn.nullable(),
  /** Power modes every miner in the container accepts (vendors differ). */
  supportedPowerModes: F(it),
  minerStatus: Di,
  /**
   * The container's ambient temperature, from its layout `envDeviceId`; null
   * when it names none or the device has no reading.
   */
  envTempC: I().nullable(),
  racks: F(Bf)
}), Vf = C({ containers: F(Li) }), Jf = 1e3, Yf = 288, yn = {
  metric: xf,
  interval: bn,
  /** Narrow the series to one container; without it the series is site-wide. */
  containerId: w().optional(),
  /** Narrow the series to one rack. */
  rackId: w().optional()
}, Fi = I().int().min(1).max(Jf);
C({
  ...yn,
  limit: Fi.optional(),
  start: Fe.optional(),
  end: Fe.optional()
});
Gn([
  C({ ...yn, limit: Fi.optional() }),
  C({ ...yn, start: Fe, end: Fe })
]);
const Yr = C({ ts: Fe, value: Z }), Gf = bf("metric", [
  C({
    metric: _t("hashrate"),
    interval: bn,
    unit: _t("TH/s"),
    points: F(Yr),
    /** Nominal hashrate of the same scope, TH/s. */
    nominal: Z
  }),
  C({
    metric: _t("power"),
    interval: bn,
    unit: _t("W"),
    points: F(Yr)
  })
]), qf = C({
  id: w(),
  name: w(),
  containerId: w(),
  powerW: Z,
  /** Hashrate of the miners behind this meter. */
  hashrateThs: Z,
  miners: I().int().nonnegative()
}), Xf = C({
  /**
   * Site total consumption: the layout's site meter, else the container
   * meters' sum. Site efficiency = this / hashrate.
   */
  siteMeterPowerW: Z,
  /** Sum of the miners' own power readings. Mining efficiency = this / hashrate. */
  minersPowerW: Z,
  hashrateThs: Z,
  meters: F(qf)
}), Ui = C({
  id: w(),
  serial: w(),
  ip: w(),
  containerId: w(),
  rackId: w(),
  /** Socket position in the rack, e.g. "1-1-3". */
  position: w(),
  status: jf,
  powerMode: it,
  /**
   * Power percentage: the worker's reading, or else the last value the app
   * applied; null when neither is known.
   */
  powerPct: qn.nullable(),
  supportedPowerModes: F(it),
  hashrateThs: Z,
  powerW: Z,
  frequencyMhz: Z,
  inletTempC: I(),
  /** Its container's `envTempC`: the container's reading, not the miner's. */
  envTempC: I().nullable(),
  chipTempC: I(),
  uptimeS: Z,
  /** Last successful poll. */
  lastUpdate: Fe
}), Qf = C({
  container: Li.pick({
    id: !0,
    name: !0,
    model: !0,
    hashrateThs: !0,
    powerW: !0
  }),
  racks: F(
    C({
      id: w(),
      name: w(),
      sockets: F(
        C({
          position: w(),
          miner: Ui.nullable(),
          /**
           * The socket's current from its container's PDU, in A; null when the
           * socket names no PDU socket or the PDU has no reading for it.
           */
          currentA: I().nullable(),
          /** Whether the PDU powers the socket; null as for `currentA`. Never guessed. */
          enabled: Yn().nullable()
        })
      )
    })
  )
}), Xn = 200;
C({
  containerId: w().optional(),
  /** Matches id, serial, IP or position. */
  search: w().optional(),
  /** 1-based. */
  page: I().int().positive().optional(),
  /** Default {@link MINERS_DEFAULT_PAGE_SIZE}. */
  pageSize: I().int().min(1).max(Xn).optional()
});
const Wi = C({
  items: F(Ui),
  total: I().int().nonnegative(),
  page: I().int().positive(),
  pageSize: I().int().positive()
}), ji = Gn([
  C({ containerId: w() }),
  C({ minerIds: F(w()).min(1) })
]), eh = C({
  target: ji,
  mode: it
}), th = C({ target: ji, pct: qn }), Gr = C({
  accepted: Yn(),
  minerCount: I().int().nonnegative()
}), nh = C({
  /** Position in the rack, e.g. "1-3". Unique within the rack. */
  position: w().min(1),
  /** The MDK device in this socket; null for an empty socket. Unique across the site. */
  deviceId: w().min(1).nullable(),
  /**
   * The PDU socket feeding this socket, as the container's Worker names it
   * (Bitdeer: pdu "1-1", socket "a1"). Both or neither; unique within the
   * container, and only in a container that names its `containerDeviceId`.
   */
  pdu: w().min(1).nullable().optional(),
  socket: w().min(1).nullable().optional()
}), rh = C({
  /** Unique across the site. */
  id: w().min(1),
  name: w().min(1),
  sockets: F(nh)
}), oh = C({
  /** Unique across the site. */
  id: w().min(1),
  name: w().min(1),
  /** Miner model shown under the container name, e.g. "MicroBT WhatsMiner M56". */
  model: w().min(1),
  /** Nominal hashrate of one miner in this container, TH/s. */
  nominalHashrateThs: Z,
  /** The power meter device behind this container; null when it has none. */
  meterDeviceId: w().min(1).nullable(),
  /**
   * The device reporting the container's ambient temperature: the container's
   * own Worker, or a sensor. Several containers may name one site sensor.
   * Absent or null: the container has none.
   */
  envDeviceId: w().min(1).nullable().optional(),
  /**
   * The container's own Worker, which reports its PDU sockets (current, on/off).
   * May be the same device as `envDeviceId`; one per container. Absent or null:
   * the container has none.
   */
  containerDeviceId: w().min(1).nullable().optional(),
  racks: F(rh)
}), Pe = (e, t, n, r) => {
  const o = /* @__PURE__ */ new Set();
  n.forEach((i, s) => {
    o.has(i) && e.addIssue({ code: "custom", message: `duplicate ${t} "${i}"`, path: [...r, s] }), o.add(i);
  });
};
C({
  /**
   * The meter of the whole site, cooling included (e.g. a DCS reading the
   * site main meter); its reading is the site's total consumption. Absent
   * or null: the total is the container meters' sum.
   */
  siteMeterDeviceId: w().min(1).nullable().optional(),
  containers: F(oh)
}).superRefine((e, t) => {
  Pe(
    t,
    "container id",
    e.containers.map((o) => o.id),
    ["containers"]
  ), Pe(
    t,
    "rack id",
    e.containers.flatMap((o) => o.racks.map((i) => i.id)),
    ["containers"]
  ), e.containers.forEach((o, i) => {
    o.racks.forEach((s, a) => {
      Pe(
        t,
        "socket position",
        s.sockets.map((c) => c.position),
        ["containers", i, "racks", a, "sockets"]
      );
    });
  });
  const n = [
    ...e.siteMeterDeviceId == null ? [] : [e.siteMeterDeviceId],
    ...e.containers.flatMap((o) => [
      ...o.meterDeviceId === null ? [] : [o.meterDeviceId],
      ...o.racks.flatMap(
        (i) => i.sockets.flatMap((s) => s.deviceId === null ? [] : [s.deviceId])
      )
    ])
  ];
  Pe(t, "device id", n, ["containers"]);
  const r = new Set(n);
  e.containers.forEach((o, i) => {
    o.envDeviceId != null && r.has(o.envDeviceId) && t.addIssue({
      code: "custom",
      message: `env device "${o.envDeviceId}" is also a miner or a meter`,
      path: ["containers", i, "envDeviceId"]
    }), o.containerDeviceId != null && r.has(o.containerDeviceId) && t.addIssue({
      code: "custom",
      message: `container device "${o.containerDeviceId}" is also a miner or a meter`,
      path: ["containers", i, "containerDeviceId"]
    });
    const s = [];
    o.racks.forEach((a, c) => {
      a.sockets.forEach((u, d) => {
        const h = ["containers", i, "racks", c, "sockets", d];
        u.pdu == null != (u.socket == null) ? t.addIssue({ code: "custom", message: "pdu and socket go together", path: h }) : u.pdu != null && u.socket != null && (o.containerDeviceId == null && t.addIssue({
          code: "custom",
          message: "a PDU socket needs the container's containerDeviceId",
          path: h
        }), s.push(`${u.pdu} / ${u.socket}`));
      });
    }), Pe(t, "PDU socket", s, ["containers", i, "racks"]);
  }), Pe(
    t,
    "container device",
    e.containers.flatMap((o) => o.containerDeviceId == null ? [] : [o.containerDeviceId]),
    ["containers"]
  );
});
const xi = "op-centre-lite", Hi = [xi, "live"], Ne = {
  /** The site config; it only changes with a restart, so it is not live. */
  config: (e) => [xi, "config", e],
  /** A read of live site data, by what it reads and its URL. */
  live: (e, t) => [...Hi, e, t]
}, we = async (e, t) => t.parse(await Ao(e)), qr = async (e, t, n) => {
  const r = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  };
  return n.parse(await Ao(e, r));
}, ue = {
  CONFIG: "/api/config",
  SITE_SUMMARY: "/api/site/summary",
  CONTAINERS: "/api/containers",
  HISTORY: "/api/history",
  POWER_METERS: "/api/power-meters",
  MINERS: "/api/miners",
  POWER_MODE: "/api/commands/power-mode",
  POWER_PCT: "/api/commands/power-pct"
}, ih = (e) => `/api/containers/${encodeURIComponent(e)}/layout`, sh = (e) => `/api/miners/${encodeURIComponent(e)}/logs`, zt = () => {
  const { apiUrl: e } = oe(), t = e(ue.CONFIG);
  return Ie({
    queryKey: Ne.config(t),
    queryFn: () => we(t, Hf),
    staleTime: Number.POSITIVE_INFINITY
  }).data;
}, Ki = () => zt()?.commandsEnabled !== !1 ? null : /* @__PURE__ */ l("p", { className: "op-centre-lite-demo-banner", role: "status", children: "This hosted demo shows live data but can't send commands to miners. Download and run it locally to change power modes." }), ah = () => {
  const e = zt();
  return e?.commandsEnabled !== !1 || e.downloadUrl === null ? null : /* @__PURE__ */ m(
    "a",
    {
      className: "op-centre-lite-download-app",
      href: e.downloadUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      children: [
        /* @__PURE__ */ l(Oo, {}),
        "Download the App"
      ]
    }
  );
}, Xr = {
  MINERS: "op-centre-lite-miners-box--no-pool",
  HASHRATE: "op-centre-lite-hashrate-box--no-pool"
}, ch = ({ view: e }) => {
  if (e.status === "error")
    return /* @__PURE__ */ l(ne, { title: "Could not load the site summary", error: e.message });
  const t = e.status === "ready" ? e.stats : void 0;
  return /* @__PURE__ */ m(Hs, { children: [
    /* @__PURE__ */ l(
      Ks,
      {
        className: Xr.MINERS,
        total: t?.miners.total,
        appTotal: t?.miners.total,
        online: t?.miners.online,
        error: t?.miners.error,
        offline: t?.miners.offline
      }
    ),
    /* @__PURE__ */ l(Bs, { className: Xr.HASHRATE, appPhs: t?.hashratePhs }),
    /* @__PURE__ */ l(Vs, { valueMw: t?.consumptionMw }),
    /* @__PURE__ */ l(Js, { valueWthS: t?.efficiencyWPerThs })
  ] });
}, lh = 404, uh = 501, dh = /* @__PURE__ */ new Set([500, 502, 503, 504]), fe = (e, t) => e instanceof Cd ? `${t} answered with a body that does not match the contract.` : e instanceof ze && e.status === lh ? `Nothing serves ${t} (HTTP 404). Is the app's backend running?` : e instanceof ze && e.status === uh ? `This site does not offer ${t} (HTTP 501).` : e instanceof ze && dh.has(e.status) ? `The app's backend is not reachable (HTTP ${e.status}). Try again in a moment.` : e instanceof Error ? e.message : String(e), Y = "-", fh = 1e3, hh = 1e3, ph = 1e6, ge = (e) => e / fh, B = (e) => e / hh, Qn = (e) => e / ph, te = (e, t) => t > 0 ? e / t : void 0, S = {
  HASHRATE: "PH/s",
  /** One miner's hashrate. */
  HASHRATE_TH: "TH/s",
  POWER: "MW",
  /** One miner's power. */
  POWER_W: "W",
  /** Container and rack power, as Figma's Site Overview shows it. */
  POWER_KW: "kW",
  EFFICIENCY: "W/TH/s",
  /** Container and rack efficiency, as Figma's Site Overview cards show it. */
  EFFICIENCY_CARD: "W/TH",
  PERCENT: "%",
  TEMPERATURE: "°C",
  FREQUENCY: "MHz",
  /** A socket's current, from its PDU. */
  CURRENT: "A"
}, O = {
  HASHRATE: 2,
  HASHRATE_TH: 2,
  /** A miner's hash rate on a socket tile, where there is room for whole TH/s only. */
  HASHRATE_TH_SOCKET: 0,
  /** A miner's power on a socket tile, in kW. */
  POWER_KW_SOCKET: 1,
  /** A miner's power in the container page's side panel, in kW. */
  POWER_KW_MINER: 2,
  POWER: 3,
  POWER_W: 0,
  POWER_KW: 0,
  EFFICIENCY: 2,
  TEMPERATURE: 1,
  FREQUENCY: 0,
  CURRENT: 1,
  /** Site Efficiency's consumption breakdown: kW and shares to two decimals, as the design shows them. */
  BREAKDOWN: 2
}, E = (e, t) => e.toLocaleString("en-US", {
  minimumFractionDigits: t,
  maximumFractionDigits: t
}), mh = (e, t) => {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}, Ee = (e, t) => `${e} ${t}`, He = (e, t = S.EFFICIENCY_CARD) => e === void 0 ? Y : Ee(E(e, O.EFFICIENCY), t), Mt = (e) => Ee(E(e, O.POWER_KW), S.POWER_KW), er = (e) => Ee(E(B(e), O.POWER_KW_MINER), S.POWER_KW), _h = (e) => Ee(E(e, O.FREQUENCY), S.FREQUENCY), Zt = (e) => Ee(E(e, O.HASHRATE), S.HASHRATE), Dt = (e) => Ee(E(e, O.HASHRATE_TH), S.HASHRATE_TH), gh = (e) => Ee(E(e, O.POWER_W), S.POWER_W), qe = (e) => Ee(E(e, O.TEMPERATURE), S.TEMPERATURE), Lt = (e) => `${E(e, 0)}${S.PERCENT}`, Ce = (e, t, n = `${t}s`) => `${E(e, 0)} ${e === 1 ? t : n}`, vh = (e) => ({
  miners: e.miners,
  hashratePhs: ge(e.hashrateThs),
  consumptionMw: Qn(e.powerW),
  efficiencyWPerThs: te(e.powerW, e.hashrateThs)
}), bh = 3e4, Bi = () => {
  const { apiUrl: e } = oe(), t = e(ue.SITE_SUMMARY), n = Ie({
    queryKey: Ne.live("site-summary", t),
    queryFn: () => we(t, Kf),
    refetchInterval: bh
  });
  return n.data !== void 0 ? { status: "ready", stats: vh(n.data) } : n.isError ? { status: "error", message: fe(n.error, t) } : { status: "loading" };
}, Ue = ({
  title: e,
  subtitle: t,
  actions: n,
  className: r,
  demoNotice: o = "header",
  children: i
}) => {
  const s = Bi();
  return /* @__PURE__ */ m(
    "section",
    {
      className: r === void 0 ? "op-centre-lite-page" : `op-centre-lite-page ${r}`,
      children: [
        /* @__PURE__ */ l(ch, { view: s }),
        /* @__PURE__ */ m("header", { className: "op-centre-lite-page__header", children: [
          /* @__PURE__ */ m("div", { children: [
            /* @__PURE__ */ l(K, { variant: "heading1", children: e }),
            t === void 0 ? null : typeof t == "string" ? /* @__PURE__ */ l("p", { className: "op-centre-lite-page__subtitle", children: t }) : t
          ] }),
          /* @__PURE__ */ m("div", { className: "op-centre-lite-page__actions", children: [
            n,
            /* @__PURE__ */ l(ah, {})
          ] })
        ] }),
        o === "header" ? /* @__PURE__ */ l(Ki, {}) : null,
        i
      ]
    }
  );
}, yh = "rgba(247, 147, 26, 0.35)", wh = "rgba(247, 147, 26, 0)", Eh = (e, t, n, r) => {
  const o = Mn(null), i = n.datasets[0]?.data;
  Me(() => {
    const s = e.current;
    !r || !t || s === null || i === void 0 || (o.current?.chart !== s && (o.current = {
      chart: s,
      series: s.addAreaSeries({
        lineColor: "transparent",
        topColor: yh,
        bottomColor: wh,
        lineWidth: 1,
        priceLineVisible: !1,
        lastValueVisible: !1,
        crosshairMarkerVisible: !1
      })
    }), o.current.series.setData(
      i.map(({ x: a, y: c }) => {
        const u = Math.round(a / 1e3);
        return c === null ? { time: u } : { time: u, value: c };
      })
    ));
  }, [e, t, r, i]), Me(
    () => () => {
      const s = o.current;
      if (o.current = null, s !== null)
        try {
          s.chart.removeSeries(s.series);
        } catch {
        }
    },
    []
  );
}, Sh = (e) => {
  const t = Mn(null), [n, r] = R(!1);
  return Me(() => {
    if (n) return;
    let i = 0;
    const s = () => {
      t.current === null ? i = requestAnimationFrame(s) : r(!0);
    };
    return i = requestAnimationFrame(s), () => cancelAnimationFrame(i);
  }, [n]), { data: de(
    () => ({ ...e, datasets: [...e.datasets] }),
    // `chartReady` is a dependency on purpose: flipping it re-creates `datasets`.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [e, n]
  ), chartRef: t, chartReady: n };
}, Th = { datasets: [] }, kh = (e) => ({
  ...e,
  datasets: e.datasets.map((t) => ({
    ...t,
    legendIcon: /* @__PURE__ */ l(
      "span",
      {
        className: "op-centre-lite-legend-key",
        "data-line": t.lineStyle ?? "solid",
        style: { color: t.borderColor }
      }
    )
  }))
}), Ot = ({
  title: e,
  view: t,
  toggle: n,
  axisFormat: r,
  fill: o = !1
}) => {
  const i = Sh(t.status === "ready" ? t.chart : Th);
  Eh(i.chartRef, i.chartReady, i.data, o);
  const s = de(() => kh(i.data), [i.data]);
  if (t.status === "error")
    return /* @__PURE__ */ l(ne, { title: `Could not load ${e.toLowerCase()}`, error: t.message });
  const a = t.status === "ready" && t.stale;
  return /* @__PURE__ */ m("div", { className: "op-centre-lite-history", "data-stale": a, "aria-busy": a, children: [
    a ? /* @__PURE__ */ l(Co, { className: "op-centre-lite-history__loader" }) : null,
    /* @__PURE__ */ l(
      Ys,
      {
        title: e,
        data: s,
        chartRef: i.chartRef,
        isLoading: t.status === "loading",
        timelineOptions: n?.options,
        timeline: n?.value,
        onTimelineChange: n?.onChange,
        chartProps: { customDateFormat: r, disableAutoRange: !0 },
        detailLegends: !0,
        minHeight: 280
      }
    )
  ] });
}, Ae = 6e4, st = {
  "1m": Ae,
  "5m": 5 * Ae,
  "30m": 30 * Ae,
  "3h": 180 * Ae,
  "1d": 1440 * Ae
}, Vi = (e, t, n) => Math.floor(n / st[e]) - Math.floor(t / st[e]) + 1, Oh = 1440 * Ae, Ch = (e) => e.kind === "range" && e.end - e.start > Oh, Ih = ({ containerId: e, rackId: t }) => ({
  containerId: e,
  ...t === void 0 ? {} : { rackId: t }
}), Ji = [
  "5m",
  "30m",
  "3h",
  "1d"
], Qr = "5m", Yi = {
  "5m": "1m",
  "30m": "1m",
  "3h": "5m",
  "1d": "30m"
}, Nh = (e) => st[e] / st[Yi[e]] + 1, eo = (e, t, n) => ({
  metric: e,
  interval: Yi[t],
  limit: Nh(t)
}), Ph = (e, t, n, r) => ({
  metric: e,
  interval: t,
  ...Ih(r),
  start: n.start,
  end: n.end
}), Rh = (e, t) => {
  const n = st[e.interval];
  if ("start" in e) {
    const i = Math.floor(e.start / n);
    return Array.from(
      { length: Vi(e.interval, e.start, e.end) },
      (s, a) => (i + a) * n
    );
  }
  const r = e.limit ?? Yf, o = Math.floor(t / n) * n;
  return Array.from({ length: r }, (i, s) => o - (r - 1 - s) * n);
}, Ah = 100, $h = (e) => vn.find(
  (t) => Vi(t, e.start, e.end) <= Ah
) ?? vn.at(-1) ?? "1d", zh = 7, qt = (e) => {
  const t = new Date(e);
  t.setDate(t.getDate() - (zh - 1)), t.setHours(0, 0, 0, 0);
  const n = new Date(e);
  return n.setHours(23, 59, 59, 999), { kind: "range", start: t.getTime(), end: n.getTime() };
}, Mh = (e, t, n) => {
  const r = new Date(e);
  r.setHours(0, 0, 0, 0);
  const o = new Date(t);
  return o.setHours(23, 59, 59, 999), { kind: "range", start: r.getTime(), end: Math.min(o.getTime(), n) };
}, Re = O.HASHRATE, Be = O.POWER, Zh = (e) => {
  if (e.length === 0) return;
  let t = Number.POSITIVE_INFINITY, n = Number.NEGATIVE_INFINITY, r = 0;
  for (const o of e)
    o < t && (t = o), o > n && (n = o), r += o;
  return { min: t, max: n, avg: r / e.length };
}, Gi = (e, t, n, r = []) => {
  const o = new Map(r.map((i) => [i, null]));
  for (const i of e) o.set(i.ts, mh(t(i.value), n));
  return [...o.entries()].sort(([i], [s]) => i - s).map(([i, s]) => ({ x: i, y: s }));
}, qi = (e) => e.flatMap((t) => t.y === null ? [] : [t.y]), Xi = (e, t, n) => {
  const r = Zh(e);
  if (r !== void 0)
    return {
      min: `${E(r.min, n)} ${t}`,
      max: `${E(r.max, n)} ${t}`,
      avg: `${E(r.avg, n)} ${t}`
    };
}, Qi = (e) => e.at(-1), G = { SITE: "site", CONTAINER: "container", RACK: "rack" }, Dh = (e) => e.rackId !== void 0 ? G.RACK : e.containerId !== void 0 ? G.CONTAINER : G.SITE, Lh = {
  [G.SITE]: "Site hash rate",
  [G.CONTAINER]: "Container hash rate",
  [G.RACK]: "Rack hash rate"
}, Fh = {
  [G.SITE]: "Total consumption",
  [G.CONTAINER]: "Container consumption",
  [G.RACK]: "Rack consumption"
}, Uh = (e, t = G.SITE, n) => {
  const r = Gi(e.points, ge, Re, n), o = qi(r), i = ge(e.nominal), s = Qi(o), a = {
    label: Lh[t],
    borderColor: an.secondaryOrange,
    data: r
  };
  s !== void 0 && (a.currentValue = {
    value: E(s, Re),
    unit: S.HASHRATE
  });
  const c = {
    yTicksFormatter: (d) => E(d, Re),
    priceFormatter: (d) => E(d, Re),
    datasets: [
      a,
      {
        label: "Nominal hash rate",
        borderColor: an.grey,
        lineStyle: "dashed",
        data: r.map((d) => ({ x: d.x, y: i })),
        currentValue: {
          value: E(i, Re),
          unit: S.HASHRATE
        }
      }
    ]
  }, u = Xi(o, S.HASHRATE, Re);
  return u !== void 0 && (c.minMaxAvg = u), c;
}, Wh = (e, t = G.SITE, n) => {
  const r = Gi(e.points, Qn, Be, n), o = qi(r), i = Qi(o), s = {
    label: Fh[t],
    borderColor: an.secondaryOrange,
    data: r
  };
  i !== void 0 && (s.currentValue = { value: E(i, Be), unit: S.POWER });
  const a = {
    yTicksFormatter: (u) => E(u, Be),
    priceFormatter: (u) => E(u, Be),
    datasets: [s]
  }, c = Xi(o, S.POWER, Be);
  return c !== void 0 && (a.minMaxAvg = c), a;
}, jh = 6e4, xh = (e) => {
  const t = new URLSearchParams({ metric: e.metric, interval: e.interval });
  return "start" in e ? (t.set("start", String(e.start)), t.set("end", String(e.end))) : e.limit !== void 0 && t.set("limit", String(e.limit)), e.containerId !== void 0 && t.set("containerId", e.containerId), e.rackId !== void 0 && t.set("rackId", e.rackId), t;
}, Hh = (e, t) => !("start" in e) || e.end > t, wn = (e) => {
  const { apiUrl: t } = oe(), n = `${t(ue.HISTORY)}?${xh(e).toString()}`, r = Ie({
    queryKey: Ne.live("history", n),
    // The window's buckets are counted when the answer comes in and travel with
    // it: a previous answer shown while a new window loads keeps its own
    // buckets. They are counted on the browser's clock while the plugin counts
    // on its own; both are epoch-aligned, so they line up, and a skewed browser
    // clock only adds or drops a few empty buckets at the end of the chart.
    queryFn: async () => ({ history: await we(n, Gf), buckets: Rh(e, Date.now()) }),
    refetchInterval: Hh(e, Date.now()) ? jh : !1,
    placeholderData: (a) => a
  }), o = r.data, i = Dh(e), s = de(() => {
    if (o === void 0) return;
    const { history: a, buckets: c } = o;
    return a.metric === "hashrate" ? Uh(a, i, c) : Wh(a, i, c);
  }, [o, i]);
  return s !== void 0 ? { status: "ready", chart: s, stale: r.isPlaceholderData } : r.isError ? { status: "error", message: fe(r.error, n) } : { status: "loading" };
}, Kh = "dd/MM", Bh = "HH:mm", to = (e, t, n) => ({
  view: wn(Ph(e, $h(t), t, n)),
  axisFormat: Ch(t) ? Kh : Bh
}), Vh = (e) => ({
  from: new Date(e.start),
  to: new Date(e.end)
}), Jh = 1e3, Yh = (e) => {
  const [t, n] = R(void 0), [r, o] = R(void 0), [i, s] = R(void 0), [a, c] = R(() => qt(Date.now()));
  Me(() => {
    if (r !== void 0) return;
    const _ = setTimeout(
      () => c(qt(Date.now())),
      Math.max(0, a.end - Date.now()) + Jh
    );
    return () => clearTimeout(_);
  }, [r, a]);
  const u = r?.historyWindow ?? a, d = { containerId: e.container.id, rackId: t }, h = to("hashrate", u, d), p = to("power", u, d), g = (_) => {
    _?.from !== void 0 && _.to !== void 0 ? (o({ range: _, historyWindow: Mh(_.from, _.to, Date.now()) }), s(void 0)) : _ === void 0 ? (o(void 0), s(void 0), c(qt(Date.now()))) : s(_);
  };
  return {
    rackId: t,
    onRackChange: n,
    range: i ?? r?.range ?? Vh(a),
    onRangeChange: g,
    hashrate: h,
    power: p
  };
}, Xt = "all", Gh = "dd/MM/yy", qh = ({ layout: e }) => {
  const t = Yh(e);
  return /* @__PURE__ */ m("div", { className: "op-centre-lite-charts", children: [
    /* @__PURE__ */ m("div", { className: "op-centre-lite-charts__toolbar", children: [
      /* @__PURE__ */ l(
        Gs,
        {
          selected: t.range,
          onSelect: t.onRangeChange,
          dateFormat: Gh,
          triggerClassName: "op-centre-lite-charts__range"
        }
      ),
      /* @__PURE__ */ m(
        Xe,
        {
          value: t.rackId ?? Xt,
          onValueChange: (n) => t.onRackChange(n === Xt ? void 0 : n),
          children: [
            /* @__PURE__ */ l(Qe, { "aria-label": "Rack", className: "op-centre-lite-charts__rack", children: /* @__PURE__ */ l(et, {}) }),
            /* @__PURE__ */ m(tt, { children: [
              /* @__PURE__ */ l(ke, { value: Xt, children: "All Racks" }),
              e.racks.map((n) => /* @__PURE__ */ l(ke, { value: n.id, children: n.name }, n.id))
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ l(Ot, { title: "Hash Rate", ...t.hashrate }),
    /* @__PURE__ */ l(Ot, { title: "Power Consumption", ...t.power, fill: !0 })
  ] });
}, tr = {
  sleep: "Sleep",
  low: "Low",
  normal: "Normal",
  high: "High"
}, Xh = [100, 90, 80, 70, 60, 50], Ct = "Commands are off on this site.", It = { CONTAINER: "container", MINERS: "miners" }, es = (e) => e.kind === "mode" ? tr[e.mode] : Lt(e.pct), Qh = (e, t, n) => {
  const r = es(n);
  return !e.accepted || e.minerCount === 0 ? {
    variant: "warning",
    title: `${t}: nothing changed`,
    description: `No online miner accepts ${r}.`
  } : {
    variant: "success",
    title: `${t} set to ${r}`,
    description: `Sent to ${Ce(e.minerCount, "miner")}.`
  };
}, ep = 403, tp = (e, t, n) => ({
  variant: "error",
  title: `Could not change ${n}`,
  description: e instanceof ze && e.status === ep ? Ct : fe(e, t)
}), np = "mdk-dialog__header--bare", rp = "mdk-button--variant-secondary", ts = ({
  choice: e,
  targetName: t,
  targetKind: n,
  onConfirm: r,
  onCancel: o
}) => /* @__PURE__ */ l(
  qs,
  {
    open: e !== void 0,
    onOpenChange: (i) => {
      i || o();
    },
    children: e === void 0 ? null : /* @__PURE__ */ m(Xs, { children: [
      /* @__PURE__ */ m(Qs, { className: np, children: [
        /* @__PURE__ */ m(ea, { children: [
          "Set ",
          t,
          " to ",
          es(e),
          "?"
        ] }),
        /* @__PURE__ */ l(ta, { children: n === It.CONTAINER ? `This applies right away to every online miner in ${t} that supports it.` : `This applies right away to ${t}.` })
      ] }),
      /* @__PURE__ */ m(na, { children: [
        /* @__PURE__ */ l(ra, { className: rp, children: "Cancel" }),
        /* @__PURE__ */ l(oa, { onClick: () => r(e), children: "Apply" })
      ] })
    ] })
  }
), op = [3e3, 6e3, 9e3], ns = (e, t) => {
  const { apiUrl: n } = oe(), r = Ls(), { notifySuccess: o, notifyInfo: i, notifyWarning: s, notifyError: a } = Io(), [c] = R(() => /* @__PURE__ */ new Set()), u = $o(() => {
    for (const _ of c) clearTimeout(_);
    c.clear();
  }, [c]);
  Me(() => u, [u]);
  const d = ({ variant: _, title: y, description: v }) => {
    const T = {
      success: o,
      info: i,
      warning: s,
      error: a
    }[_];
    T(y, v);
  }, h = (_) => n(_.kind === "mode" ? ue.POWER_MODE : ue.POWER_PCT), p = Fs({
    mutationFn: (_) => _.kind === "mode" ? qr(
      h(_),
      eh.parse({ target: e, mode: _.mode }),
      Gr
    ) : qr(
      h(_),
      th.parse({ target: e, pct: _.pct }),
      Gr
    ),
    onSuccess: (_, y) => d(Qh(_, t, y)),
    onError: (_, y) => d(tp(_, h(y), t)),
    onSettled: () => {
      const _ = () => {
        r.invalidateQueries({ queryKey: Hi });
      };
      _();
      for (const y of op) {
        const v = setTimeout(() => {
          c.delete(v), _();
        }, y);
        c.add(v);
      }
    }
  });
  return { send: (_) => {
    u(), p.mutate(_);
  }, sending: p.isPending };
}, no = "", ro = " (current)", rs = ({
  target: e,
  targetName: t,
  supportedPowerModes: n,
  currentMode: r,
  currentPct: o,
  className: i,
  withPct: s = !0
}) => {
  const a = zt(), c = ns(e, t), [u, d] = R(void 0), h = a?.commandsEnabled === !1, p = la(), g = h ? p : void 0, _ = a?.commandsEnabled !== !0 || c.sending, y = (v) => {
    d(void 0), c.send(v);
  };
  return /* @__PURE__ */ m("div", { className: i, title: h ? Ct : void 0, children: [
    /* @__PURE__ */ m(
      Xe,
      {
        value: no,
        disabled: _ || n.length === 0,
        onValueChange: (v) => {
          const T = n.find((U) => U === v);
          T !== void 0 && d({ kind: "mode", mode: T });
        },
        children: [
          /* @__PURE__ */ l(
            Qe,
            {
              "aria-label": `Set power mode of ${t}`,
              "aria-describedby": g,
              children: /* @__PURE__ */ l(et, { placeholder: "Set Power Mode" })
            }
          ),
          /* @__PURE__ */ l(tt, { children: n.map((v) => /* @__PURE__ */ m(ke, { value: v, children: [
            tr[v],
            v === r ? ro : ""
          ] }, v)) })
        ]
      }
    ),
    s ? /* @__PURE__ */ m(
      Xe,
      {
        value: no,
        disabled: _,
        onValueChange: (v) => d({ kind: "pct", pct: Number(v) }),
        children: [
          /* @__PURE__ */ l(
            Qe,
            {
              "aria-label": `Set power percentage of ${t}`,
              "aria-describedby": g,
              children: /* @__PURE__ */ l(et, { placeholder: "Set Power %" })
            }
          ),
          /* @__PURE__ */ l(tt, { children: Xh.map((v) => /* @__PURE__ */ m(ke, { value: String(v), children: [
            Lt(v),
            v === o ? ro : ""
          ] }, v)) })
        ]
      }
    ) : null,
    h ? /* @__PURE__ */ l("span", { id: p, className: "op-centre-lite-visually-hidden", children: Ct }) : null,
    /* @__PURE__ */ l(
      ts,
      {
        choice: u,
        targetName: t,
        targetKind: "containerId" in e ? It.CONTAINER : It.MINERS,
        onConfirm: y,
        onCancel: () => d(void 0)
      }
    )
  ] });
}, os = ["inletTempC", "chipTempC", "hashrateThs", "powerW"], ip = "inletTempC", oo = { low: "coolest", high: "hottest" }, io = { low: "lowest", high: "highest" }, so = (e, t = 0) => `${E(e, t)}°`, Ft = {
  inletTempC: {
    label: "Inlet temperature",
    format: qe,
    short: so,
    ends: oo
  },
  chipTempC: {
    label: "Chip temperature",
    format: qe,
    short: so,
    ends: oo
  },
  hashrateThs: {
    label: "Hash rate",
    format: Dt,
    short: (e, t = O.HASHRATE_TH_SOCKET) => E(e, t),
    ends: io
  },
  powerW: {
    label: "Consumption",
    format: er,
    short: (e, t = O.POWER_KW_SOCKET) => E(B(e), t),
    ends: io
  }
}, sp = /* @__PURE__ */ new Set(["offline", "sleep", "error"]), is = (e) => e !== null && !sp.has(e.status), ap = (e) => {
  const t = [...e].sort((r, o) => r - o), n = Math.floor(t.length / 2);
  return t.length % 2 === 1 ? t[n] ?? 0 : ((t[n - 1] ?? 0) + (t[n] ?? 0)) / 2;
}, cp = (e, t) => {
  const n = e.flatMap((r) => r.sockets.map((o) => o.miner)).filter(is).map((r) => r[t]);
  if (n.length !== 0)
    return { low: Math.min(...n), median: ap(n), high: Math.max(...n) };
}, ss = [59, 130, 246], En = [58, 53, 49], as = [247, 147, 26], yt = (e) => `#${e.map((t) => t.toString(16).padStart(2, "0")).join("")}`, lp = `linear-gradient(to right, ${yt(ss)}, ${yt(En)} 50%, ${yt(as)})`, ao = (e, t, n) => [
  Math.round(e[0] + (t[0] - e[0]) * n),
  Math.round(e[1] + (t[1] - e[1]) * n),
  Math.round(e[2] + (t[2] - e[2]) * n)
], Qt = (e) => {
  const t = e / 255;
  return t <= 0.04045 ? t / 12.92 : ((t + 0.055) / 1.055) ** 2.4;
}, up = ([e, t, n]) => 0.2126 * Qt(e) + 0.7152 * Qt(t) + 0.0722 * Qt(n), dp = 0.3, fp = (e, { low: t, median: n, high: r }) => {
  if (e === n) return 0.5;
  const o = e < n ? 0.5 * (e - t) / (n - t) : 0.5 + 0.5 * (e - n) / (r - n);
  return Math.min(1, Math.max(0, o));
}, hp = (e, t) => {
  const n = fp(e, t), r = n <= 0.5 ? ao(ss, En, n * 2) : ao(En, as, n * 2 - 1);
  return { fill: yt(r), ink: up(r) > dp ? "dark" : "light" };
}, pp = (e, t, n) => {
  if (!is(e) || n === void 0) return { color: "none", label: "—" };
  const r = e[t];
  return { color: hp(r, n), label: Ft[t].short(r) };
}, mp = (e, t) => {
  if (t === void 0) return;
  const { short: n, ends: r } = Ft[e];
  return {
    low: `${n(t.low)} ${r.low}`,
    median: `${n(t.median)} median`,
    high: `${n(t.high)} ${r.high}`
  };
}, _p = ({ metric: e, scale: t }) => {
  const n = mp(e, t);
  return /* @__PURE__ */ m("div", { className: "op-centre-lite-heat-legend", "aria-label": "Colour scale", children: [
    /* @__PURE__ */ m("div", { className: "op-centre-lite-heat-legend__top", children: [
      /* @__PURE__ */ l("span", { className: "op-centre-lite-heat-legend__title", children: Ft[e].label }),
      /* @__PURE__ */ m("span", { className: "op-centre-lite-heat-legend__keys", children: [
        /* @__PURE__ */ m("span", { className: "op-centre-lite-heat-legend__key", children: [
          /* @__PURE__ */ l("span", { "data-heat": "none", "aria-hidden": "true" }),
          "No metric"
        ] }),
        /* @__PURE__ */ m("span", { className: "op-centre-lite-heat-legend__key", children: [
          /* @__PURE__ */ l("span", { "data-state": "empty", "aria-hidden": "true" }),
          "Vacant"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ l(
      "div",
      {
        className: "op-centre-lite-heat-legend__ramp",
        style: { background: lp },
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ l("div", { className: "op-centre-lite-heat-legend__ticks", children: n === void 0 ? null : /* @__PURE__ */ m(We, { children: [
      /* @__PURE__ */ l("span", { children: n.low }),
      /* @__PURE__ */ l("span", { children: n.median }),
      /* @__PURE__ */ l("span", { children: n.high })
    ] }) })
  ] });
}, nr = {
  offline: "Offline",
  error: "Error",
  sleep: "Sleeping",
  low: "Low",
  normal: "Normal",
  high: "High"
}, gp = 1, Sn = 60 * gp, Tn = 60 * Sn, co = 24 * Tn, cs = (e) => {
  const t = Math.max(0, Math.floor(e));
  if (t < Sn) return `${t} s`;
  if (t < Tn) return `${Math.floor(t / Sn)} min`;
  if (t < co) return `${Math.floor(t / Tn)} h`;
  const n = Math.floor(t / co);
  return n === 1 ? "1 day" : `${n} days`;
}, vp = (e, t) => `${cs((t - e) / 1e3)} ago`, Ut = "empty", rr = "mining-error";
[...Mi];
const Wt = {
  ...nr,
  [rr]: "Mining with Error",
  [Ut]: "No Miner"
}, or = (e) => e === null ? Ut : e.status === "error" && e.hashrateThs > 0 ? rr : e.status, bp = (e) => e === null ? "unknown" : e ? "on" : "off", yp = ({ container: e, racks: t }) => {
  const n = t.map((r) => ({
    id: r.id,
    name: r.name,
    sockets: r.sockets.map(({ position: o, miner: i, currentA: s, enabled: a }) => ({
      position: o,
      state: or(i),
      power: bp(a),
      currentA: s,
      miner: i
    }))
  }));
  return {
    container: {
      id: e.id,
      name: e.name,
      model: e.model,
      minerCount: n.flatMap((r) => r.sockets).filter((r) => r.miner !== null).length,
      hashratePhs: ge(e.hashrateThs),
      powerKw: B(e.powerW),
      efficiencyWPerThs: te(e.powerW, e.hashrateThs)
    },
    racks: n
  };
}, ls = (e, t) => t === void 0 ? void 0 : e.racks.flatMap(
  (n) => n.sockets.flatMap(
    ({ miner: r }) => r !== null && r.id === t ? [{ miner: r, rack: n }] : []
  )
)[0], ir = ({ miner: e, rack: t }) => `${t.name} · Socket ${e.position}`, jt = (e) => e.serial || e.id, us = (e) => e.racks.flatMap((t) => t.sockets).sort((t, n) => t.position.localeCompare(n.position, "en", { numeric: !0 })), wp = {
  ...Wt,
  low: "Mining",
  normal: "Mining",
  high: "Mining"
}, ds = (e) => {
  const t = or(e);
  return { label: "Status", value: wp[t], state: t };
}, Ep = (e) => [
  { label: "Hash Rate", value: Dt(e.hashrateThs) },
  { label: "Consumption", value: er(e.powerW) },
  ds(e),
  { label: "IP", value: e.ip || Y }
], Sp = (e, t) => [
  {
    label: "Efficiency",
    value: He(
      te(e.powerW, e.hashrateThs),
      S.EFFICIENCY
    )
  },
  { label: "Hash Rate", value: Dt(e.hashrateThs) },
  { label: "Frequency", value: _h(e.frequencyMhz) },
  { label: "Temperature", value: qe(e.chipTempC) },
  { label: "Consumption", value: er(e.powerW) },
  { label: "Inlet Temp", value: qe(e.inletTempC) },
  {
    label: "Env Temp",
    value: e.envTempC === null ? Y : qe(e.envTempC)
  },
  { label: "Power Mode", value: tr[e.powerMode] },
  { label: "Uptime", value: e.uptimeS > 0 ? cs(e.uptimeS) : Y },
  ds(e),
  {
    label: "Last Update",
    value: e.lastUpdate > 0 ? vp(e.lastUpdate, t) : Y
  }
], Tp = 404, fs = (e) => e instanceof ze && e.status === Tp, kp = (e, t, n) => e !== void 0 ? { status: "ready", layout: e } : fs(t) ? { status: "not-found" } : t != null ? { status: "error", message: fe(t, n) } : { status: "loading" }, sr = ({ title: e, subtitle: t, children: n }) => /* @__PURE__ */ m("aside", { className: "op-centre-lite-side-panel", "aria-label": e, children: [
  /* @__PURE__ */ m("div", { className: "op-centre-lite-side-panel__head", children: [
    /* @__PURE__ */ l("span", { className: "op-centre-lite-side-panel__title", children: e }),
    /* @__PURE__ */ l("span", { className: "op-centre-lite-side-panel__subtitle", children: t })
  ] }),
  n
] }), Se = ({ title: e, children: t }) => /* @__PURE__ */ m("section", { className: "op-centre-lite-side-panel__section", "aria-label": e, children: [
  /* @__PURE__ */ l("h3", { className: "op-centre-lite-side-panel__section-title", children: e }),
  t
] }), hs = ({ rows: e }) => /* @__PURE__ */ l("dl", { className: "op-centre-lite-metric-grid", children: e.map(({ label: t, value: n, state: r }) => /* @__PURE__ */ m("div", { className: "op-centre-lite-metric-grid__item", children: [
  /* @__PURE__ */ l("dt", { children: t }),
  /* @__PURE__ */ l("dd", { "data-state": r, children: n })
] }, t)) }), Nt = ({ children: e }) => /* @__PURE__ */ l("p", { className: "op-centre-lite-side-panel__hint", children: e }), ar = "Select a socket", Op = (e) => {
  const [t, n] = R(ip), r = cp(e.racks, t);
  return {
    metric: t,
    onMetricChange: n,
    scale: r,
    faceOf: ({ miner: o }) => {
      if (o === null) return;
      const i = pp(o, t, r);
      return { lines: [i.label], heat: i.color };
    }
  };
}, ps = (e, t) => {
  const n = URL.createObjectURL(t), r = document.createElement("a");
  r.href = n, r.download = e, r.click(), setTimeout(() => URL.revokeObjectURL(n), 0);
}, Cp = /filename\*=UTF-8''([^;]+)/i, Ip = /filename="?([^";]+)"?/i, Np = (e) => {
  if (e === null) return;
  const t = Cp.exec(e)?.[1];
  if (t !== void 0)
    try {
      return decodeURIComponent(t.trim());
    } catch {
    }
  return Ip.exec(e)?.[1]?.trim();
}, Pp = async (e, t) => {
  const n = ca.getState().token, r = new Headers();
  n && r.set("Authorization", `Bearer ${n}`);
  const o = await fetch(e, { headers: r });
  if (!o.ok)
    throw new ze(o.status, `HTTP ${o.status}: ${o.statusText}`);
  const i = Np(o.headers.get("content-disposition")) ?? t;
  ps(i, await o.blob());
}, Rp = () => {
  const { apiUrl: e } = oe(), { notifyError: t } = Io(), [n, r] = R(void 0);
  return { download: (i) => {
    const s = e(sh(i.id)), a = jt(i);
    r(i.id), Pp(s, `${a}-logs.tgz`).catch((c) => {
      t(`Could not download the logs of ${a}`, fe(c, s));
    }).finally(() => r((c) => c === i.id ? void 0 : c));
  }, isDownloading: (i) => i === n };
}, ms = (e) => {
  const [t, n] = R(void 0), r = ls(e, t);
  return {
    selected: r,
    isSelected: (o) => o.id === r?.miner.id,
    onSelect: (o) => n((i) => i === o.id ? void 0 : o.id)
  };
}, ee = (e, t) => e === void 0 ? void 0 : Number(e.toFixed(t)), Ap = /[",\r\n]/, $p = /^[=+\-@\t\r]/, lo = (e) => {
  if (e === void 0) return "";
  const t = typeof e == "string" && $p.test(e) ? `'${e}` : String(e);
  return Ap.test(t) ? `"${t.replaceAll('"', '""')}"` : t;
}, kn = (e, t) => [
  e.map((n) => lo(n.header)),
  ...t.map((n) => e.map((r) => lo(r.value(n))))
].map((n) => n.join(",")).join(`\r
`), On = (e, t) => ps(e, new Blob([t], { type: "text/csv;charset=utf-8" })), zp = [
  { header: "Rack", value: (e) => e.rack },
  { header: "Position", value: (e) => e.socket.position },
  { header: "Serial", value: (e) => e.socket.miner?.serial },
  { header: "IP", value: (e) => e.socket.miner?.ip },
  { header: "Status", value: (e) => Wt[e.socket.state] },
  {
    header: "Socket Power",
    value: (e) => e.socket.power === "unknown" ? void 0 : e.socket.power
  },
  {
    header: `Current (${S.CURRENT})`,
    value: (e) => ee(e.socket.currentA ?? void 0, O.CURRENT)
  },
  {
    header: `Consumption (${S.POWER_KW})`,
    value: (e) => ee(
      e.socket.miner === null ? void 0 : B(e.socket.miner.powerW),
      O.POWER_KW_MINER
    )
  },
  {
    header: `Hash rate (${S.HASHRATE_TH})`,
    value: (e) => ee(e.socket.miner?.hashrateThs, O.HASHRATE_TH)
  },
  {
    header: `Power (${S.PERCENT})`,
    value: (e) => e.socket.miner?.powerPct ?? void 0
  },
  {
    header: `Inlet temperature (${S.TEMPERATURE})`,
    value: (e) => ee(e.socket.miner?.inletTempC, O.TEMPERATURE)
  }
], Mp = (e) => {
  const t = new Map(
    e.racks.flatMap((n) => n.sockets.map((r) => [r.position, n.name]))
  );
  return us(e).map((n) => ({
    rack: t.get(n.position) ?? "",
    socket: n
  }));
}, Zp = (e) => `${e.container.id}-sockets.csv`, en = [0.75, 1, 1.25, 1.5], tn = 1, Dp = {
  on: "Socket On",
  off: "Socket Off",
  unknown: void 0
}, Lp = (e, t) => {
  const n = Dp[e.power];
  return (e.miner === null ? [`Socket ${e.position}: no miner`] : [`Socket ${e.position}`, jt(e.miner), Wt[e.state]]).concat(n === void 0 ? [] : [n]).concat(t?.lines ?? []).join(", ");
}, uo = ({ lines: e }) => /* @__PURE__ */ l("span", { className: "op-centre-lite-socket__lines", "aria-hidden": "true", children: e.map((t, n) => (
  // The lines are a fixed list per tab: their order is their identity.
  // oxlint-disable-next-line react/no-array-index-key
  /* @__PURE__ */ l("span", { children: t }, n)
)) }), Fp = (e) => {
  if (e === void 0) return {};
  if (e === "none") return { "data-heat": "none" };
  const t = { "--op-centre-lite-heat": e.fill };
  return { "data-heat": e.ink, style: t };
}, Up = ({ socket: e, face: t, selected: n, onSelect: r }) => {
  const o = Lp(e, t), i = /* @__PURE__ */ l("span", { className: "op-centre-lite-socket__position", children: e.position }), { miner: s } = e;
  return s === null ? /* @__PURE__ */ m(
    "div",
    {
      className: "op-centre-lite-socket",
      "data-state": e.state,
      "data-power": e.power,
      role: "img",
      "aria-label": o,
      children: [
        t === void 0 ? null : /* @__PURE__ */ l(uo, { lines: t.lines }),
        i
      ]
    }
  ) : /* @__PURE__ */ m(
    "button",
    {
      type: "button",
      className: "op-centre-lite-socket",
      "data-state": e.state,
      "data-power": e.power,
      ...Fp(t?.heat),
      "aria-label": o,
      "aria-pressed": n,
      onClick: () => r(s),
      children: [
        /* @__PURE__ */ l(uo, { lines: t?.lines ?? [] }),
        i
      ]
    }
  );
}, _s = ({ sockets: e, faceOf: t, isSelected: n, onSelect: r }) => /* @__PURE__ */ l("div", { className: "op-centre-lite-socket-grid__sockets", children: e.map((o) => /* @__PURE__ */ l(
  Up,
  {
    socket: o,
    face: t(o),
    selected: o.miner !== null && n(o.miner),
    onSelect: r
  },
  o.position
)) }), Wp = ({ rack: e, ...t }) => /* @__PURE__ */ m("section", { className: "op-centre-lite-socket-grid__rack", "aria-label": e.name, children: [
  /* @__PURE__ */ l("h3", { className: "op-centre-lite-socket-grid__rack-name", children: e.name }),
  /* @__PURE__ */ l(_s, { sockets: e.sockets, ...t })
] }), jp = ({ layout: e, zoom: t, ordered: n, ...r }) => /* @__PURE__ */ l(
  "div",
  {
    className: "op-centre-lite-socket-grid",
    "data-ordered": n,
    style: { zoom: t },
    children: n ? /* @__PURE__ */ l(_s, { sockets: us(e), ...r }) : e.racks.map((o) => /* @__PURE__ */ l(Wp, { rack: o, ...r }, o.id))
  }
), cr = ({ layout: e, actions: t, legend: n, ...r }) => {
  const [o, i] = R(tn), [s, a] = R(!1), c = en.indexOf(o), u = en[c - 1], d = en[c + 1], h = () => On(Zp(e), kn(zp, Mp(e)));
  return /* @__PURE__ */ m("div", { className: "op-centre-lite-workbench", children: [
    /* @__PURE__ */ m("div", { className: "op-centre-lite-workbench__head", children: [
      /* @__PURE__ */ m("div", { className: "op-centre-lite-workbench__efficiency", children: [
        /* @__PURE__ */ l("span", { className: "op-centre-lite-workbench__label", children: "Container Efficiency" }),
        /* @__PURE__ */ l("span", { className: "op-centre-lite-workbench__value", children: He(e.container.efficiencyWPerThs, S.EFFICIENCY) })
      ] }),
      t === void 0 ? null : /* @__PURE__ */ l("div", { className: "op-centre-lite-workbench__actions", children: t })
    ] }),
    /* @__PURE__ */ m("div", { className: "op-centre-lite-workbench__tools", role: "toolbar", "aria-label": "Grid tools", children: [
      /* @__PURE__ */ l(
        J,
        {
          variant: "secondary",
          className: "op-centre-lite-tool",
          disabled: d === void 0,
          onClick: () => d !== void 0 && i(d),
          children: "Zoom In"
        }
      ),
      /* @__PURE__ */ l(
        J,
        {
          variant: "secondary",
          className: "op-centre-lite-tool",
          disabled: u === void 0,
          onClick: () => u !== void 0 && i(u),
          children: "Zoom Out"
        }
      ),
      /* @__PURE__ */ l(
        J,
        {
          variant: "secondary",
          className: "op-centre-lite-tool",
          disabled: o === tn,
          onClick: () => i(tn),
          children: "Reset"
        }
      ),
      /* @__PURE__ */ l(J, { variant: "secondary", className: "op-centre-lite-tool", onClick: () => window.print(), children: "Print" }),
      /* @__PURE__ */ l(
        J,
        {
          variant: "secondary",
          className: "op-centre-lite-tool",
          "aria-pressed": s,
          onClick: () => a((p) => !p),
          children: "Ordered View"
        }
      ),
      /* @__PURE__ */ l(J, { variant: "secondary", className: "op-centre-lite-tool", onClick: h, children: "Export" })
    ] }),
    /* @__PURE__ */ l("div", { className: "op-centre-lite-workbench__grid", children: /* @__PURE__ */ l(jp, { layout: e, zoom: o, ordered: s, ...r }) }),
    /* @__PURE__ */ l("div", { className: "op-centre-lite-workbench__legend", children: n })
  ] });
}, xp = (e) => os.some((t) => t === e), fo = "op-centre-lite-heatmap-metric", Hp = ({ layout: e }) => {
  const t = Op(e), n = ms(e), r = Rp(), { selected: o } = n, i = o?.miner;
  return /* @__PURE__ */ m("div", { className: "op-centre-lite-detail-body", children: [
    /* @__PURE__ */ l(
      cr,
      {
        layout: e,
        actions: /* @__PURE__ */ m("div", { className: "op-centre-lite-heatmap__metric", children: [
          /* @__PURE__ */ l("span", { id: fo, children: "Metric" }),
          /* @__PURE__ */ m(
            Xe,
            {
              value: t.metric,
              onValueChange: (s) => {
                xp(s) && t.onMetricChange(s);
              },
              children: [
                /* @__PURE__ */ l(Qe, { "aria-labelledby": fo, children: /* @__PURE__ */ l(et, {}) }),
                /* @__PURE__ */ l(tt, { children: os.map((s) => /* @__PURE__ */ l(ke, { value: s, children: Ft[s].label }, s)) })
              ]
            }
          )
        ] }),
        legend: /* @__PURE__ */ l(_p, { metric: t.metric, scale: t.scale }),
        faceOf: t.faceOf,
        isSelected: n.isSelected,
        onSelect: n.onSelect
      }
    ),
    /* @__PURE__ */ l(
      sr,
      {
        title: e.container.name,
        subtitle: o === void 0 ? ar : ir(o),
        children: i === void 0 ? /* @__PURE__ */ l(Se, { title: "Miner Metrics", children: /* @__PURE__ */ l(Nt, { children: "Select a socket to see its miner." }) }) : /* @__PURE__ */ m(We, { children: [
          /* @__PURE__ */ l(Se, { title: "Miner Controls", children: /* @__PURE__ */ m("div", { className: "op-centre-lite-side-panel__controls", children: [
            /* @__PURE__ */ l(
              rs,
              {
                className: "op-centre-lite-side-panel__power",
                target: { minerIds: [i.id] },
                targetName: jt(i),
                supportedPowerModes: i.supportedPowerModes,
                currentMode: i.powerMode,
                currentPct: i.powerPct,
                withPct: !1
              }
            ),
            /* @__PURE__ */ l(
              J,
              {
                variant: "secondary",
                className: "op-centre-lite-tool",
                loading: r.isDownloading(i.id),
                onClick: () => r.download(i),
                children: "Download Logs"
              }
            )
          ] }) }),
          /* @__PURE__ */ l(Se, { title: "Miner Metrics", children: /* @__PURE__ */ l(hs, { rows: Sp(i, Date.now()) }) }),
          /* @__PURE__ */ l(Se, { title: "Miner Info", children: /* @__PURE__ */ m("dl", { className: "op-centre-lite-side-panel__info", children: [
            /* @__PURE__ */ l("dt", { children: "Serial" }),
            /* @__PURE__ */ l("dd", { children: i.serial === "" ? Y : i.serial })
          ] }) })
        ] })
      }
    )
  ] });
}, Kp = [
  Ut,
  "offline",
  "error",
  "sleep",
  "normal",
  "low",
  "high",
  "mining-error"
], gs = () => /* @__PURE__ */ m("ul", { className: "op-centre-lite-socket-legend", "aria-label": "Legend", children: [
  /* @__PURE__ */ m("li", { children: [
    /* @__PURE__ */ l("span", { className: "op-centre-lite-socket-legend__swatch", "data-power": "off", "aria-hidden": "true" }),
    "Socket Off"
  ] }),
  /* @__PURE__ */ m("li", { children: [
    /* @__PURE__ */ l("span", { className: "op-centre-lite-socket-legend__swatch", "data-power": "on", "aria-hidden": "true" }),
    "Socket On"
  ] }),
  Kp.map((e) => /* @__PURE__ */ m("li", { children: [
    /* @__PURE__ */ l(
      "span",
      {
        className: "op-centre-lite-socket-legend__swatch",
        "data-state": e,
        "aria-hidden": "true"
      }
    ),
    Wt[e]
  ] }, e))
] }), ho = (e) => `${e === null ? Y : E(e, O.CURRENT)} ${S.CURRENT}`, Bp = ({ miner: e, currentA: t }) => e === null ? t === null ? void 0 : { lines: [ho(t)] } : {
  lines: [
    `${E(B(e.powerW), O.POWER_KW_SOCKET)} ${S.POWER_KW}`,
    ho(t)
  ]
}, Vp = ({ layout: e }) => {
  const t = ms(e), { selected: n } = t;
  return /* @__PURE__ */ m("div", { className: "op-centre-lite-detail-body", children: [
    /* @__PURE__ */ l(
      cr,
      {
        layout: e,
        legend: /* @__PURE__ */ l(gs, {}),
        faceOf: Bp,
        isSelected: t.isSelected,
        onSelect: t.onSelect
      }
    ),
    /* @__PURE__ */ l(
      sr,
      {
        title: e.container.name,
        subtitle: n === void 0 ? ar : ir(n),
        children: /* @__PURE__ */ l(Se, { title: "Miner Metrics", children: n === void 0 ? /* @__PURE__ */ l(Nt, { children: "Select a socket to see its miner." }) : /* @__PURE__ */ l(hs, { rows: Ep(n.miner) }) })
      }
    )
  ] });
}, Jp = /* @__PURE__ */ new Set(["offline"]), vs = (e) => !Jp.has(e.status), Cn = (e) => e.racks.flatMap((t) => t.sockets).flatMap((t) => t.miner === null ? [] : [t.miner]).filter(vs), Yp = (e, t) => Cn(e).filter((n) => t.has(n.id)), Gp = (e) => {
  const t = e[0]?.powerPct ?? null;
  return t !== null && e.every((n) => n.powerPct === t) ? t : null;
}, In = 0, Nn = Zi, bs = 100, qp = [0, 50, 100, 150, 200], ys = (e) => Number.isFinite(e) ? Math.min(Nn, Math.max(In, Math.round(e))) : bs, Xp = (e) => {
  if (e.trim() === "") return;
  const t = Number(e);
  return Number.isFinite(t) ? ys(t) : void 0;
}, Qp = (e) => e.length === 1 && e[0] !== void 0 ? jt(e[0]) : Ce(e.length, "miner"), em = (e, t) => e.racks.map((n) => ({
  rack: n.name,
  miners: n.sockets.flatMap(
    (r) => r.miner !== null && t.has(r.miner.id) ? [r.miner] : []
  )
})).filter((n) => n.miners.length > 0), tm = (e) => {
  const t = zt(), [n, r] = R(bs), [o, i] = R(void 0), [s, a] = R(void 0), c = e.miners, u = Qp(c), d = ns({ minerIds: [...e.ids] }, u);
  return {
    pct: n,
    onSlide: (h) => {
      i(void 0), r(ys(h));
    },
    fieldText: o ?? String(n),
    onFieldChange: (h) => {
      i(h);
      const p = Xp(h);
      p !== void 0 && r(p);
    },
    onFieldBlur: () => i(void 0),
    name: u,
    sharedPct: c.length === 0 ? null : Gp(c),
    canApply: c.length > 0 && t?.commandsEnabled === !0 && !d.sending,
    commandsOff: t?.commandsEnabled === !1,
    sending: d.sending,
    pending: s,
    onApply: () => a({ kind: "pct", pct: n }),
    onConfirm: (h) => {
      a(void 0), d.send(h);
    },
    onCancel: () => a(void 0)
  };
}, nm = ({ layout: e, selection: t }) => {
  const n = tm(t), r = t.miners.length, o = em(e, t.ids);
  return /* @__PURE__ */ m(We, { children: [
    /* @__PURE__ */ m(Se, { title: "Power Controls", children: [
      /* @__PURE__ */ m("label", { className: "op-centre-lite-power-panel__field", children: [
        /* @__PURE__ */ l("span", { children: "Manual Input" }),
        /* @__PURE__ */ l(
          No,
          {
            type: "number",
            min: In,
            max: Nn,
            value: n.fieldText,
            onChange: (i) => n.onFieldChange(i.target.value),
            onBlur: n.onFieldBlur,
            suffix: "%",
            wrapperClassName: "op-centre-lite-power-panel__input"
          }
        )
      ] }),
      /* @__PURE__ */ m(
        lt.Root,
        {
          className: "op-centre-lite-slider",
          min: In,
          max: Nn,
          step: 1,
          value: [n.pct],
          onValueChange: ([i]) => n.onSlide(i ?? n.pct),
          children: [
            /* @__PURE__ */ l(lt.Track, { className: "op-centre-lite-slider__track", children: /* @__PURE__ */ l(lt.Range, { className: "op-centre-lite-slider__range" }) }),
            /* @__PURE__ */ l(lt.Thumb, { className: "op-centre-lite-slider__thumb", "aria-label": "Power percentage" })
          ]
        }
      ),
      /* @__PURE__ */ l("div", { className: "op-centre-lite-slider__ticks", "aria-hidden": "true", children: qp.map((i) => /* @__PURE__ */ l("span", { children: Lt(i) }, i)) }),
      /* @__PURE__ */ l(
        J,
        {
          variant: "primary",
          className: "op-centre-lite-power-panel__apply",
          disabled: !n.canApply,
          loading: n.sending,
          onClick: n.onApply,
          children: "Apply"
        }
      ),
      n.commandsOff ? /* @__PURE__ */ l(Nt, { children: Ct }) : null
    ] }),
    /* @__PURE__ */ l(
      Se,
      {
        title: `Selected ${Ce(r, "socket")} from ${e.container.name}`,
        children: o.length === 0 ? /* @__PURE__ */ l(Nt, { children: "Pick sockets on the grid (offline ones cannot be picked)." }) : o.map((i) => /* @__PURE__ */ m("div", { className: "op-centre-lite-power-panel__rack", children: [
          /* @__PURE__ */ l("span", { children: i.rack }),
          /* @__PURE__ */ l("ul", { className: "op-centre-lite-power-panel__chips", children: i.miners.map((s) => /* @__PURE__ */ m("li", { className: "op-centre-lite-power-panel__chip", children: [
            /* @__PURE__ */ l(
              "span",
              {
                className: "op-centre-lite-power-panel__dot",
                "data-state": or(s),
                "aria-hidden": "true"
              }
            ),
            "Socket: ",
            s.position
          ] }, s.id)) })
        ] }, i.rack))
      }
    ),
    /* @__PURE__ */ l(
      ts,
      {
        choice: n.pending,
        targetName: n.name,
        targetKind: It.MINERS,
        onConfirm: n.onConfirm,
        onCancel: n.onCancel
      }
    )
  ] });
}, rm = (e) => {
  const [t, n] = R(() => /* @__PURE__ */ new Set()), r = Yp(e, t), o = (i) => n((s) => {
    const a = new Set(s);
    return a.has(i.id) ? a.delete(i.id) : a.add(i.id), a;
  });
  return {
    miners: r,
    ids: new Set(r.map((i) => i.id)),
    onToggle: o,
    onSelectAll: () => n(new Set(Cn(e).map((i) => i.id))),
    onClear: () => n(/* @__PURE__ */ new Set()),
    selectableCount: Cn(e).length
  };
}, om = ({ miner: e }) => e === null ? void 0 : { lines: [e.powerPct === null ? Y : Lt(e.powerPct)] }, im = ({ layout: e }) => {
  const t = rm(e), [n] = t.miners, r = t.miners.length === 1 ? ls(e, n?.id) : void 0, o = r !== void 0 ? ir(r) : t.miners.length > 1 ? Ce(t.miners.length, "socket") : ar;
  return /* @__PURE__ */ m("div", { className: "op-centre-lite-detail-body", children: [
    /* @__PURE__ */ l(
      cr,
      {
        layout: e,
        actions: /* @__PURE__ */ m(We, { children: [
          /* @__PURE__ */ l(
            J,
            {
              variant: "secondary",
              className: "op-centre-lite-tool",
              disabled: t.miners.length === t.selectableCount,
              onClick: t.onSelectAll,
              children: "Select All"
            }
          ),
          /* @__PURE__ */ l(
            J,
            {
              variant: "secondary",
              className: "op-centre-lite-tool",
              disabled: t.miners.length === 0,
              onClick: t.onClear,
              children: "Deselect All"
            }
          )
        ] }),
        legend: /* @__PURE__ */ l(gs, {}),
        faceOf: om,
        isSelected: (i) => t.ids.has(i.id),
        onSelect: (i) => {
          vs(i) && t.onToggle(i);
        }
      }
    ),
    /* @__PURE__ */ l(sr, { title: e.container.name, subtitle: o, children: /* @__PURE__ */ l(nm, { layout: e, selection: t }) })
  ] });
}, sm = (e) => {
  const t = e.querySelector('[data-state="active"]');
  if (!t) return;
  const n = e.getBoundingClientRect(), r = t.getBoundingClientRect();
  r.left < n.left ? e.scrollLeft -= n.left - r.left : r.right > n.right && (e.scrollLeft += r.right - n.right);
}, am = (e, t) => {
  const n = Mn(null);
  return zo(() => {
    const r = n.current;
    r && sm(r);
  }, [e, t]), n;
}, cm = 3e4, lm = 3, um = (e) => {
  const { apiUrl: t } = oe(), n = t(ih(e)), r = Ie({
    queryKey: Ne.live("layout", n),
    queryFn: () => we(n, Qf),
    refetchInterval: cm,
    retry: (i, s) => !fs(s) && i < lm
  }), o = de(
    () => r.data === void 0 ? void 0 : yp(r.data),
    [r.data]
  );
  return kp(o, r.error, n);
}, ws = [
  { tab: X.LAYOUT, label: "Layout", ready: !0 },
  { tab: X.POWER_ADJUSTMENT, label: "Power Adjustment", ready: !0 },
  { tab: X.CHARTS, label: "Charts", ready: !0 },
  { tab: X.HEATMAP, label: "Heatmap", ready: !0 }
], dm = (e) => ws.find((t) => t.ready && Zo(e) && t.tab === e)?.tab ?? X.LAYOUT, fm = ({ container: e }) => `${e.model} · ${Ce(e.minerCount, "miner")}`, hm = () => {
  const { id: e = "", tab: t } = js(), n = $n(), r = um(e), o = dm(t), i = am(o, r.status === "ready"), s = (c) => {
    Zo(c) && n(hr.tab(e, c), { relative: "route", replace: !0 });
  }, a = /* @__PURE__ */ l(
    ko,
    {
      className: "op-centre-lite-detail__back",
      to: hr.siteOverview,
      relative: "route",
      children: "Site Overview"
    }
  );
  return r.status !== "ready" ? /* @__PURE__ */ m(Ue, { title: e, subtitle: a, className: "op-centre-lite-detail", children: [
    r.status === "loading" ? /* @__PURE__ */ l(at, { type: "circle" }) : null,
    r.status === "not-found" ? /* @__PURE__ */ l(ne, { title: "Container not found", error: `This site has no container "${e}".` }) : null,
    r.status === "error" ? /* @__PURE__ */ l(ne, { title: "Could not load the container", error: r.message }) : null
  ] }) : /* @__PURE__ */ l(
    Ue,
    {
      title: r.layout.container.name,
      subtitle: a,
      actions: /* @__PURE__ */ l("span", { className: "op-centre-lite-detail__meta", children: fm(r.layout) }),
      className: "op-centre-lite-detail",
      demoNotice: "page",
      children: /* @__PURE__ */ m(Po, { variant: "underline", value: o, onValueChange: s, children: [
        /* @__PURE__ */ l(Ro, { ref: i, className: "op-centre-lite-tabs", children: ws.map(({ tab: c, label: u, ready: d }) => /* @__PURE__ */ l(cn, { value: c, disabled: !d, children: u }, c)) }),
        /* @__PURE__ */ l(Ki, {}),
        /* @__PURE__ */ l($e, { value: X.LAYOUT, children: /* @__PURE__ */ l(Vp, { layout: r.layout }) }),
        /* @__PURE__ */ l($e, { value: X.HEATMAP, children: /* @__PURE__ */ l(Hp, { layout: r.layout }) }),
        /* @__PURE__ */ l($e, { value: X.POWER_ADJUSTMENT, children: /* @__PURE__ */ l(im, { layout: r.layout }) }),
        /* @__PURE__ */ l($e, { value: X.CHARTS, children: /* @__PURE__ */ l(qh, { layout: r.layout }) })
      ] })
    }
  );
}, pm = {
  "1m": "1 Min",
  "5m": "5 Min",
  "30m": "30 Min",
  "3h": "3 H",
  "1d": "1 D"
}, mm = {
  "1m": "1m",
  "5m": "5m",
  "30m": "30m",
  "3h": "3h",
  "1d": "1D"
}, lr = (e) => mm[e], _m = (e) => ({
  value: lr(e),
  label: pm[e]
}), gm = Ji.map(_m), vm = (e) => lr(e), bm = (e) => Ji.find((t) => lr(t) === e), po = "HH:mm", mo = (e, t) => ({
  options: gm,
  value: vm(e),
  onChange: (n) => {
    const r = bm(n);
    r !== void 0 && t(r);
  }
}), ym = () => {
  const [e, t] = R(Qr), [n, r] = R(Qr), o = wn(eo("hashrate", e)), i = wn(eo("power", n));
  return /* @__PURE__ */ l(Ue, { title: "Dashboard", children: /* @__PURE__ */ m("div", { className: "op-centre-lite-dashboard", children: [
    /* @__PURE__ */ l(
      Ot,
      {
        title: "Hash Rate",
        view: o,
        toggle: mo(e, t),
        axisFormat: po
      }
    ),
    /* @__PURE__ */ l(
      Ot,
      {
        title: "Power Consumption",
        view: i,
        toggle: mo(n, r),
        axisFormat: po,
        fill: !0
      }
    )
  ] }) });
}, wm = (e, t) => {
  const [n, r] = R(e);
  return Me(() => {
    const o = setTimeout(() => r(e), t);
    return () => clearTimeout(o);
  }, [e, t]), n;
}, _o = (e) => {
  const [t, n] = R({ key: e, page: 1 }), r = t.key === e ? t.page : 1, o = $o((i) => n({ key: e, page: i }), [e]);
  return [r, o];
}, j = { RACKS: "racks", MINERS: "miners" }, Es = (e) => e === j.RACKS || e === j.MINERS, Em = {
  [j.RACKS]: "Search racks, containers",
  [j.MINERS]: "Search serials, IPs, positions"
}, Pn = "tab", Ss = j.RACKS, Sm = (e) => {
  const t = e.get(Pn);
  return t !== null && Es(t) ? t : Ss;
}, Tm = (e, t) => {
  const n = new URLSearchParams(e);
  return t === Ss ? n.delete(Pn) : n.set(Pn, t), n;
}, km = {
  searches: { [j.RACKS]: "", [j.MINERS]: "" },
  containerId: void 0
}, Om = (e, t) => ({
  ...e,
  searches: { ...e.searches, [t.tab]: t.filter.search },
  containerId: t.filter.containerId
}), nn = (e, t) => ({
  search: e.searches[t],
  containerId: e.containerId
}), Cm = (e) => e.map(({ id: t, name: n }) => ({ id: t, name: n })), Im = (e) => e.flatMap(
  (t) => t.racks.map((n) => ({
    id: n.id,
    name: n.name,
    containerId: t.id,
    containerName: t.name,
    efficiencyWPerThs: te(n.powerW, n.hashrateThs),
    hashratePhs: ge(n.hashrateThs),
    powerKw: B(n.powerW)
  }))
), Nm = (e, { search: t, containerId: n }) => {
  const r = t.trim().toLowerCase();
  return e.filter(
    (o) => (n === void 0 || o.containerId === n) && (r === "" || o.name.toLowerCase().includes(r) || o.containerName.toLowerCase().includes(r))
  );
}, Ts = (e, t) => ({
  id: e.id,
  serial: e.serial,
  ip: e.ip,
  containerId: e.containerId,
  containerName: t.get(e.containerId) ?? e.containerId,
  position: e.position,
  status: e.status,
  efficiencyWPerThs: te(e.powerW, e.hashrateThs),
  hashrateThs: e.hashrateThs,
  powerW: e.powerW
}), Pm = (e, t, n) => e.slice((t - 1) * n, t * n), ks = ({
  page: e,
  pageSize: t,
  total: n,
  onPageChange: r
}) => {
  if (n === 0) return null;
  const o = (e - 1) * t + 1, i = Math.min(e * t, n);
  return /* @__PURE__ */ m("div", { className: "op-centre-lite-explorer__footer", children: [
    /* @__PURE__ */ m(K, { variant: "secondary", size: "sm", children: [
      "Showing ",
      E(o, 0),
      "-",
      E(i, 0),
      " of ",
      E(n, 0)
    ] }),
    /* @__PURE__ */ l(
      ia,
      {
        current: e,
        pageSize: t,
        total: n,
        showSizeChanger: !1,
        onChange: (s) => r(s)
      }
    )
  ] });
}, go = "all", Rm = "", Am = ({
  filter: e,
  containers: t,
  searchPlaceholder: n,
  onFilterChange: r,
  onExport: o,
  exporting: i
}) => /* @__PURE__ */ m("div", { className: "op-centre-lite-explorer__toolbar", children: [
  /* @__PURE__ */ l(
    No,
    {
      variant: "search",
      "aria-label": "Search",
      placeholder: n,
      value: e.search,
      onChange: (s) => r({ ...e, search: s.target.value }),
      wrapperClassName: "op-centre-lite-explorer__search"
    }
  ),
  /* @__PURE__ */ m(
    Xe,
    {
      value: e.containerId ?? Rm,
      onValueChange: (s) => r({ ...e, containerId: s === go ? void 0 : s }),
      children: [
        /* @__PURE__ */ l(Qe, { "aria-label": "Container", className: "op-centre-lite-explorer__container", children: /* @__PURE__ */ l(et, { placeholder: "Container" }) }),
        /* @__PURE__ */ m(tt, { children: [
          /* @__PURE__ */ l(ke, { value: go, children: "All containers" }),
          t.map((s) => /* @__PURE__ */ l(ke, { value: s.id, children: s.name }, s.id))
        ] })
      ]
    }
  ),
  /* @__PURE__ */ l(J, { variant: "secondary", icon: /* @__PURE__ */ l(Oo, {}), loading: i, onClick: o, children: "Export CSV" })
] }), W = 1, $m = () => /* @__PURE__ */ l(
  "svg",
  {
    className: "op-centre-lite-explorer__chevron",
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": "true",
    children: /* @__PURE__ */ l("path", { d: "M6 3.5L10.5 8L6 12.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  }
), zm = (e) => {
  const [t, n] = R(!1);
  return zo(() => n(!0), []), t ? e : Mm;
}, Mm = [], Os = ({
  columns: e,
  rows: t,
  loading: n = !1,
  onRowClick: r
}) => {
  const o = de(
    () => [...e, { id: "open", header: "", size: W, cell: () => /* @__PURE__ */ l($m, {}) }],
    [e]
  ), i = zm(t);
  return /* @__PURE__ */ l(
    zn,
    {
      data: i,
      columns: o,
      getRowId: (s) => s.id,
      enablePagination: !1,
      loading: n,
      onRowClick: r,
      tableClassName: "op-centre-lite-explorer__table"
    }
  );
}, Zm = [
  { accessorKey: "serial", header: "Serial", size: W },
  { accessorKey: "ip", header: "IP", size: W },
  { accessorKey: "containerName", header: "Container", size: W },
  { accessorKey: "position", header: "Position", size: W },
  {
    accessorKey: "status",
    header: "Status",
    size: W,
    cell: ({ row: e }) => nr[e.original.status]
  },
  {
    accessorKey: "efficiencyWPerThs",
    header: "Efficiency",
    size: W,
    cell: ({ row: e }) => He(e.original.efficiencyWPerThs)
  },
  {
    accessorKey: "hashrateThs",
    header: "Hash rate",
    size: W,
    cell: ({ row: e }) => Dt(e.original.hashrateThs)
  },
  {
    accessorKey: "powerW",
    header: "Consumption",
    size: W,
    cell: ({ row: e }) => gh(e.original.powerW)
  }
], Dm = [
  { header: "Serial", value: (e) => e.serial },
  { header: "IP", value: (e) => e.ip },
  { header: "Container", value: (e) => e.containerName },
  { header: "Position", value: (e) => e.position },
  { header: "Status", value: (e) => nr[e.status] },
  {
    header: `Efficiency (${S.EFFICIENCY_CARD})`,
    value: (e) => ee(e.efficiencyWPerThs, O.EFFICIENCY)
  },
  {
    header: `Hash rate (${S.HASHRATE_TH})`,
    value: (e) => ee(e.hashrateThs, O.HASHRATE_TH)
  },
  {
    header: `Consumption (${S.POWER_W})`,
    value: (e) => ee(e.powerW, O.POWER_W)
  }
], Lm = ({ rows: e, loading: t, onRowClick: n }) => /* @__PURE__ */ l(Os, { columns: Zm, rows: e, loading: t, onRowClick: n }), vo = 4, Cs = (e, t, n) => {
  const r = e.search.trim();
  return {
    page: t,
    pageSize: n,
    ...r === "" ? {} : { search: r },
    ...e.containerId === void 0 ? {} : { containerId: e.containerId }
  };
}, Fm = (e) => {
  const t = new URLSearchParams();
  return e.page !== void 0 && t.set("page", String(e.page)), e.pageSize !== void 0 && t.set("pageSize", String(e.pageSize)), e.search !== void 0 && t.set("search", e.search), e.containerId !== void 0 && t.set("containerId", e.containerId), t;
}, Is = (e, t) => `${e}?${Fm(t).toString()}`, Ns = (e, t, n) => we(
  Is(e, Cs(t, n, Xn)),
  Wi
), Ps = async (e, t, n) => {
  if (n.length === 0) return [];
  const r = await Promise.all(
    n.slice(0, vo).map((i) => Ns(e, t, i))
  ), o = await Ps(e, t, n.slice(vo));
  return [...r.flatMap((i) => i.items), ...o];
}, Um = async (e, t) => {
  const n = await Ns(e, t, 1), r = Math.ceil(n.total / Xn), o = Array.from({ length: Math.max(r - 1, 0) }, (i, s) => s + 2);
  return [...n.items, ...await Ps(e, t, o)];
}, Wm = 3e4, jm = (e, t, n) => {
  const { apiUrl: r } = oe(), o = Is(r(ue.MINERS), Cs(e, t, n)), i = Ie({
    queryKey: Ne.live("miners", o),
    queryFn: () => we(o, Wi),
    refetchInterval: Wm,
    placeholderData: (s) => s
  });
  return i.data !== void 0 ? {
    status: "ready",
    miners: i.data.items,
    total: i.data.total,
    stale: i.isPlaceholderData
  } : i.isError ? { status: "error", message: fe(i.error, o) } : { status: "loading" };
}, xm = ({
  filter: e,
  containerNames: t,
  page: n,
  pageSize: r,
  onPageChange: o,
  onRowClick: i
}) => {
  const s = jm(e, n, r), a = s.status === "ready" ? s.miners : void 0, c = de(
    () => (a ?? []).map((u) => Ts(u, t)),
    [a, t]
  );
  return s.status === "loading" ? /* @__PURE__ */ l(at, { type: "circle" }) : s.status === "error" ? /* @__PURE__ */ l(ne, { title: "Could not load the miners", error: s.message }) : /* @__PURE__ */ m(We, { children: [
    /* @__PURE__ */ l(Lm, { rows: c, loading: s.stale, onRowClick: i }),
    /* @__PURE__ */ l(
      ks,
      {
        page: n,
        pageSize: r,
        total: s.total,
        onPageChange: o
      }
    )
  ] });
}, Hm = [
  { accessorKey: "name", header: "Rack", size: W },
  { accessorKey: "containerName", header: "Container", size: W },
  {
    accessorKey: "efficiencyWPerThs",
    header: "Efficiency",
    size: W,
    cell: ({ row: e }) => He(e.original.efficiencyWPerThs)
  },
  {
    accessorKey: "hashratePhs",
    header: "Hash rate",
    size: W,
    cell: ({ row: e }) => Zt(e.original.hashratePhs)
  },
  {
    accessorKey: "powerKw",
    header: "Consumption",
    size: W,
    cell: ({ row: e }) => Mt(e.original.powerKw)
  }
], Km = [
  { header: "Rack", value: (e) => e.name },
  { header: "Container", value: (e) => e.containerName },
  {
    header: `Efficiency (${S.EFFICIENCY_CARD})`,
    value: (e) => ee(e.efficiencyWPerThs, O.EFFICIENCY)
  },
  {
    header: `Hash rate (${S.HASHRATE})`,
    value: (e) => ee(e.hashratePhs, O.HASHRATE)
  },
  {
    header: `Consumption (${S.POWER_KW})`,
    value: (e) => ee(e.powerKw, O.POWER_KW)
  }
], Bm = ({ rows: e, onRowClick: t }) => /* @__PURE__ */ l(Os, { columns: Hm, rows: e, onRowClick: t }), Vm = 3e4, ur = () => {
  const { apiUrl: e } = oe(), t = e(ue.CONTAINERS);
  return { query: Ie({
    queryKey: Ne.live("containers", t),
    queryFn: () => we(t, Vf),
    refetchInterval: Vm
  }), url: t };
}, Jm = () => {
  const { query: e, url: t } = ur(), n = de(() => {
    if (e.data === void 0) return;
    const { containers: r } = e.data;
    return {
      racks: Im(r),
      containers: Cm(r),
      containerNames: new Map(r.map((o) => [o.id, o.name]))
    };
  }, [e.data]);
  return n !== void 0 ? { status: "ready", ...n } : e.isError ? { status: "error", message: fe(e.error, t) } : { status: "loading" };
}, Ym = ({
  tab: e,
  racks: t,
  minersFilter: n,
  containerNames: r
}) => {
  const { apiUrl: o } = oe(), [i, s] = R(!1), [a, c] = R(void 0), u = async () => {
    s(!0);
    try {
      const p = (await Um(o(ue.MINERS), n)).map((g) => Ts(g, r));
      On("miners.csv", kn(Dm, p));
    } catch {
      c("Could not export the miners. Try again.");
    } finally {
      s(!1);
    }
  };
  return { exportCsv: () => {
    if (c(void 0), e === j.RACKS) {
      On("racks.csv", kn(Km, t));
      return;
    }
    u();
  }, exporting: i, error: a };
}, Gm = () => {
  const [e, t] = xs(), n = (r) => {
    Es(r) && t((o) => Tm(o, r), { replace: !0 });
  };
  return [Sm(e), n];
}, rn = 10, qm = 300, bo = ({ search: e, containerId: t }) => JSON.stringify([e, t ?? null]), Xm = ({ racks: e, containers: t, containerNames: n }) => {
  const r = $n(), [o, i] = Gm(), [s, a] = ua(Om, km), c = nn(s, o), u = nn(s, j.RACKS), h = { search: wm(nn(s, j.MINERS).search, qm), containerId: s.containerId }, [p, g] = _o(bo(u)), [_, y] = _o(bo(h)), v = Nm(e, u), T = Ym({ tab: o, racks: v, minersFilter: h, containerNames: n }), U = (ie) => {
    a({ tab: o, filter: ie });
  }, he = ({ containerId: ie }) => {
    r(Mo(ie), { relative: "path" });
  };
  return /* @__PURE__ */ m(Po, { variant: "underline", value: o, onValueChange: i, children: [
    /* @__PURE__ */ m(Ro, { className: "op-centre-lite-tabs", children: [
      /* @__PURE__ */ l(cn, { value: j.RACKS, children: "Racks" }),
      /* @__PURE__ */ l(cn, { value: j.MINERS, children: "Miners" })
    ] }),
    /* @__PURE__ */ m("div", { className: "op-centre-lite-explorer", children: [
      /* @__PURE__ */ l(
        Am,
        {
          filter: c,
          containers: t,
          searchPlaceholder: Em[o],
          onFilterChange: U,
          onExport: T.exportCsv,
          exporting: T.exporting
        }
      ),
      T.error === void 0 ? null : /* @__PURE__ */ l(ne, { title: "Export failed", error: T.error }),
      /* @__PURE__ */ m($e, { value: j.RACKS, children: [
        /* @__PURE__ */ l(Bm, { rows: Pm(v, p, rn), onRowClick: he }),
        /* @__PURE__ */ l(
          ks,
          {
            page: p,
            pageSize: rn,
            total: v.length,
            onPageChange: g
          }
        )
      ] }),
      /* @__PURE__ */ l($e, { value: j.MINERS, children: /* @__PURE__ */ l(
        xm,
        {
          filter: h,
          containerNames: n,
          page: _,
          pageSize: rn,
          onPageChange: y,
          onRowClick: he
        }
      ) })
    ] })
  ] });
}, Qm = () => {
  const e = Jm();
  return /* @__PURE__ */ m(Ue, { title: "Explorer", children: [
    e.status === "loading" ? /* @__PURE__ */ l(at, { type: "circle" }) : null,
    e.status === "error" ? /* @__PURE__ */ l(ne, { title: "Could not load the containers", error: e.message }) : null,
    e.status === "ready" ? /* @__PURE__ */ l(
      Xm,
      {
        racks: e.racks,
        containers: e.containers,
        containerNames: e.containerNames
      }
    ) : null
  ] });
}, yo = 6, Rs = "site-total", e_ = "unmetered", Rn = (e, t) => t > 0 ? e / t * 100 : 0, t_ = (e) => e.containerName === void 0 ? e.name : `${e.name} · ${e.containerName}`, n_ = (e, t, n) => [
  {
    id: Rs,
    source: "Site meter (total)",
    powerKw: B(t),
    sharePct: Rn(t, n),
    series: "total"
  },
  ...e.map((r) => ({
    id: r.id,
    source: t_(r),
    powerKw: r.powerKw,
    sharePct: r.sharePct,
    series: String(r.colorIndex ?? "rest")
  }))
], r_ = (e, t) => {
  const n = e.siteMeterPowerW, r = e.meters.reduce((c, u) => c + u.powerW, 0), o = n - r, i = Math.max(n, r), s = (c) => t.get(c) ?? c, a = e.meters.map((c, u) => ({
    id: c.id,
    name: c.name,
    containerName: s(c.containerId),
    powerKw: B(c.powerW),
    sharePct: Rn(c.powerW, i),
    colorIndex: u % yo
  }));
  return o > 0 && a.push({
    id: e_,
    name: "Not metered",
    containerName: void 0,
    powerKw: B(o),
    sharePct: Rn(o, i),
    colorIndex: void 0
  }), {
    siteEfficiencyWPerThs: te(e.siteMeterPowerW, e.hashrateThs),
    miningEfficiencyWPerThs: te(e.minersPowerW, e.hashrateThs),
    totalPowerMw: Qn(n),
    meters: e.meters.map((c, u) => ({
      id: c.id,
      name: c.name,
      containerName: s(c.containerId),
      colorIndex: u % yo,
      efficiencyWPerThs: te(c.powerW, c.hashrateThs),
      powerKw: B(c.powerW),
      hashratePhs: ge(c.hashrateThs),
      miners: c.miners
    })),
    breakdown: a,
    breakdownRows: n_(a, n, i)
  };
}, As = O.BREAKDOWN, An = (e) => `${E(e, As)}%`, $s = { size: 1, enableSorting: !1 }, wo = { ...$s, meta: { align: "right" } }, o_ = [
  {
    accessorKey: "source",
    header: "Source",
    ...$s,
    cell: ({ row: e }) => /* @__PURE__ */ m(
      "span",
      {
        className: "op-centre-lite-breakdown__source",
        "data-total": e.original.id === Rs,
        children: [
          /* @__PURE__ */ l(
            "span",
            {
              className: "op-centre-lite-series-swatch",
              "data-series": e.original.series,
              "aria-hidden": "true"
            }
          ),
          e.original.source
        ]
      }
    )
  },
  {
    accessorKey: "powerKw",
    header: "Consumption (kW)",
    ...wo,
    cell: ({ row: e }) => E(e.original.powerKw, As)
  },
  {
    accessorKey: "sharePct",
    header: "% of total",
    ...wo,
    cell: ({ row: e }) => An(e.original.sharePct)
  }
], i_ = ({ slices: e, rows: t }) => /* @__PURE__ */ m("div", { className: "op-centre-lite-breakdown", children: [
  /* @__PURE__ */ l(
    "div",
    {
      className: "op-centre-lite-breakdown__bar",
      role: "img",
      "aria-label": "Share of consumption per meter",
      children: e.map((n) => /* @__PURE__ */ l(
        "span",
        {
          className: "op-centre-lite-breakdown__segment",
          "data-series": n.colorIndex ?? "rest",
          style: { flexGrow: n.sharePct },
          title: `${n.name}: ${An(n.sharePct)}`,
          children: /* @__PURE__ */ m("span", { className: "op-centre-lite-breakdown__segment-label", "aria-hidden": "true", children: [
            /* @__PURE__ */ l("span", { children: n.name }),
            /* @__PURE__ */ l("span", { children: An(n.sharePct) })
          ] })
        },
        n.id
      ))
    }
  ),
  /* @__PURE__ */ l(
    zn,
    {
      data: t,
      columns: o_,
      getRowId: (n) => n.id,
      enablePagination: !1,
      tableClassName: "op-centre-lite-breakdown__table"
    }
  )
] }), zs = ({ value: e, unit: t, className: n }) => /* @__PURE__ */ m("span", { className: ["op-centre-lite-value-with-unit", n].filter(Boolean).join(" "), children: [
  /* @__PURE__ */ l("span", { className: "op-centre-lite-value-with-unit__value", children: e }),
  /* @__PURE__ */ l("span", { className: "op-centre-lite-value-with-unit__unit", children: t })
] }), on = ({ label: e, value: t }) => /* @__PURE__ */ m("div", { className: "op-centre-lite-meter-card__metric", children: [
  /* @__PURE__ */ l("span", { className: "op-centre-lite-meter-card__metric-label", children: e }),
  /* @__PURE__ */ l("span", { className: "op-centre-lite-meter-card__metric-value", children: t })
] }), s_ = ({ meter: e }) => /* @__PURE__ */ m(ae, { className: "op-centre-lite-meter-card", children: [
  /* @__PURE__ */ m(ae.Header, { className: "op-centre-lite-meter-card__header", children: [
    /* @__PURE__ */ m("span", { className: "op-centre-lite-meter-card__name", children: [
      /* @__PURE__ */ l(
        "span",
        {
          className: "op-centre-lite-series-swatch",
          "data-series": e.colorIndex,
          "aria-hidden": "true"
        }
      ),
      /* @__PURE__ */ l(K, { size: "sm", weight: "medium", children: e.name })
    ] }),
    /* @__PURE__ */ l(K, { variant: "secondary", size: "xs", children: e.containerName })
  ] }),
  /* @__PURE__ */ m(ae.Body, { className: "op-centre-lite-meter-card__efficiency", children: [
    /* @__PURE__ */ l(K, { variant: "secondary", size: "xs", children: "Efficiency" }),
    /* @__PURE__ */ l(
      zs,
      {
        value: e.efficiencyWPerThs === void 0 ? Y : E(e.efficiencyWPerThs, O.EFFICIENCY),
        unit: S.EFFICIENCY_CARD,
        className: "op-centre-lite-meter-card__efficiency-value"
      }
    )
  ] }),
  /* @__PURE__ */ m(ae.Body, { className: "op-centre-lite-meter-card__metrics", children: [
    /* @__PURE__ */ l(on, { label: "Power", value: Mt(e.powerKw) }),
    /* @__PURE__ */ l(on, { label: "Hash rate", value: Zt(e.hashratePhs) }),
    /* @__PURE__ */ l(on, { label: "Miners", value: E(e.miners, 0) })
  ] })
] }), a_ = 3e4, c_ = () => {
  const { apiUrl: e } = oe(), t = e(ue.POWER_METERS), n = Ie({
    queryKey: Ne.live("power-meters", t),
    queryFn: () => we(t, Xf),
    refetchInterval: a_
  }), r = ur().query.data, o = de(() => {
    if (n.data === void 0) return;
    const i = new Map(r?.containers.map(({ id: s, name: a }) => [s, a]));
    return r_(n.data, i);
  }, [n.data, r]);
  return o !== void 0 ? { status: "ready", view: o } : n.isError ? { status: "error", message: fe(n.error, t) } : { status: "loading" };
}, Eo = (e) => e === void 0 ? Y : E(e, O.EFFICIENCY), sn = ({ label: e, value: t, unit: n }) => /* @__PURE__ */ l(ae, { className: "op-centre-lite-kpi-tile", children: /* @__PURE__ */ m(ae.Body, { children: [
  /* @__PURE__ */ l(K, { variant: "secondary", className: "op-centre-lite-kpi-tile__label", children: e }),
  /* @__PURE__ */ l(zs, { value: t, unit: n, className: "op-centre-lite-kpi-tile__value" })
] }) }), l_ = ({ view: e }) => /* @__PURE__ */ m("div", { className: "op-centre-lite-site-efficiency", children: [
  /* @__PURE__ */ m("div", { className: "op-centre-lite-site-efficiency__kpis", children: [
    /* @__PURE__ */ l(
      sn,
      {
        label: "Site efficiency",
        value: Eo(e.siteEfficiencyWPerThs),
        unit: S.EFFICIENCY_CARD
      }
    ),
    /* @__PURE__ */ l(
      sn,
      {
        label: "Mining efficiency",
        value: Eo(e.miningEfficiencyWPerThs),
        unit: S.EFFICIENCY_CARD
      }
    ),
    /* @__PURE__ */ l(
      sn,
      {
        label: "Total consumption",
        value: E(e.totalPowerMw, O.POWER),
        unit: S.POWER
      }
    )
  ] }),
  e.meters.length === 0 ? /* @__PURE__ */ l(sa, { description: "No power meter readings for this site.", image: "simple" }) : /* @__PURE__ */ m(We, { children: [
    /* @__PURE__ */ m("section", { className: "op-centre-lite-site-efficiency__section", children: [
      /* @__PURE__ */ l(K, { variant: "heading3", className: "op-centre-lite-site-efficiency__heading", children: "Efficiency per power meter" }),
      /* @__PURE__ */ l("div", { className: "op-centre-lite-site-efficiency__meters", children: e.meters.map((t) => /* @__PURE__ */ l(s_, { meter: t }, t.id)) })
    ] }),
    /* @__PURE__ */ m("section", { className: "op-centre-lite-site-efficiency__section", children: [
      /* @__PURE__ */ l(K, { variant: "heading3", className: "op-centre-lite-site-efficiency__heading", children: "Consumption breakdown" }),
      /* @__PURE__ */ l(i_, { slices: e.breakdown, rows: e.breakdownRows })
    ] })
  ] })
] }), u_ = () => {
  const e = c_();
  return /* @__PURE__ */ m(Ue, { title: "Site Efficiency", children: [
    e.status === "loading" ? /* @__PURE__ */ l(at, { type: "circle" }) : null,
    e.status === "error" ? /* @__PURE__ */ l(ne, { title: "Could not load the power meters", error: e.message }) : null,
    e.status === "ready" ? /* @__PURE__ */ l(l_, { view: e.view }) : null
  ] });
}, d_ = 1, gt = { size: d_, enableSorting: !1 }, f_ = [
  { accessorKey: "name", header: "Rack", ...gt },
  {
    accessorKey: "efficiencyWPerThs",
    header: "Efficiency",
    ...gt,
    cell: ({ row: e }) => He(e.original.efficiencyWPerThs)
  },
  {
    accessorKey: "powerKw",
    header: "Consumption",
    ...gt,
    cell: ({ row: e }) => Mt(e.original.powerKw)
  },
  {
    accessorKey: "hashratePhs",
    header: "Hash rate",
    ...gt,
    cell: ({ row: e }) => Zt(e.original.hashratePhs)
  }
], h_ = ({ racks: e }) => /* @__PURE__ */ l(
  zn,
  {
    data: e,
    columns: f_,
    getRowId: (t) => t.id,
    enablePagination: !1,
    tableClassName: "op-centre-lite-rack-table"
  }
), So = ({ label: e, value: t }) => /* @__PURE__ */ m("div", { className: "op-centre-lite-container-card__metric", children: [
  /* @__PURE__ */ l(K, { variant: "secondary", size: "sm", children: e }),
  /* @__PURE__ */ l(K, { size: "sm", weight: "semibold", children: t })
] }), Ms = "op-centre-lite-container-card__controls", p_ = (e) => e.target instanceof Element && e.currentTarget.contains(e.target) && e.target.closest(`a, button, [role='combobox'], .${Ms}`) === null, m_ = ({ card: e }) => {
  const t = $n(), n = Mo(e.id);
  return (
    // The title link is the keyboard and screen reader path to the detail page;
    // the card click is a larger mouse target for the same link.
    /* @__PURE__ */ m(ae, { className: "op-centre-lite-container-card", onClick: (o) => {
      p_(o) && t(n, { relative: "path" });
    }, children: [
      /* @__PURE__ */ m(ae.Header, { className: "op-centre-lite-container-card__header", children: [
        /* @__PURE__ */ m("div", { children: [
          /* @__PURE__ */ l(ko, { className: "op-centre-lite-container-card__title", to: n, relative: "path", children: /* @__PURE__ */ l(K, { size: "md", weight: "semibold", children: e.name }) }),
          /* @__PURE__ */ l(K, { variant: "secondary", size: "sm", children: e.model })
        ] }),
        /* @__PURE__ */ l(K, { color: "primary", weight: "semibold", children: Mt(e.powerKw) })
      ] }),
      /* @__PURE__ */ m(ae.Body, { className: "op-centre-lite-container-card__body", children: [
        /* @__PURE__ */ l(
          rs,
          {
            className: Ms,
            target: { containerId: e.id },
            targetName: e.name,
            supportedPowerModes: e.power.supportedModes,
            currentMode: e.power.mode,
            currentPct: e.power.pct
          }
        ),
        /* @__PURE__ */ m("div", { className: "op-centre-lite-container-card__metrics", children: [
          /* @__PURE__ */ l(So, { label: "Efficiency", value: He(e.efficiencyWPerThs) }),
          /* @__PURE__ */ l(So, { label: "Hash rate", value: Zt(e.hashratePhs) })
        ] }),
        /* @__PURE__ */ l(h_, { racks: e.racks }),
        /* @__PURE__ */ l(aa, { data: e.statusCounts, variant: "tiles" })
      ] })
    ] })
  );
}, __ = (e) => ({
  id: e.id,
  name: e.name,
  efficiencyWPerThs: te(e.powerW, e.hashrateThs),
  powerKw: B(e.powerW),
  hashratePhs: ge(e.hashrateThs)
}), g_ = ({
  empty: e,
  ...t
}) => ({
  ...t,
  disconnected: e
}), v_ = (e) => ({
  id: e.id,
  name: e.name,
  model: e.model,
  powerKw: B(e.powerW),
  efficiencyWPerThs: te(e.powerW, e.hashrateThs),
  hashratePhs: ge(e.hashrateThs),
  racks: e.racks.map(__),
  statusCounts: g_(e.minerStatus),
  power: {
    supportedModes: e.supportedPowerModes,
    mode: e.powerMode,
    pct: e.powerPct
  }
}), b_ = ({ empty: e, ...t }) => Object.values(t).reduce((n, r) => n + r, 0), y_ = () => {
  const { query: e, url: t } = ur(), n = de(() => {
    if (e.data === void 0) return;
    const { containers: r } = e.data;
    return {
      cards: r.map(v_),
      minerCount: r.reduce((o, i) => o + b_(i.minerStatus), 0)
    };
  }, [e.data]);
  return n !== void 0 ? { status: "ready", ...n } : e.isError ? { status: "error", message: fe(e.error, t) } : { status: "loading" };
}, w_ = (e) => {
  if (e.status === "ready")
    return `${Ce(e.cards.length, "container")} · ${Ce(e.minerCount, "miner")}`;
}, E_ = () => {
  const e = y_();
  return /* @__PURE__ */ m(Ue, { title: "Site Overview", subtitle: w_(e), children: [
    e.status === "loading" ? /* @__PURE__ */ l(at, { type: "circle" }) : null,
    e.status === "error" ? /* @__PURE__ */ l(ne, { title: "Could not load the containers", error: e.message }) : null,
    e.status === "ready" ? /* @__PURE__ */ l("div", { className: "op-centre-lite-site-overview", children: e.cards.map((t) => /* @__PURE__ */ l(m_, { card: t }, t.id)) }) : null
  ] });
}, S_ = () => {
  const e = Bi();
  if (e.status === "loading") return /* @__PURE__ */ l(Co, {});
  if (e.status === "error")
    return /* @__PURE__ */ l(ne, { title: "Could not load the site summary", error: e.message });
  const { miners: t, hashratePhs: n, consumptionMw: r, efficiencyWPerThs: o } = e.stats, i = o === void 0 ? Y : E(o, O.EFFICIENCY);
  return /* @__PURE__ */ m("div", { className: "op-centre-lite-home-panel", children: [
    /* @__PURE__ */ l(ut, { name: "Miners online", value: `${t.online} / ${t.total}` }),
    /* @__PURE__ */ l(
      ut,
      {
        name: "Hashrate",
        value: E(n, O.HASHRATE),
        unit: S.HASHRATE
      }
    ),
    /* @__PURE__ */ l(
      ut,
      {
        name: "Consumption",
        value: E(r, O.POWER),
        unit: S.POWER
      }
    ),
    /* @__PURE__ */ l(ut, { name: "Efficiency", value: i, unit: S.EFFICIENCY })
  ] });
}, P_ = Us({
  // Must equal `id` in mdk-app.yaml: the dashboard refuses a mismatch.
  id: "io.tether.opcentrelite",
  displayName: "Operation Center Lite",
  routes: [
    { path: se.DASHBOARD, label: "Dashboard", component: ym },
    { path: se.SITE_OVERVIEW, label: "Site Overview", component: E_ },
    { path: se.SITE_EFFICIENCY, label: "Site Efficiency", component: u_ },
    { path: se.EXPLORER, label: "Explorer", component: Qm },
    { path: se.CONTAINER_DETAIL, hidden: !0, component: hm }
  ],
  panels: [
    {
      id: "site-summary",
      slot: Ws.HOME,
      title: "Operation Center Lite",
      component: S_
    }
  ]
});
export {
  P_ as default
};
