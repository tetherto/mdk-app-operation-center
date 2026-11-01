import { useMdkApp as re, useQuery as Oe, useQueryClient as Ki, useMutation as Bi, defineMdkApp as Vi, MDK_APP_PANEL_SLOT as Ji } from "@tetherto/mdk-react-adapter";
import { generatePath as Vr, useParams as Yi, useNavigate as gn, useLocation as Gi, Link as qi } from "react-router";
import { jsx as u, jsxs as g, Fragment as _n } from "react/jsx-runtime";
import { ErrorCard as te, HeaderStatsBar as Xi, HeaderMinersBox as Qi, HeaderHashrateBox as es, HeaderConsumptionBox as ts, HeaderEfficiencyBox as ns, CoreAlert as rs, Typography as O, LineChartCard as os, CHART_COLORS as Xt, Select as Ge, SelectTrigger as qe, SelectValue as Xe, SelectContent as Qe, SelectItem as Ee, DateRangePicker as is, Button as Y, AlertDialog as ss, AlertDialogContent as as, AlertDialogHeader as cs, AlertDialogTitle as us, AlertDialogDescription as ls, AlertDialogFooter as ds, AlertDialogCancel as fs, AlertDialogAction as hs, useNotification as Jr, Card as F, ExportIcon as Yr, Indicator as ps, Slider as ut, Input as Gr, Spinner as it, Tabs as qr, TabsList as Xr, TabsTrigger as Qt, TabsContent as ze, Pagination as ms, DataTable as vn, EmptyState as gs, MinersActivityChart as _s, Loader as vs, SingleStatCard as lt } from "@tetherto/mdk-react-devkit";
import { mdkFetch as Qr, MdkFetchError as Ae, authStore as ys } from "@tetherto/mdk-ui-foundation";
import { useRef as bs, useState as $, useEffect as yn, useMemo as ge, useCallback as eo, useId as ws, useReducer as Es } from "react";
const de = {
  DASHBOARD: "",
  SITE_OVERVIEW: "site-overview",
  SITE_EFFICIENCY: "site-efficiency",
  EXPLORER: "explorer",
  CONTAINER_DETAIL: "explorer/containers/:id/:tab?"
}, to = (e) => `../${Vr(de.CONTAINER_DETAIL, { id: e })}`, X = {
  LAYOUT: "layout",
  POWER_ADJUSTMENT: "power-adjustment",
  CHARTS: "charts",
  HEATMAP: "heatmap"
}, Ss = Object.values(X), no = (e) => e !== void 0 && Ss.includes(e), Vn = {
  explorer: `../${de.EXPLORER}`,
  tab: (e, t) => `../${Vr(de.CONTAINER_DETAIL, { id: e, tab: t })}`
}, Ts = ({ view: e }) => {
  if (e.status === "error")
    return /* @__PURE__ */ u(te, { title: "Could not load the site summary", error: e.message });
  const t = e.status === "ready" ? e.stats : void 0;
  return /* @__PURE__ */ g(Xi, { children: [
    /* @__PURE__ */ u(
      Qi,
      {
        total: t?.miners.total,
        online: t?.miners.online,
        error: t?.miners.error,
        offline: t?.miners.offline
      }
    ),
    /* @__PURE__ */ u(es, { appPhs: t?.hashratePhs }),
    /* @__PURE__ */ u(ts, { valueMw: t?.consumptionMw }),
    /* @__PURE__ */ u(ns, { valueWthS: t?.efficiencyWPerThs })
  ] });
};
function en(e) {
  const t = Object.values(e).filter((r) => typeof r == "number");
  return Object.entries(e).filter(([r, o]) => t.indexOf(+r) === -1).map(([r, o]) => o);
}
function Jn(e, t = "|") {
  return e.map((n) => ao(n)).join(t);
}
function tn(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
class ks {
  constructor(t) {
    this._getter = t, this._value = void 0;
  }
  get value() {
    const t = this._getter;
    return t !== void 0 && (this._value = t(), this._getter = void 0), this._value;
  }
}
function Nt(e) {
  return new ks(e);
}
function Os(e) {
  return e == null;
}
function bn(e) {
  const t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, n);
}
function Cs(e, t) {
  const n = e / t, r = Math.round(n), o = 4 * Number.EPSILON * Math.max(Math.abs(n), 1);
  return Math.abs(n - r) < o ? 0 : n - r;
}
function _e(e, t, n) {
  Object.defineProperty(e, t, {
    value: n,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function wn(e) {
  const t = Object.getOwnPropertyDescriptor(e, "shape");
  return t?.get ? t.get.raw : t?.value;
}
function ie(e) {
  return wn(e._zod.def) ?? e._zod.def.shape;
}
function ro(e, t, n) {
  Object.defineProperty(e, t, {
    get() {
      const r = n();
      return _e(this, t, r), r;
    },
    enumerable: !0,
    configurable: !0
  });
}
function oo(e, t, n) {
  t in e ? _e(e, t, n) : e[t] = n;
}
function Se(e, t, n, r) {
  const o = ie(t);
  for (const i of n) {
    const s = Object.getOwnPropertyDescriptor(o, i);
    s.enumerable && (s.get ? ro(e, i, () => {
      const a = t._zod.def.shape[i];
      return r ? r(a, i) : a;
    }) : oo(e, i, r ? r(s.value, i) : s.value));
  }
}
function Is(e, t) {
  for (const n of Reflect.ownKeys(t)) {
    const r = Object.getOwnPropertyDescriptor(t, n);
    r.enumerable && (r.get ? ro(e, n, () => t[n]) : oo(e, n, r.value));
  }
}
function K(...e) {
  const t = {};
  for (const n of e) {
    const r = Object.getOwnPropertyDescriptors(n);
    Object.assign(t, r);
  }
  return Object.defineProperties({}, t);
}
function Ps(e) {
  return JSON.stringify(e);
}
function zs(e) {
  return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const io = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {
};
function et(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const As = /* @__PURE__ */ Nt(() => {
  if (ne.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare"))
    return !1;
  try {
    const e = Function;
    return new e(""), !0;
  } catch {
    return !1;
  }
});
function tt(e) {
  if (et(e) === !1)
    return !1;
  const t = e.constructor;
  if (t === void 0 || typeof t != "function")
    return !0;
  const n = t.prototype;
  return !(et(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
function so(e) {
  return tt(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
const Ns = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function Re(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ve(e, t, n) {
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
function ao(e) {
  return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function $s(e) {
  return Object.keys(e).filter((t) => e[t]._zod.optin !== void 0 && e[t]._zod.optout === "optional");
}
const co = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, Rs = {
  int64: [/* @__PURE__ */ BigInt("-9223372036854775808"), /* @__PURE__ */ BigInt("9223372036854775807")],
  uint64: [/* @__PURE__ */ BigInt(0), /* @__PURE__ */ BigInt("18446744073709551615")]
};
function Ms(e, t) {
  const n = e._zod.def, r = n.checks;
  if (r && r.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  const i = {};
  return Se(i, e, $t(e, t)), ve(e, K(n, { shape: i, checks: [] }));
}
function $t(e, t) {
  const n = ie(e), r = [];
  for (const o of Reflect.ownKeys(t)) {
    if (!Object.getOwnPropertyDescriptor(n, o)?.enumerable)
      throw new Error(`Unrecognized key: "${String(o)}"`);
    t[o] && r.push(o);
  }
  return r;
}
function Zs(e, t) {
  const n = e._zod.def, r = n.checks;
  if (r && r.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const i = new Set($t(e, t)), s = {};
  return Se(s, e, Reflect.ownKeys(ie(e)).filter((a) => !i.has(a))), ve(e, K(n, { shape: s, checks: [] }));
}
function Ds(e, t) {
  if (!tt(t))
    throw new Error("Invalid input to extend: expected a plain object");
  const n = e._zod.def.checks;
  if (n && n.length > 0) {
    const o = ie(e);
    for (const i of Reflect.ownKeys(t))
      if (Object.getOwnPropertyDescriptor(o, i) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  return ve(e, K(e._zod.def, { shape: uo(e, t) }));
}
function uo(e, t) {
  const n = {};
  return Se(n, e, Reflect.ownKeys(ie(e))), Is(n, t), n;
}
function Fs(e, t) {
  if (!tt(t))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  return ve(e, K(e._zod.def, { shape: uo(e, t) }));
}
function Ls(e, t) {
  if (!t?._zod?.def)
    throw new Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
  if (e._zod.def.checks?.length)
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  const n = {};
  Se(n, e, Reflect.ownKeys(ie(e))), Se(n, t, Reflect.ownKeys(ie(t)));
  const r = K(e._zod.def, {
    shape: n,
    get catchall() {
      return t._zod.def.catchall;
    },
    checks: t._zod.def.checks ?? []
  });
  return ve(e, r);
}
function Yn(e, t, n, r = "partial") {
  const i = t._zod.def.checks;
  if (i && i.length > 0)
    throw new Error(`.${r}() cannot be used on object schemas containing refinements`);
  const a = n ? new Set($t(t, n)) : void 0, c = {};
  return Se(c, t, Reflect.ownKeys(ie(t)), e && ((l, d) => a && !a.has(d) ? l : new e({ type: "optional", innerType: l }))), ve(t, K(t._zod.def, { shape: c, checks: [] }));
}
function js(e, t, n) {
  const r = n ? new Set($t(t, n)) : void 0, o = {};
  return Se(o, t, Reflect.ownKeys(ie(t)), (i, s) => (
    // overwrite with non-optional
    r && !r.has(s) ? i : new e({ type: "nonoptional", innerType: i })
  )), ve(t, K(t._zod.def, { shape: o }));
}
function oe(e, t = 0) {
  if (e.aborted === !0)
    return !0;
  for (let n = t; n < e.issues.length; n++)
    if (e.issues[n]?.continue !== !0)
      return !0;
  return !1;
}
function xs(e, t = 0) {
  if (e.aborted === !0)
    return !0;
  for (let n = t; n < e.issues.length; n++)
    if (e.issues[n]?.continue === !1)
      return !0;
  return !1;
}
function lo(e, t) {
  return t.map((n) => {
    var r;
    return (r = n).path ?? (r.path = []), n.path.unshift(e), n;
  });
}
function We(e) {
  return typeof e == "string" ? e : e?.message;
}
function Gn(e) {
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
function nn(e, t, n) {
  var r;
  for (let o = t; o < e.length; o++)
    (r = e[o]).schema ?? (r.schema = n);
}
function Le(e, t, n) {
  var r;
  const o = e.inst?._zod?.traits;
  o?.has("$ZodType") && (o.has("$ZodCheck") ? (r = e).schema ?? (r.schema = e.inst) : e.schema = e.inst);
  const i = e.schema !== e.inst ? e.schema?._zod.def?.error : void 0, s = e.message ? e.message : We(e.inst?._zod.def?.error?.(e)) ?? We(i?.(e)) ?? We(t?.error?.(e)) ?? We(n.customError?.(e)) ?? We(n.localeError?.(e)) ?? "Invalid input", a = {};
  for (const c of Object.keys(e))
    c === "inst" || c === "schema" || c === "continue" || c === "input" || c === "__proto__" || (a[c] = e[c]);
  return a.path ?? (a.path = []), a.message = s, t?.reportInput && (a.input = e.input), a;
}
const Us = /[\uD800-\uDBFF]/;
function En(e) {
  const t = e.length;
  if (!Us.test(e))
    return t;
  let n = t;
  for (let r = 0; r < t - 1; r++)
    (e.charCodeAt(r) & 64512) === 55296 && (e.charCodeAt(r + 1) & 64512) === 56320 && (n--, r++);
  return n;
}
function Sn(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Ws(e) {
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
function nt(...e) {
  const [t, n, r] = e;
  return typeof t == "string" ? {
    message: t,
    code: "custom",
    input: n,
    inst: r
  } : { ...t };
}
function Hs(e, t) {
  for (const n in t) {
    const r = Object.getOwnPropertyDescriptor(t, n);
    r.get ? Object.defineProperty(e, n, { ...r, enumerable: !1 }) : Ks(e, n, r.value);
  }
}
function he(e, t, n, r = !0) {
  return Object.defineProperty(e, t, { configurable: !0, writable: !0, enumerable: r, value: n }), n;
}
function fo(e, t, n) {
  return he(e, t, n, !1);
}
function ho(e, t) {
  for (const n in e) {
    const r = e[n];
    Object.defineProperty(t, n, {
      configurable: !0,
      enumerable: !0,
      get() {
        return he(this, n, r(this));
      },
      set(o) {
        he(this, n, o);
      }
    });
  }
  return t;
}
function Ks(e, t, n) {
  Object.defineProperty(e, t, {
    configurable: !0,
    get() {
      return this == null ? n : he(this, t, n.bind(this));
    },
    set(r) {
      he(this, t, r);
    }
  });
}
function Bs(e, t) {
  const n = Object.getPrototypeOf(e);
  return t in n ? void 0 : n;
}
let Lt, le = !1;
const Vs = {
  configurable: !0,
  get() {
    le = !0;
  }
};
function S(e, t, n) {
  const r = Object.getPrototypeOf(e._zod);
  if (t in r && Lt !== e._zod) {
    Lt = void 0;
    return;
  }
  Lt = e._zod, Object.defineProperty(r, t, {
    configurable: !0,
    get() {
      Object.defineProperty(this, t, Vs);
      const o = le;
      le = !1;
      try {
        const i = n(this);
        return le ? delete this[t] : Object.defineProperty(this, t, { configurable: !0, writable: !0, value: i }), le = le || o, i;
      } catch (i) {
        throw delete this[t], le = le || o, i;
      }
    },
    set(o) {
      Object.defineProperty(this, t, { configurable: !0, writable: !0, value: o });
    }
  });
}
function Js(e, t, n, r) {
  const o = Bs(e, t);
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
const Ys = "~constantCatch";
function Gs(e) {
  const t = () => e;
  return t[Ys] = !0, t;
}
var qn;
const jt = { value: void 0, enumerable: !1 };
let Xn = "captureStackTrace" in Error ? Error : null;
function qs(e) {
  const t = Xn;
  if (t) {
    const n = t.stackTraceLimit;
    if (typeof n == "number") {
      try {
        t.stackTraceLimit = 0;
      } catch {
        return Xn = null, new e();
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
  function c(p, _) {
    if (p._zod) {
      if (p._zod.traits.has(e))
        return;
    } else {
      jt.value = new i(_);
      try {
        Object.defineProperty(p, "_zod", jt);
      } finally {
        jt.value = void 0;
      }
    }
    if (p._zod.traits.add(e), t(p, _), a) {
      const v = Object.getPrototypeOf(p), y = p._zod.constr.prototype;
      let E = v;
      for (; E && E !== y; )
        E = Object.getPrototypeOf(E);
      const B = E ?? v;
      a.has(B) || (a.add(B), Hs(B, s));
    }
    const m = h.prototype;
    for (const v in m)
      Object.prototype.hasOwnProperty.call(m, v) && (v in p || (p[v] = m[v].bind(p)));
  }
  const l = r?.Parent ?? Object;
  class d extends l {
  }
  Object.defineProperty(d, "name", { value: e });
  function h(p) {
    const _ = r?.Parent ? qs(d) : this;
    c(_, p);
    const m = _._zod.deferred;
    if (m) {
      for (const y of m)
        y();
      _._zod.deferred = void 0;
    }
    const v = globalThis.__zod_globalConfig?.postProcessor;
    return v && v(_), _;
  }
  return Object.defineProperty(h, "init", { value: c }), Object.defineProperty(h, Symbol.hasInstance, {
    value: (p) => r?.Parent && p instanceof r.Parent ? !0 : p?._zod?.traits?.has(e)
  }), Object.defineProperty(h, "name", { value: e }), h;
}
class we extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class po extends Error {
  constructor(t) {
    super(`Encountered unidirectional transform during encode: ${t}`), this.name = "ZodEncodeError";
  }
}
(qn = globalThis).__zod_globalConfig ?? (qn.__zod_globalConfig = {});
const ne = globalThis.__zod_globalConfig;
function ye(e) {
  return e && Object.assign(ne, e), ne;
}
function Xs() {
  const e = this._zod;
  return e.message ?? (e.message = JSON.stringify(e.def, tn, 2)), e.message;
}
function Qs(e) {
  this._zod.message = e;
}
const ea = {
  get: Xs,
  set: Qs,
  enumerable: !0,
  configurable: !0
}, xt = { value: void 0, enumerable: !1 }, Qn = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]), ta = (e, t) => {
  e.name = "$ZodError", xt.value = t, Object.defineProperty(e, "issues", xt), xt.value = void 0, Object.defineProperty(e, "message", ea);
  const n = Object.getPrototypeOf(e);
  Qn.has(n) || (Qn.add(n), Object.defineProperty(n, "toString", {
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
}, na = f("$ZodError", ta);
function ra(e, t, n) {
  return Object.prototype.hasOwnProperty.call(e, t) || (t === "__proto__" ? Object.defineProperty(e, t, { value: n(), writable: !0, enumerable: !0, configurable: !0 }) : e[t] = n()), e[t];
}
function oa(e, t = (n) => n.message) {
  const n = {}, r = [];
  for (const o of e.issues)
    o.path.length > 0 ? ra(n, o.path[0], () => []).push(t(o)) : r.push(t(o));
  return { formErrors: r, fieldErrors: n };
}
function ia(e, t = (n) => n.message) {
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
          let c = n, l = 0;
          for (; l < a.length; ) {
            const d = a[l], h = l === a.length - 1;
            if (d === "_errors") {
              h && c._errors.push(t(s)), l++;
              continue;
            }
            Object.prototype.hasOwnProperty.call(c, d) || Object.defineProperty(c, d, {
              value: { _errors: [] },
              enumerable: !0,
              writable: !0,
              configurable: !0
            });
            const p = c[d];
            h && p._errors.push(t(s)), c = p, l++;
          }
        }
      }
  };
  return r(e), n;
}
function Rt(e, t) {
  return { callee: t?.callee ?? e, Err: t?.Err };
}
const Tn = (e) => {
  const t = (n, r, o, i) => {
    const s = o ? { ...o, async: !1 } : { async: !1 }, a = n._zod.run({ value: r, issues: [] }, s);
    if (a instanceof Promise)
      throw new we();
    if (a.issues.length) {
      const c = new (i?.Err ?? e)(a.issues.map((l) => Le(l, s, ye())));
      throw io(c, i?.callee ?? t), c;
    }
    return a.value;
  };
  return t;
}, kn = (e) => {
  const t = async (n, r, o, i) => {
    const s = o ? { ...o, async: !0 } : { async: !0 };
    let a = n._zod.run({ value: r, issues: [] }, s);
    if (a instanceof Promise && (a = await a), a.issues.length) {
      const c = new (i?.Err ?? e)(a.issues.map((l) => Le(l, s, ye())));
      throw io(c, i?.callee ?? t), c;
    }
    return a.value;
  };
  return t;
}, On = (e) => (t, n, r) => {
  const o = r ? { ...r, async: !1 } : { async: !1 }, i = t._zod.run({ value: n, issues: [] }, o);
  if (i instanceof Promise)
    throw new we();
  return i.issues.length ? mo(e, i.issues, o) : { success: !0, data: i.value };
};
function mo(e, t, n) {
  let r;
  return {
    success: !1,
    get error() {
      return r || (r = new e(t.map((o) => Le(o, n, ye()))), t = void 0, n = void 0), r;
    },
    set error(o) {
      r = o, t = void 0, n = void 0;
    }
  };
}
const Cn = (e) => async (t, n, r) => {
  const o = r ? { ...r, async: !0 } : { async: !0 };
  let i = t._zod.run({ value: n, issues: [] }, o);
  return i instanceof Promise && (i = await i), i.issues.length ? mo(e, i.issues, o) : { success: !0, data: i.value };
}, sa = /* @__PURE__ */ Symbol.for("zod.compile.invalid"), aa = /* @__PURE__ */ Symbol.for("zod.compile.fallback"), ca = ((e, t, n) => {
  const r = e._zod.bag.validator;
  if (r !== void 0) {
    if (r(t) !== sa)
      return !0;
    if (r.definite === !0 && n === void 0)
      return !1;
  }
  return ua(e, t, n);
});
function ua(e, t, n) {
  const r = n ? { ...n, async: !1, abortEarly: !0 } : { async: !1, abortEarly: !0 }, o = e._zod.bag.fallbackRun;
  let i;
  if (o ? (r[aa] = !0, i = o({ value: t, issues: [] }, r)) : i = e._zod.run({ value: t, issues: [] }, r), i instanceof Promise)
    throw new we();
  return i.issues.length === 0;
}
const la = async (e, t, n) => {
  const r = n ? { ...n, async: !0, abortEarly: !0 } : { async: !0, abortEarly: !0 };
  let o = e._zod.run({ value: t, issues: [] }, r);
  return o instanceof Promise && (o = await o), o.issues.length === 0;
}, da = (e) => {
  const t = Tn(e), n = (r, o, i, s) => {
    const a = i ? { ...i, direction: "backward" } : { direction: "backward" };
    return t(r, o, a, Rt(n, s));
  };
  return n;
}, fa = (e) => {
  const t = Tn(e), n = (r, o, i, s) => t(r, o, i, Rt(n, s));
  return n;
}, ha = (e) => {
  const t = kn(e), n = async (r, o, i, s) => {
    const a = i ? { ...i, direction: "backward" } : { direction: "backward" };
    return await t(r, o, a, Rt(n, s));
  };
  return n;
}, pa = (e) => {
  const t = kn(e), n = async (r, o, i, s) => await t(r, o, i, Rt(n, s));
  return n;
}, ma = (e) => (t, n, r) => {
  const o = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return On(e)(t, n, o);
}, ga = (e) => (t, n, r) => On(e)(t, n, r), _a = (e) => async (t, n, r) => {
  const o = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return Cn(e)(t, n, o);
}, va = (e) => async (t, n, r) => Cn(e)(t, n, r), ya = /^[cC][0-9a-z]{6,}$/, ba = /^[0-9a-z]+$/, wa = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/, Ea = /^[0-9a-vA-V]{20}$/, Sa = /^[A-Za-z0-9]{27}$/, Ta = /^[a-zA-Z0-9_-]{21}$/;
function ka(e) {
  return new RegExp(`^[a-zA-Z0-9_-]{${e}}$`);
}
const Oa = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, Ca = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, er = (e) => e ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, Ia = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, Pa = "^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$";
function za() {
  return new RegExp(Pa, "u");
}
const Aa = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Na = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, $a = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, Ra = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Ma = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, Za = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/, Da = /^https?$/, Fa = /^\+[1-9]\d{6,14}$/, go = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
function La(e) {
  return new RegExp(`^${e}$`);
}
const ja = /* @__PURE__ */ La(go);
function rn(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : e.seconds ? `${t}:[0-5]\\d(?:\\.\\d+)?` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function xa(e) {
  return new RegExp(`^${rn(e)}$`);
}
function Ua(e) {
  const t = ["Z"];
  e.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const n = `${rn({ precision: e.precision, seconds: !0 })}(?:${t.join("|")})`, r = e.local ? `${n}|${rn({ precision: e.precision })}` : n;
  return new RegExp(`^${go}T(?:${r})$`);
}
const Wa = /^[\s\S]{0,}$/, Ha = /^-?\d+(?:\.\d+)?$/, Ka = /^(?:true|false)$/i, Ba = /^[^A-Z]*$/, Va = /^[^a-z]*$/, H = /* @__PURE__ */ f("$ZodCheck", (e, t) => {
  var n;
  e._zod ?? (e._zod = {}), e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), In = (e) => {
  const t = e.value;
  return !Os(t) && t.length !== void 0;
}, Et = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, _o = /* @__PURE__ */ f("$ZodCheckLessThan", (e, t) => {
  H.init(e, t);
  const n = Et[typeof t.value];
  e._zod.check = (r) => {
    (t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
      origin: Et[typeof r.value] ?? n,
      code: "too_big",
      maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
      input: r.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), vo = /* @__PURE__ */ f("$ZodCheckGreaterThan", (e, t) => {
  H.init(e, t);
  const n = Et[typeof t.value];
  e._zod.check = (r) => {
    (t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
      origin: Et[typeof r.value] ?? n,
      code: "too_small",
      minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
      input: r.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), Ja = /* @__PURE__ */ f("$ZodCheckMultipleOf", (e, t) => {
  H.init(e, t), e._zod.check = (n) => {
    if (typeof n.value != typeof t.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof n.value == "bigint" ? (
      // `value % 0n` throws, and nothing is a multiple of zero — the number branch already fails this way via NaN
      t.value !== BigInt(0) && n.value % t.value === BigInt(0)
    ) : Cs(n.value, t.value) === 0) || n.issues.push({
      origin: typeof n.value,
      code: "not_multiple_of",
      divisor: t.value,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Ya = /* @__PURE__ */ f("$ZodCheckNumberFormat", (e, t) => {
  H.init(e, t), t.format = t.format || "float64";
  const n = t.format?.includes("int"), r = n ? "int" : "number", [o, i] = co[t.format];
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
}), Ga = /* @__PURE__ */ f("$ZodCheckMaxLength", (e, t) => {
  var n;
  H.init(e, t), (n = e._zod.def).when ?? (n.when = In), e._zod.check = (r) => {
    const o = r.value, i = o.length;
    if ((typeof o == "string" && i > t.maximum ? En(o) : i) <= t.maximum)
      return;
    const a = Sn(o);
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
}), qa = /* @__PURE__ */ f("$ZodCheckMinLength", (e, t) => {
  var n;
  H.init(e, t), (n = e._zod.def).when ?? (n.when = In), e._zod.check = (r) => {
    const o = r.value, i = o.length;
    if ((typeof o == "string" && i >= t.minimum && i < t.minimum * 2 ? En(o) : i) >= t.minimum)
      return;
    const a = Sn(o);
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
}), Xa = /* @__PURE__ */ f("$ZodCheckLengthEquals", (e, t) => {
  var n;
  H.init(e, t), (n = e._zod.def).when ?? (n.when = In), e._zod.check = (r) => {
    const o = r.value, i = o.length, s = typeof o == "string" && i >= t.length && i <= t.length * 2 ? En(o) : i;
    if (s === t.length)
      return;
    const a = Sn(o), c = s > t.length;
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
}), Mt = /* @__PURE__ */ f("$ZodCheckStringFormat", (e, t) => {
  var n, r;
  H.init(e, t), t.pattern ? (n = e._zod).check ?? (n.check = (o) => {
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
}), Qa = /* @__PURE__ */ f("$ZodCheckRegex", (e, t) => {
  Mt.init(e, t), e._zod.check = (n) => {
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
}), ec = /* @__PURE__ */ f("$ZodCheckLowerCase", (e, t) => {
  t.pattern ?? (t.pattern = Ba), Mt.init(e, t);
}), tc = /* @__PURE__ */ f("$ZodCheckUpperCase", (e, t) => {
  t.pattern ?? (t.pattern = Va), Mt.init(e, t);
}), nc = /* @__PURE__ */ f("$ZodCheckIncludes", (e, t) => {
  H.init(e, t);
  const n = Re(t.includes), r = new RegExp(typeof t.position == "number" ? `^.{${t.position},}${n}` : n);
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
}), rc = /* @__PURE__ */ f("$ZodCheckStartsWith", (e, t) => {
  H.init(e, t);
  const n = new RegExp(`^${Re(t.prefix)}.*`);
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
}), oc = /* @__PURE__ */ f("$ZodCheckEndsWith", (e, t) => {
  H.init(e, t);
  const n = new RegExp(`.*${Re(t.suffix)}$`);
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
}), ic = /* @__PURE__ */ f("$ZodCheckOverwrite", (e, t) => {
  H.init(e, t), e._zod.check = (n) => {
    n.value = t.tx(n.value);
  };
});
class sc {
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
const ac = {
  major: 4,
  minor: 6,
  patch: 7
}, R = /* @__PURE__ */ f("$ZodType", (e, t) => {
  var n;
  e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = ac;
  const r = e._zod.def.checks, o = e._zod.traits.has("$ZodCheck") ? [e, ...r ?? []] : r?.length ? [...r] : [];
  for (const i of o)
    for (const s of i._zod.onattach)
      s(e);
  if (o.length === 0)
    (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
      e._zod.run = e._zod.parse;
    });
  else {
    const i = (a, c, l) => {
      if (a.memo)
        return a;
      let d = oe(a), h;
      for (const p of c) {
        if (p._zod.def.when) {
          if (xs(a) || !p._zod.def.when(a))
            continue;
        } else if (d)
          continue;
        const _ = a.issues.length, m = p._zod.check(a);
        if (m instanceof Promise && l?.async === !1)
          throw new we();
        if (h || m instanceof Promise)
          h = (h ?? Promise.resolve()).then(async () => {
            await m, a.issues.length !== _ && (nn(a.issues, _, e), d || (d = oe(a, _)));
          });
        else {
          if (a.issues.length === _)
            continue;
          nn(a.issues, _, e), d || (d = oe(a, _));
        }
      }
      return h ? h.then(() => a) : a;
    }, s = (a, c, l) => {
      if (oe(a))
        return a.aborted = !0, a;
      const d = i(c, o, l);
      if (d instanceof Promise) {
        if (l.async === !1)
          throw new we();
        return d.then((h) => e._zod.parse(h, l));
      }
      return e._zod.parse(d, l);
    };
    e._zod.run = (a, c) => {
      if (c.skipChecks)
        return e._zod.parse(a, c);
      if (c.direction === "backward") {
        const d = e._zod.parse({ value: a.value, issues: [] }, { ...c, skipChecks: !0 });
        return d instanceof Promise ? d.then((h) => s(h, a, c)) : s(d, a, c);
      }
      const l = e._zod.parse(a, c);
      if (l instanceof Promise) {
        if (c.async === !1)
          throw new we();
        return l.then((d) => i(d, o, c));
      }
      return i(l, o, c);
    };
  }
}, {
  // Wrappers extend this by installing a richer factory over it; reading it eagerly would defeat the laziness.
  get "~standard"() {
    return fo(this, "~standard", bo(this));
  },
  set "~standard"(e) {
    he(this, "~standard", e);
  }
}), yo = (e, t) => e.issues.length ? { issues: e.issues.map((n) => Le(n, t, ye())) } : { value: e.value };
async function cc(e, t) {
  const n = { async: !0 };
  return yo(await e._zod.run({ value: t, issues: [] }, n), n);
}
function bo(e) {
  return {
    validate: (t) => {
      const n = { async: !1 };
      try {
        const r = e._zod.run({ value: t, issues: [] }, n);
        if (!(r instanceof Promise))
          return yo(r, n);
      } catch {
      }
      return cc(e, t);
    },
    vendor: "zod",
    version: 1
  };
}
const Pn = /* @__PURE__ */ f("$ZodString", (e, t) => {
  R.init(e, t), e._zod.pattern = t.pattern ?? Wa, e._zod.parse = (n, r) => {
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
}), z = /* @__PURE__ */ f("$ZodStringFormat", (e, t) => {
  Mt.init(e, t), Pn.init(e, t);
}), uc = /* @__PURE__ */ f("$ZodGUID", (e, t) => {
  t.pattern ?? (t.pattern = Ca), z.init(e, t);
}), lc = /* @__PURE__ */ f("$ZodUUID", (e, t) => {
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
    t.pattern ?? (t.pattern = er(r));
  } else
    t.pattern ?? (t.pattern = er());
  z.init(e, t);
}), dc = /* @__PURE__ */ f("$ZodEmail", (e, t) => {
  t.pattern ?? (t.pattern = Ia), z.init(e, t);
}), wo = 1, St = 2;
function Eo(e) {
  try {
    return typeof URL < "u" && typeof URL.canParse == "function" ? URL.canParse(e) : (new URL(e), !0);
  } catch {
    return !1;
  }
}
function fc(e, t) {
  return !("normalize" in t) && !("hostname" in t) && !("protocol" in t) ? Eo(e) || St : hc(e, t);
}
function hc(e, t) {
  if (!t.normalize && t.protocol?.source === Da.source && !/^https?:\/\//i.test(e))
    return wo;
  try {
    if (typeof URL < "u") {
      const n = URL;
      if (typeof n.parse == "function")
        return n.parse(e) ?? St;
    }
    return new URL(e);
  } catch {
    return St;
  }
}
const pc = /[\t\n\r]/g;
function tr(e) {
  return e.replace(pc, "");
}
function mc(e, t) {
  return t.lastIndex = 0, t.test(e.hostname);
}
function gc(e, t) {
  return t.lastIndex = 0, t.test(e.protocol.endsWith(":") ? e.protocol.slice(0, -1) : e.protocol);
}
const _c = /* @__PURE__ */ f("$ZodURL", (e, t) => {
  z.init(e, t), e._zod.check = (n) => {
    try {
      const r = n.value.trim(), o = fc(r, t);
      if (o === wo) {
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
      if (o === St) {
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
        n.value = tr(r);
        return;
      }
      t.hostname && !mc(o, t.hostname) && n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: t.hostname.source,
        input: n.value,
        inst: e,
        continue: !t.abort
      }), t.protocol && !gc(o, t.protocol) && n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: t.protocol.source,
        input: n.value,
        inst: e,
        continue: !t.abort
      }), n.value = t.normalize ? o.href : tr(r);
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
}), vc = /* @__PURE__ */ f("$ZodEmoji", (e, t) => {
  t.pattern ?? (t.pattern = za()), z.init(e, t);
}), yc = /* @__PURE__ */ f("$ZodNanoID", (e, t) => {
  if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1))
    throw new Error(`Invalid nanoid length: ${t.length}`);
  t.pattern ?? (t.pattern = t.length === void 0 ? Ta : ka(t.length)), z.init(e, t);
}), bc = /* @__PURE__ */ f("$ZodCUID", (e, t) => {
  t.pattern ?? (t.pattern = ya), z.init(e, t);
}), wc = /* @__PURE__ */ f("$ZodCUID2", (e, t) => {
  t.pattern ?? (t.pattern = ba), z.init(e, t);
}), Ec = /* @__PURE__ */ f("$ZodULID", (e, t) => {
  t.pattern ?? (t.pattern = wa), z.init(e, t);
}), Sc = /* @__PURE__ */ f("$ZodXID", (e, t) => {
  t.pattern ?? (t.pattern = Ea), z.init(e, t);
}), Tc = /* @__PURE__ */ f("$ZodKSUID", (e, t) => {
  t.pattern ?? (t.pattern = Sa), z.init(e, t);
}), kc = /* @__PURE__ */ f("$ZodISODateTime", (e, t) => {
  t.pattern ?? (t.pattern = Ua(t)), z.init(e, t);
}), Oc = /* @__PURE__ */ f("$ZodISODate", (e, t) => {
  t.pattern ?? (t.pattern = ja), z.init(e, t);
}), Cc = /* @__PURE__ */ f("$ZodISOTime", (e, t) => {
  t.pattern ?? (t.pattern = xa(t)), z.init(e, t);
}), Ic = /* @__PURE__ */ f("$ZodISODuration", (e, t) => {
  t.pattern ?? (t.pattern = Oa), z.init(e, t);
}), Pc = /* @__PURE__ */ f("$ZodIPv4", (e, t) => {
  t.pattern ?? (t.pattern = Aa), z.init(e, t);
}), zc = /^[0-9a-fA-F:.]+$/;
function So(e) {
  return zc.test(e) ? Eo(`http://[${e}]`) : !1;
}
const Ac = /* @__PURE__ */ f("$ZodIPv6", (e, t) => {
  t.pattern ?? (t.pattern = Na), z.init(e, t), e._zod.check = (n) => {
    So(n.value) || n.issues.push({
      code: "invalid_format",
      format: "ipv6",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Nc = /* @__PURE__ */ f("$ZodCIDRv4", (e, t) => {
  t.pattern ?? (t.pattern = $a), z.init(e, t);
});
function $c(e) {
  const t = e.split("/");
  if (t.length !== 2)
    return !1;
  const [n, r] = t;
  if (!r)
    return !1;
  const o = Number(r);
  return `${o}` !== r || o < 0 || o > 128 ? !1 : So(n);
}
const Rc = /* @__PURE__ */ f("$ZodCIDRv6", (e, t) => {
  t.pattern ?? (t.pattern = Ra), z.init(e, t), e._zod.check = (n) => {
    $c(n.value) || n.issues.push({
      code: "invalid_format",
      format: "cidrv6",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
});
function To(e) {
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
const ko = /^[0-9a-zA-Z+/]*={0,2}$/, Mc = /* @__PURE__ */ f("$ZodBase64", (e, t) => {
  t.pattern ?? (t.pattern = ko), z.init(e, t), e._zod.check = (n) => {
    To(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), zn = /^[A-Za-z0-9_-]*$/;
function Zc(e) {
  if (!zn.test(e))
    return !1;
  const t = e.replace(/[-_]/g, (r) => r === "-" ? "+" : "/"), n = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return To(n);
}
const Dc = /* @__PURE__ */ f("$ZodBase64URL", (e, t) => {
  t.pattern ?? (t.pattern = zn), z.init(e, t), e._zod.check = (n) => {
    Zc(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Fc = /* @__PURE__ */ f("$ZodE164", (e, t) => {
  t.pattern ?? (t.pattern = Fa), z.init(e, t);
});
function Lc(e, t = null) {
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
const jc = /* @__PURE__ */ f("$ZodJWT", (e, t) => {
  z.init(e, t), e._zod.check = (n) => {
    Lc(n.value, t.alg) || n.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Oo = /* @__PURE__ */ f("$ZodNumber", (e, t) => {
  R.init(e, t), e._zod.pattern = Ha, e._zod.parse = (n, r) => {
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
}), xc = /* @__PURE__ */ f("$ZodNumberFormat", (e, t) => {
  Ya.init(e, t), Oo.init(e, t);
}), Uc = /* @__PURE__ */ f("$ZodBoolean", (e, t) => {
  R.init(e, t), e._zod.pattern = Ka, e._zod.parse = (n, r) => {
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
}), Wc = /* @__PURE__ */ f("$ZodUnknown", (e, t) => {
  R.init(e, t), e._zod.parse = (n) => n;
}), Hc = /* @__PURE__ */ f("$ZodNever", (e, t) => {
  R.init(e, t), e._zod.parse = (n, r) => (n.issues.push({
    expected: "never",
    code: "invalid_type",
    input: n.value,
    inst: e
  }), n);
});
function Kc(e, t) {
  const n = Gn(e._zod.def.checks);
  if (!n.length)
    return;
  const r = Math.min(...n.map((i) => i[0])), o = e._zod.parse;
  e._zod.parse = (i, s) => {
    const a = t(i.value);
    if (a > r && !s?.skipChecks && s?.direction !== "backward") {
      for (const [c, l] of Gn(e._zod.def.checks))
        if (a > c && l._zod.def.when(i)) {
          const d = i.issues.length;
          return l._zod.check(i), i.issues[d].continue = !1, nn(i.issues, d, e), i;
        }
    }
    return o(i, s);
  };
}
const Bc = (e) => Array.isArray(e) ? e.length : -1;
function nr(e, t, n) {
  e.issues.length && t.issues.push(...lo(n, e.issues)), t.value[n] = e.value;
}
const Vc = /* @__PURE__ */ f("$ZodArray", (e, t) => {
  R.init(e, t);
  const n = ne.memoizer;
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
      const l = i[c], d = t.element._zod.run({
        value: l,
        issues: []
      }, o);
      if (d instanceof Promise)
        s.push(d.then((h) => nr(h, r, c)));
      else if (nr(d, r, c), a && d.issues.length !== 0 && oe(d))
        break;
    }
    return s.length ? Promise.all(s).then(() => r) : r;
  }, Kc(e, Bc);
});
function Tt(e, t, n, r, o, i) {
  const s = n in r, a = i === "optional";
  if (!(!s && a && o === "optional")) {
    if (e.issues.length) {
      if (o !== void 0 && a && !s)
        return;
      t.issues.push(...lo(n, e.issues));
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
const Jc = [];
function Co(e) {
  const t = Object.keys(e.shape), n = Object.getOwnPropertySymbols(e.shape), r = n.length ? n : Jc, o = r.length ? [...t, ...r] : t;
  for (const s of o)
    if (!e.shape?.[s]?._zod?.traits?.has("$ZodType"))
      throw new Error(`Invalid element at key "${String(s)}": expected a Zod schema`);
  const i = $s(e.shape);
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
function Io(e, t, n, r, o, i, s) {
  const a = [], c = o.keySet, l = o.catchall._zod, d = l.def.type, h = l.optin, p = l.optout;
  let _ = 0;
  for (const m in t) {
    if (s && n.issues.length !== _) {
      if (oe(n, _))
        break;
      _ = n.issues.length;
    }
    if (c.has(m))
      continue;
    if (m === "__proto__") {
      d === "never" && a.push(m);
      continue;
    }
    if (d === "never") {
      a.push(m);
      continue;
    }
    const v = l.run({ value: t[m], issues: [] }, r);
    v instanceof Promise ? e.push(v.then((y) => Tt(y, n, m, t, h, p))) : Tt(v, n, m, t, h, p);
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
const Yc = /* @__PURE__ */ f("$ZodObject", (e, t) => {
  R.init(e, t);
  const n = Object.getOwnPropertyDescriptor(t, "shape"), r = n?.get ? n.get.raw : t.shape ?? {};
  if (r) {
    const l = () => {
      const d = { ...r };
      return Object.defineProperty(t, "shape", { value: d }), l.raw = d, d;
    };
    l.raw = r, Object.defineProperty(t, "shape", { get: l });
  }
  const o = Nt(() => Co(t));
  S(e, "propValues", (l) => {
    const d = l.def.shape, h = {};
    for (const p in d) {
      const _ = d[p]._zod;
      if (_.values) {
        Object.prototype.hasOwnProperty.call(h, p) || _e(h, p, /* @__PURE__ */ new Set());
        for (const m of _.values)
          h[p].add(m);
        _.optin !== void 0 && h[p].add(void 0);
      }
    }
    return h;
  });
  const i = et, s = t.catchall;
  let a;
  const c = ne.memoizer;
  c?.attach(e), e._zod.parse = (l, d) => {
    a ?? (a = o.value);
    const h = l.value;
    if (!i(h))
      return l.issues.push({
        expected: "object",
        code: "invalid_type",
        input: h,
        inst: e
      }), l;
    l.value = c ? c.alloc(e, l, {}, d) : {};
    const p = [], _ = a.shape, m = d?.abortEarly;
    let v = l.issues.length;
    for (const y of a.allKeys) {
      if (m && l.issues.length !== v) {
        if (oe(l, v))
          break;
        v = l.issues.length;
      }
      if (y === "__proto__")
        continue;
      const E = _[y], B = E._zod.optin, ue = E._zod.optout, V = E._zod.run({ value: h[y], issues: [] }, d);
      V instanceof Promise ? p.push(V.then((Z) => Tt(Z, l, y, h, B, ue))) : Tt(V, l, y, h, B, ue);
    }
    return s ? Io(p, h, l, d, o.value, e, m === !0) : p.length ? Promise.all(p).then(() => l) : l;
  };
}), Gc = /* @__PURE__ */ f("$ZodObjectJIT", (e, t) => {
  Yc.init(e, t);
  const n = e._zod.parse, r = Nt(() => Co(t)), o = ne.memoizer, i = (_) => {
    const m = r.value, v = m.symbolKeys, y = new sc(["payload", "ctx"], { shape: _, inst: e, memo: o, syms: v }), E = (Z) => `shape[${Z}]._zod.run({ value: input[${Z}], issues: [] }, ctx)`, B = (Z, C) => `
          let ${Z}_ab = false;
          for (let i = 0; i < ${Z}.issues.length; i++) {
            const iss = ${Z}.issues[i];
            iss.path = iss.path ? [${C}, ...iss.path] : [${C}];
            payload.issues.push(iss);
            if (iss.continue !== true) ${Z}_ab = true;
          }
          if (${Z}_ab && ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }`;
    y.write("const input = payload.value;");
    const ue = /* @__PURE__ */ Object.create(null);
    let V = 0;
    for (const Z of m.allKeys)
      ue[Z] = `key_${V++}`;
    y.write(o ? "const newResult = memo.alloc(inst, payload, {}, ctx);" : "const newResult = {};");
    for (const Z of m.allKeys) {
      if (Z === "__proto__")
        continue;
      const C = ue[Z], q = typeof Z == "symbol" ? `syms[${v.indexOf(Z)}]` : Ps(Z), Dt = `${q} in input`, Kn = _[Z], Ft = Kn?._zod?.optin, Bn = Ft !== void 0, Wi = Kn?._zod?.optout === "optional";
      if (y.write(`const ${C} = ${E(q)};`), Bn && Wi) {
        const Hi = Ft === "optional" ? `${C}_present` : `${C}.value !== undefined || ${C}_present`;
        y.write(`
        const ${C}_present = ${Dt};
        if (!${C}.issues.length || ${C}_present) {
          if (${C}.issues.length) {${B(C, q)}
          }

          if (${Hi}) {
            newResult[${q}] = ${C}.value;
          }
        }

      `);
      } else Bn ? (y.write(`
        if (${C}.issues.length) {${B(C, q)}
        }
      `), Ft === "defaulted" ? y.write(`newResult[${q}] = ${C}.value;`) : y.write(`
        if (${C}.value !== undefined || ${Dt}) {
          newResult[${q}] = ${C}.value;
        }
      `)) : y.write(`
        const ${C}_present = ${Dt};
        if (${C}.issues.length) {${B(C, q)}
        }
        if (!${C}_present && !${C}.issues.length) {
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

        if (${C}_present) {
          newResult[${q}] = ${C}.value;
        }

      `);
    }
    return y.write("payload.value = newResult;"), y.write("return payload;"), y.compile();
  };
  let s;
  const a = et, c = !ne.jitless, d = c && As.value, h = t.catchall;
  let p;
  e._zod.parse = (_, m) => {
    p ?? (p = r.value);
    const v = _.value;
    return a(v) ? c && d && m?.async === !1 && m.jitless !== !0 ? (s || (s = i(t.shape)), _ = s(_, m), h ? Io([], v, _, m, p, e, m?.abortEarly === !0) : _) : n(_, m) : (_.issues.push({
      expected: "object",
      code: "invalid_type",
      input: v,
      inst: e
    }), _);
  };
});
function rr(e, t, n, r) {
  for (const i of e)
    if (i.issues.length === 0)
      return t.value = i.value, t;
  const o = e.filter((i) => !oe(i));
  return o.length === 1 ? (t.value = o[0].value, o[0]) : (t.issues.push({
    code: "invalid_union",
    input: t.value,
    inst: n,
    errors: e.map((i) => i.issues.map((s) => Le(s, r, ye())))
  }), t);
}
const Po = /* @__PURE__ */ f("$ZodUnion", (e, t) => {
  R.init(e, t), S(e, "optin", (r) => r.def.options.some((o) => o._zod.optin === "defaulted") ? "defaulted" : r.def.options.some((o) => o._zod.optin !== void 0) ? "optional" : void 0), S(e, "optout", (r) => r.def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0), S(e, "values", (r) => {
    if (r.def.options.every((o) => o._zod.values))
      return new Set(r.def.options.flatMap((o) => Array.from(o._zod.values)));
  }), S(e, "pattern", (r) => {
    if (r.def.options.every((o) => o._zod.pattern)) {
      const o = r.def.options.map((i) => i._zod.pattern);
      return new RegExp(`^(${o.map((i) => bn(i.source)).join("|")})$`);
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
    return i ? Promise.all(s).then((a) => rr(a, r, e, o)) : rr(s, r, e, o);
  };
});
function qc(e) {
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
const Xc = /* @__PURE__ */ f("$ZodDiscriminatedUnion", (e, t) => {
  t.inclusive = !1, Po.init(e, t);
  const n = e._zod.parse;
  S(e, "propValues", (o) => {
    const i = {};
    let s = 0;
    for (const a of o.def.options) {
      const c = a._zod.propValues;
      if (!c || Object.keys(c).length === 0)
        throw new Error(`Invalid discriminated union option at index "${o.def.options.indexOf(a)}"`);
      c[o.def.discriminator]?.has(void 0) && s++;
      for (const [l, d] of Object.entries(c)) {
        Object.prototype.hasOwnProperty.call(i, l) || _e(i, l, /* @__PURE__ */ new Set());
        for (const h of d)
          i[l].add(h);
      }
    }
    return !o.def.unionFallback && s > 1 && i[o.def.discriminator]?.delete(void 0), i;
  }), t.options.forEach((o, i) => {
    const s = wn(o._zod.def);
    if (s && !Object.prototype.hasOwnProperty.call(s, t.discriminator))
      throw new Error(`Invalid discriminated union option at index "${i}"`);
  });
  const r = Nt(() => qc(t));
  e._zod.parse = (o, i) => {
    const s = o.value;
    if (!et(s))
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
      options: Array.from(r.value.keys()).filter((l) => r.value.get(l) !== null),
      input: s,
      path: [t.discriminator],
      inst: e
    }), o);
  };
}), Qc = /* @__PURE__ */ f("$ZodIntersection", (e, t) => {
  R.init(e, t), e._zod.parse = (n, r) => {
    const o = n.value, i = t.left._zod.run({ value: o, issues: [] }, r), s = t.right._zod.run({ value: o, issues: [] }, r);
    return i instanceof Promise || s instanceof Promise ? Promise.all([i, s]).then(([c, l]) => or(n, c, l)) : or(n, i, s);
  };
});
function on(e, t) {
  if (e === t)
    return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t)
    return { valid: !0, data: e };
  if (tt(e) && tt(t)) {
    const n = Object.keys(t), r = Object.keys(e).filter((i) => n.indexOf(i) !== -1), o = { ...e, ...t };
    Object.prototype.hasOwnProperty.call(o, "__proto__") && delete o.__proto__;
    for (const i of r) {
      if (i === "__proto__")
        continue;
      const s = on(e[i], t[i]);
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
      const o = e[r], i = t[r], s = on(o, i);
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
function or(e, t, n) {
  const r = /* @__PURE__ */ new Map();
  let o;
  const i = /* @__PURE__ */ new Map(), s = (l, d) => {
    let h;
    if (l.code === "unrecognized_keys" && !l.path?.length)
      o ?? (o = l), h = l.keys;
    else if (l.code === "invalid_key" && l.origin === "record" && l.path?.length === 1) {
      const p = String(l.path[0]);
      i.has(p) || i.set(p, l), h = [p];
    } else
      return !1;
    for (const p of h)
      r.has(p) || r.set(p, {}), r.get(p)[d] = !0;
    return !0;
  };
  for (const l of t.issues)
    s(l, "l") || e.issues.push(l);
  for (const l of n.issues)
    s(l, "r") || e.issues.push(l);
  const a = [...r].filter(([, l]) => l.l && l.r).map(([l]) => l);
  if (a.length) {
    const l = o ? a.filter((d) => o.keys.includes(d)) : [];
    l.length && e.issues.push({ ...o, keys: l });
    for (const d of a)
      !l.includes(d) && i.has(d) && e.issues.push(i.get(d));
  }
  const c = on(t.value, n.value);
  if (!c.valid) {
    if (oe(e))
      return e;
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(c.mergeErrorPath)}`);
  }
  return e.value = c.data, e;
}
const eu = /* @__PURE__ */ f("$ZodEnum", (e, t) => {
  R.init(e, t);
  const n = en(t.entries), r = new Set(n);
  e._zod.values = r, S(e, "pattern", (o) => {
    const i = en(o.def.entries).filter((s) => Ns.has(typeof s));
    return new RegExp(i.length ? `^(${i.map((s) => Re(s.toString())).join("|")})$` : "^[^\\s\\S]$");
  }), e._zod.parse = (o, i) => {
    const s = o.value;
    return r.has(s) || o.issues.push({
      code: "invalid_value",
      values: n,
      input: s,
      inst: e
    }), o;
  };
}), tu = /* @__PURE__ */ f("$ZodLiteral", (e, t) => {
  R.init(e, t);
  const n = new Set(t.values);
  e._zod.values = n, S(e, "pattern", (r) => {
    const o = r.def.values;
    return new RegExp(o.length ? `^(${o.map((i) => typeof i == "string" ? Re(i) : i ? Re(i.toString()) : String(i)).join("|")})$` : "^[^\\s\\S]$");
  }), e._zod.parse = (r, o) => {
    const i = r.value;
    return n.has(i) || r.issues.push({
      code: "invalid_value",
      values: t.values,
      input: i,
      inst: e
    }), r;
  };
}), nu = /* @__PURE__ */ f("$ZodTransform", (e, t) => {
  R.init(e, t), e._zod.optin = "optional", ne.memoizer?.guard(e), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      throw new po(e.constructor.name);
    const o = t.transform(n.value, n);
    if (r.async)
      return (o instanceof Promise ? o : Promise.resolve(o)).then((s) => (n.value = s, n));
    if (o instanceof Promise)
      throw new we();
    return n.value = o, n;
  };
});
function ir(e, t) {
  return e.value = t.issues.length ? void 0 : t.value, e;
}
const zo = /* @__PURE__ */ f("$ZodOptional", (e, t) => {
  R.init(e, t), S(e, "optin", (n) => n.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e._zod.optout = "optional", S(e, "values", (n) => {
    const r = n.def.innerType._zod.values;
    return r ? /* @__PURE__ */ new Set([...r, void 0]) : void 0;
  }), S(e, "pattern", (n) => {
    const r = n.def.innerType._zod.pattern;
    return r ? new RegExp(`^(${bn(r.source)})?$`) : void 0;
  }), e._zod.parse = (n, r) => {
    if (n.value === void 0) {
      if (t.innerType._zod.optin !== "defaulted")
        return n;
      const o = t.innerType._zod.run({ value: n.value, issues: [] }, r);
      return o instanceof Promise ? o.then((i) => ir(n, i)) : ir(n, o);
    }
    return t.innerType._zod.run(n, r);
  };
}), ru = /* @__PURE__ */ f("$ZodExactOptional", (e, t) => {
  zo.init(e, t), S(e, "values", (n) => n.def.innerType._zod.values), S(e, "pattern", (n) => n.def.innerType._zod.pattern), e._zod.parse = (n, r) => t.innerType._zod.run(n, r);
}), ou = /* @__PURE__ */ f("$ZodNullable", (e, t) => {
  R.init(e, t), S(e, "optin", (n) => n.def.innerType._zod.optin), S(e, "optout", (n) => n.def.innerType._zod.optout), S(e, "pattern", (n) => {
    const r = n.def.innerType._zod.pattern;
    return r ? new RegExp(`^(${bn(r.source)}|null)$`) : void 0;
  }), S(e, "values", (n) => n.def.innerType._zod.values ? /* @__PURE__ */ new Set([...n.def.innerType._zod.values, null]) : void 0), e._zod.parse = (n, r) => n.value === null ? n : t.innerType._zod.run(n, r);
}), iu = /* @__PURE__ */ f("$ZodDefault", (e, t) => {
  R.init(e, t), e._zod.optin = "defaulted", S(e, "values", (n) => n.def.innerType._zod.values), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    if (n.value === void 0)
      return n.value = t.defaultValue, n;
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((i) => sr(i, t)) : sr(o, t);
  };
});
function sr(e, t) {
  return e.value === void 0 && (e.value = t.defaultValue), e;
}
const su = /* @__PURE__ */ f("$ZodPrefault", (e, t) => {
  R.init(e, t), e._zod.optin = "defaulted", S(e, "values", (n) => n.def.innerType._zod.values), e._zod.parse = (n, r) => (r.direction === "backward" || n.value === void 0 && (n.value = t.defaultValue), t.innerType._zod.run(n, r));
}), au = /* @__PURE__ */ f("$ZodNonOptional", (e, t) => {
  R.init(e, t), S(e, "values", (n) => {
    const r = n.def.innerType._zod.values;
    return r ? new Set([...r].filter((o) => o !== void 0)) : void 0;
  }), e._zod.parse = (n, r) => {
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((i) => ar(i, e)) : ar(o, e);
  };
});
function ar(e, t) {
  return !e.issues.length && e.value === void 0 && e.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: e.value,
    inst: t
  }), e;
}
function cr(e, t, n, r) {
  return t.issues.length ? (e.value = n.catchValue({
    ...t,
    value: e.value,
    error: {
      issues: t.issues.map((o) => Le(o, r, ye()))
    },
    input: e.value
  }), e) : (e.value = t.value, t.memo && (e.memo = !0), e);
}
const cu = /* @__PURE__ */ f("$ZodCatch", (e, t) => {
  R.init(e, t), S(e, "optin", (n) => n.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), S(e, "optout", (n) => n.def.innerType._zod.optout), S(e, "values", (n) => n.def.innerType._zod.values), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    const o = t.innerType._zod.run({ value: n.value, issues: [] }, r);
    return o instanceof Promise ? o.then((i) => cr(n, i, t, r)) : cr(n, o, t, r);
  };
}), uu = /* @__PURE__ */ f("$ZodPipe", (e, t) => {
  R.init(e, t), S(e, "values", (n) => n.def.in._zod.values), S(e, "optin", (n) => n.def.in._zod.optin), S(e, "optout", (n) => n.def.out._zod.optout), S(e, "propValues", (n) => n.def.in._zod.propValues), e._zod.parse = (n, r) => {
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
const lu = /* @__PURE__ */ f("$ZodReadonly", (e, t) => {
  R.init(e, t), S(e, "propValues", (n) => n.def.innerType._zod.propValues), S(e, "values", (n) => n.def.innerType._zod.values), S(e, "optin", (n) => n.def.innerType?._zod?.optin), S(e, "optout", (n) => n.def.innerType?._zod?.optout), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then(ur) : ur(o);
  };
});
function ur(e) {
  return e.memo || (e.value = Object.freeze(e.value)), e;
}
const du = /* @__PURE__ */ f("$ZodCustom", (e, t) => {
  H.init(e, t), R.init(e, t), e._zod.parse = (n, r) => n, e._zod.check = (n) => {
    const r = n.value, o = t.fn(r);
    if (o instanceof Promise)
      return o.then((i) => lr(i, n, r, e));
    lr(o, n, r, e);
  };
});
function lr(e, t, n, r) {
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
    r._zod.def.params && (o.params = r._zod.def.params), t.issues.push(nt(o));
  }
}
class fu extends Error {
  constructor() {
    super("Cannot parse a reference cycle that closes through a transform"), this.name = "ZodCyclicError";
  }
}
const sn = "~memo", dr = [];
function Ao(e) {
  return e !== null && typeof e == "object";
}
function Ut(e) {
  return e.map((t) => t.path ? { ...t, path: t.path.slice() } : { ...t });
}
const No = /* @__PURE__ */ new WeakMap(), Ke = 0, yt = 1, Je = 2;
function bt(e, t, n) {
  const r = No.get(e);
  if (r !== void 0)
    return r ? Je : Ke;
  if (t.has(e))
    return Je;
  t.add(e);
  let o = Ke;
  const i = (d) => {
    if (o !== Je && d?._zod) {
      const h = bt(d, t);
      h > o && (o = h);
    }
  }, s = (d, h) => {
    let p = Ke;
    for (const _ of Reflect.ownKeys(d)) {
      const m = Object.getOwnPropertyDescriptor(d, _);
      if (!m.enumerable)
        continue;
      const v = m.get ? yt : m.value?._zod ? bt(m.value, t) : Ke;
      v > p && (p = v);
    }
    return p;
  }, a = (d) => {
    d > o && (o = d);
  }, c = e._zod.def;
  switch (c.type) {
    case "object": {
      const d = wn(c);
      a(d ? s(d) : yt), i(c.catchall);
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
      a(d ? bt(d, t) : yt);
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
            for (const _ of p)
              i(_);
        }
      }
  }
  return t.delete(e), hu(e, o);
}
function hu(e, t) {
  return t !== yt && No.set(e, t === Je), t;
}
function pu(e, t) {
  let n = e.buckets.get(t);
  return n || (n = /* @__PURE__ */ new WeakMap(), e.buckets.set(t, n)), n;
}
let ft;
const ht = [], mu = {
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
        if (i.direction !== "backward" && _u(i, o.value))
          throw new fu();
        return n(o, i);
      };
      e._zod.parse = r, e._zod.run === n && (e._zod.run = r);
    });
  },
  attach(e) {
    var t;
    let n, r = !1, o, i;
    (t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
      const s = e._zod.parse, a = (c, l) => {
        if (n === void 0) {
          const E = bt(e, /* @__PURE__ */ new Set());
          if (E === Ke)
            return e._zod.parse = s, e._zod.run === a && (e._zod.run = s), s(c, l);
          E === Je || r ? n = !0 : r = !0;
        }
        const d = c.value;
        if (!Ao(d))
          return s(c, l);
        let h = l[sn];
        h || (h = { buckets: /* @__PURE__ */ new WeakMap(), backEdges: void 0 }, l[sn] = h);
        let p;
        o === l ? p = i : (p = pu(h, e), o = l, i = p);
        const _ = p.get(d);
        if (_)
          return c.value = _.value, _.issues ? _.issues.length && c.issues.push(...Ut(_.issues)) : (c.memo = !0, h.backEdges ?? (h.backEdges = /* @__PURE__ */ new WeakSet()), h.backEdges.add(_.value)), c;
        ft = p;
        const m = ht.length, v = s(c, l);
        ft = void 0;
        const y = ht.length > m ? ht.pop() : void 0;
        return v instanceof Promise ? v.then((E) => (y && (y.issues = E.issues.length ? Ut(E.issues) : dr), E)) : (y && (y.issues = v.issues.length ? Ut(v.issues) : dr), v);
      };
      e._zod.parse = a, e._zod.run === s && (e._zod.run = a);
    });
  }
};
function gu() {
  return mu;
}
function _u(e, t) {
  const n = e[sn]?.backEdges;
  return n !== void 0 && Ao(t) && n.has(t);
}
const vu = () => {
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
        const s = o(i.expected), a = Ws(i.input), c = o(a, i.input);
        return `Invalid input: expected ${s}, received ${c}`;
      }
      case "invalid_value":
        return i.values.length === 1 ? `Invalid input: expected ${ao(i.values[0])}` : `Invalid option: expected one of ${Jn(i.values, "|")}`;
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
        return `Unrecognized key${i.keys.length > 1 ? "s" : ""}: ${Jn(i.keys, ", ")}`;
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
function yu() {
  return {
    localeError: vu()
  };
}
var fr;
class bu {
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
function wu() {
  return new bu();
}
(fr = globalThis).__zod_globalRegistry ?? (fr.__zod_globalRegistry = wu());
const Be = globalThis.__zod_globalRegistry;
function $o(e) {
  return e.checks && (e.checks = [...e.checks]), e;
}
// @__NO_SIDE_EFFECTS__
function Eu(e, t) {
  return new e($o({ type: "string", ...b(t) }));
}
// @__NO_SIDE_EFFECTS__
function Su(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Tu(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ku(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ou(e, t) {
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
function Cu(e, t) {
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
function Iu(e, t) {
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
function Ro(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Pu(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function zu(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Au(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Nu(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function $u(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ru(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Mu(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Zu(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Du(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Fu(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Lu(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ju(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function xu(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Uu(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Wu(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Hu(e, t) {
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
function Ku(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Bu(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Vu(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ju(e, t) {
  return new e($o({ type: "number", checks: [], ...b(t) }));
}
// @__NO_SIDE_EFFECTS__
function Yu(e, t) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Gu(e, t) {
  return new e({
    type: "boolean",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function qu(e) {
  return new e({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function Xu(e, t) {
  return new e({
    type: "never",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function hr(e, t) {
  return new _o({
    check: "less_than",
    ...b(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Wt(e, t) {
  return new _o({
    check: "less_than",
    ...b(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function pr(e, t) {
  return new vo({
    check: "greater_than",
    ...b(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Ht(e, t) {
  return new vo({
    check: "greater_than",
    ...b(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function mr(e, t) {
  return new Ja({
    check: "multiple_of",
    ...b(t),
    value: e
  });
}
// @__NO_SIDE_EFFECTS__
function Mo(e, t) {
  return new Ga({
    check: "max_length",
    ...b(t),
    maximum: e
  });
}
// @__NO_SIDE_EFFECTS__
function kt(e, t) {
  return new qa({
    check: "min_length",
    ...b(t),
    minimum: e
  });
}
// @__NO_SIDE_EFFECTS__
function Zo(e, t) {
  return new Xa({
    check: "length_equals",
    ...b(t),
    length: e
  });
}
// @__NO_SIDE_EFFECTS__
function Qu(e, t) {
  return new Qa({
    check: "string_format",
    format: "regex",
    ...b(t),
    pattern: e
  });
}
// @__NO_SIDE_EFFECTS__
function el(e) {
  return new ec({
    check: "string_format",
    format: "lowercase",
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function tl(e) {
  return new tc({
    check: "string_format",
    format: "uppercase",
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function nl(e, t) {
  return new nc({
    check: "string_format",
    format: "includes",
    ...b(t),
    includes: e
  });
}
// @__NO_SIDE_EFFECTS__
function rl(e, t) {
  return new rc({
    check: "string_format",
    format: "starts_with",
    ...b(t),
    prefix: e
  });
}
// @__NO_SIDE_EFFECTS__
function ol(e, t) {
  return new oc({
    check: "string_format",
    format: "ends_with",
    ...b(t),
    suffix: e
  });
}
// @__NO_SIDE_EFFECTS__
function je(e) {
  return new ic({
    check: "overwrite",
    tx: e
  });
}
// @__NO_SIDE_EFFECTS__
function il(e) {
  return /* @__PURE__ */ je((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function sl() {
  return /* @__PURE__ */ je((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function al() {
  return /* @__PURE__ */ je((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function cl() {
  return /* @__PURE__ */ je((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function ul() {
  return /* @__PURE__ */ je((e) => zs(e));
}
// @__NO_SIDE_EFFECTS__
function ll(e, t, n) {
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
function dl(e, t, n) {
  return new e({
    type: "custom",
    check: "custom",
    fn: t,
    ...b(n)
  });
}
// @__NO_SIDE_EFFECTS__
function fl(e, t) {
  const n = /* @__PURE__ */ hl((r) => (r.addIssue = (o) => {
    if (typeof o == "string")
      r.issues.push(nt(o, r.value, n._zod.def));
    else {
      const i = o;
      i.fatal && (i.continue = !1), i.code ?? (i.code = "custom"), "input" in i || (i.input = r.value), i.inst ?? (i.inst = n), i.continue ?? (i.continue = !n._zod.def.abort), r.issues.push(nt(i));
    }
  }, e(r.value, r)), t);
  return n;
}
// @__NO_SIDE_EFFECTS__
function hl(e, t) {
  const n = new H({
    check: "custom",
    ...b(t)
  });
  return n._zod.check = e, n;
}
function Ye(e, ...t) {
  for (const n of t)
    for (const r of Reflect.ownKeys(n))
      Object.prototype.propertyIsEnumerable.call(n, r) && _e(e, r, n[r]);
  return e;
}
function Do(e) {
  let t = e?.target ?? "draft-2020-12";
  return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
    processors: e.processors ?? {},
    metadataRegistry: e?.metadata ?? Be,
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
function pe(e, t, n, r, o) {
  const i = typeof t.unrepresentable == "function" ? t.unrepresentable({ zodSchema: e, path: r.path, message: o }) : t.unrepresentable;
  if (i === "any")
    return !1;
  if (i === void 0 || i === "throw")
    throw new Error(o);
  return Object.assign(n, i), !0;
}
function L(e, t, n = { path: [], schemaPath: [] }) {
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
      const p = s.schema, _ = t.processors[o.type];
      if (!_)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${o.type}`);
      _(e, t, p, d);
    }
    const h = e._zod.parent;
    h && (s.ref || (s.ref = h), L(h, t, d), t.seen.get(h).isParent = !0);
  }
  const c = t.metadataRegistry.get(e);
  return c && Ye(s.schema, c), t.io === "input" && j(e) && (delete s.schema.examples, delete s.schema.default), t.io === "input" && "_prefault" in s.schema && ((r = s.schema).default ?? (r.default = s.schema._prefault)), delete s.schema._prefault, t.seen.get(e).schema;
}
function gr(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function Fo(e, t) {
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
      const h = e.external.registry.get(s[0])?.id, p = e.external.uri ?? ((m) => m);
      if (h)
        return { ref: p(h) };
      const _ = s[1].defId ?? s[1].schema.id ?? `schema${e.counter++}`;
      return s[1].defId = _, { defId: _, ref: `${p("__shared")}#/${a}/${gr(_)}` };
    }
    const c = "#", l = `${c}/${a}/`;
    if (s[1] === n && !s[1].schema.id)
      return { ref: c };
    const d = s[1].schema.id ?? `__schema${e.counter++}`;
    return { defId: d, ref: l + gr(d) };
  }, i = (s) => {
    if (s[1].schema.$ref)
      return;
    const a = s[1], { ref: c, defId: l } = o(s);
    a.def = { ...a.schema }, l && (a.defId = l);
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
      const l = e.external.registry.get(s[0])?.id;
      if (t !== s[0] && l) {
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
function Lo(e) {
  const t = e.anyOf;
  if (!Array.isArray(t) || t.length === 0 || e.type !== void 0)
    return;
  const n = [];
  for (const r of t) {
    if (!r || typeof r != "object")
      return;
    Lo(r);
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
const jo = /* @__PURE__ */ new Set(["type", "properties", "required", "additionalProperties"]), _r = ["oneOf", "anyOf"];
function vr(e) {
  const t = e.additionalProperties;
  return t === void 0 || t === !1 || typeof t != "object" || t === null ? null : Object.keys(t).length ? t : null;
}
function an(e) {
  const t = [];
  for (const i of e) {
    if (typeof i != "object" || i.type !== "object")
      return null;
    for (const s in i)
      if (!jo.has(s))
        return null;
    t.push(i);
  }
  const n = {}, r = /* @__PURE__ */ new Set();
  for (const i of t) {
    for (const s in i.properties) {
      if (Object.prototype.hasOwnProperty.call(n, s))
        continue;
      const a = [];
      for (const l of t) {
        const d = l.properties?.[s] ?? vr(l);
        d != null && (a.some((h) => JSON.stringify(h) === JSON.stringify(d)) || a.push(d));
      }
      const c = a.length === 1 ? a[0] : an(a) ?? { allOf: a };
      _e(n, s, c);
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
      const a = vr(s);
      a && !i.some((c) => JSON.stringify(c) === JSON.stringify(a)) && i.push(a);
    }
    i.length === 1 ? o.additionalProperties = i[0] : i.length > 1 && (o.additionalProperties = { allOf: i });
  }
  return o;
}
function pl(e) {
  const t = e.allOf;
  if (!Array.isArray(t) || t.length < 2)
    return;
  for (const o of jo)
    if (o in e)
      return;
  const n = t.filter((o) => _r.some((i) => Array.isArray(o[i])));
  let r = null;
  if (!n.length)
    r = an(t);
  else {
    const o = n[0], i = _r.find((c) => Array.isArray(o[c]));
    if (Object.keys(o).length !== 1)
      return;
    const s = t.filter((c) => c !== o), a = o[i].map((c) => an([...s, c]));
    if (a.some((c) => !c))
      return;
    r = { [i]: a };
  }
  r && (delete e.allOf, Ye(e, r));
}
function xo(e, t) {
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = (a) => {
    const c = e.seen.get(a);
    if (c.ref === null)
      return;
    const l = c.def ?? c.schema, d = { ...l }, h = c.ref;
    if (c.ref = null, h) {
      r(h);
      const _ = e.seen.get(h), m = _.schema;
      if (m.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (l.allOf = l.allOf ?? [], l.allOf.push(m)) : Ye(l, m), Ye(l, d), a._zod.parent === h)
        for (const y in l)
          y === "$ref" || y === "allOf" || y in d || delete l[y];
      if (m.$ref && _.def)
        for (const y in l)
          y === "$ref" || y === "allOf" || y in _.def && JSON.stringify(l[y]) === JSON.stringify(_.def[y]) && delete l[y];
    }
    const p = a._zod.parent;
    if (p && p !== h) {
      r(p);
      const _ = e.seen.get(p);
      if (_?.schema.$ref && (l.$ref = _.schema.$ref, _.def))
        for (const m in l)
          m === "$ref" || m === "allOf" || m in _.def && JSON.stringify(l[m]) === JSON.stringify(_.def[m]) && delete l[m];
    }
    e.override({
      zodSchema: a,
      jsonSchema: l,
      path: c.path ?? []
    });
  };
  if (!e.external || e.sharedEmitDoneFor !== e.external) {
    for (const a of [...e.seen.entries()].reverse())
      r(a[0]);
    if (e.target !== "openapi-3.0")
      for (const a of e.seen.entries())
        Lo(a[1].def ?? a[1].schema);
    for (const a of e.deferred)
      a();
    if (e.intersections.length) {
      const a = /* @__PURE__ */ new Map();
      for (const c of e.seen.values())
        for (const l of [c.schema, c.def]) {
          const d = l?.allOf;
          if (!Array.isArray(d))
            continue;
          const h = a.get(d);
          h ? h.push(l) : a.set(d, [l]);
        }
      for (const c of e.intersections)
        for (const l of a.get(c) ?? [])
          pl(l);
    }
  }
  const o = {};
  if (e.target === "draft-2020-12" ? o.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? o.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? o.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
    const a = e.external.registry.get(t)?.id;
    if (!a)
      throw new Error("Schema is missing an `id` property");
    o.$id = e.external.uri(a);
  }
  Ye(o, n.defId ? n.schema : n.def ?? n.schema);
  const i = e.metadataRegistry.get(t)?.id;
  i !== void 0 && o.id === i && delete o.id;
  const s = e.external?.defs ?? {};
  if (!e.external || e.sharedEmitDoneFor !== e.external)
    for (const a of e.seen.entries()) {
      const c = a[1];
      c.def && c.defId && (c.def.id === c.defId && delete c.def.id, _e(s, c.defId, c.def));
    }
  e.external && (e.sharedEmitDoneFor = e.external), e.external || Object.keys(s).length > 0 && (e.target === "draft-2020-12" ? o.$defs = s : o.definitions = s);
  try {
    const a = JSON.parse(JSON.stringify(o));
    return Object.defineProperty(a, "~standard", {
      value: {
        ...t["~standard"],
        jsonSchema: {
          input: Ot(t, "input", e.processors),
          output: Ot(t, "output", e.processors)
        }
      },
      enumerable: !1,
      writable: !1
    }), a;
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function j(e, t) {
  const n = t ?? { seen: /* @__PURE__ */ new Set() };
  if (n.seen.has(e))
    return !1;
  n.seen.add(e);
  const r = e._zod.def;
  if (r.type === "transform")
    return !0;
  if (r.type === "array")
    return j(r.element, n);
  if (r.type === "set")
    return j(r.valueType, n);
  if (r.type === "lazy")
    return j(r.getter(), n);
  if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault" || r.type === "catch")
    return j(r.innerType, n);
  if (r.type === "intersection")
    return j(r.left, n) || j(r.right, n);
  if (r.type === "record" || r.type === "map")
    return j(r.keyType, n) || j(r.valueType, n);
  if (r.type === "pipe")
    return e._zod.traits.has("$ZodCodec") ? !0 : j(r.in, n) || j(r.out, n);
  if (r.type === "object") {
    for (const o in r.shape)
      if (j(r.shape[o], n))
        return !0;
    return !1;
  }
  if (r.type === "union") {
    for (const o of r.options)
      if (j(o, n))
        return !0;
    return !1;
  }
  if (r.type === "tuple") {
    for (const o of r.items)
      if (j(o, n))
        return !0;
    return !!(r.rest && j(r.rest, n));
  }
  return !1;
}
const ml = (e, t = {}) => (n) => {
  const r = Do({ ...n, processors: t });
  return L(e, r), Fo(r, e), xo(r, e);
}, Ot = (e, t, n = {}) => (r) => {
  const { libraryOptions: o, target: i } = r ?? {}, s = Do({ ...o ?? {}, target: i, io: t, processors: n });
  return L(e, s), Fo(s, e), xo(s, e);
}, Me = (e, t, n) => {
  (e[t] === void 0 || n > e[t]) && (e[t] = n);
}, Ze = (e, t, n) => {
  (e[t] === void 0 || n < e[t]) && (e[t] = n);
}, yr = (e, t) => {
  Me(e, "minimum", t), Ze(e, "maximum", t);
}, Uo = (e, t) => {
  e.multipleOf ?? (e.multipleOf = []), e.multipleOf.includes(t) || e.multipleOf.push(t);
}, Wo = (e, t) => {
  e.patterns ?? (e.patterns = /* @__PURE__ */ new Set()), e.patterns.add(t);
}, Ho = (e, t) => {
  e.mime = e.mime ? e.mime.filter((n) => t.includes(n)) : [...t];
}, Ko = (e, t) => {
  e.format = t, t.includes("int") && (e.isInt = !0);
}, br = (e, t) => Me(e, "minimum", t.minimum), wr = (e, t) => Ze(e, "maximum", t.maximum), Er = (e) => (t, n) => {
  Ko(t, n.format);
  const [r, o] = e[n.format];
  Me(t, "minimum", r), Ze(t, "maximum", o);
}, gl = {
  greater_than: (e, t) => Me(e, t.inclusive ? "minimum" : "exclusiveMinimum", t.value),
  less_than: (e, t) => Ze(e, t.inclusive ? "maximum" : "exclusiveMaximum", t.value),
  multiple_of: (e, t) => Uo(e, t.value),
  number_format: Er(co),
  bigint_format: Er(Rs),
  min_length: br,
  max_length: wr,
  length_equals: (e, t) => yr(e, t.length),
  min_size: br,
  max_size: wr,
  size_equals: (e, t) => yr(e, t.size),
  string_format: (e, t) => {
    Ko(e, t.format), t.pattern && Wo(e, t.pattern), (t.format === "base64" || t.format === "base64url") && (e.contentEncoding = t.format), (t.local || t.precision === -1) && (e.laxFormat = !0);
  },
  mime_type: (e, t) => Ho(e, t.mime)
};
function Q(e) {
  const t = {}, n = e._zod.def, r = e._zod.traits.has("$ZodCheck") ? [e, ...n.checks ?? []] : n.checks ?? [];
  for (const i of r)
    gl[i._zod.def.check]?.(t, i._zod.def);
  const o = e._zod.bag;
  o.minimum !== void 0 && Me(t, "minimum", o.minimum), o.exclusiveMinimum !== void 0 && Me(t, "exclusiveMinimum", o.exclusiveMinimum), o.maximum !== void 0 && Ze(t, "maximum", o.maximum), o.exclusiveMaximum !== void 0 && Ze(t, "exclusiveMaximum", o.exclusiveMaximum), o.multipleOf !== void 0 && Uo(t, o.multipleOf), o.format !== void 0 && (t.format ?? (t.format = o.format), o.format.includes("int") && (t.isInt = !0)), o.mime && Ho(t, o.mime);
  for (const i of o.patterns ?? [])
    Wo(t, i);
  return t;
}
const _l = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
}, vl = /* @__PURE__ */ new Map([
  [ko, Ma],
  [zn, Za]
]), yl = (e) => vl.get(e) ?? e, bl = (e, t, n, r) => {
  const o = n;
  o.type = "string";
  const { minimum: i, maximum: s, format: a, patterns: c, contentEncoding: l, laxFormat: d } = Q(e);
  if (typeof i == "number" && (o.minLength = i), typeof s == "number" && (o.maxLength = s), a && (o.format = _l[a] ?? a, o.format === "" && delete o.format, (a === "time" || d) && delete o.format), l && (o.contentEncoding = l), c && c.size > 0) {
    const h = [...c].map(yl);
    h.length === 1 ? o.pattern = h[0].source : h.length > 1 && (o.allOf = [
      ...h.map((p) => ({
        ...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: p.source
      }))
    ]);
  }
}, wl = (e, t, n, r) => {
  const o = n, { minimum: i, maximum: s, multipleOf: a, exclusiveMaximum: c, exclusiveMinimum: l, isInt: d } = Q(e);
  o.type = d ? "integer" : "number";
  const h = typeof l == "number" && l >= (i ?? Number.NEGATIVE_INFINITY), p = typeof c == "number" && c <= (s ?? Number.POSITIVE_INFINITY), _ = t.target === "draft-04" || t.target === "openapi-3.0";
  if (h ? _ ? (o.minimum = l, o.exclusiveMinimum = !0) : o.exclusiveMinimum = l : typeof i == "number" && (o.minimum = i), p ? _ ? (o.maximum = c, o.exclusiveMaximum = !0) : o.exclusiveMaximum = c : typeof s == "number" && (o.maximum = s), a) {
    const m = /* @__PURE__ */ new Set();
    for (const E of a)
      Number.isFinite(E) && E !== 0 ? m.add(Math.abs(E)) : pe(e, t, o, r, `A multipleOf divisor of ${E} cannot be represented in JSON Schema`);
    const [v, ...y] = m;
    v !== void 0 && (o.multipleOf = v), y.length && (o.allOf = [...o.allOf ?? [], ...y.map((E) => ({ multipleOf: E }))]);
  }
}, El = (e, t, n, r) => {
  n.type = "boolean";
}, Sl = (e, t, n, r) => {
  n.not = {};
}, Tl = (e, t, n, r) => {
}, kl = (e, t, n, r) => {
  const o = e._zod.def, i = en(o.entries);
  if (i.length === 0) {
    n.not = {};
    return;
  }
  i.every((s) => typeof s == "number") && (n.type = "number"), i.every((s) => typeof s == "string") && (n.type = "string"), n.enum = i;
}, Ol = (e, t, n, r) => {
  const o = e._zod.def;
  if (o.values.length === 0) {
    n.not = {};
    return;
  }
  const i = [];
  for (const s of o.values)
    if (s === void 0) {
      if (pe(e, t, n, r, "Literal `undefined` cannot be represented in JSON Schema"))
        return;
    } else if (typeof s == "bigint") {
      if (pe(e, t, n, r, "BigInt literals cannot be represented in JSON Schema"))
        return;
      i.push(Number(s));
    } else
      i.push(s);
  if (i.length !== 0) if (i.length === 1) {
    const s = i[0];
    n.type = s === null ? "null" : typeof s, t.target === "draft-04" || t.target === "openapi-3.0" ? n.enum = [s] : n.const = s;
  } else
    i.every((s) => typeof s == "number") && (n.type = "number"), i.every((s) => typeof s == "string") && (n.type = "string"), i.every((s) => typeof s == "boolean") && (n.type = "boolean"), i.every((s) => s === null) && (n.type = "null"), n.enum = i;
}, Cl = (e, t, n, r) => {
  pe(e, t, n, r, "Custom types cannot be represented in JSON Schema");
}, Il = (e, t, n, r) => {
  pe(e, t, n, r, "Transforms cannot be represented in JSON Schema");
}, Pl = (e, t, n, r) => {
  const o = n, i = e._zod.def, { minimum: s, maximum: a } = Q(e);
  typeof s == "number" && (o.minItems = s), typeof a == "number" && (o.maxItems = a), o.type = "array", o.items = L(i.element, t, {
    ...r,
    path: [...r.path, "items"]
  });
};
function cn(e) {
  const t = e._zod.def;
  return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? cn(t.out) : t.type === "catch" ? cn(t.innerType) : e._zod.optin;
}
const zl = (e, t, n, r) => {
  const o = n, i = e._zod.def, s = i.shape;
  if (Object.getOwnPropertySymbols(s).length && pe(e, t, o, r, "Symbol keys cannot be represented in JSON Schema"))
    return;
  o.type = "object", o.properties = {};
  for (const l in s)
    _e(o.properties, l, L(s[l], t, {
      ...r,
      path: [...r.path, "properties", l]
    }));
  const c = [];
  for (const l of Object.keys(s)) {
    const d = i.shape[l];
    (t.io === "input" ? cn(d) === void 0 : d._zod.optout === void 0) && c.push(l);
  }
  c.length > 0 && (o.required = c), i.catchall?._zod.def.type === "never" ? o.additionalProperties = !1 : i.catchall ? i.catchall && (o.additionalProperties = L(i.catchall, t, {
    ...r,
    path: [...r.path, "additionalProperties"]
  })) : t.io === "output" && (o.additionalProperties = !1);
}, Al = (e, t, n, r) => {
  const o = e._zod.def, i = o.inclusive === !1, s = o.options.map((a, c) => L(a, t, {
    ...r,
    path: [...r.path, i ? "oneOf" : "anyOf", c]
  }));
  i ? n.oneOf = s : n.anyOf = s;
}, Nl = (e, t, n, r) => {
  const o = e._zod.def, i = L(o.left, t, {
    ...r,
    path: [...r.path, "allOf", 0]
  }), s = L(o.right, t, {
    ...r,
    path: [...r.path, "allOf", 1]
  }), a = (l) => "allOf" in l && Object.keys(l).length === 1, c = [
    ...a(i) ? i.allOf : [i],
    ...a(s) ? s.allOf : [s]
  ];
  n.allOf = c, t.intersections.push(c);
}, $l = (e, t, n, r) => {
  const o = e._zod.def, i = L(o.innerType, t, r), s = t.seen.get(e);
  t.target === "openapi-3.0" ? (s.ref = o.innerType, n.nullable = !0) : n.anyOf = [i, { type: "null" }];
}, Rl = (e, t, n, r) => {
  const o = e._zod.def;
  L(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType;
}, An = /* @__PURE__ */ Symbol();
function Bo(e, t, n, r, o) {
  let i = !1;
  const s = JSON.stringify(e, (a, c) => typeof c != "bigint" ? c : (i = !0, null));
  return i ? (pe(t, n, r, o, "BigInt defaults cannot be represented in JSON Schema"), An) : JSON.parse(s);
}
const Ml = (e, t, n, r) => {
  const o = e._zod.def;
  L(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType;
  const s = Bo(o.defaultValue, e, t, n, r);
  s !== An && (n.default = s);
}, Zl = (e, t, n, r) => {
  const o = e._zod.def;
  L(o.innerType, t, r);
  const i = t.seen.get(e);
  if (i.ref = o.innerType, t.io !== "input")
    return;
  const s = Bo(o.defaultValue, e, t, n, r);
  s !== An && (n._prefault = s);
}, Dl = (e, t, n, r) => {
  const o = e._zod.def;
  L(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType;
  let s;
  try {
    s = o.catchValue(void 0);
  } catch {
    pe(e, t, n, r, "Dynamic catch values are not supported in JSON Schema");
    return;
  }
  n.default = s;
}, Fl = (e, t, n, r) => {
  const o = e._zod.def, i = o.in._zod.traits.has("$ZodTransform"), s = t.io === "input" ? i ? o.out : o.in : o.out;
  L(s, t, r);
  const a = t.seen.get(e);
  a.ref = s;
}, Ll = (e, t, n, r) => {
  const o = e._zod.def;
  L(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType, n.readOnly = !0;
}, Vo = (e, t, n, r) => {
  const o = e._zod.def;
  L(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType;
}, Sr = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
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
const Jo = (e, t) => {
  na.init(e, t), e.name = "ZodError";
  const n = Object.getPrototypeOf(e);
  Sr.has(n) || (Sr.add(n), pt(n, "format", (r) => (o) => ia(r, o)), pt(n, "flatten", (r) => (o) => oa(r, o)), pt(n, "addIssue", (r) => (o) => {
    r.issues.push(o), r.message = JSON.stringify(r.issues, tn, 2);
  }), pt(n, "addIssues", (r) => (o) => {
    r.issues.push(...o), r.message = JSON.stringify(r.issues, tn, 2);
  }), Object.defineProperty(n, "isEmpty", {
    configurable: !0,
    enumerable: !1,
    get() {
      return this.issues.length === 0;
    }
  }));
}, jl = /* @__PURE__ */ f("ZodError", Jo), J = /* @__PURE__ */ f("ZodError", Jo, void 0, {
  Parent: Error
}), xl = /* @__PURE__ */ Tn(J), Ul = /* @__PURE__ */ kn(J), Wl = /* @__PURE__ */ On(J), Hl = /* @__PURE__ */ Cn(J), Kl = /* @__PURE__ */ da(J), Bl = /* @__PURE__ */ fa(J), Vl = /* @__PURE__ */ ha(J), Jl = /* @__PURE__ */ pa(J), Yl = /* @__PURE__ */ ma(J), Gl = /* @__PURE__ */ ga(J), ql = /* @__PURE__ */ _a(J), Xl = /* @__PURE__ */ va(J);
function Ql() {
  ne.localeError || ye(yu());
}
function Nn() {
  ne.memoizer || ye({ memoizer: gu() });
}
const M = /* @__PURE__ */ f("ZodType", (e, t) => (Ql(), R.init(e, t), e.def = t, e.type = t.type, e), {
  check(...e) {
    const t = this.def;
    return this.clone(K(t, {
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
    return ve(this, e, t);
  },
  brand() {
    return this;
  },
  register(e, t) {
    return e.add(this, t), this;
  },
  refine(e, t) {
    return this.check(Gd(e, t));
  },
  superRefine(e, t) {
    return this.check(qd(e, t));
  },
  overwrite(e) {
    return this.check(/* @__PURE__ */ je(e));
  },
  optional() {
    return Or(this);
  },
  exactOptional() {
    return Dd(this);
  },
  nullable() {
    return Cr(this);
  },
  nullish() {
    return Or(Cr(this));
  },
  nonoptional(e) {
    return Wd(this, e);
  },
  array() {
    return x(this);
  },
  or(e) {
    return $n([this, e]);
  },
  and(e) {
    return $d(this, e);
  },
  transform(e) {
    return Ir(this, Zd(e));
  },
  default(e) {
    return jd(this, e);
  },
  prefault(e) {
    return Ud(this, e);
  },
  catch(e) {
    return Kd(this, e);
  },
  pipe(e) {
    return Ir(this, e);
  },
  readonly() {
    return Jd(this);
  },
  describe(e) {
    const t = this.clone();
    return Be.add(t, { description: e }), t;
  },
  meta(...e) {
    if (e.length === 0)
      return Be.get(this);
    const t = this.clone();
    return Be.add(t, e[0]), t;
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
    return fo(this, "~standard", {
      ...bo(this),
      jsonSchema: {
        input: Ot(this, "input"),
        output: Ot(this, "output")
      }
    });
  },
  set "~standard"(e) {
    he(this, "~standard", e);
  },
  parse: function e(t, n) {
    return xl(this, t, n, { callee: e });
  },
  parseAsync: async function e(t, n) {
    return await Ul(this, t, n, { callee: e });
  },
  safeParse(e, t) {
    return Wl(this, e, t);
  },
  async safeParseAsync(e, t) {
    return Hl(this, e, t);
  },
  // `spa` is an alias: same function object as `safeParseAsync`, as before.
  get spa() {
    return this?.safeParseAsync;
  },
  set spa(e) {
    he(this, "spa", e);
  },
  validate(e, t) {
    return ca(this, e, t);
  },
  validateAsync(e, t) {
    return la(this, e, t);
  },
  encode: function e(t, n) {
    return Kl(this, t, n, { callee: e });
  },
  decode: function e(t, n) {
    return Bl(this, t, n, { callee: e });
  },
  encodeAsync: async function e(t, n) {
    return await Vl(this, t, n, { callee: e });
  },
  decodeAsync: async function e(t, n) {
    return await Jl(this, t, n, { callee: e });
  },
  safeEncode(e, t) {
    return Yl(this, e, t);
  },
  safeDecode(e, t) {
    return Gl(this, e, t);
  },
  async safeEncodeAsync(e, t) {
    return ql(this, e, t);
  },
  async safeDecodeAsync(e, t) {
    return Xl(this, e, t);
  },
  toJSONSchema(e) {
    return ml(this, {})(e);
  },
  // Reads through to the registry on every access, so it must not cache.
  get description() {
    return Be.get(this)?.description;
  },
  // No setter: `schema._def = x` throws, as it did when `_def` was a non-writable own property.
  get _def() {
    return this._zod.def;
  }
}), Yo = /* @__PURE__ */ f(
  "_ZodString",
  (e, t) => {
    Pn.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => bl(e, n, r);
  },
  /* @__PURE__ */ ho({
    format: (e) => Q(e).format ?? null,
    minLength: (e) => Q(e).minimum ?? null,
    maxLength: (e) => Q(e).maximum ?? null
  }, {
    regex(...e) {
      return this.check(/* @__PURE__ */ Qu(...e));
    },
    includes(...e) {
      return this.check(/* @__PURE__ */ nl(...e));
    },
    startsWith(...e) {
      return this.check(/* @__PURE__ */ rl(...e));
    },
    endsWith(...e) {
      return this.check(/* @__PURE__ */ ol(...e));
    },
    min(...e) {
      return this.check(/* @__PURE__ */ kt(...e));
    },
    max(...e) {
      return this.check(/* @__PURE__ */ Mo(...e));
    },
    length(...e) {
      return this.check(/* @__PURE__ */ Zo(...e));
    },
    nonempty(...e) {
      return this.check(/* @__PURE__ */ kt(1, ...e));
    },
    lowercase(e) {
      return this.check(/* @__PURE__ */ el(e));
    },
    uppercase(e) {
      return this.check(/* @__PURE__ */ tl(e));
    },
    trim() {
      return this.check(/* @__PURE__ */ sl());
    },
    normalize(...e) {
      return this.check(/* @__PURE__ */ il(...e));
    },
    toLowerCase() {
      return this.check(/* @__PURE__ */ al());
    },
    toUpperCase() {
      return this.check(/* @__PURE__ */ cl());
    },
    slugify() {
      return this.check(/* @__PURE__ */ ul());
    }
  })
), ed = /* @__PURE__ */ f("ZodString", (e, t) => {
  Pn.init(e, t), Yo.init(e, t);
}, {
  email(e) {
    return this.check(/* @__PURE__ */ Su(id, e));
  },
  url(e) {
    return this.check(/* @__PURE__ */ Ro(Go, e));
  },
  jwt(e) {
    return this.check(/* @__PURE__ */ Wu(Ed, e));
  },
  emoji(e) {
    return this.check(/* @__PURE__ */ Pu(cd, e));
  },
  guid(e) {
    return this.check(/* @__PURE__ */ Tu(sd, e));
  },
  uuid(e) {
    return this.check(/* @__PURE__ */ ku(mt, e));
  },
  uuidv4(e) {
    return this.check(/* @__PURE__ */ Ou(mt, e));
  },
  uuidv6(e) {
    return this.check(/* @__PURE__ */ Cu(mt, e));
  },
  uuidv7(e) {
    return this.check(/* @__PURE__ */ Iu(mt, e));
  },
  nanoid(e) {
    return this.check(/* @__PURE__ */ zu(ud, e));
  },
  cuid(e) {
    return this.check(/* @__PURE__ */ Au(ld, e));
  },
  cuid2(e) {
    return this.check(/* @__PURE__ */ Nu(dd, e));
  },
  ulid(e) {
    return this.check(/* @__PURE__ */ $u(fd, e));
  },
  base64(e) {
    return this.check(/* @__PURE__ */ ju(yd, e));
  },
  base64url(e) {
    return this.check(/* @__PURE__ */ xu(bd, e));
  },
  xid(e) {
    return this.check(/* @__PURE__ */ Ru(hd, e));
  },
  ksuid(e) {
    return this.check(/* @__PURE__ */ Mu(pd, e));
  },
  ipv4(e) {
    return this.check(/* @__PURE__ */ Zu(md, e));
  },
  ipv6(e) {
    return this.check(/* @__PURE__ */ Du(gd, e));
  },
  cidrv4(e) {
    return this.check(/* @__PURE__ */ Fu(_d, e));
  },
  cidrv6(e) {
    return this.check(/* @__PURE__ */ Lu(vd, e));
  },
  e164(e) {
    return this.check(/* @__PURE__ */ Uu(wd, e));
  },
  datetime(e) {
    return this.check(/* @__PURE__ */ Hu(td, e));
  },
  date(e) {
    return this.check(/* @__PURE__ */ Ku(nd, e));
  },
  time(e) {
    return this.check(/* @__PURE__ */ Bu(rd, e));
  },
  duration(e) {
    return this.check(/* @__PURE__ */ Vu(od, e));
  }
});
function w(e) {
  return /* @__PURE__ */ Eu(ed, e);
}
const N = /* @__PURE__ */ f("ZodStringFormat", (e, t) => {
  z.init(e, t), Yo.init(e, t);
}), td = /* @__PURE__ */ f("ZodISODateTime", (e, t) => {
  kc.init(e, t), N.init(e, t);
}), nd = /* @__PURE__ */ f("ZodISODate", (e, t) => {
  Oc.init(e, t), N.init(e, t);
}), rd = /* @__PURE__ */ f("ZodISOTime", (e, t) => {
  Cc.init(e, t), N.init(e, t);
}), od = /* @__PURE__ */ f("ZodISODuration", (e, t) => {
  Ic.init(e, t), N.init(e, t);
}), id = /* @__PURE__ */ f("ZodEmail", (e, t) => {
  dc.init(e, t), N.init(e, t);
}), sd = /* @__PURE__ */ f("ZodGUID", (e, t) => {
  uc.init(e, t), N.init(e, t);
}), mt = /* @__PURE__ */ f("ZodUUID", (e, t) => {
  lc.init(e, t), N.init(e, t);
}), Go = /* @__PURE__ */ f("ZodURL", (e, t) => {
  _c.init(e, t), N.init(e, t);
});
function ad(e) {
  return /* @__PURE__ */ Ro(Go, e);
}
const cd = /* @__PURE__ */ f("ZodEmoji", (e, t) => {
  vc.init(e, t), N.init(e, t);
}), ud = /* @__PURE__ */ f("ZodNanoID", (e, t) => {
  yc.init(e, t), N.init(e, t);
}), ld = /* @__PURE__ */ f("ZodCUID", (e, t) => {
  bc.init(e, t), N.init(e, t);
}), dd = /* @__PURE__ */ f("ZodCUID2", (e, t) => {
  wc.init(e, t), N.init(e, t);
}), fd = /* @__PURE__ */ f("ZodULID", (e, t) => {
  Ec.init(e, t), N.init(e, t);
}), hd = /* @__PURE__ */ f("ZodXID", (e, t) => {
  Sc.init(e, t), N.init(e, t);
}), pd = /* @__PURE__ */ f("ZodKSUID", (e, t) => {
  Tc.init(e, t), N.init(e, t);
}), md = /* @__PURE__ */ f("ZodIPv4", (e, t) => {
  Pc.init(e, t), N.init(e, t);
}), gd = /* @__PURE__ */ f("ZodIPv6", (e, t) => {
  Ac.init(e, t), N.init(e, t);
}), _d = /* @__PURE__ */ f("ZodCIDRv4", (e, t) => {
  Nc.init(e, t), N.init(e, t);
}), vd = /* @__PURE__ */ f("ZodCIDRv6", (e, t) => {
  Rc.init(e, t), N.init(e, t);
}), yd = /* @__PURE__ */ f("ZodBase64", (e, t) => {
  Mc.init(e, t), N.init(e, t);
}), bd = /* @__PURE__ */ f("ZodBase64URL", (e, t) => {
  Dc.init(e, t), N.init(e, t);
}), wd = /* @__PURE__ */ f("ZodE164", (e, t) => {
  Fc.init(e, t), N.init(e, t);
}), Ed = /* @__PURE__ */ f("ZodJWT", (e, t) => {
  jc.init(e, t), N.init(e, t);
}), qo = /* @__PURE__ */ f(
  "ZodNumber",
  (e, t) => {
    Oo.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => wl(e, n, r, o), e.isFinite = !0;
  },
  /* @__PURE__ */ ho({
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
      return this.check(/* @__PURE__ */ pr(e, t));
    },
    gte(e, t) {
      return this.check(/* @__PURE__ */ Ht(e, t));
    },
    min(e, t) {
      return this.check(/* @__PURE__ */ Ht(e, t));
    },
    lt(e, t) {
      return this.check(/* @__PURE__ */ hr(e, t));
    },
    lte(e, t) {
      return this.check(/* @__PURE__ */ Wt(e, t));
    },
    max(e, t) {
      return this.check(/* @__PURE__ */ Wt(e, t));
    },
    int(e) {
      return this.check(Tr(e));
    },
    safe(e) {
      return this.check(Tr(e));
    },
    positive(e) {
      return this.check(/* @__PURE__ */ pr(0, e));
    },
    nonnegative(e) {
      return this.check(/* @__PURE__ */ Ht(0, e));
    },
    negative(e) {
      return this.check(/* @__PURE__ */ hr(0, e));
    },
    nonpositive(e) {
      return this.check(/* @__PURE__ */ Wt(0, e));
    },
    multipleOf(e, t) {
      return this.check(/* @__PURE__ */ mr(e, t));
    },
    step(e, t) {
      return this.check(/* @__PURE__ */ mr(e, t));
    },
    finite() {
      return this;
    }
  })
);
function I(e) {
  return /* @__PURE__ */ Ju(qo, e);
}
const Sd = /* @__PURE__ */ f("ZodNumberFormat", (e, t) => {
  xc.init(e, t), qo.init(e, t);
});
function Tr(e) {
  return /* @__PURE__ */ Yu(Sd, e);
}
const Td = /* @__PURE__ */ f("ZodBoolean", (e, t) => {
  Uc.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => El(e, n, r);
});
function Xo(e) {
  return /* @__PURE__ */ Gu(Td, e);
}
const kd = /* @__PURE__ */ f("ZodUnknown", (e, t) => {
  Wc.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => Tl();
});
function kr() {
  return /* @__PURE__ */ qu(kd);
}
const Od = /* @__PURE__ */ f("ZodNever", (e, t) => {
  Hc.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => Sl(e, n, r);
});
function Cd(e) {
  return /* @__PURE__ */ Xu(Od, e);
}
const Id = /* @__PURE__ */ f("ZodArray", (e, t) => {
  Nn(), Vc.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => Pl(e, n, r, o), e.element = t.element;
}, {
  min(e, t) {
    return this.check(/* @__PURE__ */ kt(e, t));
  },
  nonempty(e) {
    return this.check(/* @__PURE__ */ kt(1, e));
  },
  max(e, t) {
    return this.check(/* @__PURE__ */ Mo(e, t));
  },
  length(e, t) {
    return this.check(/* @__PURE__ */ Zo(e, t));
  },
  unwrap() {
    return this.element;
  }
});
function x(e, t) {
  return /* @__PURE__ */ ll(Id, e, t);
}
const Pd = /* @__PURE__ */ f("ZodObject", (e, t) => {
  Nn(), Gc.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => zl(e, n, r, o), Js(e, "shape", (n) => n._zod.def.shape, !1);
}, {
  keyof() {
    return st(Object.keys(this._zod.def.shape));
  },
  catchall(e) {
    return this.clone(K(this._zod.def, { catchall: e }));
  },
  passthrough() {
    return this.clone(K(this._zod.def, { catchall: kr() }));
  },
  loose() {
    return this.clone(K(this._zod.def, { catchall: kr() }));
  },
  strict() {
    return this.clone(K(this._zod.def, { catchall: Cd() }));
  },
  strip() {
    return this.clone(K(this._zod.def, { catchall: void 0 }));
  },
  extend(e) {
    return Ds(this, e);
  },
  safeExtend(e) {
    return Fs(this, e);
  },
  merge(e) {
    return Ls(this, e);
  },
  pick(e) {
    return Ms(this, e);
  },
  omit(e) {
    return Zs(this, e);
  },
  partial(...e) {
    return Yn(ei, this, e[0]);
  },
  exactPartial(...e) {
    return Yn(ti, this, e[0], "exactPartial");
  },
  required(...e) {
    return js(ni, this, e[0]);
  }
});
function T(e, t) {
  const n = {
    type: "object",
    shape: e ?? {},
    ...b(t)
  };
  return new Pd(n);
}
const Qo = /* @__PURE__ */ f("ZodUnion", (e, t) => {
  Po.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => Al(e, n, r, o), e.options = t.options;
});
function $n(e, t) {
  return new Qo({
    type: "union",
    options: e,
    ...b(t)
  });
}
const zd = /* @__PURE__ */ f("ZodDiscriminatedUnion", (e, t) => {
  Qo.init(e, t), Xc.init(e, t);
});
function Ad(e, t, n) {
  return new zd({
    type: "union",
    options: t,
    discriminator: e,
    ...b(n)
  });
}
const Nd = /* @__PURE__ */ f("ZodIntersection", (e, t) => {
  Qc.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => Nl(e, n, r, o);
});
function $d(e, t) {
  return new Nd({
    type: "intersection",
    left: e,
    right: t
  });
}
const un = /* @__PURE__ */ f("ZodEnum", (e, t) => {
  eu.init(e, t), M.init(e, t), e._zod.processJSONSchema = (r, o, i) => kl(e, r, o), e.enum = t.entries, e.options = [...e._zod.values];
  const n = new Set(Object.keys(t.entries));
  e.extract = (r, o) => {
    const i = {};
    for (const s of r)
      if (n.has(s))
        i[s] = t.entries[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new un({
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
    return new un({
      ...t,
      checks: [],
      ...b(o),
      entries: i
    });
  };
});
function st(e, t) {
  const n = Array.isArray(e) ? Object.fromEntries(e.map((r) => [r, r])) : e;
  return new un({
    type: "enum",
    entries: n,
    ...b(t)
  });
}
const Rd = /* @__PURE__ */ f("ZodLiteral", (e, t) => {
  tu.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => Ol(e, n, r, o), e.values = new Set(t.values), Object.defineProperty(e, "value", {
    get() {
      if (t.values.length > 1)
        throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
      return t.values[0];
    }
  });
});
function gt(e, t) {
  return new Rd({
    type: "literal",
    values: Array.isArray(e) ? e : [e],
    ...b(t)
  });
}
const Md = /* @__PURE__ */ f("ZodTransform", (e, t) => {
  Nn(), nu.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => Il(e, n, r, o), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      throw new po(e.constructor.name);
    n.addIssue = (i) => {
      if (typeof i == "string")
        n.issues.push(nt(i, n.value, t));
      else {
        const s = i;
        s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), "input" in s || (s.input = n.value), s.inst ?? (s.inst = e), n.issues.push(nt(s));
      }
    };
    const o = t.transform(n.value, n);
    return o instanceof Promise ? o.then((i) => (n.value = i, n)) : (n.value = o, n);
  };
});
function Zd(e) {
  return new Md({
    type: "transform",
    transform: e
  });
}
const ei = /* @__PURE__ */ f("ZodOptional", (e, t) => {
  zo.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => Vo(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Or(e) {
  return new ei({
    type: "optional",
    innerType: e
  });
}
const ti = /* @__PURE__ */ f("ZodExactOptional", (e, t) => {
  ru.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => Vo(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Dd(e) {
  return new ti({
    type: "optional",
    innerType: e
  });
}
const Fd = /* @__PURE__ */ f("ZodNullable", (e, t) => {
  ou.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => $l(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Cr(e) {
  return new Fd({
    type: "nullable",
    innerType: e
  });
}
const Ld = /* @__PURE__ */ f("ZodDefault", (e, t) => {
  iu.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => Ml(e, n, r, o), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function jd(e, t) {
  return new Ld({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : so(t);
    }
  });
}
const xd = /* @__PURE__ */ f("ZodPrefault", (e, t) => {
  su.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => Zl(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Ud(e, t) {
  return new xd({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : so(t);
    }
  });
}
const ni = /* @__PURE__ */ f("ZodNonOptional", (e, t) => {
  au.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => Rl(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Wd(e, t) {
  return new ni({
    type: "nonoptional",
    innerType: e,
    ...b(t)
  });
}
const Hd = /* @__PURE__ */ f("ZodCatch", (e, t) => {
  cu.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => Dl(e, n, r, o), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function Kd(e, t) {
  return new Hd({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : Gs(t)
  });
}
const Bd = /* @__PURE__ */ f("ZodPipe", (e, t) => {
  uu.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => Fl(e, n, r, o), e.in = t.in, e.out = t.out;
});
function Ir(e, t) {
  return new Bd({
    type: "pipe",
    in: e,
    out: t
    // ...util.normalizeParams(params),
  });
}
const Vd = /* @__PURE__ */ f("ZodReadonly", (e, t) => {
  lu.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => Ll(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Jd(e) {
  return new Vd({
    type: "readonly",
    innerType: e
  });
}
const Yd = /* @__PURE__ */ f("ZodCustom", (e, t) => {
  du.init(e, t), M.init(e, t), e._zod.processJSONSchema = (n, r, o) => Cl(e, n, r, o);
});
function Gd(e, t = {}) {
  return /* @__PURE__ */ dl(Yd, e, t);
}
function qd(e, t) {
  return /* @__PURE__ */ fl(e, t);
}
const Xd = ["sleep", "low", "normal", "high"], ri = ["offline", "error", "sleep", "low", "normal", "high"], Qd = ["hashrate", "power"], Te = ["5m", "30m", "3h", "1d"], rt = st(Xd), ef = st(ri), tf = st(Qd), ln = st(Te), D = I().nonnegative(), Rn = I().min(0).max(100), De = I().int().nonnegative(), oi = T({
  offline: I().int().nonnegative(),
  error: I().int().nonnegative(),
  sleep: I().int().nonnegative(),
  low: I().int().nonnegative(),
  normal: I().int().nonnegative(),
  high: I().int().nonnegative(),
  empty: I().int().nonnegative()
});
T({
  statusCode: I().int(),
  error: w(),
  message: w()
});
const nf = T({
  siteName: w(),
  /** False on the hosted demo: the UI shows live data but disables every command. */
  commandsEnabled: Xo(),
  /** Where the hosted demo's "Download the App" button points; null shows no button. */
  downloadUrl: ad({ protocol: /^https?$/ }).nullable()
}), rf = T({
  miners: T({
    total: I().int().nonnegative(),
    online: I().int().nonnegative(),
    error: I().int().nonnegative(),
    offline: I().int().nonnegative()
  }),
  hashrateThs: D,
  powerW: D
}), of = T({
  id: w(),
  name: w(),
  containerId: w(),
  hashrateThs: D,
  powerW: D,
  minerStatus: oi
}), ii = T({
  id: w(),
  name: w(),
  /** Miner model shown under the container name, e.g. "MicroBT WhatsMiner M56". */
  model: w(),
  hashrateThs: D,
  powerW: D,
  /** The container-wide power mode; null when its miners run in mixed modes. */
  powerMode: rt.nullable(),
  /** The container-wide power percentage; null when mixed. */
  powerPct: Rn.nullable(),
  /** Power modes every miner in the container accepts (vendors differ). */
  supportedPowerModes: x(rt),
  minerStatus: oi,
  racks: x(of)
}), sf = T({ containers: x(ii) }), si = 1e3, dn = {
  metric: tf,
  interval: ln,
  /** Narrow the series to one container; without it the series is site-wide. */
  containerId: w().optional(),
  /** Narrow the series to one rack. */
  rackId: w().optional()
}, ai = I().int().min(1).max(si);
T({
  ...dn,
  limit: ai.optional(),
  start: De.optional(),
  end: De.optional()
});
$n([
  T({ ...dn, limit: ai.optional() }),
  T({ ...dn, start: De, end: De })
]);
const Pr = T({ ts: De, value: D }), af = Ad("metric", [
  T({
    metric: gt("hashrate"),
    interval: ln,
    unit: gt("TH/s"),
    points: x(Pr),
    /** Nominal hashrate of the same scope, TH/s. */
    nominal: D
  }),
  T({
    metric: gt("power"),
    interval: ln,
    unit: gt("W"),
    points: x(Pr)
  })
]), cf = T({
  id: w(),
  name: w(),
  containerId: w(),
  powerW: D,
  /** Hashrate of the miners behind this meter. */
  hashrateThs: D,
  miners: I().int().nonnegative()
}), uf = T({
  /** Site meter total. Site efficiency = this / hashrate. */
  siteMeterPowerW: D,
  /** Sum of the miners' own power readings. Mining efficiency = this / hashrate. */
  minersPowerW: D,
  hashrateThs: D,
  meters: x(cf)
}), ci = T({
  id: w(),
  serial: w(),
  ip: w(),
  containerId: w(),
  rackId: w(),
  /** Socket position in the rack, e.g. "1-1-3". */
  position: w(),
  status: ef,
  powerMode: rt,
  /**
   * Power percentage: the worker's reading, or else the last value the app
   * applied; null when neither is known.
   */
  powerPct: Rn.nullable(),
  supportedPowerModes: x(rt),
  hashrateThs: D,
  powerW: D,
  frequencyMhz: D,
  inletTempC: I(),
  chipTempC: I(),
  uptimeS: D,
  /** Last successful poll. */
  lastUpdate: De
}), lf = T({
  container: ii.pick({
    id: !0,
    name: !0,
    model: !0,
    hashrateThs: !0,
    powerW: !0
  }),
  racks: x(
    T({
      id: w(),
      name: w(),
      sockets: x(T({ position: w(), miner: ci.nullable() }))
    })
  )
}), Mn = 200;
T({
  containerId: w().optional(),
  /** Matches id, serial, IP or position. */
  search: w().optional(),
  /** 1-based. */
  page: I().int().positive().optional(),
  /** Default {@link MINERS_DEFAULT_PAGE_SIZE}. */
  pageSize: I().int().min(1).max(Mn).optional()
});
const ui = T({
  items: x(ci),
  total: I().int().nonnegative(),
  page: I().int().positive(),
  pageSize: I().int().positive()
}), li = $n([
  T({ containerId: w() }),
  T({ minerIds: x(w()).min(1) })
]), df = T({
  target: li,
  mode: rt
}), ff = T({ target: li, pct: Rn }), zr = T({
  accepted: Xo(),
  minerCount: I().int().nonnegative()
}), hf = T({
  /** Position in the rack, e.g. "1-3". Unique within the rack. */
  position: w().min(1),
  /** The MDK device in this socket; null for an empty socket. Unique across the site. */
  deviceId: w().min(1).nullable()
}), pf = T({
  /** Unique across the site. */
  id: w().min(1),
  name: w().min(1),
  sockets: x(hf)
}), mf = T({
  /** Unique across the site. */
  id: w().min(1),
  name: w().min(1),
  /** Miner model shown under the container name, e.g. "MicroBT WhatsMiner M56". */
  model: w().min(1),
  /** Nominal hashrate of one miner in this container, TH/s. */
  nominalHashrateThs: D,
  /** The power meter device behind this container; null when it has none. */
  meterDeviceId: w().min(1).nullable(),
  racks: x(pf)
}), _t = (e, t, n, r) => {
  const o = /* @__PURE__ */ new Set();
  n.forEach((i, s) => {
    o.has(i) && e.addIssue({ code: "custom", message: `duplicate ${t} "${i}"`, path: [...r, s] }), o.add(i);
  });
};
T({ containers: x(mf) }).superRefine((e, t) => {
  _t(
    t,
    "container id",
    e.containers.map((r) => r.id),
    ["containers"]
  ), _t(
    t,
    "rack id",
    e.containers.flatMap((r) => r.racks.map((o) => o.id)),
    ["containers"]
  ), e.containers.forEach((r, o) => {
    r.racks.forEach((i, s) => {
      _t(
        t,
        "socket position",
        i.sockets.map((a) => a.position),
        ["containers", o, "racks", s, "sockets"]
      );
    });
  });
  const n = e.containers.flatMap((r) => [
    ...r.meterDeviceId === null ? [] : [r.meterDeviceId],
    ...r.racks.flatMap(
      (o) => o.sockets.flatMap((i) => i.deviceId === null ? [] : [i.deviceId])
    )
  ]);
  _t(t, "device id", n, ["containers"]);
});
const di = "op-centre-lite", fi = [di, "live"], Ce = {
  /** The site config; it only changes with a restart, so it is not live. */
  config: (e) => [di, "config", e],
  /** A read of live site data, by what it reads and its URL. */
  live: (e, t) => [...fi, e, t]
}, be = async (e, t) => t.parse(await Qr(e)), Ar = async (e, t, n) => {
  const r = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  };
  return n.parse(await Qr(e, r));
}, se = {
  CONFIG: "/api/config",
  SITE_SUMMARY: "/api/site/summary",
  CONTAINERS: "/api/containers",
  HISTORY: "/api/history",
  POWER_METERS: "/api/power-meters",
  MINERS: "/api/miners",
  POWER_MODE: "/api/commands/power-mode",
  POWER_PCT: "/api/commands/power-pct"
}, gf = (e) => `/api/containers/${encodeURIComponent(e)}/layout`, _f = (e) => `/api/miners/${encodeURIComponent(e)}/logs`, vf = 404, yf = 501, bf = /* @__PURE__ */ new Set([500, 502, 503, 504]), ce = (e, t) => e instanceof jl ? `${t} answered with a body that does not match the contract.` : e instanceof Ae && e.status === vf ? `Nothing serves ${t} (HTTP 404). Is the app's backend running?` : e instanceof Ae && e.status === yf ? `This site does not offer ${t} (HTTP 501).` : e instanceof Ae && bf.has(e.status) ? `The app's backend is not reachable (HTTP ${e.status}). Try again in a moment.` : e instanceof Error ? e.message : String(e), xe = "-", wf = 1e3, Ef = 1e3, Sf = 1e6, me = (e) => e / wf, fe = (e) => e / Ef, Zn = (e) => e / Sf, ee = (e, t) => t > 0 ? e / t : void 0, P = {
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
  TEMPERATURE: "°C"
}, A = {
  HASHRATE: 2,
  HASHRATE_TH: 2,
  /** A miner's hash rate on a socket tile, where there is room for whole TH/s only. */
  HASHRATE_TH_SOCKET: 0,
  /** A miner's power on a socket tile, in kW. */
  POWER_KW_SOCKET: 1,
  POWER: 3,
  POWER_W: 0,
  POWER_KW: 0,
  EFFICIENCY: 2,
  TEMPERATURE: 1
}, k = (e, t) => e.toLocaleString("en-US", {
  minimumFractionDigits: t,
  maximumFractionDigits: t
}), Tf = (e, t) => {
  const n = 10 ** t;
  return Math.round(e * n) / n;
}, Ie = (e, t) => `${e} ${t}`, ae = (e, t = P.EFFICIENCY_CARD) => e === void 0 ? xe : Ie(k(e, A.EFFICIENCY), t), kf = (e) => Ie(k(e, A.POWER), P.POWER), Ue = (e) => Ie(k(e, A.POWER_KW), P.POWER_KW), at = (e) => Ie(k(e, A.HASHRATE), P.HASHRATE), Dn = (e) => Ie(k(e, A.HASHRATE_TH), P.HASHRATE_TH), Fn = (e) => Ie(k(e, A.POWER_W), P.POWER_W), Ct = (e) => Ie(k(e, A.TEMPERATURE), P.TEMPERATURE), ke = (e) => `${k(e, 0)}${P.PERCENT}`, ot = (e, t, n = `${t}s`) => `${k(e, 0)} ${e === 1 ? t : n}`, Of = (e) => ({
  miners: e.miners,
  hashratePhs: me(e.hashrateThs),
  consumptionMw: Zn(e.powerW),
  efficiencyWPerThs: ee(e.powerW, e.hashrateThs)
}), Cf = 3e4, hi = () => {
  const { apiUrl: e } = re(), t = e(se.SITE_SUMMARY), n = Oe({
    queryKey: Ce.live("site-summary", t),
    queryFn: () => be(t, rf),
    refetchInterval: Cf
  });
  return n.data !== void 0 ? { status: "ready", stats: Of(n.data) } : n.isError ? { status: "error", message: ce(n.error, t) } : { status: "loading" };
}, Ln = () => {
  const { apiUrl: e } = re(), t = e(se.CONFIG);
  return Oe({
    queryKey: Ce.config(t),
    queryFn: () => be(t, nf),
    staleTime: Number.POSITIVE_INFINITY
  }).data;
}, If = () => {
  const e = Ln();
  return e?.commandsEnabled !== !1 ? null : /* @__PURE__ */ u(
    rs,
    {
      className: "op-centre-lite-demo-banner",
      type: "info",
      showIcon: !0,
      title: "This hosted demo shows live data but can't send commands.",
      description: "Power controls are off. Install the app on your own site to use them.",
      action: e.downloadUrl === null ? void 0 : /* @__PURE__ */ u(
        "a",
        {
          className: "mdk-button mdk-button--variant-primary",
          href: e.downloadUrl,
          target: "_blank",
          rel: "noopener noreferrer",
          children: "Download the App"
        }
      )
    }
  );
}, Fe = ({ title: e, subtitle: t, actions: n, children: r }) => {
  const o = hi();
  return /* @__PURE__ */ g("section", { className: "op-centre-lite-page", children: [
    /* @__PURE__ */ u(Ts, { view: o }),
    /* @__PURE__ */ u(If, {}),
    /* @__PURE__ */ g("header", { className: "op-centre-lite-page__header", children: [
      /* @__PURE__ */ g("div", { children: [
        /* @__PURE__ */ u(O, { variant: "heading1", children: e }),
        t === void 0 ? null : /* @__PURE__ */ u(O, { variant: "secondary", size: "sm", children: t })
      ] }),
      n === void 0 ? null : /* @__PURE__ */ u("div", { className: "op-centre-lite-page__actions", children: n })
    ] }),
    r
  ] });
}, Pf = (e) => {
  const t = bs(null), [n, r] = $(!1);
  return yn(() => {
    if (n) return;
    let i = 0;
    const s = () => {
      t.current === null ? i = requestAnimationFrame(s) : r(!0);
    };
    return i = requestAnimationFrame(s), () => cancelAnimationFrame(i);
  }, [n]), { data: ge(
    () => ({ ...e, datasets: [...e.datasets] }),
    // `chartReady` is a dependency on purpose: flipping it re-creates `datasets`.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [e, n]
  ), chartRef: t };
}, zf = {
  "5m": "5 Min",
  "30m": "30 Min",
  "3h": "3 H",
  "1d": "1 D"
}, pi = {
  "5m": "5m",
  "30m": "30m",
  "3h": "3h",
  "1d": "1D"
}, mi = (e) => pi[e], Af = (e) => Te.find((t) => pi[t] === e), gi = (e) => ({
  value: mi(e),
  label: zf[e]
}), Nf = Te.map(gi), $f = (e) => Te.filter((t) => e.includes(t)).map(gi), fn = "5m", Nr = {
  "5m": "HH:mm",
  "30m": "HH:mm",
  "3h": "MMM dd HH:mm",
  "1d": "MMM dd"
}, Rf = "MMM dd HH:mm", Mf = (e, t) => t && Nr[e] === "HH:mm" ? Rf : Nr[e], Zf = { datasets: [] }, It = ({
  title: e,
  view: t,
  interval: n,
  onIntervalChange: r,
  allowedIntervals: o,
  spansDays: i = !1
}) => {
  const s = Pf(t.status === "ready" ? t.chart : Zf);
  if (t.status === "error")
    return /* @__PURE__ */ u(te, { title: `Could not load ${e.toLowerCase()}`, error: t.message });
  const a = (c) => {
    const l = Af(c);
    l !== void 0 && r(l);
  };
  return /* @__PURE__ */ u(
    os,
    {
      title: e,
      data: s.data,
      chartRef: s.chartRef,
      isLoading: t.status === "loading",
      timelineOptions: o === void 0 ? Nf : $f(o),
      timeline: mi(n),
      onTimelineChange: a,
      chartProps: { customDateFormat: Mf(n, i) },
      detailLegends: !0,
      minHeight: 280
    }
  );
}, Ve = 6e4, $r = {
  "5m": 5 * Ve,
  "30m": 30 * Ve,
  "3h": 180 * Ve,
  "1d": 1440 * Ve
}, Rr = { kind: "recent" }, Df = (e, t, n) => Math.floor(n / $r[e]) - Math.floor(t / $r[e]) + 1, _i = (e) => e.kind === "recent" ? [...Te] : Te.filter(
  (t) => Df(t, e.start, e.end) <= si
), Ff = (e, t) => {
  const n = _i(e);
  return n.includes(t) ? t : n[0] ?? Te.at(-1) ?? t;
}, Lf = 1440 * Ve, jf = (e) => e.kind === "range" && e.end - e.start > Lf, xf = (e, t, n, { containerId: r, rackId: o }) => {
  const i = { containerId: r, ...o === void 0 ? {} : { rackId: o } };
  return n.kind === "recent" ? { metric: e, interval: t, ...i } : { metric: e, interval: t, ...i, start: n.start, end: n.end };
}, Uf = (e, t, n) => {
  const r = new Date(e);
  r.setHours(0, 0, 0, 0);
  const o = new Date(t);
  return o.setHours(23, 59, 59, 999), { kind: "range", start: r.getTime(), end: Math.min(o.getTime(), n) };
}, Pe = A.HASHRATE, He = A.POWER, Wf = (e) => {
  if (e.length === 0) return;
  let t = Number.POSITIVE_INFINITY, n = Number.NEGATIVE_INFINITY, r = 0;
  for (const o of e)
    o < t && (t = o), o > n && (n = o), r += o;
  return { min: t, max: n, avg: r / e.length };
}, vi = (e, t, n) => e.map((r) => ({ x: r.ts, y: Tf(t(r.value), n) })), yi = (e, t, n) => {
  const r = Wf(e);
  if (r !== void 0)
    return {
      min: `${k(r.min, n)} ${t}`,
      max: `${k(r.max, n)} ${t}`,
      avg: `${k(r.avg, n)} ${t}`
    };
}, bi = (e) => e.at(-1), G = { SITE: "site", CONTAINER: "container", RACK: "rack" }, Hf = (e) => e.rackId !== void 0 ? G.RACK : e.containerId !== void 0 ? G.CONTAINER : G.SITE, Kf = {
  [G.SITE]: "Site hash rate",
  [G.CONTAINER]: "Container hash rate",
  [G.RACK]: "Rack hash rate"
}, Bf = {
  [G.SITE]: "Total consumption",
  [G.CONTAINER]: "Container consumption",
  [G.RACK]: "Rack consumption"
}, Vf = (e, t = G.SITE) => {
  const n = vi(e.points, me, Pe), r = n.map((l) => l.y), o = me(e.nominal), i = bi(r), s = {
    label: Kf[t],
    borderColor: Xt.secondaryOrange,
    data: n
  };
  i !== void 0 && (s.currentValue = {
    value: k(i, Pe),
    unit: P.HASHRATE
  });
  const a = {
    yTicksFormatter: (l) => k(l, Pe),
    priceFormatter: (l) => k(l, Pe),
    datasets: [
      s,
      {
        label: "Nominal hash rate",
        borderColor: Xt.grey,
        data: n.map((l) => ({ x: l.x, y: o })),
        currentValue: {
          value: k(o, Pe),
          unit: P.HASHRATE
        }
      }
    ]
  }, c = yi(r, P.HASHRATE, Pe);
  return c !== void 0 && (a.minMaxAvg = c), a;
}, Jf = (e, t = G.SITE) => {
  const n = vi(e.points, Zn, He), r = n.map((c) => c.y), o = bi(r), i = {
    label: Bf[t],
    borderColor: Xt.secondaryOrange,
    data: n
  };
  o !== void 0 && (i.currentValue = { value: k(o, He), unit: P.POWER });
  const s = {
    yTicksFormatter: (c) => k(c, He),
    priceFormatter: (c) => k(c, He),
    datasets: [i]
  }, a = yi(r, P.POWER, He);
  return a !== void 0 && (s.minMaxAvg = a), s;
}, Yf = 6e4, Gf = (e) => {
  const t = new URLSearchParams({ metric: e.metric, interval: e.interval });
  return "start" in e ? (t.set("start", String(e.start)), t.set("end", String(e.end))) : e.limit !== void 0 && t.set("limit", String(e.limit)), e.containerId !== void 0 && t.set("containerId", e.containerId), e.rackId !== void 0 && t.set("rackId", e.rackId), t;
}, hn = (e) => {
  const { apiUrl: t } = re(), n = `${t(se.HISTORY)}?${Gf(e).toString()}`, r = Oe({
    queryKey: Ce.live("history", n),
    queryFn: () => be(n, af),
    refetchInterval: "start" in e ? !1 : Yf,
    placeholderData: (a) => a
  }), o = r.data, i = Hf(e), s = ge(() => {
    if (o !== void 0)
      return o.metric === "hashrate" ? Vf(o, i) : Jf(o, i);
  }, [o, i]);
  return s !== void 0 ? { status: "ready", chart: s } : r.isError ? { status: "error", message: ce(r.error, n) } : { status: "loading" };
}, Mr = (e, t, n) => {
  const [r, o] = $(fn), i = Ff(t, r);
  return { view: hn(xf(e, i, t, n)), interval: i, onIntervalChange: o };
}, qf = (e) => {
  const [t, n] = $(void 0), [r, o] = $(void 0), [i, s] = $(Rr), a = { containerId: e.container.id, rackId: t }, c = Mr("hashrate", i, a), l = Mr("power", i, a);
  return {
    rackId: t,
    onRackChange: n,
    range: r,
    onRangeChange: (h) => {
      o(h), s(
        h?.from !== void 0 && h.to !== void 0 ? Uf(h.from, h.to, Date.now()) : Rr
      );
    },
    isLive: i.kind === "recent",
    allowedIntervals: _i(i),
    spansDays: jf(i),
    hashrate: c,
    power: l
  };
}, Kt = "all", Xf = ({ layout: e }) => {
  const t = qf(e);
  return /* @__PURE__ */ g("div", { className: "op-centre-lite-charts", children: [
    /* @__PURE__ */ g("div", { className: "op-centre-lite-charts__toolbar", children: [
      /* @__PURE__ */ g(
        Ge,
        {
          value: t.rackId ?? Kt,
          onValueChange: (n) => t.onRackChange(n === Kt ? void 0 : n),
          children: [
            /* @__PURE__ */ u(qe, { "aria-label": "Rack", className: "op-centre-lite-charts__rack", children: /* @__PURE__ */ u(Xe, {}) }),
            /* @__PURE__ */ g(Qe, { children: [
              /* @__PURE__ */ u(Ee, { value: Kt, children: "All racks" }),
              e.racks.map((n) => /* @__PURE__ */ u(Ee, { value: n.id, children: n.name }, n.id))
            ] })
          ]
        }
      ),
      /* @__PURE__ */ u(
        is,
        {
          selected: t.range,
          onSelect: t.onRangeChange,
          placeholder: "Live: latest readings"
        }
      ),
      t.isLive ? null : /* @__PURE__ */ u(Y, { variant: "secondary", size: "sm", onClick: () => t.onRangeChange(void 0), children: "Back to live" })
    ] }),
    /* @__PURE__ */ u(
      It,
      {
        title: "Hash Rate",
        ...t.hashrate,
        allowedIntervals: t.allowedIntervals,
        spansDays: t.spansDays
      }
    ),
    /* @__PURE__ */ u(
      It,
      {
        title: "Power Consumption",
        ...t.power,
        allowedIntervals: t.allowedIntervals,
        spansDays: t.spansDays
      }
    )
  ] });
}, jn = {
  sleep: "Sleep",
  low: "Low",
  normal: "Normal",
  high: "High"
}, Qf = [100, 90, 80, 70, 60, 50], Pt = "Commands are off on this site.", zt = { CONTAINER: "container", MINERS: "miners" }, wi = (e) => e.kind === "mode" ? jn[e.mode] : ke(e.pct), eh = (e, t, n) => {
  const r = wi(n);
  return !e.accepted || e.minerCount === 0 ? {
    variant: "warning",
    title: `${t}: nothing changed`,
    description: `No online miner accepts ${r}.`
  } : {
    variant: "success",
    title: `${t} set to ${r}`,
    description: `Sent to ${ot(e.minerCount, "miner")}.`
  };
}, th = 403, nh = (e, t, n) => ({
  variant: "error",
  title: `Could not change ${n}`,
  description: e instanceof Ae && e.status === th ? Pt : ce(e, t)
}), Ei = ({
  choice: e,
  targetName: t,
  targetKind: n,
  onConfirm: r,
  onCancel: o
}) => /* @__PURE__ */ u(
  ss,
  {
    open: e !== void 0,
    onOpenChange: (i) => {
      i || o();
    },
    children: e === void 0 ? null : /* @__PURE__ */ g(as, { children: [
      /* @__PURE__ */ g(cs, { children: [
        /* @__PURE__ */ g(us, { children: [
          "Set ",
          t,
          " to ",
          wi(e),
          "?"
        ] }),
        /* @__PURE__ */ u(ls, { children: n === zt.CONTAINER ? `This applies right away to every online miner in ${t} that supports it.` : `This applies right away to ${t}.` })
      ] }),
      /* @__PURE__ */ g(ds, { children: [
        /* @__PURE__ */ u(fs, { children: "Cancel" }),
        /* @__PURE__ */ u(hs, { onClick: () => r(e), children: "Apply" })
      ] })
    ] })
  }
), rh = [3e3, 6e3, 9e3], Si = (e, t) => {
  const { apiUrl: n } = re(), r = Ki(), { notifySuccess: o, notifyInfo: i, notifyWarning: s, notifyError: a } = Jr(), [c] = $(() => /* @__PURE__ */ new Set()), l = eo(() => {
    for (const m of c) clearTimeout(m);
    c.clear();
  }, [c]);
  yn(() => l, [l]);
  const d = ({ variant: m, title: v, description: y }) => {
    const E = {
      success: o,
      info: i,
      warning: s,
      error: a
    }[m];
    E(v, y);
  }, h = (m) => n(m.kind === "mode" ? se.POWER_MODE : se.POWER_PCT), p = Bi({
    mutationFn: (m) => m.kind === "mode" ? Ar(
      h(m),
      df.parse({ target: e, mode: m.mode }),
      zr
    ) : Ar(
      h(m),
      ff.parse({ target: e, pct: m.pct }),
      zr
    ),
    onSuccess: (m, v) => d(eh(m, t, v)),
    onError: (m, v) => d(nh(m, h(v), t)),
    onSettled: () => {
      const m = () => {
        r.invalidateQueries({ queryKey: fi });
      };
      m();
      for (const v of rh) {
        const y = setTimeout(() => {
          c.delete(y), m();
        }, v);
        c.add(y);
      }
    }
  });
  return { send: (m) => {
    l(), p.mutate(m);
  }, sending: p.isPending };
}, Zr = "", Dr = " (current)", Ti = ({
  target: e,
  targetName: t,
  supportedPowerModes: n,
  currentMode: r,
  currentPct: o,
  className: i
}) => {
  const s = Ln(), a = Si(e, t), [c, l] = $(void 0), d = s?.commandsEnabled === !1, h = ws(), p = d ? h : void 0, _ = s?.commandsEnabled !== !0 || a.sending, m = (v) => {
    l(void 0), a.send(v);
  };
  return /* @__PURE__ */ g("div", { className: i, title: d ? Pt : void 0, children: [
    /* @__PURE__ */ g(
      Ge,
      {
        value: Zr,
        disabled: _ || n.length === 0,
        onValueChange: (v) => {
          const y = n.find((E) => E === v);
          y !== void 0 && l({ kind: "mode", mode: y });
        },
        children: [
          /* @__PURE__ */ u(
            qe,
            {
              "aria-label": `Set power mode of ${t}`,
              "aria-describedby": p,
              children: /* @__PURE__ */ u(Xe, { placeholder: "Set Power Mode" })
            }
          ),
          /* @__PURE__ */ u(Qe, { children: n.map((v) => /* @__PURE__ */ g(Ee, { value: v, children: [
            jn[v],
            v === r ? Dr : ""
          ] }, v)) })
        ]
      }
    ),
    /* @__PURE__ */ g(
      Ge,
      {
        value: Zr,
        disabled: _,
        onValueChange: (v) => l({ kind: "pct", pct: Number(v) }),
        children: [
          /* @__PURE__ */ u(
            qe,
            {
              "aria-label": `Set power percentage of ${t}`,
              "aria-describedby": p,
              children: /* @__PURE__ */ u(Xe, { placeholder: "Set Power %" })
            }
          ),
          /* @__PURE__ */ u(Qe, { children: Qf.map((v) => /* @__PURE__ */ g(Ee, { value: String(v), children: [
            ke(v),
            v === o ? Dr : ""
          ] }, v)) })
        ]
      }
    ),
    d ? /* @__PURE__ */ u("span", { id: h, className: "op-centre-lite-visually-hidden", children: Pt }) : null,
    /* @__PURE__ */ u(
      Ei,
      {
        choice: c,
        targetName: t,
        targetKind: "containerId" in e ? zt.CONTAINER : zt.MINERS,
        onConfirm: m,
        onCancel: () => l(void 0)
      }
    )
  ] });
}, ki = ["inletTempC", "chipTempC", "hashrateThs", "powerW"], oh = "inletTempC", xn = {
  inletTempC: {
    label: "Inlet temperature",
    format: Ct,
    tile: (e) => k(e, A.TEMPERATURE)
  },
  chipTempC: {
    label: "Chip temperature",
    format: Ct,
    tile: (e) => k(e, A.TEMPERATURE)
  },
  hashrateThs: {
    label: "Hash rate",
    format: Dn,
    tile: (e) => k(e, A.HASHRATE_TH_SOCKET)
  },
  powerW: {
    label: "Consumption",
    format: Fn,
    tile: (e) => k(fe(e), A.POWER_KW_SOCKET)
  }
}, wt = 5, ih = /* @__PURE__ */ new Set(["offline", "sleep", "error"]), Oi = (e) => e !== null && !ih.has(e.status), sh = (e, t) => {
  const n = e.flatMap((r) => r.sockets.map((o) => o.miner)).filter(Oi).map((r) => r[t]);
  if (n.length !== 0)
    return { min: Math.min(...n), max: Math.max(...n) };
}, ah = (e, t) => {
  if (t.max === t.min) return Math.floor(wt / 2);
  const n = (e - t.min) / (t.max - t.min);
  return Math.min(wt - 1, Math.max(0, Math.floor(n * wt)));
}, ch = (e, t, n) => {
  if (!Oi(e) || n === void 0) return;
  const r = e[t];
  return { step: ah(r, n), label: xn[t].tile(r) };
}, uh = ({ metric: e, scale: t }) => {
  const { format: n } = xn[e];
  return /* @__PURE__ */ g("div", { className: "op-centre-lite-heat-legend", "aria-label": "Colour scale", children: [
    /* @__PURE__ */ u(O, { variant: "secondary", size: "sm", children: t === void 0 ? "No readings" : n(t.min) }),
    /* @__PURE__ */ u("span", { className: "op-centre-lite-heat-legend__steps", "aria-hidden": "true", children: Array.from({ length: wt }, (r, o) => /* @__PURE__ */ u("span", { className: "op-centre-lite-heat-legend__step", "data-heat": o }, o)) }),
    /* @__PURE__ */ u(O, { variant: "secondary", size: "sm", children: t === void 0 ? xe : n(t.max) })
  ] });
}, Zt = {
  offline: "Offline",
  error: "Error",
  sleep: "Sleep",
  low: "Low",
  normal: "Normal",
  high: "High"
}, ct = "empty", lh = [...ri, ct], Ci = {
  ...Zt,
  [ct]: "Empty"
}, dh = (e) => e.split("-").at(-1) ?? e, fh = ({ container: e, racks: t }) => {
  const n = /* @__PURE__ */ new Map(), r = t.map((o) => ({
    id: o.id,
    name: o.name,
    sockets: o.sockets.map(({ position: i, miner: s }) => {
      const a = s?.status ?? ct;
      return n.set(a, (n.get(a) ?? 0) + 1), { position: i, slot: dh(i), state: a, miner: s };
    })
  }));
  return {
    container: {
      id: e.id,
      name: e.name,
      model: e.model,
      hashratePhs: me(e.hashrateThs),
      powerKw: fe(e.powerW),
      efficiencyWPerThs: ee(e.powerW, e.hashrateThs)
    },
    racks: r,
    stateCounts: n
  };
}, hh = (e, t) => t === void 0 ? void 0 : e.racks.flatMap((n) => n.sockets).find((n) => n.miner?.id === t)?.miner ?? void 0, ph = (e) => [
  { label: "Serial", value: e.serial },
  { label: "IP", value: e.ip },
  { label: "Position", value: e.position },
  { label: "Status", value: Zt[e.status] },
  { label: "Power mode", value: jn[e.powerMode] },
  { label: "Power %", value: e.powerPct === null ? xe : ke(e.powerPct) },
  { label: "Hash rate", value: Dn(e.hashrateThs) },
  { label: "Consumption", value: Fn(e.powerW) },
  {
    label: "Efficiency",
    value: ae(ee(e.powerW, e.hashrateThs))
  },
  { label: "Inlet temp", value: Ct(e.inletTempC) },
  { label: "Chip temp", value: Ct(e.chipTempC) }
], mh = 404, Ii = (e) => e instanceof Ae && e.status === mh, gh = (e, t, n) => e !== void 0 ? { status: "ready", layout: e } : Ii(t) ? { status: "not-found" } : t != null ? { status: "error", message: ce(t, n) } : { status: "loading" }, Pi = ({ miner: e, onClose: t, actions: n }) => /* @__PURE__ */ g(F, { className: "op-centre-lite-miner-panel", "aria-label": `Miner ${e.serial}`, children: [
  /* @__PURE__ */ g(F.Header, { className: "op-centre-lite-miner-panel__header", children: [
    /* @__PURE__ */ u(O, { size: "md", weight: "semibold", children: e.serial }),
    /* @__PURE__ */ u(Y, { variant: "secondary", size: "sm", onClick: t, children: "Close" })
  ] }),
  /* @__PURE__ */ g(F.Body, { className: "op-centre-lite-miner-panel__body", children: [
    n === void 0 ? null : /* @__PURE__ */ u("div", { className: "op-centre-lite-miner-panel__actions", children: n }),
    /* @__PURE__ */ u("dl", { className: "op-centre-lite-miner-panel__details", children: ph(e).map(({ label: r, value: o }) => /* @__PURE__ */ g("div", { className: "op-centre-lite-miner-panel__row", children: [
      /* @__PURE__ */ u("dt", { children: /* @__PURE__ */ u(O, { variant: "secondary", size: "sm", children: r }) }),
      /* @__PURE__ */ u("dd", { children: /* @__PURE__ */ u(O, { size: "sm", children: o }) })
    ] }, r)) })
  ] })
] }), Bt = [0.75, 1, 1.25, 1.5], At = 1, _h = 52, vh = 5, yh = (e, t) => t.miner === null ? `${e}, socket ${t.slot}: empty` : `${e}, socket ${t.slot}: ${t.miner.serial}, ${Ci[t.state]}`, bh = ({ rackName: e, socket: t, selected: n, onSelect: r, heatOf: o }) => {
  const i = yh(e, t);
  if (t.miner === null)
    return /* @__PURE__ */ u(
      "div",
      {
        className: "op-centre-lite-socket",
        "data-state": ct,
        role: "img",
        "aria-label": i,
        children: /* @__PURE__ */ u("span", { className: "op-centre-lite-socket__slot", children: t.slot })
      }
    );
  const { miner: s } = t, a = o?.(t);
  return /* @__PURE__ */ g(
    "button",
    {
      type: "button",
      className: "op-centre-lite-socket",
      "data-state": t.state,
      "data-heat": o === void 0 ? void 0 : a?.step ?? "none",
      "aria-label": i,
      "aria-pressed": n,
      onClick: () => r(s),
      children: [
        /* @__PURE__ */ u("span", { className: "op-centre-lite-socket__slot", children: t.slot }),
        /* @__PURE__ */ u("span", { className: "op-centre-lite-socket__value", children: o === void 0 ? k(s.hashrateThs, A.HASHRATE_TH_SOCKET) : a?.label ?? xe })
      ]
    }
  );
}, Un = ({
  racks: e,
  zoom: t,
  selectedMinerId: n,
  selectedMinerIds: r,
  onSelect: o,
  heatOf: i
}) => /* @__PURE__ */ u(
  "div",
  {
    className: "op-centre-lite-socket-grid",
    style: { "--op-centre-lite-socket-size": `${_h * t}px` },
    children: e.map((s) => /* @__PURE__ */ g("section", { className: "op-centre-lite-socket-grid__rack", "aria-label": s.name, children: [
      /* @__PURE__ */ u(O, { size: "sm", weight: "semibold", children: s.name }),
      /* @__PURE__ */ u(
        "div",
        {
          className: "op-centre-lite-socket-grid__sockets",
          style: {
            "--op-centre-lite-rack-columns": Math.min(s.sockets.length, vh)
          },
          children: s.sockets.map((a) => /* @__PURE__ */ u(
            bh,
            {
              rackName: s.name,
              socket: a,
              selected: a.miner !== null && (a.miner.id === n || r?.has(a.miner.id) === !0),
              onSelect: o,
              heatOf: i
            },
            a.position
          ))
        }
      )
    ] }, s.id))
  }
), wh = (e) => {
  const [t, n] = $(oh), r = sh(e.racks, t);
  return {
    metric: t,
    onMetricChange: n,
    scale: r,
    heatOf: (o) => ch(o.miner, t, r)
  };
}, zi = (e, t) => {
  const n = URL.createObjectURL(t), r = document.createElement("a");
  r.href = n, r.download = e, r.click(), setTimeout(() => URL.revokeObjectURL(n), 0);
}, Eh = /filename\*=UTF-8''([^;]+)/i, Sh = /filename="?([^";]+)"?/i, Th = (e) => {
  if (e === null) return;
  const t = Eh.exec(e)?.[1];
  if (t !== void 0)
    try {
      return decodeURIComponent(t.trim());
    } catch {
    }
  return Sh.exec(e)?.[1]?.trim();
}, kh = async (e, t) => {
  const n = ys.getState().token, r = new Headers();
  n && r.set("Authorization", `Bearer ${n}`);
  const o = await fetch(e, { headers: r });
  if (!o.ok)
    throw new Ae(o.status, `HTTP ${o.status}: ${o.statusText}`);
  const i = Th(o.headers.get("content-disposition")) ?? t;
  zi(i, await o.blob());
}, Oh = () => {
  const { apiUrl: e } = re(), { notifyError: t } = Jr(), [n, r] = $(void 0);
  return { download: (i) => {
    const s = e(_f(i.id));
    r(i.id), kh(s, `${i.serial}-logs.tgz`).catch((a) => {
      t(
        `Could not download the logs of ${i.serial}`,
        ce(a, s)
      );
    }).finally(() => r((a) => a === i.id ? void 0 : a));
  }, isDownloading: (i) => i === n };
}, Ai = (e) => {
  const [t, n] = $(At), [r, o] = $(void 0);
  return {
    zoom: t,
    onZoomChange: n,
    selected: hh(e, r),
    onSelect: (i) => o(i.id),
    onClear: () => o(void 0)
  };
}, Wn = ({ zoom: e, onZoomChange: t }) => {
  const n = Bt.indexOf(e), r = Bt[n - 1], o = Bt[n + 1];
  return /* @__PURE__ */ g("div", { className: "op-centre-lite-zoom", role: "group", "aria-label": "Zoom", children: [
    /* @__PURE__ */ u(
      Y,
      {
        variant: "secondary",
        size: "sm",
        "aria-label": "Zoom out",
        disabled: r === void 0,
        onClick: () => r !== void 0 && t(r),
        children: "-"
      }
    ),
    /* @__PURE__ */ u(
      Y,
      {
        variant: "secondary",
        size: "sm",
        "aria-label": "Zoom in",
        disabled: o === void 0,
        onClick: () => o !== void 0 && t(o),
        children: "+"
      }
    ),
    /* @__PURE__ */ u(
      Y,
      {
        variant: "secondary",
        size: "sm",
        disabled: e === At,
        onClick: () => t(At),
        children: "Reset"
      }
    )
  ] });
}, Ch = (e) => ki.some((t) => t === e), Ih = ({ layout: e }) => {
  const t = wh(e), n = Ai(e), r = Oh(), { selected: o } = n;
  return /* @__PURE__ */ g("div", { className: "op-centre-lite-layout", children: [
    /* @__PURE__ */ g("div", { className: "op-centre-lite-layout__toolbar", children: [
      /* @__PURE__ */ g("div", { className: "op-centre-lite-heatmap__controls", children: [
        /* @__PURE__ */ g(
          Ge,
          {
            value: t.metric,
            onValueChange: (i) => {
              Ch(i) && t.onMetricChange(i);
            },
            children: [
              /* @__PURE__ */ u(qe, { "aria-label": "Metric", className: "op-centre-lite-heatmap__metric", children: /* @__PURE__ */ u(Xe, {}) }),
              /* @__PURE__ */ u(Qe, { children: ki.map((i) => /* @__PURE__ */ u(Ee, { value: i, children: xn[i].label }, i)) })
            ]
          }
        ),
        /* @__PURE__ */ u(uh, { metric: t.metric, scale: t.scale })
      ] }),
      /* @__PURE__ */ u(Wn, { zoom: n.zoom, onZoomChange: n.onZoomChange })
    ] }),
    /* @__PURE__ */ g("div", { className: "op-centre-lite-layout__body", children: [
      /* @__PURE__ */ u(
        Un,
        {
          racks: e.racks,
          zoom: n.zoom,
          selectedMinerId: o?.id,
          onSelect: n.onSelect,
          heatOf: t.heatOf
        }
      ),
      o === void 0 ? null : /* @__PURE__ */ u(
        Pi,
        {
          miner: o,
          onClose: n.onClear,
          actions: /* @__PURE__ */ g(_n, { children: [
            /* @__PURE__ */ u(
              Ti,
              {
                className: "op-centre-lite-miner-panel__controls",
                target: { minerIds: [o.id] },
                targetName: o.serial,
                supportedPowerModes: o.supportedPowerModes,
                currentMode: o.powerMode,
                currentPct: o.powerPct
              }
            ),
            /* @__PURE__ */ u(
              Y,
              {
                variant: "secondary",
                size: "sm",
                icon: /* @__PURE__ */ u(Yr, {}),
                loading: r.isDownloading(o.id),
                onClick: () => r.download(o),
                children: "Download Logs"
              }
            )
          ] })
        }
      )
    ] })
  ] });
}, Ph = {
  offline: "gray",
  error: "red",
  sleep: "blue",
  low: "yellow",
  normal: "green",
  high: "purple",
  [ct]: "slate"
}, Ni = ({ stateCounts: e }) => /* @__PURE__ */ g("div", { className: "op-centre-lite-socket-legend", children: [
  /* @__PURE__ */ u("ul", { className: "op-centre-lite-socket-legend__states", "aria-label": "Legend", children: lh.map((t) => /* @__PURE__ */ u("li", { children: /* @__PURE__ */ g(ps, { color: Ph[t], size: "sm", children: [
    /* @__PURE__ */ u("span", { children: Ci[t] }),
    /* @__PURE__ */ u("span", { children: e.get(t) ?? 0 })
  ] }) }, t)) }),
  /* @__PURE__ */ u(O, { variant: "secondary", size: "sm", children: "Sockets show the miner's hash rate in TH/s." })
] }), zh = ({ layout: e }) => {
  const t = Ai(e);
  return /* @__PURE__ */ g("div", { className: "op-centre-lite-layout", children: [
    /* @__PURE__ */ g("div", { className: "op-centre-lite-layout__toolbar", children: [
      /* @__PURE__ */ u(Ni, { stateCounts: e.stateCounts }),
      /* @__PURE__ */ u(Wn, { zoom: t.zoom, onZoomChange: t.onZoomChange })
    ] }),
    /* @__PURE__ */ g("div", { className: "op-centre-lite-layout__body", children: [
      /* @__PURE__ */ u(
        Un,
        {
          racks: e.racks,
          zoom: t.zoom,
          selectedMinerId: t.selected?.id,
          onSelect: t.onSelect
        }
      ),
      t.selected === void 0 ? null : /* @__PURE__ */ u(Pi, { miner: t.selected, onClose: t.onClear })
    ] })
  ] });
}, Ah = /* @__PURE__ */ new Set(["offline"]), $i = (e) => !Ah.has(e.status), pn = (e) => e.racks.flatMap((t) => t.sockets).flatMap((t) => t.miner === null ? [] : [t.miner]).filter($i), Nh = (e, t) => pn(e).filter((n) => t.has(n.id)), $h = (e) => {
  const t = e[0]?.powerPct ?? null;
  return t !== null && e.every((n) => n.powerPct === t) ? t : null;
}, mn = 0, Ne = 100, Ri = (e) => Number.isFinite(e) ? Math.min(Ne, Math.max(mn, Math.round(e))) : Ne, Rh = (e) => {
  if (e.trim() === "") return;
  const t = Number(e);
  return Number.isFinite(t) ? Ri(t) : void 0;
}, Mh = (e) => e.length === 1 && e[0] !== void 0 ? e[0].serial : ot(e.length, "miner"), Zh = (e) => {
  const t = Ln(), [n, r] = $(Ne), [o, i] = $(void 0), [s, a] = $(void 0), c = e.miners, l = Mh(c), d = Si({ minerIds: [...e.ids] }, l);
  return {
    pct: n,
    onSlide: (h) => {
      i(void 0), r(Ri(h));
    },
    fieldText: o ?? String(n),
    onFieldChange: (h) => {
      i(h);
      const p = Rh(h);
      p !== void 0 && r(p);
    },
    onFieldBlur: () => i(void 0),
    name: l,
    sharedPct: c.length === 0 ? null : $h(c),
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
}, Dh = "Pick miners on the grid (offline ones cannot be picked).", Fh = ({ selection: e }) => {
  const t = Zh(e), n = e.miners.length;
  return /* @__PURE__ */ g(F, { className: "op-centre-lite-power-panel", children: [
    /* @__PURE__ */ u(F.Header, { children: /* @__PURE__ */ u(O, { size: "md", weight: "semibold", children: "Power adjustment" }) }),
    /* @__PURE__ */ g(F.Body, { className: "op-centre-lite-power-panel__body", children: [
      /* @__PURE__ */ u(O, { size: "sm", children: n === 0 ? Dh : `${t.name} selected` }),
      /* @__PURE__ */ g("div", { className: "op-centre-lite-power-panel__selection", children: [
        /* @__PURE__ */ u(
          Y,
          {
            variant: "secondary",
            size: "sm",
            disabled: n === e.selectableCount,
            onClick: e.onSelectAll,
            children: "Select all"
          }
        ),
        /* @__PURE__ */ u(Y, { variant: "secondary", size: "sm", disabled: n === 0, onClick: e.onClear, children: "Deselect all" })
      ] }),
      /* @__PURE__ */ g(O, { variant: "secondary", size: "sm", children: [
        "Current power:",
        " ",
        t.sharedPct === null ? xe : ke(t.sharedPct)
      ] }),
      /* @__PURE__ */ g("div", { className: "op-centre-lite-power-panel__value", children: [
        /* @__PURE__ */ g(
          ut.Root,
          {
            className: "op-centre-lite-slider",
            min: mn,
            max: Ne,
            step: 1,
            value: [t.pct],
            onValueChange: ([r]) => t.onSlide(r ?? Ne),
            children: [
              /* @__PURE__ */ u(ut.Track, { className: "op-centre-lite-slider__track", children: /* @__PURE__ */ u(ut.Range, { className: "op-centre-lite-slider__range" }) }),
              /* @__PURE__ */ u(ut.Thumb, { className: "op-centre-lite-slider__thumb", "aria-label": "Power percentage" })
            ]
          }
        ),
        /* @__PURE__ */ u(
          Gr,
          {
            type: "number",
            "aria-label": "Power percentage value",
            min: mn,
            max: Ne,
            value: t.fieldText,
            onChange: (r) => t.onFieldChange(r.target.value),
            onBlur: t.onFieldBlur,
            suffix: "%",
            wrapperClassName: "op-centre-lite-power-panel__input"
          }
        )
      ] }),
      /* @__PURE__ */ g(
        Y,
        {
          variant: "primary",
          disabled: !t.canApply,
          loading: t.sending,
          onClick: t.onApply,
          children: [
            "Apply ",
            ke(t.pct)
          ]
        }
      ),
      t.commandsOff ? /* @__PURE__ */ u(O, { variant: "secondary", size: "sm", children: Pt }) : null
    ] }),
    /* @__PURE__ */ u(
      Ei,
      {
        choice: t.pending,
        targetName: t.name,
        targetKind: zt.MINERS,
        onConfirm: t.onConfirm,
        onCancel: t.onCancel
      }
    )
  ] });
}, Lh = (e) => {
  const [t, n] = $(() => /* @__PURE__ */ new Set()), r = Nh(e, t), o = (i) => n((s) => {
    const a = new Set(s);
    return a.has(i.id) ? a.delete(i.id) : a.add(i.id), a;
  });
  return {
    miners: r,
    ids: new Set(r.map((i) => i.id)),
    onToggle: o,
    onSelectAll: () => n(new Set(pn(e).map((i) => i.id))),
    onClear: () => n(/* @__PURE__ */ new Set()),
    selectableCount: pn(e).length
  };
}, jh = ({ layout: e }) => {
  const [t, n] = $(At), r = Lh(e);
  return /* @__PURE__ */ g("div", { className: "op-centre-lite-layout", children: [
    /* @__PURE__ */ g("div", { className: "op-centre-lite-layout__toolbar", children: [
      /* @__PURE__ */ u(Ni, { stateCounts: e.stateCounts }),
      /* @__PURE__ */ u(Wn, { zoom: t, onZoomChange: n })
    ] }),
    /* @__PURE__ */ g("div", { className: "op-centre-lite-layout__body", children: [
      /* @__PURE__ */ u(
        Un,
        {
          racks: e.racks,
          zoom: t,
          selectedMinerId: void 0,
          selectedMinerIds: r.ids,
          onSelect: (o) => {
            $i(o) && r.onToggle(o);
          }
        }
      ),
      /* @__PURE__ */ u(Fh, { selection: r })
    ] })
  ] });
}, xh = 3e4, Uh = 3, Wh = (e) => {
  const { apiUrl: t } = re(), n = t(gf(e)), r = Oe({
    queryKey: Ce.live("layout", n),
    queryFn: () => be(n, lf),
    refetchInterval: xh,
    retry: (i, s) => !Ii(s) && i < Uh
  }), o = ge(
    () => r.data === void 0 ? void 0 : fh(r.data),
    [r.data]
  );
  return gh(o, r.error, n);
}, Mi = [
  { tab: X.LAYOUT, label: "Layout", ready: !0 },
  { tab: X.POWER_ADJUSTMENT, label: "Power Adjustment", ready: !0 },
  { tab: X.CHARTS, label: "Charts", ready: !0 },
  { tab: X.HEATMAP, label: "Heatmap", ready: !0 }
], Hh = (e) => Mi.find((t) => t.ready && no(e) && t.tab === e)?.tab ?? X.LAYOUT, Kh = "default", Bh = ({ container: e }) => [
  e.model,
  at(e.hashratePhs),
  Ue(e.powerKw),
  ae(e.efficiencyWPerThs)
].join(" · "), Vh = () => {
  const { id: e = "", tab: t } = Yi(), n = gn(), r = Gi(), o = Wh(e), i = Hh(t), s = () => {
    r.key === Kh ? n(Vn.explorer, { relative: "route" }) : n(-1);
  }, a = (l) => {
    no(l) && n(Vn.tab(e, l), { relative: "route", replace: !0 });
  }, c = /* @__PURE__ */ u(Y, { variant: "secondary", size: "sm", onClick: s, children: "Back" });
  return o.status !== "ready" ? /* @__PURE__ */ g(Fe, { title: e, actions: c, children: [
    o.status === "loading" ? /* @__PURE__ */ u(it, { type: "circle" }) : null,
    o.status === "not-found" ? /* @__PURE__ */ u(te, { title: "Container not found", error: `This site has no container "${e}".` }) : null,
    o.status === "error" ? /* @__PURE__ */ u(te, { title: "Could not load the container", error: o.message }) : null
  ] }) : /* @__PURE__ */ u(Fe, { title: o.layout.container.name, subtitle: Bh(o.layout), actions: c, children: /* @__PURE__ */ g(qr, { variant: "underline", value: i, onValueChange: a, children: [
    /* @__PURE__ */ u(Xr, { children: Mi.map(({ tab: l, label: d, ready: h }) => /* @__PURE__ */ u(Qt, { value: l, disabled: !h, children: d }, l)) }),
    /* @__PURE__ */ u(ze, { value: X.LAYOUT, children: /* @__PURE__ */ u(zh, { layout: o.layout }) }),
    /* @__PURE__ */ u(ze, { value: X.HEATMAP, children: /* @__PURE__ */ u(Ih, { layout: o.layout }) }),
    /* @__PURE__ */ u(ze, { value: X.POWER_ADJUSTMENT, children: /* @__PURE__ */ u(jh, { layout: o.layout }) }),
    /* @__PURE__ */ u(ze, { value: X.CHARTS, children: /* @__PURE__ */ u(Xf, { layout: o.layout }) })
  ] }) });
}, Jh = () => {
  const [e, t] = $(fn), [n, r] = $(fn), o = hn({ metric: "hashrate", interval: e }), i = hn({ metric: "power", interval: n });
  return /* @__PURE__ */ u(Fe, { title: "Dashboard", children: /* @__PURE__ */ g("div", { className: "op-centre-lite-dashboard", children: [
    /* @__PURE__ */ u(
      It,
      {
        title: "Hash Rate",
        view: o,
        interval: e,
        onIntervalChange: t
      }
    ),
    /* @__PURE__ */ u(
      It,
      {
        title: "Power Consumption",
        view: i,
        interval: n,
        onIntervalChange: r
      }
    )
  ] }) });
}, Yh = (e, t) => {
  const [n, r] = $(e);
  return yn(() => {
    const o = setTimeout(() => r(e), t);
    return () => clearTimeout(o);
  }, [e, t]), n;
}, Fr = (e) => {
  const [t, n] = $({ key: e, page: 1 }), r = t.key === e ? t.page : 1, o = eo((i) => n({ key: e, page: i }), [e]);
  return [r, o];
}, W = { RACKS: "racks", MINERS: "miners" }, Gh = (e) => e === W.RACKS || e === W.MINERS, qh = {
  [W.RACKS]: "Search racks, containers",
  [W.MINERS]: "Search serials, IPs, positions"
}, Xh = {
  tab: W.RACKS,
  searches: { [W.RACKS]: "", [W.MINERS]: "" },
  containerId: void 0
}, Qh = (e, t) => t.type === "tab" ? { ...e, tab: t.tab } : {
  ...e,
  searches: { ...e.searches, [e.tab]: t.filter.search },
  containerId: t.filter.containerId
}, Vt = (e, t) => ({
  search: e.searches[t],
  containerId: e.containerId
}), ep = (e) => e.map(({ id: t, name: n }) => ({ id: t, name: n })), tp = (e) => e.flatMap(
  (t) => t.racks.map((n) => ({
    id: n.id,
    name: n.name,
    containerId: t.id,
    containerName: t.name,
    efficiencyWPerThs: ee(n.powerW, n.hashrateThs),
    hashratePhs: me(n.hashrateThs),
    powerKw: fe(n.powerW)
  }))
), np = (e, { search: t, containerId: n }) => {
  const r = t.trim().toLowerCase();
  return e.filter(
    (o) => (n === void 0 || o.containerId === n) && (r === "" || o.name.toLowerCase().includes(r) || o.containerName.toLowerCase().includes(r))
  );
}, Zi = (e, t) => ({
  id: e.id,
  serial: e.serial,
  ip: e.ip,
  containerId: e.containerId,
  containerName: t.get(e.containerId) ?? e.containerId,
  position: e.position,
  status: e.status,
  efficiencyWPerThs: ee(e.powerW, e.hashrateThs),
  hashrateThs: e.hashrateThs,
  powerW: e.powerW
}), rp = (e, t, n) => e.slice((t - 1) * n, t * n), Di = ({
  page: e,
  pageSize: t,
  total: n,
  onPageChange: r
}) => {
  const o = n === 0 ? 0 : (e - 1) * t + 1, i = Math.min(e * t, n);
  return /* @__PURE__ */ g("div", { className: "op-centre-lite-explorer__footer", children: [
    /* @__PURE__ */ g(O, { variant: "secondary", size: "sm", children: [
      "Showing ",
      k(o, 0),
      "-",
      k(i, 0),
      " of ",
      k(n, 0)
    ] }),
    /* @__PURE__ */ u(
      ms,
      {
        current: e,
        pageSize: t,
        total: n,
        showSizeChanger: !1,
        onChange: (s) => r(s)
      }
    )
  ] });
}, Lr = "all", op = "", ip = ({
  filter: e,
  containers: t,
  searchPlaceholder: n,
  onFilterChange: r,
  onExport: o,
  exporting: i
}) => /* @__PURE__ */ g("div", { className: "op-centre-lite-explorer__toolbar", children: [
  /* @__PURE__ */ u(
    Gr,
    {
      variant: "search",
      "aria-label": "Search",
      placeholder: n,
      value: e.search,
      onChange: (s) => r({ ...e, search: s.target.value }),
      wrapperClassName: "op-centre-lite-explorer__search"
    }
  ),
  /* @__PURE__ */ g(
    Ge,
    {
      value: e.containerId ?? op,
      onValueChange: (s) => r({ ...e, containerId: s === Lr ? void 0 : s }),
      children: [
        /* @__PURE__ */ u(qe, { "aria-label": "Container", className: "op-centre-lite-explorer__container", children: /* @__PURE__ */ u(Xe, { placeholder: "Container" }) }),
        /* @__PURE__ */ g(Qe, { children: [
          /* @__PURE__ */ u(Ee, { value: Lr, children: "All containers" }),
          t.map((s) => /* @__PURE__ */ u(Ee, { value: s.id, children: s.name }, s.id))
        ] })
      ]
    }
  ),
  /* @__PURE__ */ u(Y, { variant: "secondary", icon: /* @__PURE__ */ u(Yr, {}), loading: i, onClick: o, children: "Export CSV" })
] }), $e = (e, t) => e === void 0 ? void 0 : Number(e.toFixed(t)), sp = /[",\r\n]/, ap = /^[=+\-@\t\r]/, jr = (e) => {
  if (e === void 0) return "";
  const t = typeof e == "string" && ap.test(e) ? `'${e}` : String(e);
  return sp.test(t) ? `"${t.replaceAll('"', '""')}"` : t;
}, xr = (e, t) => [
  e.map((n) => jr(n.header)),
  ...t.map((n) => e.map((r) => jr(r.value(n))))
].map((n) => n.join(",")).join(`\r
`), Ur = (e, t) => zi(e, new Blob([t], { type: "text/csv;charset=utf-8" })), U = 1, cp = () => /* @__PURE__ */ u(
  "svg",
  {
    className: "op-centre-lite-explorer__chevron",
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": "true",
    children: /* @__PURE__ */ u("path", { d: "M6 3.5L10.5 8L6 12.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
  }
), Fi = ({
  columns: e,
  rows: t,
  loading: n = !1,
  onRowClick: r
}) => {
  const o = ge(
    () => [...e, { id: "open", header: "", size: U, cell: () => /* @__PURE__ */ u(cp, {}) }],
    [e]
  );
  return /* @__PURE__ */ u(
    vn,
    {
      data: t,
      columns: o,
      getRowId: (i) => i.id,
      enablePagination: !1,
      loading: n,
      onRowClick: r,
      tableClassName: "op-centre-lite-explorer__table"
    }
  );
}, up = [
  { accessorKey: "serial", header: "Serial", size: U },
  { accessorKey: "ip", header: "IP", size: U },
  { accessorKey: "containerName", header: "Container", size: U },
  { accessorKey: "position", header: "Position", size: U },
  {
    accessorKey: "status",
    header: "Status",
    size: U,
    cell: ({ row: e }) => Zt[e.original.status]
  },
  {
    accessorKey: "efficiencyWPerThs",
    header: "Efficiency",
    size: U,
    cell: ({ row: e }) => ae(e.original.efficiencyWPerThs)
  },
  {
    accessorKey: "hashrateThs",
    header: "Hash rate",
    size: U,
    cell: ({ row: e }) => Dn(e.original.hashrateThs)
  },
  {
    accessorKey: "powerW",
    header: "Consumption",
    size: U,
    cell: ({ row: e }) => Fn(e.original.powerW)
  }
], lp = [
  { header: "Serial", value: (e) => e.serial },
  { header: "IP", value: (e) => e.ip },
  { header: "Container", value: (e) => e.containerName },
  { header: "Position", value: (e) => e.position },
  { header: "Status", value: (e) => Zt[e.status] },
  {
    header: `Efficiency (${P.EFFICIENCY_CARD})`,
    value: (e) => $e(e.efficiencyWPerThs, A.EFFICIENCY)
  },
  {
    header: `Hash rate (${P.HASHRATE_TH})`,
    value: (e) => $e(e.hashrateThs, A.HASHRATE_TH)
  },
  {
    header: `Consumption (${P.POWER_W})`,
    value: (e) => $e(e.powerW, A.POWER_W)
  }
], dp = ({ rows: e, loading: t, onRowClick: n }) => /* @__PURE__ */ u(Fi, { columns: up, rows: e, loading: t, onRowClick: n }), Wr = 4, Li = (e, t, n) => {
  const r = e.search.trim();
  return {
    page: t,
    pageSize: n,
    ...r === "" ? {} : { search: r },
    ...e.containerId === void 0 ? {} : { containerId: e.containerId }
  };
}, fp = (e) => {
  const t = new URLSearchParams();
  return e.page !== void 0 && t.set("page", String(e.page)), e.pageSize !== void 0 && t.set("pageSize", String(e.pageSize)), e.search !== void 0 && t.set("search", e.search), e.containerId !== void 0 && t.set("containerId", e.containerId), t;
}, ji = (e, t) => `${e}?${fp(t).toString()}`, xi = (e, t, n) => be(
  ji(e, Li(t, n, Mn)),
  ui
), Ui = async (e, t, n) => {
  if (n.length === 0) return [];
  const r = await Promise.all(
    n.slice(0, Wr).map((i) => xi(e, t, i))
  ), o = await Ui(e, t, n.slice(Wr));
  return [...r.flatMap((i) => i.items), ...o];
}, hp = async (e, t) => {
  const n = await xi(e, t, 1), r = Math.ceil(n.total / Mn), o = Array.from({ length: Math.max(r - 1, 0) }, (i, s) => s + 2);
  return [...n.items, ...await Ui(e, t, o)];
}, pp = 3e4, mp = (e, t, n) => {
  const { apiUrl: r } = re(), o = ji(r(se.MINERS), Li(e, t, n)), i = Oe({
    queryKey: Ce.live("miners", o),
    queryFn: () => be(o, ui),
    refetchInterval: pp,
    placeholderData: (s) => s
  });
  return i.data !== void 0 ? {
    status: "ready",
    miners: i.data.items,
    total: i.data.total,
    stale: i.isPlaceholderData
  } : i.isError ? { status: "error", message: ce(i.error, o) } : { status: "loading" };
}, gp = ({
  filter: e,
  containerNames: t,
  page: n,
  pageSize: r,
  onPageChange: o,
  onRowClick: i
}) => {
  const s = mp(e, n, r), a = s.status === "ready" ? s.miners : void 0, c = ge(
    () => (a ?? []).map((l) => Zi(l, t)),
    [a, t]
  );
  return s.status === "loading" ? /* @__PURE__ */ u(it, { type: "circle" }) : s.status === "error" ? /* @__PURE__ */ u(te, { title: "Could not load the miners", error: s.message }) : /* @__PURE__ */ g(_n, { children: [
    /* @__PURE__ */ u(dp, { rows: c, loading: s.stale, onRowClick: i }),
    /* @__PURE__ */ u(
      Di,
      {
        page: n,
        pageSize: r,
        total: s.total,
        onPageChange: o
      }
    )
  ] });
}, _p = [
  { accessorKey: "name", header: "Rack", size: U },
  { accessorKey: "containerName", header: "Container", size: U },
  {
    accessorKey: "efficiencyWPerThs",
    header: "Efficiency",
    size: U,
    cell: ({ row: e }) => ae(e.original.efficiencyWPerThs)
  },
  {
    accessorKey: "hashratePhs",
    header: "Hash rate",
    size: U,
    cell: ({ row: e }) => at(e.original.hashratePhs)
  },
  {
    accessorKey: "powerKw",
    header: "Consumption",
    size: U,
    cell: ({ row: e }) => Ue(e.original.powerKw)
  }
], vp = [
  { header: "Rack", value: (e) => e.name },
  { header: "Container", value: (e) => e.containerName },
  {
    header: `Efficiency (${P.EFFICIENCY_CARD})`,
    value: (e) => $e(e.efficiencyWPerThs, A.EFFICIENCY)
  },
  {
    header: `Hash rate (${P.HASHRATE})`,
    value: (e) => $e(e.hashratePhs, A.HASHRATE)
  },
  {
    header: `Consumption (${P.POWER_KW})`,
    value: (e) => $e(e.powerKw, A.POWER_KW)
  }
], yp = ({ rows: e, onRowClick: t }) => /* @__PURE__ */ u(Fi, { columns: _p, rows: e, onRowClick: t }), bp = 3e4, Hn = () => {
  const { apiUrl: e } = re(), t = e(se.CONTAINERS);
  return { query: Oe({
    queryKey: Ce.live("containers", t),
    queryFn: () => be(t, sf),
    refetchInterval: bp
  }), url: t };
}, wp = () => {
  const { query: e, url: t } = Hn(), n = ge(() => {
    if (e.data === void 0) return;
    const { containers: r } = e.data;
    return {
      racks: tp(r),
      containers: ep(r),
      containerNames: new Map(r.map((o) => [o.id, o.name]))
    };
  }, [e.data]);
  return n !== void 0 ? { status: "ready", ...n } : e.isError ? { status: "error", message: ce(e.error, t) } : { status: "loading" };
}, Ep = ({
  tab: e,
  racks: t,
  minersFilter: n,
  containerNames: r
}) => {
  const { apiUrl: o } = re(), [i, s] = $(!1), [a, c] = $(void 0), l = async () => {
    s(!0);
    try {
      const p = (await hp(o(se.MINERS), n)).map((_) => Zi(_, r));
      Ur("miners.csv", xr(lp, p));
    } catch {
      c("Could not export the miners. Try again.");
    } finally {
      s(!1);
    }
  };
  return { exportCsv: () => {
    if (c(void 0), e === W.RACKS) {
      Ur("racks.csv", xr(vp, t));
      return;
    }
    l();
  }, exporting: i, error: a };
}, Jt = 10, Sp = 300, Hr = ({ search: e, containerId: t }) => JSON.stringify([e, t ?? null]), Tp = ({ racks: e, containers: t, containerNames: n }) => {
  const r = gn(), [o, i] = Es(Qh, Xh), { tab: s } = o, a = Vt(o, s), c = Vt(o, W.RACKS), d = { search: Yh(Vt(o, W.MINERS).search, Sp), containerId: o.containerId }, [h, p] = Fr(Hr(c)), [_, m] = Fr(Hr(d)), v = np(e, c), y = Ep({ tab: s, racks: v, minersFilter: d, containerNames: n }), E = (V) => {
    Gh(V) && i({ type: "tab", tab: V });
  }, B = (V) => {
    i({ type: "filter", filter: V });
  }, ue = ({ containerId: V }) => {
    r(to(V), { relative: "path" });
  };
  return /* @__PURE__ */ g(qr, { variant: "underline", value: s, onValueChange: E, children: [
    /* @__PURE__ */ g(Xr, { children: [
      /* @__PURE__ */ u(Qt, { value: W.RACKS, children: "Racks" }),
      /* @__PURE__ */ u(Qt, { value: W.MINERS, children: "Miners" })
    ] }),
    /* @__PURE__ */ g("div", { className: "op-centre-lite-explorer", children: [
      /* @__PURE__ */ u(
        ip,
        {
          filter: a,
          containers: t,
          searchPlaceholder: qh[s],
          onFilterChange: B,
          onExport: y.exportCsv,
          exporting: y.exporting
        }
      ),
      y.error === void 0 ? null : /* @__PURE__ */ u(te, { title: "Export failed", error: y.error }),
      /* @__PURE__ */ g(ze, { value: W.RACKS, children: [
        /* @__PURE__ */ u(yp, { rows: rp(v, h, Jt), onRowClick: ue }),
        /* @__PURE__ */ u(
          Di,
          {
            page: h,
            pageSize: Jt,
            total: v.length,
            onPageChange: p
          }
        )
      ] }),
      /* @__PURE__ */ u(ze, { value: W.MINERS, children: /* @__PURE__ */ u(
        gp,
        {
          filter: d,
          containerNames: n,
          page: _,
          pageSize: Jt,
          onPageChange: m,
          onRowClick: ue
        }
      ) })
    ] })
  ] });
}, kp = () => {
  const e = wp();
  return /* @__PURE__ */ g(Fe, { title: "Explorer", children: [
    e.status === "loading" ? /* @__PURE__ */ u(it, { type: "circle" }) : null,
    e.status === "error" ? /* @__PURE__ */ u(te, { title: "Could not load the containers", error: e.message }) : null,
    e.status === "ready" ? /* @__PURE__ */ u(
      Tp,
      {
        racks: e.racks,
        containers: e.containers,
        containerNames: e.containerNames
      }
    ) : null
  ] });
}, Yt = 1, Op = ({ slice: e }) => /* @__PURE__ */ u(
  "span",
  {
    className: "op-centre-lite-breakdown__swatch",
    "data-series": e.colorIndex ?? "rest",
    "aria-hidden": "true"
  }
), Cp = [
  {
    accessorKey: "name",
    header: "Meter",
    size: Yt,
    cell: ({ row: e }) => /* @__PURE__ */ g("span", { className: "op-centre-lite-breakdown__name", children: [
      /* @__PURE__ */ u(Op, { slice: e.original }),
      e.original.name
    ] })
  },
  {
    accessorKey: "powerKw",
    header: "Consumption",
    size: Yt,
    cell: ({ row: e }) => Ue(e.original.powerKw)
  },
  {
    accessorKey: "sharePct",
    header: "% of total",
    size: Yt,
    cell: ({ row: e }) => ke(e.original.sharePct)
  }
], Ip = ({ slices: e }) => /* @__PURE__ */ g(F, { className: "op-centre-lite-breakdown", children: [
  /* @__PURE__ */ u(F.Header, { children: /* @__PURE__ */ u(O, { size: "md", weight: "semibold", children: "Consumption breakdown" }) }),
  /* @__PURE__ */ g(F.Body, { className: "op-centre-lite-breakdown__body", children: [
    /* @__PURE__ */ u(
      "div",
      {
        className: "op-centre-lite-breakdown__bar",
        role: "img",
        "aria-label": "Share of consumption per meter",
        children: e.map((t) => /* @__PURE__ */ u(
          "span",
          {
            className: "op-centre-lite-breakdown__segment",
            "data-series": t.colorIndex ?? "rest",
            style: { flexGrow: t.sharePct },
            title: `${t.name}: ${ke(t.sharePct)}`
          },
          t.id
        ))
      }
    ),
    /* @__PURE__ */ u(
      vn,
      {
        data: e,
        columns: Cp,
        getRowId: (t) => t.id,
        enablePagination: !1,
        tableClassName: "op-centre-lite-breakdown__table"
      }
    )
  ] })
] }), Gt = ({ label: e, value: t, hint: n }) => /* @__PURE__ */ u(F, { className: "op-centre-lite-kpi", children: /* @__PURE__ */ g(F.Body, { className: "op-centre-lite-kpi__body", children: [
  /* @__PURE__ */ u(O, { variant: "secondary", size: "sm", children: e }),
  /* @__PURE__ */ u(O, { size: "lg", weight: "semibold", color: "primary", children: t }),
  /* @__PURE__ */ u(O, { variant: "secondary", size: "sm", children: n })
] }) }), qt = ({ label: e, value: t }) => /* @__PURE__ */ g("div", { className: "op-centre-lite-meter-card__metric", children: [
  /* @__PURE__ */ u(O, { variant: "secondary", size: "sm", children: e }),
  /* @__PURE__ */ u(O, { size: "sm", weight: "semibold", children: t })
] }), Pp = ({ meter: e }) => /* @__PURE__ */ g(F, { className: "op-centre-lite-meter-card", children: [
  /* @__PURE__ */ g(F.Header, { className: "op-centre-lite-meter-card__header", children: [
    /* @__PURE__ */ g("div", { children: [
      /* @__PURE__ */ u(O, { size: "md", weight: "semibold", children: e.name }),
      /* @__PURE__ */ u(O, { variant: "secondary", size: "sm", children: e.containerName })
    ] }),
    /* @__PURE__ */ u(O, { color: "primary", weight: "semibold", children: ae(e.efficiencyWPerThs, P.EFFICIENCY) })
  ] }),
  /* @__PURE__ */ g(F.Body, { className: "op-centre-lite-meter-card__metrics", children: [
    /* @__PURE__ */ u(qt, { label: "Power", value: Ue(e.powerKw) }),
    /* @__PURE__ */ u(qt, { label: "Hash rate", value: at(e.hashratePhs) }),
    /* @__PURE__ */ u(qt, { label: "Miners", value: ot(e.miners, "miner") })
  ] })
] }), zp = 6, Ap = "unmetered", Kr = (e, t) => t > 0 ? e / t * 100 : 0, Np = (e, t) => {
  const n = e.siteMeterPowerW, r = e.meters.reduce((a, c) => a + c.powerW, 0), o = n - r, i = Math.max(n, r), s = e.meters.map((a, c) => ({
    id: a.id,
    name: a.name,
    powerKw: fe(a.powerW),
    sharePct: Kr(a.powerW, i),
    colorIndex: c % zp
  }));
  return o > 0 && s.push({
    id: Ap,
    name: "Not metered",
    powerKw: fe(o),
    sharePct: Kr(o, i),
    colorIndex: void 0
  }), {
    siteEfficiencyWPerThs: ee(e.siteMeterPowerW, e.hashrateThs),
    miningEfficiencyWPerThs: ee(e.minersPowerW, e.hashrateThs),
    totalPowerMw: Zn(n),
    meters: e.meters.map((a) => ({
      id: a.id,
      name: a.name,
      containerName: t.get(a.containerId) ?? a.containerId,
      efficiencyWPerThs: ee(a.powerW, a.hashrateThs),
      powerKw: fe(a.powerW),
      hashratePhs: me(a.hashrateThs),
      miners: a.miners
    })),
    breakdown: s
  };
}, $p = 3e4, Rp = () => {
  const { apiUrl: e } = re(), t = e(se.POWER_METERS), n = Oe({
    queryKey: Ce.live("power-meters", t),
    queryFn: () => be(t, uf),
    refetchInterval: $p
  }), r = Hn().query.data, o = ge(() => {
    if (n.data === void 0) return;
    const i = new Map(r?.containers.map(({ id: s, name: a }) => [s, a]));
    return Np(n.data, i);
  }, [n.data, r]);
  return o !== void 0 ? { status: "ready", view: o } : n.isError ? { status: "error", message: ce(n.error, t) } : { status: "loading" };
}, Mp = ({ view: e }) => /* @__PURE__ */ g("div", { className: "op-centre-lite-site-efficiency", children: [
  /* @__PURE__ */ g("div", { className: "op-centre-lite-site-efficiency__kpis", children: [
    /* @__PURE__ */ u(
      Gt,
      {
        label: "Site efficiency",
        value: ae(e.siteEfficiencyWPerThs, P.EFFICIENCY),
        hint: "Everything the site meter measures, per TH/s"
      }
    ),
    /* @__PURE__ */ u(
      Gt,
      {
        label: "Mining efficiency",
        value: ae(e.miningEfficiencyWPerThs, P.EFFICIENCY),
        hint: "The miners' own power, per TH/s"
      }
    ),
    /* @__PURE__ */ u(
      Gt,
      {
        label: "Total consumption",
        value: kf(e.totalPowerMw),
        hint: "The site meter"
      }
    )
  ] }),
  e.meters.length === 0 ? /* @__PURE__ */ u(
    gs,
    {
      description: "No power meters reported. A container's meter comes from the layout config.",
      image: "simple"
    }
  ) : /* @__PURE__ */ g(_n, { children: [
    /* @__PURE__ */ u("div", { className: "op-centre-lite-site-efficiency__meters", children: e.meters.map((t) => /* @__PURE__ */ u(Pp, { meter: t }, t.id)) }),
    /* @__PURE__ */ u(Ip, { slices: e.breakdown })
  ] })
] }), Zp = () => {
  const e = Rp();
  return /* @__PURE__ */ g(Fe, { title: "Site Efficiency", children: [
    e.status === "loading" ? /* @__PURE__ */ u(it, { type: "circle" }) : null,
    e.status === "error" ? /* @__PURE__ */ u(te, { title: "Could not load the power meters", error: e.message }) : null,
    e.status === "ready" ? /* @__PURE__ */ u(Mp, { view: e.view }) : null
  ] });
}, vt = 1, Dp = [
  { accessorKey: "name", header: "Rack", size: vt },
  {
    accessorKey: "efficiencyWPerThs",
    header: "Efficiency",
    size: vt,
    cell: ({ row: e }) => ae(e.original.efficiencyWPerThs)
  },
  {
    accessorKey: "powerKw",
    header: "Consumption",
    size: vt,
    cell: ({ row: e }) => Ue(e.original.powerKw)
  },
  {
    accessorKey: "hashratePhs",
    header: "Hash rate",
    size: vt,
    cell: ({ row: e }) => at(e.original.hashratePhs)
  }
], Fp = ({ racks: e }) => /* @__PURE__ */ u(
  vn,
  {
    data: e,
    columns: Dp,
    getRowId: (t) => t.id,
    enablePagination: !1,
    tableClassName: "op-centre-lite-rack-table"
  }
), Br = ({ label: e, value: t }) => /* @__PURE__ */ g("div", { className: "op-centre-lite-container-card__metric", children: [
  /* @__PURE__ */ u(O, { variant: "secondary", size: "sm", children: e }),
  /* @__PURE__ */ u(O, { size: "sm", weight: "semibold", children: t })
] }), Lp = (e) => e.target instanceof Element && e.currentTarget.contains(e.target) && e.target.closest("a, button, [role='combobox']") === null, jp = ({ card: e }) => {
  const t = gn(), n = to(e.id);
  return (
    // The title link is the keyboard and screen reader path to the detail page;
    // the card click is a larger mouse target for the same link.
    /* @__PURE__ */ g(F, { className: "op-centre-lite-container-card", onClick: (o) => {
      Lp(o) && t(n, { relative: "path" });
    }, children: [
      /* @__PURE__ */ g(F.Header, { className: "op-centre-lite-container-card__header", children: [
        /* @__PURE__ */ g("div", { children: [
          /* @__PURE__ */ u(qi, { className: "op-centre-lite-container-card__title", to: n, relative: "path", children: /* @__PURE__ */ u(O, { size: "md", weight: "semibold", children: e.name }) }),
          /* @__PURE__ */ u(O, { variant: "secondary", size: "sm", children: e.model })
        ] }),
        /* @__PURE__ */ u(O, { color: "primary", weight: "semibold", children: Ue(e.powerKw) })
      ] }),
      /* @__PURE__ */ g(F.Body, { className: "op-centre-lite-container-card__body", children: [
        /* @__PURE__ */ u(
          Ti,
          {
            className: "op-centre-lite-container-card__controls",
            target: { containerId: e.id },
            targetName: e.name,
            supportedPowerModes: e.power.supportedModes,
            currentMode: e.power.mode,
            currentPct: e.power.pct
          }
        ),
        /* @__PURE__ */ g("div", { className: "op-centre-lite-container-card__metrics", children: [
          /* @__PURE__ */ u(Br, { label: "Efficiency", value: ae(e.efficiencyWPerThs) }),
          /* @__PURE__ */ u(Br, { label: "Hash rate", value: at(e.hashratePhs) })
        ] }),
        /* @__PURE__ */ u(Fp, { racks: e.racks }),
        /* @__PURE__ */ u(_s, { data: e.statusCounts, variant: "tiles" })
      ] })
    ] })
  );
}, xp = (e) => ({
  id: e.id,
  name: e.name,
  efficiencyWPerThs: ee(e.powerW, e.hashrateThs),
  powerKw: fe(e.powerW),
  hashratePhs: me(e.hashrateThs)
}), Up = ({
  empty: e,
  ...t
}) => ({
  ...t,
  disconnected: e
}), Wp = (e) => ({
  id: e.id,
  name: e.name,
  model: e.model,
  powerKw: fe(e.powerW),
  efficiencyWPerThs: ee(e.powerW, e.hashrateThs),
  hashratePhs: me(e.hashrateThs),
  racks: e.racks.map(xp),
  statusCounts: Up(e.minerStatus),
  power: {
    supportedModes: e.supportedPowerModes,
    mode: e.powerMode,
    pct: e.powerPct
  }
}), Hp = ({ empty: e, ...t }) => Object.values(t).reduce((n, r) => n + r, 0), Kp = () => {
  const { query: e, url: t } = Hn(), n = ge(() => {
    if (e.data === void 0) return;
    const { containers: r } = e.data;
    return {
      cards: r.map(Wp),
      minerCount: r.reduce((o, i) => o + Hp(i.minerStatus), 0)
    };
  }, [e.data]);
  return n !== void 0 ? { status: "ready", ...n } : e.isError ? { status: "error", message: ce(e.error, t) } : { status: "loading" };
}, Bp = (e) => {
  if (e.status === "ready")
    return `${ot(e.cards.length, "container")} · ${ot(e.minerCount, "miner")}`;
}, Vp = () => {
  const e = Kp();
  return /* @__PURE__ */ g(Fe, { title: "Site Overview", subtitle: Bp(e), children: [
    e.status === "loading" ? /* @__PURE__ */ u(it, { type: "circle" }) : null,
    e.status === "error" ? /* @__PURE__ */ u(te, { title: "Could not load the containers", error: e.message }) : null,
    e.status === "ready" ? /* @__PURE__ */ u("div", { className: "op-centre-lite-site-overview", children: e.cards.map((t) => /* @__PURE__ */ u(jp, { card: t }, t.id)) }) : null
  ] });
}, Jp = () => {
  const e = hi();
  if (e.status === "loading") return /* @__PURE__ */ u(vs, {});
  if (e.status === "error")
    return /* @__PURE__ */ u(te, { title: "Could not load the site summary", error: e.message });
  const { miners: t, hashratePhs: n, consumptionMw: r, efficiencyWPerThs: o } = e.stats, i = o === void 0 ? xe : k(o, A.EFFICIENCY);
  return /* @__PURE__ */ g("div", { className: "op-centre-lite-home-panel", children: [
    /* @__PURE__ */ u(lt, { name: "Miners online", value: `${t.online} / ${t.total}` }),
    /* @__PURE__ */ u(
      lt,
      {
        name: "Hashrate",
        value: k(n, A.HASHRATE),
        unit: P.HASHRATE
      }
    ),
    /* @__PURE__ */ u(
      lt,
      {
        name: "Consumption",
        value: k(r, A.POWER),
        unit: P.POWER
      }
    ),
    /* @__PURE__ */ u(lt, { name: "Efficiency", value: i, unit: P.EFFICIENCY })
  ] });
}, tm = Vi({
  // Must equal `id` in mdk-app.yaml: the dashboard refuses a mismatch.
  id: "io.tether.opcentrelite",
  displayName: "Operation Center Lite",
  routes: [
    { path: de.DASHBOARD, label: "Dashboard", component: Jh },
    { path: de.SITE_OVERVIEW, label: "Site Overview", component: Vp },
    { path: de.SITE_EFFICIENCY, label: "Site Efficiency", component: Zp },
    { path: de.EXPLORER, label: "Explorer", component: kp },
    { path: de.CONTAINER_DETAIL, hidden: !0, component: Vh }
  ],
  panels: [
    {
      id: "site-summary",
      slot: Ji.HOME,
      title: "Operation Center Lite",
      component: Jp
    }
  ]
});
export {
  tm as default
};
