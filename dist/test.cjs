'use strict';

var isomorphic_js = require('isomorphic.js');

/**
 * Utility module to work with key-value stores.
 *
 * @module map
 */

/**
 * Creates a new Map instance.
 *
 * @function
 * @return {Map<any, any>}
 *
 * @function
 */
const create$a = () => new Map();

/**
 * Copy a Map object into a fresh Map object.
 *
 * @function
 * @template X,Y
 * @param {Map<X,Y>} m
 * @return {Map<X,Y>}
 */
const copy = m => {
  const r = create$a();
  m.forEach((v, k) => { r.set(k, v); });
  return r
};

/**
 * Get map property. Create T if property is undefined and set T on map.
 *
 * ```js
 * const listeners = map.setIfUndefined(events, 'eventName', set.create)
 * listeners.add(listener)
 * ```
 *
 * @function
 * @template T,K
 * @param {Map<K, T>} map
 * @param {K} key
 * @param {function():T} createT
 * @return {T}
 */
const setIfUndefined$1 = (map, key, createT) => {
  let set = map.get(key);
  if (set === undefined) {
    map.set(key, set = createT());
  }
  return set
};

/**
 * Creates an Array and populates it with the content of all key-value pairs using the `f(value, key)` function.
 *
 * @function
 * @template K
 * @template V
 * @template R
 * @param {Map<K,V>} m
 * @param {function(V,K):R} f
 * @return {Array<R>}
 */
const map$4 = (m, f) => {
  const res = [];
  for (const [key, value] of m) {
    res.push(f(value, key));
  }
  return res
};

/**
 * Utility module to work with strings.
 *
 * @module string
 */

const fromCharCode = String.fromCharCode;
const fromCodePoint = String.fromCodePoint;

/**
 * @param {string} s
 * @return {string}
 */
const toLowerCase = s => s.toLowerCase();

const trimLeftRegex = /^\s*/g;

/**
 * @param {string} s
 * @return {string}
 */
const trimLeft = s => s.replace(trimLeftRegex, '');

const fromCamelCaseRegex = /([A-Z])/g;

/**
 * @param {string} s
 * @param {string} separator
 * @return {string}
 */
const fromCamelCase = (s, separator) => trimLeft(s.replace(fromCamelCaseRegex, match => `${separator}${toLowerCase(match)}`));

/**
 * Compute the utf8ByteLength
 * @param {string} str
 * @return {number}
 */
const utf8ByteLength = str => unescape(encodeURIComponent(str)).length;

/**
 * @param {string} str
 * @return {Uint8Array}
 */
const _encodeUtf8Polyfill = str => {
  const encodedString = unescape(encodeURIComponent(str));
  const len = encodedString.length;
  const buf = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buf[i] = /** @type {number} */ (encodedString.codePointAt(i));
  }
  return buf
};

/* istanbul ignore next */
const utf8TextEncoder = /** @type {TextEncoder} */ (typeof TextEncoder !== 'undefined' ? new TextEncoder() : null);

/**
 * @param {string} str
 * @return {Uint8Array}
 */
const _encodeUtf8Native = str => utf8TextEncoder.encode(str);

/**
 * @param {string} str
 * @return {Uint8Array}
 */
/* istanbul ignore next */
const encodeUtf8 = utf8TextEncoder ? _encodeUtf8Native : _encodeUtf8Polyfill;

/**
 * @param {Uint8Array} buf
 * @return {string}
 */
const _decodeUtf8Polyfill = buf => {
  let remainingLen = buf.length;
  let encodedString = '';
  let bufPos = 0;
  while (remainingLen > 0) {
    const nextLen = remainingLen < 10000 ? remainingLen : 10000;
    const bytes = buf.subarray(bufPos, bufPos + nextLen);
    bufPos += nextLen;
    // Starting with ES5.1 we can supply a generic array-like object as arguments
    encodedString += String.fromCodePoint.apply(null, /** @type {any} */ (bytes));
    remainingLen -= nextLen;
  }
  return decodeURIComponent(escape(encodedString))
};

/* istanbul ignore next */
let utf8TextDecoder = typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });

/* istanbul ignore next */
if (utf8TextDecoder && utf8TextDecoder.decode(new Uint8Array()).length === 1) {
  // Safari doesn't handle BOM correctly.
  // This fixes a bug in Safari 13.0.5 where it produces a BOM the first time it is called.
  // utf8TextDecoder.decode(new Uint8Array()).length === 1 on the first call and
  // utf8TextDecoder.decode(new Uint8Array()).length === 1 on the second call
  // Another issue is that from then on no BOM chars are recognized anymore
  /* istanbul ignore next */
  utf8TextDecoder = null;
}

/**
 * @param {Uint8Array} buf
 * @return {string}
 */
const _decodeUtf8Native = buf => /** @type {TextDecoder} */ (utf8TextDecoder).decode(buf);

/**
 * @param {string} str The initial string
 * @param {number} index Starting position
 * @param {number} remove Number of characters to remove
 * @param {string} insert New content to insert
 */
const splice = (str, index, remove, insert = '') => str.slice(0, index) + insert + str.slice(index + remove);

/**
 * Often used conditions.
 *
 * @module conditions
 */

/**
 * @template T
 * @param {T|null|undefined} v
 * @return {T|null}
 */
/* istanbul ignore next */
const undefinedToNull = v => v === undefined ? null : v;

/* global localStorage, addEventListener */

/**
 * Isomorphic variable storage.
 *
 * Uses LocalStorage in the browser and falls back to in-memory storage.
 *
 * @module storage
 */

/* istanbul ignore next */
class VarStoragePolyfill {
  constructor () {
    this.map = new Map();
  }

  /**
   * @param {string} key
   * @param {any} newValue
   */
  setItem (key, newValue) {
    this.map.set(key, newValue);
  }

  /**
   * @param {string} key
   */
  getItem (key) {
    return this.map.get(key)
  }
}

/* istanbul ignore next */
/**
 * @type {any}
 */
let _localStorage = new VarStoragePolyfill();
let usePolyfill = true;

try {
  // if the same-origin rule is violated, accessing localStorage might thrown an error
  /* istanbul ignore next */
  if (typeof localStorage !== 'undefined') {
    _localStorage = localStorage;
    usePolyfill = false;
  }
} catch (e) { }

/* istanbul ignore next */
/**
 * This is basically localStorage in browser, or a polyfill in nodejs
 */
const varStorage = _localStorage;

/* istanbul ignore next */
/**
 * A polyfill for `addEventListener('storage', event => {..})` that does nothing if the polyfill is being used.
 *
 * @param {function({ key: string, newValue: string, oldValue: string }): void} eventHandler
 * @function
 */
const onChange = eventHandler => usePolyfill || addEventListener('storage', /** @type {any} */ (eventHandler));

/**
 * Utility module to work with Arrays.
 *
 * @module array
 */

/**
 * Return the last element of an array. The element must exist
 *
 * @template L
 * @param {Array<L>} arr
 * @return {L}
 */
const last = arr => arr[arr.length - 1];

/**
 * Append elements from src to dest
 *
 * @template M
 * @param {Array<M>} dest
 * @param {Array<M>} src
 */
const appendTo = (dest, src) => {
  for (let i = 0; i < src.length; i++) {
    dest.push(src[i]);
  }
};

/**
 * True iff condition holds on every element in the Array.
 *
 * @function
 * @template ITEM
 *
 * @param {Array<ITEM>} arr
 * @param {function(ITEM, number, Array<ITEM>):boolean} f
 * @return {boolean}
 */
const every$1 = (arr, f) => arr.every(f);

/**
 * @template ELEM
 *
 * @param {Array<ELEM>} a
 * @param {Array<ELEM>} b
 * @return {boolean}
 */
const equalFlat$1 = (a, b) => a.length === b.length && every$1(a, (item, index) => item === b[index]);

/**
 * @template ELEM
 * @param {Array<Array<ELEM>>} arr
 * @return {Array<ELEM>}
 */
const flatten = arr => arr.reduce((acc, val) => acc.concat(val), []);

const isArray = Array.isArray;

/**
 * Utility functions for working with EcmaScript objects.
 *
 * @module object
 */

/**
 * @return {Object<string,any>} obj
 */
const create$9 = () => Object.create(null);

/**
 * Object.assign
 */
const assign = Object.assign;

/**
 * @param {Object<string,any>} obj
 */
const keys = Object.keys;

/**
 * @param {Object<string,any>} obj
 * @param {function(any,string):any} f
 */
const forEach$1 = (obj, f) => {
  for (const key in obj) {
    f(obj[key], key);
  }
};

/**
 * @template R
 * @param {Object<string,any>} obj
 * @param {function(any,string):R} f
 * @return {Array<R>}
 */
const map$3 = (obj, f) => {
  const results = [];
  for (const key in obj) {
    results.push(f(obj[key], key));
  }
  return results
};

/**
 * @param {Object<string,any>} obj
 * @return {number}
 */
const length$1 = obj => keys(obj).length;

/**
 * @param {Object<string,any>} obj
 * @param {function(any,string):boolean} f
 * @return {boolean}
 */
const some = (obj, f) => {
  for (const key in obj) {
    if (f(obj[key], key)) {
      return true
    }
  }
  return false
};

/**
 * @param {Object<string,any>} obj
 * @param {function(any,string):boolean} f
 * @return {boolean}
 */
const every = (obj, f) => {
  for (const key in obj) {
    if (!f(obj[key], key)) {
      return false
    }
  }
  return true
};

/**
 * Calls `Object.prototype.hasOwnProperty`.
 *
 * @param {any} obj
 * @param {string|symbol} key
 * @return {boolean}
 */
const hasProperty = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

/**
 * @param {Object<string,any>} a
 * @param {Object<string,any>} b
 * @return {boolean}
 */
const equalFlat = (a, b) => a === b || (length$1(a) === length$1(b) && every(a, (val, key) => (val !== undefined || hasProperty(b, key)) && b[key] === val));

/**
 * Common functions and function call helpers.
 *
 * @module function
 */

/**
 * @template A
 *
 * @param {A} a
 * @return {A}
 */
const id = a => a;

/**
 * @template T
 *
 * @param {T} a
 * @param {T} b
 * @return {boolean}
 */
const equalityStrict = (a, b) => a === b;

/**
 * @template T
 *
 * @param {Array<T>|object} a
 * @param {Array<T>|object} b
 * @return {boolean}
 */
const equalityFlat = (a, b) => a === b || (a != null && b != null && a.constructor === b.constructor && ((a instanceof Array && equalFlat$1(a, /** @type {Array<T>} */ (b))) || (typeof a === 'object' && equalFlat(a, b))));

/**
 * @param {any} a
 * @param {any} b
 * @return {boolean}
 */
const equalityDeep = (a, b) => {
  if (a == null || b == null) {
    return equalityStrict(a, b)
  }
  if (a.constructor !== b.constructor) {
    return false
  }
  if (a === b) {
    return true
  }
  switch (a.constructor) {
    case ArrayBuffer:
      a = new Uint8Array(a);
      b = new Uint8Array(b);
    // eslint-disable-next-line no-fallthrough
    case Uint8Array: {
      if (a.byteLength !== b.byteLength) {
        return false
      }
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          return false
        }
      }
      break
    }
    case Set: {
      if (a.size !== b.size) {
        return false
      }
      for (const value of a) {
        if (!b.has(value)) {
          return false
        }
      }
      break
    }
    case Map: {
      if (a.size !== b.size) {
        return false
      }
      for (const key of a.keys()) {
        if (!b.has(key) || !equalityDeep(a.get(key), b.get(key))) {
          return false
        }
      }
      break
    }
    case Object:
      if (length$1(a) !== length$1(b)) {
        return false
      }
      for (const key in a) {
        if (!hasProperty(a, key) || !equalityDeep(a[key], b[key])) {
          return false
        }
      }
      break
    case Array:
      if (a.length !== b.length) {
        return false
      }
      for (let i = 0; i < a.length; i++) {
        if (!equalityDeep(a[i], b[i])) {
          return false
        }
      }
      break
    default:
      return false
  }
  return true
};

/**
 * @template V
 * @template {V} OPTS
 *
 * @param {V} value
 * @param {Array<OPTS>} options
 */
// @ts-ignore
const isOneOf = (value, options) => options.includes(value);

/**
 * Isomorphic module to work access the environment (query params, env variables).
 *
 * @module map
 */

/* istanbul ignore next */
// @ts-ignore
const isNode = typeof process !== 'undefined' && process.release &&
  /node|io\.js/.test(process.release.name);
/* istanbul ignore next */
const isBrowser = typeof window !== 'undefined' && !isNode;
/* istanbul ignore next */
typeof navigator !== 'undefined'
  ? /Mac/.test(navigator.platform)
  : false;

/**
 * @type {Map<string,string>}
 */
let params;

/* istanbul ignore next */
const computeParams = () => {
  if (params === undefined) {
    if (isNode) {
      params = create$a();
      const pargs = process.argv;
      let currParamName = null;
      /* istanbul ignore next */
      for (let i = 0; i < pargs.length; i++) {
        const parg = pargs[i];
        if (parg[0] === '-') {
          if (currParamName !== null) {
            params.set(currParamName, '');
          }
          currParamName = parg;
        } else {
          if (currParamName !== null) {
            params.set(currParamName, parg);
            currParamName = null;
          }
        }
      }
      if (currParamName !== null) {
        params.set(currParamName, '');
      }
      // in ReactNative for example this would not be true (unless connected to the Remote Debugger)
    } else if (typeof location === 'object') {
      params = create$a(); // eslint-disable-next-line no-undef
      (location.search || '?').slice(1).split('&').forEach((kv) => {
        if (kv.length !== 0) {
          const [key, value] = kv.split('=');
          params.set(`--${fromCamelCase(key, '-')}`, value);
          params.set(`-${fromCamelCase(key, '-')}`, value);
        }
      });
    } else {
      params = create$a();
    }
  }
  return params
};

/**
 * @param {string} name
 * @return {boolean}
 */
/* istanbul ignore next */
const hasParam = (name) => computeParams().has(name);

/**
 * @param {string} name
 * @param {string} defaultVal
 * @return {string}
 */
/* istanbul ignore next */
const getParam = (name, defaultVal) =>
  computeParams().get(name) || defaultVal;
// export const getArgs = name => computeParams() && args

/**
 * @param {string} name
 * @return {string|null}
 */
/* istanbul ignore next */
const getVariable = (name) =>
  isNode
    ? undefinedToNull(process.env[name.toUpperCase()])
    : undefinedToNull(varStorage.getItem(name));

/**
 * @param {string} name
 * @return {boolean}
 */
/* istanbul ignore next */
const hasConf = (name) =>
  hasParam('--' + name) || getVariable(name) !== null;

/* istanbul ignore next */
const production = hasConf('production');

/* istanbul ignore next */
const forceColor = isNode &&
  isOneOf(process.env.FORCE_COLOR, ['true', '1', '2']);

/* istanbul ignore next */
const supportsColor = !hasParam('no-colors') &&
  (!isNode || process.stdout.isTTY || forceColor) && (
  !isNode || hasParam('color') || forceColor ||
    getVariable('COLORTERM') !== null ||
    (getVariable('TERM') || '').includes('color')
);

/**
 * Utility module to work with EcmaScript Symbols.
 *
 * @module symbol
 */

/**
 * Return fresh symbol.
 *
 * @return {Symbol}
 */
const create$8 = Symbol;

/**
 * Working with value pairs.
 *
 * @module pair
 */

/**
 * @template L,R
 */
class Pair {
  /**
   * @param {L} left
   * @param {R} right
   */
  constructor (left, right) {
    this.left = left;
    this.right = right;
  }
}

/**
 * @template L,R
 * @param {L} left
 * @param {R} right
 * @return {Pair<L,R>}
 */
const create$7 = (left, right) => new Pair(left, right);

/**
 * @template L,R
 * @param {R} right
 * @param {L} left
 * @return {Pair<L,R>}
 */
const createReversed = (right, left) => new Pair(left, right);

/**
 * @template L,R
 * @param {Array<Pair<L,R>>} arr
 * @param {function(L, R):any} f
 */
const forEach = (arr, f) => arr.forEach(p => f(p.left, p.right));

/**
 * @template L,R,X
 * @param {Array<Pair<L,R>>} arr
 * @param {function(L, R):X} f
 * @return {Array<X>}
 */
const map$2 = (arr, f) => arr.map(p => f(p.left, p.right));

/* eslint-env browser */

/* istanbul ignore next */
/**
 * @type {Document}
 */
const doc = /** @type {Document} */ (typeof document !== 'undefined' ? document : {});

/**
 * @param {string} name
 * @return {HTMLElement}
 */
/* istanbul ignore next */
const createElement = name => doc.createElement(name);

/**
 * @return {DocumentFragment}
 */
/* istanbul ignore next */
const createDocumentFragment = () => doc.createDocumentFragment();

/**
 * @param {string} text
 * @return {Text}
 */
/* istanbul ignore next */
const createTextNode = text => doc.createTextNode(text);

/* istanbul ignore next */
/** @type {DOMParser} */ (typeof DOMParser !== 'undefined' ? new DOMParser() : null);

/**
 * @param {Element} el
 * @param {Array<pair.Pair<string,string|boolean>>} attrs Array of key-value pairs
 * @return {Element}
 */
/* istanbul ignore next */
const setAttributes = (el, attrs) => {
  forEach(attrs, (key, value) => {
    if (value === false) {
      el.removeAttribute(key);
    } else if (value === true) {
      el.setAttribute(key, '');
    } else {
      // @ts-ignore
      el.setAttribute(key, value);
    }
  });
  return el
};

/**
 * @param {Array<Node>|HTMLCollection} children
 * @return {DocumentFragment}
 */
/* istanbul ignore next */
const fragment = children => {
  const fragment = createDocumentFragment();
  for (let i = 0; i < children.length; i++) {
    appendChild(fragment, children[i]);
  }
  return fragment
};

/**
 * @param {Element} parent
 * @param {Array<Node>} nodes
 * @return {Element}
 */
/* istanbul ignore next */
const append = (parent, nodes) => {
  appendChild(parent, fragment(nodes));
  return parent
};

/**
 * @param {EventTarget} el
 * @param {string} name
 * @param {EventListener} f
 */
/* istanbul ignore next */
const addEventListener$1 = (el, name, f) => el.addEventListener(name, f);

/**
 * @param {string} name
 * @param {Array<pair.Pair<string,string>|pair.Pair<string,boolean>>} attrs Array of key-value pairs
 * @param {Array<Node>} children
 * @return {Element}
 */
/* istanbul ignore next */
const element = (name, attrs = [], children = []) =>
  append(setAttributes(createElement(name), attrs), children);

/**
 * @param {number} width
 * @param {number} height
 */
/* istanbul ignore next */
const canvas = (width, height) => {
  const c = /** @type {HTMLCanvasElement} */ (createElement('canvas'));
  c.height = height;
  c.width = width;
  return c
};

/**
 * @param {string} t
 * @return {Text}
 */
/* istanbul ignore next */
const text = createTextNode;

/**
 * @param {Map<string,string>} m
 * @return {string}
 */
/* istanbul ignore next */
const mapToStyleString = m => map$4(m, (value, key) => `${key}:${value};`).join('');

/**
 * @param {Node} parent
 * @param {Node} child
 * @return {Node}
 */
/* istanbul ignore next */
const appendChild = (parent, child) => parent.appendChild(child);

doc.ELEMENT_NODE;
doc.TEXT_NODE;
doc.CDATA_SECTION_NODE;
doc.COMMENT_NODE;
doc.DOCUMENT_NODE;
doc.DOCUMENT_TYPE_NODE;
doc.DOCUMENT_FRAGMENT_NODE;

/**
 * JSON utility functions.
 *
 * @module json
 */

/**
 * Transform JavaScript object to JSON.
 *
 * @param {any} object
 * @return {string}
 */
const stringify = JSON.stringify;

/* global requestIdleCallback, requestAnimationFrame, cancelIdleCallback, cancelAnimationFrame */

/**
 * Utility module to work with EcmaScript's event loop.
 *
 * @module eventloop
 */

/**
 * @type {Array<function>}
 */
let queue$1 = [];

const _runQueue = () => {
  for (let i = 0; i < queue$1.length; i++) {
    queue$1[i]();
  }
  queue$1 = [];
};

/**
 * @param {function():void} f
 */
const enqueue$1 = f => {
  queue$1.push(f);
  if (queue$1.length === 1) {
    setTimeout(_runQueue, 0);
  }
};

/**
 * @typedef {Object} TimeoutObject
 * @property {function} TimeoutObject.destroy
 */

/**
 * @param {function(number):void} clearFunction
 */
const createTimeoutClass = clearFunction => class TT {
  /**
   * @param {number} timeoutId
   */
  constructor (timeoutId) {
    this._ = timeoutId;
  }

  destroy () {
    clearFunction(this._);
  }
};

const Timeout = createTimeoutClass(clearTimeout);

/**
 * @param {number} timeout
 * @param {function} callback
 * @return {TimeoutObject}
 */
const timeout = (timeout, callback) => new Timeout(setTimeout(callback, timeout));

const Interval = createTimeoutClass(clearInterval);

/**
 * @param {number} timeout
 * @param {function} callback
 * @return {TimeoutObject}
 */
const interval = (timeout, callback) => new Interval(setInterval(callback, timeout));

/* istanbul ignore next */
const Animation = createTimeoutClass(arg => typeof requestAnimationFrame !== 'undefined' && cancelAnimationFrame(arg));

/* istanbul ignore next */
/**
 * @param {function(number):void} cb
 * @return {TimeoutObject}
 */
const animationFrame = cb => typeof requestAnimationFrame === 'undefined' ? timeout(0, cb) : new Animation(requestAnimationFrame(cb));

/* istanbul ignore next */
// @ts-ignore
const Idle = createTimeoutClass(arg => typeof cancelIdleCallback !== 'undefined' && cancelIdleCallback(arg));

/* istanbul ignore next */
/**
 * Note: this is experimental and is probably only useful in browsers.
 *
 * @param {function} cb
 * @return {TimeoutObject}
 */
// @ts-ignore
const idleCallback = cb => typeof requestIdleCallback !== 'undefined' ? new Idle(requestIdleCallback(cb)) : timeout(1000, cb);

/**
 * Common Math expressions.
 *
 * @module math
 */

const floor = Math.floor;
const ceil = Math.ceil;
const abs = Math.abs;
const imul = Math.imul;
const round = Math.round;
const log10 = Math.log10;

/**
 * @function
 * @param {number} a
 * @param {number} b
 * @return {number} The sum of a and b
 */
const add$1 = (a, b) => a + b;

/**
 * @function
 * @param {number} a
 * @param {number} b
 * @return {number} The smaller element of a and b
 */
const min = (a, b) => a < b ? a : b;

/**
 * @function
 * @param {number} a
 * @param {number} b
 * @return {number} The bigger element of a and b
 */
const max = (a, b) => a > b ? a : b;

const isNaN$1 = Number.isNaN;
/**
 * Base 10 exponential function. Returns the value of 10 raised to the power of pow.
 *
 * @param {number} exp
 * @return {number}
 */
const exp10 = exp => Math.pow(10, exp);

/**
 * @param {number} n
 * @return {boolean} Wether n is negative. This function also differentiates between -0 and +0
 */
const isNegativeZero = n => n !== 0 ? n < 0 : 1 / n < 0;

/**
 * Utility module to convert metric values.
 *
 * @module metric
 */

const prefixUp = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
const prefixDown = ['', 'm', 'μ', 'n', 'p', 'f', 'a', 'z', 'y'];

/**
 * Calculate the metric prefix for a number. Assumes E.g. `prefix(1000) = { n: 1, prefix: 'k' }`
 *
 * @param {number} n
 * @param {number} [baseMultiplier] Multiplier of the base (10^(3*baseMultiplier)). E.g. `convert(time, -3)` if time is already in milli seconds
 * @return {{n:number,prefix:string}}
 */
const prefix = (n, baseMultiplier = 0) => {
  const nPow = n === 0 ? 0 : log10(n);
  let mult = 0;
  while (nPow < mult * 3 && baseMultiplier > -8) {
    baseMultiplier--;
    mult--;
  }
  while (nPow >= 3 + mult * 3 && baseMultiplier < 8) {
    baseMultiplier++;
    mult++;
  }
  const prefix = baseMultiplier < 0 ? prefixDown[-baseMultiplier] : prefixUp[baseMultiplier];
  return {
    n: round((mult > 0 ? n / exp10(mult * 3) : n * exp10(mult * -3)) * 1e12) / 1e12,
    prefix
  }
};

/**
 * Utility module to work with time.
 *
 * @module time
 */

/**
 * Return current time.
 *
 * @return {Date}
 */
const getDate = () => new Date();

/**
 * Return current unix time.
 *
 * @return {number}
 */
const getUnixTime = Date.now;

/**
 * Transform time (in ms) to a human readable format. E.g. 1100 => 1.1s. 60s => 1min. .001 => 10μs.
 *
 * @param {number} d duration in milliseconds
 * @return {string} humanized approximation of time
 */
const humanizeDuration = d => {
  if (d < 60000) {
    const p = prefix(d, -1);
    return round(p.n * 100) / 100 + p.prefix + 's'
  }
  d = floor(d / 1000);
  const seconds = d % 60;
  const minutes = floor(d / 60) % 60;
  const hours = floor(d / 3600) % 24;
  const days = floor(d / 86400);
  if (days > 0) {
    return days + 'd' + ((hours > 0 || minutes > 30) ? ' ' + (minutes > 30 ? hours + 1 : hours) + 'h' : '')
  }
  if (hours > 0) {
    /* istanbul ignore next */
    return hours + 'h' + ((minutes > 0 || seconds > 30) ? ' ' + (seconds > 30 ? minutes + 1 : minutes) + 'min' : '')
  }
  return minutes + 'min' + (seconds > 0 ? ' ' + seconds + 's' : '')
};

/**
 * Isomorphic logging module with support for colors!
 *
 * @module logging
 */

const BOLD = create$8();
const UNBOLD = create$8();
const BLUE = create$8();
const GREY = create$8();
const GREEN = create$8();
const RED = create$8();
const PURPLE = create$8();
const ORANGE = create$8();
const UNCOLOR = create$8();

/**
 * @type {Object<Symbol,pair.Pair<string,string>>}
 */
const _browserStyleMap = {
  [BOLD]: create$7('font-weight', 'bold'),
  [UNBOLD]: create$7('font-weight', 'normal'),
  [BLUE]: create$7('color', 'blue'),
  [GREEN]: create$7('color', 'green'),
  [GREY]: create$7('color', 'grey'),
  [RED]: create$7('color', 'red'),
  [PURPLE]: create$7('color', 'purple'),
  [ORANGE]: create$7('color', 'orange'), // not well supported in chrome when debugging node with inspector - TODO: deprecate
  [UNCOLOR]: create$7('color', 'black')
};

const _nodeStyleMap = {
  [BOLD]: '\u001b[1m',
  [UNBOLD]: '\u001b[2m',
  [BLUE]: '\x1b[34m',
  [GREEN]: '\x1b[32m',
  [GREY]: '\u001b[37m',
  [RED]: '\x1b[31m',
  [PURPLE]: '\x1b[35m',
  [ORANGE]: '\x1b[38;5;208m',
  [UNCOLOR]: '\x1b[0m'
};

/* istanbul ignore next */
/**
 * @param {Array<string|Symbol|Object|number>} args
 * @return {Array<string|object|number>}
 */
const computeBrowserLoggingArgs = (args) => {
  const strBuilder = [];
  const styles = [];
  const currentStyle = create$a();
  /**
   * @type {Array<string|Object|number>}
   */
  let logArgs = [];
  // try with formatting until we find something unsupported
  let i = 0;

  for (; i < args.length; i++) {
    const arg = args[i];
    // @ts-ignore
    const style = _browserStyleMap[arg];
    if (style !== undefined) {
      currentStyle.set(style.left, style.right);
    } else {
      if (arg.constructor === String || arg.constructor === Number) {
        const style = mapToStyleString(currentStyle);
        if (i > 0 || style.length > 0) {
          strBuilder.push('%c' + arg);
          styles.push(style);
        } else {
          strBuilder.push(arg);
        }
      } else {
        break
      }
    }
  }

  if (i > 0) {
    // create logArgs with what we have so far
    logArgs = styles;
    logArgs.unshift(strBuilder.join(''));
  }
  // append the rest
  for (; i < args.length; i++) {
    const arg = args[i];
    if (!(arg instanceof Symbol)) {
      logArgs.push(arg);
    }
  }
  return logArgs
};

/* istanbul ignore next */
/**
 * @param {Array<string|Symbol|Object|number>} args
 * @return {Array<string|object|number>}
 */
const computeNoColorLoggingArgs = args => {
  const strBuilder = [];
  const logArgs = [];

  // try with formatting until we find something unsupported
  let i = 0;

  for (; i < args.length; i++) {
    const arg = args[i];
    // @ts-ignore
    const style = _nodeStyleMap[arg];
    if (style === undefined) {
      if (arg.constructor === String || arg.constructor === Number) {
        strBuilder.push(arg);
      } else {
        break
      }
    }
  }
  if (i > 0) {
    logArgs.push(strBuilder.join(''));
  }
  // append the rest
  for (; i < args.length; i++) {
    const arg = args[i];
    /* istanbul ignore else */
    if (!(arg instanceof Symbol)) {
      if (arg.constructor === Object) {
        logArgs.push(JSON.stringify(arg));
      } else {
        logArgs.push(arg);
      }
    }
  }
  return logArgs
};

/* istanbul ignore next */
/**
 * @param {Array<string|Symbol|Object|number>} args
 * @return {Array<string|object|number>}
 */
const computeNodeLoggingArgs = (args) => {
  const strBuilder = [];
  const logArgs = [];

  // try with formatting until we find something unsupported
  let i = 0;

  for (; i < args.length; i++) {
    const arg = args[i];
    // @ts-ignore
    const style = _nodeStyleMap[arg];
    if (style !== undefined) {
      strBuilder.push(style);
    } else {
      if (arg.constructor === String || arg.constructor === Number) {
        strBuilder.push(arg);
      } else {
        break
      }
    }
  }
  if (i > 0) {
    // create logArgs with what we have so far
    strBuilder.push('\x1b[0m');
    logArgs.push(strBuilder.join(''));
  }
  // append the rest
  for (; i < args.length; i++) {
    const arg = args[i];
    /* istanbul ignore else */
    if (!(arg instanceof Symbol)) {
      logArgs.push(arg);
    }
  }
  return logArgs
};

/* istanbul ignore next */
const computeLoggingArgs = supportsColor
  ? (isNode ? computeNodeLoggingArgs : computeBrowserLoggingArgs)
  : computeNoColorLoggingArgs;

/**
 * @param {Array<string|Symbol|Object|number>} args
 */
const print = (...args) => {
  console.log(...computeLoggingArgs(args));
  /* istanbul ignore next */
  vconsoles.forEach((vc) => vc.print(args));
};

/* istanbul ignore next */
/**
 * @param {Error} err
 */
const printError = (err) => {
  console.error(err);
  vconsoles.forEach((vc) => vc.printError(err));
};

/* istanbul ignore next */
/**
 * @param {string} url image location
 * @param {number} height height of the image in pixel
 */
const printImg = (url, height) => {
  if (isBrowser) {
    console.log(
      '%c                      ',
      `font-size: ${height}px; background-size: contain; background-repeat: no-repeat; background-image: url(${url})`
    );
    // console.log('%c                ', `font-size: ${height}x; background: url(${url}) no-repeat;`)
  }
  vconsoles.forEach((vc) => vc.printImg(url, height));
};

/* istanbul ignore next */
/**
 * @param {string} base64
 * @param {number} height
 */
const printImgBase64 = (base64, height) =>
  printImg(`data:image/gif;base64,${base64}`, height);

/**
 * @param {Array<string|Symbol|Object|number>} args
 */
const group$1 = (...args) => {
  console.group(...computeLoggingArgs(args));
  /* istanbul ignore next */
  vconsoles.forEach((vc) => vc.group(args));
};

/**
 * @param {Array<string|Symbol|Object|number>} args
 */
const groupCollapsed = (...args) => {
  console.groupCollapsed(...computeLoggingArgs(args));
  /* istanbul ignore next */
  vconsoles.forEach((vc) => vc.groupCollapsed(args));
};

const groupEnd = () => {
  console.groupEnd();
  /* istanbul ignore next */
  vconsoles.forEach((vc) => vc.groupEnd());
};

/* istanbul ignore next */
/**
 * @param {HTMLCanvasElement} canvas
 * @param {number} height
 */
const printCanvas$1 = (canvas, height) =>
  printImg(canvas.toDataURL(), height);

const vconsoles = new Set();

/* istanbul ignore next */
/**
 * @param {Array<string|Symbol|Object|number>} args
 * @return {Array<Element>}
 */
const _computeLineSpans = (args) => {
  const spans = [];
  const currentStyle = new Map();
  // try with formatting until we find something unsupported
  let i = 0;
  for (; i < args.length; i++) {
    const arg = args[i];
    // @ts-ignore
    const style = _browserStyleMap[arg];
    if (style !== undefined) {
      currentStyle.set(style.left, style.right);
    } else {
      if (arg.constructor === String || arg.constructor === Number) {
        // @ts-ignore
        const span = element('span', [
          create$7('style', mapToStyleString(currentStyle))
        ], [text(arg.toString())]);
        if (span.innerHTML === '') {
          span.innerHTML = '&nbsp;';
        }
        spans.push(span);
      } else {
        break
      }
    }
  }
  // append the rest
  for (; i < args.length; i++) {
    let content = args[i];
    if (!(content instanceof Symbol)) {
      if (content.constructor !== String && content.constructor !== Number) {
        content = ' ' + stringify(content) + ' ';
      }
      spans.push(
        element('span', [], [text(/** @type {string} */ (content))])
      );
    }
  }
  return spans
};

const lineStyle =
  'font-family:monospace;border-bottom:1px solid #e2e2e2;padding:2px;';

/* istanbul ignore next */
class VConsole {
  /**
   * @param {Element} dom
   */
  constructor (dom) {
    this.dom = dom;
    /**
     * @type {Element}
     */
    this.ccontainer = this.dom;
    this.depth = 0;
    vconsoles.add(this);
  }

  /**
   * @param {Array<string|Symbol|Object|number>} args
   * @param {boolean} collapsed
   */
  group (args, collapsed = false) {
    enqueue$1(() => {
      const triangleDown = element('span', [
        create$7('hidden', collapsed),
        create$7('style', 'color:grey;font-size:120%;')
      ], [text('▼')]);
      const triangleRight = element('span', [
        create$7('hidden', !collapsed),
        create$7('style', 'color:grey;font-size:125%;')
      ], [text('▶')]);
      const content = element(
        'div',
        [create$7(
          'style',
          `${lineStyle};padding-left:${this.depth * 10}px`
        )],
        [triangleDown, triangleRight, text(' ')].concat(
          _computeLineSpans(args)
        )
      );
      const nextContainer = element('div', [
        create$7('hidden', collapsed)
      ]);
      const nextLine = element('div', [], [content, nextContainer]);
      append(this.ccontainer, [nextLine]);
      this.ccontainer = nextContainer;
      this.depth++;
      // when header is clicked, collapse/uncollapse container
      addEventListener$1(content, 'click', (_event) => {
        nextContainer.toggleAttribute('hidden');
        triangleDown.toggleAttribute('hidden');
        triangleRight.toggleAttribute('hidden');
      });
    });
  }

  /**
   * @param {Array<string|Symbol|Object|number>} args
   */
  groupCollapsed (args) {
    this.group(args, true);
  }

  groupEnd () {
    enqueue$1(() => {
      if (this.depth > 0) {
        this.depth--;
        // @ts-ignore
        this.ccontainer = this.ccontainer.parentElement.parentElement;
      }
    });
  }

  /**
   * @param {Array<string|Symbol|Object|number>} args
   */
  print (args) {
    enqueue$1(() => {
      append(this.ccontainer, [
        element('div', [
          create$7(
            'style',
            `${lineStyle};padding-left:${this.depth * 10}px`
          )
        ], _computeLineSpans(args))
      ]);
    });
  }

  /**
   * @param {Error} err
   */
  printError (err) {
    this.print([RED, BOLD, err.toString()]);
  }

  /**
   * @param {string} url
   * @param {number} height
   */
  printImg (url, height) {
    enqueue$1(() => {
      append(this.ccontainer, [
        element('img', [
          create$7('src', url),
          create$7('height', `${round(height * 1.5)}px`)
        ])
      ]);
    });
  }

  /**
   * @param {Node} node
   */
  printDom (node) {
    enqueue$1(() => {
      append(this.ccontainer, [node]);
    });
  }

  destroy () {
    enqueue$1(() => {
      vconsoles.delete(this);
    });
  }
}

/* istanbul ignore next */
/**
 * @param {Element} dom
 */
const createVConsole = (dom) => new VConsole(dom);

/**
 * Efficient diffs.
 *
 * @module diff
 */

/**
 * A SimpleDiff describes a change on a String.
 *
 * ```js
 * console.log(a) // the old value
 * console.log(b) // the updated value
 * // Apply changes of diff (pseudocode)
 * a.remove(diff.index, diff.remove) // Remove `diff.remove` characters
 * a.insert(diff.index, diff.insert) // Insert `diff.insert`
 * a === b // values match
 * ```
 *
 * @typedef {Object} SimpleDiff
 * @property {Number} index The index where changes were applied
 * @property {Number} remove The number of characters to delete starting
 *                                  at `index`.
 * @property {T} insert The new text to insert at `index` after applying
 *                           `delete`
 *
 * @template T
 */

/**
 * Create a diff between two strings. This diff implementation is highly
 * efficient, but not very sophisticated.
 *
 * @function
 *
 * @param {string} a The old version of the string
 * @param {string} b The updated version of the string
 * @return {SimpleDiff<string>} The diff description.
 */
const simpleDiffString = (a, b) => {
  let left = 0; // number of same characters counting from left
  let right = 0; // number of same characters counting from right
  while (left < a.length && left < b.length && a[left] === b[left]) {
    left++;
  }
  while (right + left < a.length && right + left < b.length && a[a.length - right - 1] === b[b.length - right - 1]) {
    right++;
  }
  return {
    index: left,
    remove: a.length - left - right,
    insert: b.slice(left, b.length - right)
  }
};

/**
 * Create a diff between two arrays. This diff implementation is highly
 * efficient, but not very sophisticated.
 *
 * Note: This is basically the same function as above. Another function was created so that the runtime
 * can better optimize these function calls.
 *
 * @function
 * @template T
 *
 * @param {Array<T>} a The old version of the array
 * @param {Array<T>} b The updated version of the array
 * @param {function(T, T):boolean} [compare]
 * @return {SimpleDiff<Array<T>>} The diff description.
 */
const simpleDiffArray = (a, b, compare = equalityStrict) => {
  let left = 0; // number of same characters counting from left
  let right = 0; // number of same characters counting from right
  while (left < a.length && left < b.length && compare(a[left], b[left])) {
    left++;
  }
  while (right + left < a.length && right + left < b.length && compare(a[a.length - right - 1], b[b.length - right - 1])) {
    right++;
  }
  return {
    index: left,
    remove: a.length - left - right,
    insert: b.slice(left, b.length - right)
  }
};

/**
 * Diff text and try to diff at the current cursor position.
 *
 * @param {string} a
 * @param {string} b
 * @param {number} cursor This should refer to the current left cursor-range position
 */
const simpleDiffStringWithCursor = (a, b, cursor) => {
  let left = 0; // number of same characters counting from left
  let right = 0; // number of same characters counting from right
  // Iterate left to the right until we find a changed character
  // First iteration considers the current cursor position
  while (
    left < a.length &&
    left < b.length &&
    a[left] === b[left] &&
    left < cursor
  ) {
    left++;
  }
  // Iterate right to the left until we find a changed character
  while (
    right + left < a.length &&
    right + left < b.length &&
    a[a.length - right - 1] === b[b.length - right - 1]
  ) {
    right++;
  }
  // Try to iterate left further to the right without caring about the current cursor position
  while (
    right + left < a.length &&
    right + left < b.length &&
    a[left] === b[left]
  ) {
    left++;
  }
  return {
    index: left,
    remove: a.length - left - right,
    insert: b.slice(left, b.length - right)
  }
};

/* eslint-env browser */

/**
 * Binary data constants.
 *
 * @module binary
 */

/**
 * n-th bit activated.
 *
 * @type {number}
 */
const BIT1 = 1;
const BIT2 = 2;
const BIT3 = 4;
const BIT4 = 8;
const BIT5 = 16;
const BIT6 = 32;
const BIT7 = 64;
const BIT8 = 128;
const BIT9 = 256;
const BIT10 = 512;
const BIT11 = 1024;
const BIT12 = 2048;
const BIT13 = 4096;
const BIT14 = 8192;
const BIT15 = 16384;
const BIT16 = 32768;
const BIT17 = 65536;
const BIT18 = 1 << 17;
const BIT19 = 1 << 18;
const BIT20 = 1 << 19;
const BIT21 = 1 << 20;
const BIT22 = 1 << 21;
const BIT23 = 1 << 22;
const BIT24 = 1 << 23;
const BIT25 = 1 << 24;
const BIT26 = 1 << 25;
const BIT27 = 1 << 26;
const BIT28 = 1 << 27;
const BIT29 = 1 << 28;
const BIT30 = 1 << 29;
const BIT31 = 1 << 30;
const BIT32 = 1 << 31;

/**
 * First n bits activated.
 *
 * @type {number}
 */
const BITS0 = 0;
const BITS1 = 1;
const BITS2 = 3;
const BITS3 = 7;
const BITS4 = 15;
const BITS5 = 31;
const BITS6 = 63;
const BITS7 = 127;
const BITS8 = 255;
const BITS9 = 511;
const BITS10 = 1023;
const BITS11 = 2047;
const BITS12 = 4095;
const BITS13 = 8191;
const BITS14 = 16383;
const BITS15 = 32767;
const BITS16 = 65535;
const BITS17 = BIT18 - 1;
const BITS18 = BIT19 - 1;
const BITS19 = BIT20 - 1;
const BITS20 = BIT21 - 1;
const BITS21 = BIT22 - 1;
const BITS22 = BIT23 - 1;
const BITS23 = BIT24 - 1;
const BITS24 = BIT25 - 1;
const BITS25 = BIT26 - 1;
const BITS26 = BIT27 - 1;
const BITS27 = BIT28 - 1;
const BITS28 = BIT29 - 1;
const BITS29 = BIT30 - 1;
const BITS30 = BIT31 - 1;
/**
 * @type {number}
 */
const BITS31 = 0x7FFFFFFF;
/**
 * @type {number}
 */
const BITS32 = 0xFFFFFFFF;

var binary$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  BIT1: BIT1,
  BIT2: BIT2,
  BIT3: BIT3,
  BIT4: BIT4,
  BIT5: BIT5,
  BIT6: BIT6,
  BIT7: BIT7,
  BIT8: BIT8,
  BIT9: BIT9,
  BIT10: BIT10,
  BIT11: BIT11,
  BIT12: BIT12,
  BIT13: BIT13,
  BIT14: BIT14,
  BIT15: BIT15,
  BIT16: BIT16,
  BIT17: BIT17,
  BIT18: BIT18,
  BIT19: BIT19,
  BIT20: BIT20,
  BIT21: BIT21,
  BIT22: BIT22,
  BIT23: BIT23,
  BIT24: BIT24,
  BIT25: BIT25,
  BIT26: BIT26,
  BIT27: BIT27,
  BIT28: BIT28,
  BIT29: BIT29,
  BIT30: BIT30,
  BIT31: BIT31,
  BIT32: BIT32,
  BITS0: BITS0,
  BITS1: BITS1,
  BITS2: BITS2,
  BITS3: BITS3,
  BITS4: BITS4,
  BITS5: BITS5,
  BITS6: BITS6,
  BITS7: BITS7,
  BITS8: BITS8,
  BITS9: BITS9,
  BITS10: BITS10,
  BITS11: BITS11,
  BITS12: BITS12,
  BITS13: BITS13,
  BITS14: BITS14,
  BITS15: BITS15,
  BITS16: BITS16,
  BITS17: BITS17,
  BITS18: BITS18,
  BITS19: BITS19,
  BITS20: BITS20,
  BITS21: BITS21,
  BITS22: BITS22,
  BITS23: BITS23,
  BITS24: BITS24,
  BITS25: BITS25,
  BITS26: BITS26,
  BITS27: BITS27,
  BITS28: BITS28,
  BITS29: BITS29,
  BITS30: BITS30,
  BITS31: BITS31,
  BITS32: BITS32
});

const uint32$1 = () => new Uint32Array(isomorphic_js.cryptoRandomBuffer(4))[0];

const uint53$1 = () => {
  const arr = new Uint32Array(isomorphic_js.cryptoRandomBuffer(8));
  return (arr[0] & BITS21) * (BITS32 + 1) + (arr[1] >>> 0)
};

// @ts-ignore
const uuidv4Template = [1e7] + -1e3 + -4e3 + -8e3 + -1e11;
const uuidv4 = () => uuidv4Template.replace(/[018]/g, /** @param {number} c */ c =>
  (c ^ uint32$1() & 15 >> c / 4).toString(16)
);

/**
 * @module prng
 */

/**
 * Xorshift32 is a very simple but elegang PRNG with a period of `2^32-1`.
 */
class Xorshift32 {
  /**
   * @param {number} seed Unsigned 32 bit number
   */
  constructor (seed) {
    this.seed = seed;
    /**
     * @type {number}
     */
    this._state = seed;
  }

  /**
   * Generate a random signed integer.
   *
   * @return {Number} A 32 bit signed integer.
   */
  next () {
    let x = this._state;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    this._state = x;
    return (x >>> 0) / (BITS32 + 1)
  }
}

/**
 * @module prng
 */

/**
 * This is a variant of xoroshiro128plus - the fastest full-period generator passing BigCrush without systematic failures.
 *
 * This implementation follows the idea of the original xoroshiro128plus implementation,
 * but is optimized for the JavaScript runtime. I.e.
 * * The operations are performed on 32bit integers (the original implementation works with 64bit values).
 * * The initial 128bit state is computed based on a 32bit seed and Xorshift32.
 * * This implementation returns two 32bit values based on the 64bit value that is computed by xoroshiro128plus.
 *   Caution: The last addition step works slightly different than in the original implementation - the add carry of the
 *   first 32bit addition is not carried over to the last 32bit.
 *
 * [Reference implementation](http://vigna.di.unimi.it/xorshift/xoroshiro128plus.c)
 */
class Xoroshiro128plus {
  /**
   * @param {number} seed Unsigned 32 bit number
   */
  constructor (seed) {
    this.seed = seed;
    // This is a variant of Xoroshiro128plus to fill the initial state
    const xorshift32 = new Xorshift32(seed);
    this.state = new Uint32Array(4);
    for (let i = 0; i < 4; i++) {
      this.state[i] = xorshift32.next() * BITS32;
    }
    this._fresh = true;
  }

  /**
   * @return {number} Float/Double in [0,1)
   */
  next () {
    const state = this.state;
    if (this._fresh) {
      this._fresh = false;
      return ((state[0] + state[2]) >>> 0) / (BITS32 + 1)
    } else {
      this._fresh = true;
      const s0 = state[0];
      const s1 = state[1];
      const s2 = state[2] ^ s0;
      const s3 = state[3] ^ s1;
      // function js_rotl (x, k) {
      //   k = k - 32
      //   const x1 = x[0]
      //   const x2 = x[1]
      //   x[0] = x2 << k | x1 >>> (32 - k)
      //   x[1] = x1 << k | x2 >>> (32 - k)
      // }
      // rotl(s0, 55) // k = 23 = 55 - 32; j = 9 =  32 - 23
      state[0] = (s1 << 23 | s0 >>> 9) ^ s2 ^ (s2 << 14 | s3 >>> 18);
      state[1] = (s0 << 23 | s1 >>> 9) ^ s3 ^ (s3 << 14);
      // rol(s1, 36) // k = 4 = 36 - 32; j = 23 = 32 - 9
      state[2] = s3 << 4 | s2 >>> 28;
      state[3] = s2 << 4 | s3 >>> 28;
      return (((state[1] + state[3]) >>> 0) / (BITS32 + 1))
    }
  }
}

/*
// Reference implementation
// Source: http://vigna.di.unimi.it/xorshift/xoroshiro128plus.c
// By David Blackman and Sebastiano Vigna
// Who published the reference implementation under Public Domain (CC0)

#include <stdint.h>
#include <stdio.h>

uint64_t s[2];

static inline uint64_t rotl(const uint64_t x, int k) {
    return (x << k) | (x >> (64 - k));
}

uint64_t next(void) {
    const uint64_t s0 = s[0];
    uint64_t s1 = s[1];
    s1 ^= s0;
    s[0] = rotl(s0, 55) ^ s1 ^ (s1 << 14); // a, b
    s[1] = rotl(s1, 36); // c
    return (s[0] + s[1]) & 0xFFFFFFFF;
}

int main(void)
{
    int i;
    s[0] = 1111 | (1337ul << 32);
    s[1] = 1234 | (9999ul << 32);

    printf("1000 outputs of genrand_int31()\n");
    for (i=0; i<100; i++) {
        printf("%10lu ", i);
        printf("%10lu ", next());
        printf("- %10lu ", s[0] >> 32);
        printf("%10lu ", (s[0] << 32) >> 32);
        printf("%10lu ", s[1] >> 32);
        printf("%10lu ", (s[1] << 32) >> 32);
        printf("\n");
        // if (i%5==4) printf("\n");
    }
    return 0;
}
*/

/**
 * Utility helpers for working with numbers.
 *
 * @module number
 */

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
const MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;

const LOWEST_INT32 = 1 << 31;
/**
 * @type {number}
 */
const HIGHEST_INT32 = BITS31;

/**
 * @module number
 */

/* istanbul ignore next */
const isInteger = Number.isInteger || (num => typeof num === 'number' && isFinite(num) && floor(num) === num);
const isNaN = Number.isNaN;

/**
 * Efficient schema-less binary encoding with support for variable length encoding.
 *
 * Use [lib0/encoding] with [lib0/decoding]. Every encoding function has a corresponding decoding function.
 *
 * Encodes numbers in little-endian order (least to most significant byte order)
 * and is compatible with Golang's binary encoding (https://golang.org/pkg/encoding/binary/)
 * which is also used in Protocol Buffers.
 *
 * ```js
 * // encoding step
 * const encoder = new encoding.createEncoder()
 * encoding.writeVarUint(encoder, 256)
 * encoding.writeVarString(encoder, 'Hello world!')
 * const buf = encoding.toUint8Array(encoder)
 * ```
 *
 * ```js
 * // decoding step
 * const decoder = new decoding.createDecoder(buf)
 * decoding.readVarUint(decoder) // => 256
 * decoding.readVarString(decoder) // => 'Hello world!'
 * decoding.hasContent(decoder) // => false - all data is read
 * ```
 *
 * @module encoding
 */

/**
 * A BinaryEncoder handles the encoding to an Uint8Array.
 */
class Encoder {
  constructor () {
    this.cpos = 0;
    this.cbuf = new Uint8Array(100);
    /**
     * @type {Array<Uint8Array>}
     */
    this.bufs = [];
  }
}

/**
 * @function
 * @return {Encoder}
 */
const createEncoder = () => new Encoder();

/**
 * The current length of the encoded data.
 *
 * @function
 * @param {Encoder} encoder
 * @return {number}
 */
const length = encoder => {
  let len = encoder.cpos;
  for (let i = 0; i < encoder.bufs.length; i++) {
    len += encoder.bufs[i].length;
  }
  return len
};

/**
 * Transform to Uint8Array.
 *
 * @function
 * @param {Encoder} encoder
 * @return {Uint8Array} The created ArrayBuffer.
 */
const toUint8Array = encoder => {
  const uint8arr = new Uint8Array(length(encoder));
  let curPos = 0;
  for (let i = 0; i < encoder.bufs.length; i++) {
    const d = encoder.bufs[i];
    uint8arr.set(d, curPos);
    curPos += d.length;
  }
  uint8arr.set(createUint8ArrayViewFromArrayBuffer(encoder.cbuf.buffer, 0, encoder.cpos), curPos);
  return uint8arr
};

/**
 * Verify that it is possible to write `len` bytes wtihout checking. If
 * necessary, a new Buffer with the required length is attached.
 *
 * @param {Encoder} encoder
 * @param {number} len
 */
const verifyLen = (encoder, len) => {
  const bufferLen = encoder.cbuf.length;
  if (bufferLen - encoder.cpos < len) {
    encoder.bufs.push(createUint8ArrayViewFromArrayBuffer(encoder.cbuf.buffer, 0, encoder.cpos));
    encoder.cbuf = new Uint8Array(max(bufferLen, len) * 2);
    encoder.cpos = 0;
  }
};

/**
 * Write one byte to the encoder.
 *
 * @function
 * @param {Encoder} encoder
 * @param {number} num The byte that is to be encoded.
 */
const write = (encoder, num) => {
  const bufferLen = encoder.cbuf.length;
  if (encoder.cpos === bufferLen) {
    encoder.bufs.push(encoder.cbuf);
    encoder.cbuf = new Uint8Array(bufferLen * 2);
    encoder.cpos = 0;
  }
  encoder.cbuf[encoder.cpos++] = num;
};

/**
 * Write one byte at a specific position.
 * Position must already be written (i.e. encoder.length > pos)
 *
 * @function
 * @param {Encoder} encoder
 * @param {number} pos Position to which to write data
 * @param {number} num Unsigned 8-bit integer
 */
const set$2 = (encoder, pos, num) => {
  let buffer = null;
  // iterate all buffers and adjust position
  for (let i = 0; i < encoder.bufs.length && buffer === null; i++) {
    const b = encoder.bufs[i];
    if (pos < b.length) {
      buffer = b; // found buffer
    } else {
      pos -= b.length;
    }
  }
  if (buffer === null) {
    // use current buffer
    buffer = encoder.cbuf;
  }
  buffer[pos] = num;
};

/**
 * Write one byte as an unsigned integer.
 *
 * @function
 * @param {Encoder} encoder
 * @param {number} num The number that is to be encoded.
 */
const writeUint8 = write;

/**
 * Write one byte as an unsigned Integer at a specific location.
 *
 * @function
 * @param {Encoder} encoder
 * @param {number} pos The location where the data will be written.
 * @param {number} num The number that is to be encoded.
 */
const setUint8 = set$2;

/**
 * Write two bytes as an unsigned integer.
 *
 * @function
 * @param {Encoder} encoder
 * @param {number} num The number that is to be encoded.
 */
const writeUint16 = (encoder, num) => {
  write(encoder, num & BITS8);
  write(encoder, (num >>> 8) & BITS8);
};
/**
 * Write two bytes as an unsigned integer at a specific location.
 *
 * @function
 * @param {Encoder} encoder
 * @param {number} pos The location where the data will be written.
 * @param {number} num The number that is to be encoded.
 */
const setUint16 = (encoder, pos, num) => {
  set$2(encoder, pos, num & BITS8);
  set$2(encoder, pos + 1, (num >>> 8) & BITS8);
};

/**
 * Write two bytes as an unsigned integer
 *
 * @function
 * @param {Encoder} encoder
 * @param {number} num The number that is to be encoded.
 */
const writeUint32 = (encoder, num) => {
  for (let i = 0; i < 4; i++) {
    write(encoder, num & BITS8);
    num >>>= 8;
  }
};

/**
 * Write two bytes as an unsigned integer in big endian order.
 * (most significant byte first)
 *
 * @function
 * @param {Encoder} encoder
 * @param {number} num The number that is to be encoded.
 */
const writeUint32BigEndian = (encoder, num) => {
  for (let i = 3; i >= 0; i--) {
    write(encoder, (num >>> (8 * i)) & BITS8);
  }
};

/**
 * Write two bytes as an unsigned integer at a specific location.
 *
 * @function
 * @param {Encoder} encoder
 * @param {number} pos The location where the data will be written.
 * @param {number} num The number that is to be encoded.
 */
const setUint32 = (encoder, pos, num) => {
  for (let i = 0; i < 4; i++) {
    set$2(encoder, pos + i, num & BITS8);
    num >>>= 8;
  }
};

/**
 * Write a variable length unsigned integer. Max encodable integer is 2^53.
 *
 * @function
 * @param {Encoder} encoder
 * @param {number} num The number that is to be encoded.
 */
const writeVarUint = (encoder, num) => {
  while (num > BITS7) {
    write(encoder, BIT8 | (BITS7 & num));
    num = floor(num / 128); // shift >>> 7
  }
  write(encoder, BITS7 & num);
};

/**
 * Write a variable length integer.
 *
 * We use the 7th bit instead for signaling that this is a negative number.
 *
 * @function
 * @param {Encoder} encoder
 * @param {number} num The number that is to be encoded.
 */
const writeVarInt = (encoder, num) => {
  const isNegative = isNegativeZero(num);
  if (isNegative) {
    num = -num;
  }
  //             |- whether to continue reading         |- whether is negative     |- number
  write(encoder, (num > BITS6 ? BIT8 : 0) | (isNegative ? BIT7 : 0) | (BITS6 & num));
  num = floor(num / 64); // shift >>> 6
  // We don't need to consider the case of num === 0 so we can use a different
  // pattern here than above.
  while (num > 0) {
    write(encoder, (num > BITS7 ? BIT8 : 0) | (BITS7 & num));
    num = floor(num / 128); // shift >>> 7
  }
};

/**
 * A cache to store strings temporarily
 */
const _strBuffer = new Uint8Array(30000);
const _maxStrBSize = _strBuffer.length / 3;

/**
 * Write a variable length string.
 *
 * @function
 * @param {Encoder} encoder
 * @param {String} str The string that is to be encoded.
 */
const _writeVarStringNative = (encoder, str) => {
  if (str.length < _maxStrBSize) {
    // We can encode the string into the existing buffer
    /* istanbul ignore else */
    const written = utf8TextEncoder.encodeInto(str, _strBuffer).written || 0;
    writeVarUint(encoder, written);
    for (let i = 0; i < written; i++) {
      write(encoder, _strBuffer[i]);
    }
  } else {
    writeVarUint8Array(encoder, encodeUtf8(str));
  }
};

/**
 * Write a variable length string.
 *
 * @function
 * @param {Encoder} encoder
 * @param {String} str The string that is to be encoded.
 */
const _writeVarStringPolyfill = (encoder, str) => {
  const encodedString = unescape(encodeURIComponent(str));
  const len = encodedString.length;
  writeVarUint(encoder, len);
  for (let i = 0; i < len; i++) {
    write(encoder, /** @type {number} */ (encodedString.codePointAt(i)));
  }
};

/**
 * Write a variable length string.
 *
 * @function
 * @param {Encoder} encoder
 * @param {String} str The string that is to be encoded.
 */
/* istanbul ignore next */
const writeVarString = (utf8TextEncoder && utf8TextEncoder.encodeInto) ? _writeVarStringNative : _writeVarStringPolyfill;

/**
 * Write the content of another Encoder.
 *
 * @TODO: can be improved!
 *        - Note: Should consider that when appending a lot of small Encoders, we should rather clone than referencing the old structure.
 *                Encoders start with a rather big initial buffer.
 *
 * @function
 * @param {Encoder} encoder The enUint8Arr
 * @param {Encoder} append The BinaryEncoder to be written.
 */
const writeBinaryEncoder = (encoder, append) => writeUint8Array(encoder, toUint8Array(append));

/**
 * Append fixed-length Uint8Array to the encoder.
 *
 * @function
 * @param {Encoder} encoder
 * @param {Uint8Array} uint8Array
 */
const writeUint8Array = (encoder, uint8Array) => {
  const bufferLen = encoder.cbuf.length;
  const cpos = encoder.cpos;
  const leftCopyLen = min(bufferLen - cpos, uint8Array.length);
  const rightCopyLen = uint8Array.length - leftCopyLen;
  encoder.cbuf.set(uint8Array.subarray(0, leftCopyLen), cpos);
  encoder.cpos += leftCopyLen;
  if (rightCopyLen > 0) {
    // Still something to write, write right half..
    // Append new buffer
    encoder.bufs.push(encoder.cbuf);
    // must have at least size of remaining buffer
    encoder.cbuf = new Uint8Array(max(bufferLen * 2, rightCopyLen));
    // copy array
    encoder.cbuf.set(uint8Array.subarray(leftCopyLen));
    encoder.cpos = rightCopyLen;
  }
};

/**
 * Append an Uint8Array to Encoder.
 *
 * @function
 * @param {Encoder} encoder
 * @param {Uint8Array} uint8Array
 */
const writeVarUint8Array = (encoder, uint8Array) => {
  writeVarUint(encoder, uint8Array.byteLength);
  writeUint8Array(encoder, uint8Array);
};

/**
 * Create an DataView of the next `len` bytes. Use it to write data after
 * calling this function.
 *
 * ```js
 * // write float32 using DataView
 * const dv = writeOnDataView(encoder, 4)
 * dv.setFloat32(0, 1.1)
 * // read float32 using DataView
 * const dv = readFromDataView(encoder, 4)
 * dv.getFloat32(0) // => 1.100000023841858 (leaving it to the reader to find out why this is the correct result)
 * ```
 *
 * @param {Encoder} encoder
 * @param {number} len
 * @return {DataView}
 */
const writeOnDataView = (encoder, len) => {
  verifyLen(encoder, len);
  const dview = new DataView(encoder.cbuf.buffer, encoder.cpos, len);
  encoder.cpos += len;
  return dview
};

/**
 * @param {Encoder} encoder
 * @param {number} num
 */
const writeFloat32 = (encoder, num) => writeOnDataView(encoder, 4).setFloat32(0, num, false);

/**
 * @param {Encoder} encoder
 * @param {number} num
 */
const writeFloat64 = (encoder, num) => writeOnDataView(encoder, 8).setFloat64(0, num, false);

/**
 * @param {Encoder} encoder
 * @param {bigint} num
 */
const writeBigInt64 = (encoder, num) => /** @type {any} */ (writeOnDataView(encoder, 8)).setBigInt64(0, num, false);

const floatTestBed = new DataView(new ArrayBuffer(4));
/**
 * Check if a number can be encoded as a 32 bit float.
 *
 * @param {number} num
 * @return {boolean}
 */
const isFloat32 = num => {
  floatTestBed.setFloat32(0, num);
  return floatTestBed.getFloat32(0) === num
};

/**
 * Encode data with efficient binary format.
 *
 * Differences to JSON:
 * • Transforms data to a binary format (not to a string)
 * • Encodes undefined, NaN, and ArrayBuffer (these can't be represented in JSON)
 * • Numbers are efficiently encoded either as a variable length integer, as a
 *   32 bit float, as a 64 bit float, or as a 64 bit bigint.
 *
 * Encoding table:
 *
 * | Data Type           | Prefix   | Encoding Method    | Comment |
 * | ------------------- | -------- | ------------------ | ------- |
 * | undefined           | 127      |                    | Functions, symbol, and everything that cannot be identified is encoded as undefined |
 * | null                | 126      |                    | |
 * | integer             | 125      | writeVarInt        | Only encodes 32 bit signed integers |
 * | float32             | 124      | writeFloat32       | |
 * | float64             | 123      | writeFloat64       | |
 * | bigint              | 122      | writeBigInt64      | |
 * | boolean (false)     | 121      |                    | True and false are different data types so we save the following byte |
 * | boolean (true)      | 120      |                    | - 0b01111000 so the last bit determines whether true or false |
 * | string              | 119      | writeVarString     | |
 * | object<string,any>  | 118      | custom             | Writes {length} then {length} key-value pairs |
 * | array<any>          | 117      | custom             | Writes {length} then {length} json values |
 * | Uint8Array          | 116      | writeVarUint8Array | We use Uint8Array for any kind of binary data |
 *
 * Reasons for the decreasing prefix:
 * We need the first bit for extendability (later we may want to encode the
 * prefix with writeVarUint). The remaining 7 bits are divided as follows:
 * [0-30]   the beginning of the data range is used for custom purposes
 *          (defined by the function that uses this library)
 * [31-127] the end of the data range is used for data encoding by
 *          lib0/encoding.js
 *
 * @param {Encoder} encoder
 * @param {undefined|null|number|bigint|boolean|string|Object<string,any>|Array<any>|Uint8Array} data
 */
const writeAny = (encoder, data) => {
  switch (typeof data) {
    case 'string':
      // TYPE 119: STRING
      write(encoder, 119);
      writeVarString(encoder, data);
      break
    case 'number':
      if (isInteger(data) && abs(data) <= BITS31) {
        // TYPE 125: INTEGER
        write(encoder, 125);
        writeVarInt(encoder, data);
      } else if (isFloat32(data)) {
        // TYPE 124: FLOAT32
        write(encoder, 124);
        writeFloat32(encoder, data);
      } else {
        // TYPE 123: FLOAT64
        write(encoder, 123);
        writeFloat64(encoder, data);
      }
      break
    case 'bigint':
      // TYPE 122: BigInt
      write(encoder, 122);
      writeBigInt64(encoder, data);
      break
    case 'object':
      if (data === null) {
        // TYPE 126: null
        write(encoder, 126);
      } else if (data instanceof Array) {
        // TYPE 117: Array
        write(encoder, 117);
        writeVarUint(encoder, data.length);
        for (let i = 0; i < data.length; i++) {
          writeAny(encoder, data[i]);
        }
      } else if (data instanceof Uint8Array) {
        // TYPE 116: ArrayBuffer
        write(encoder, 116);
        writeVarUint8Array(encoder, data);
      } else {
        // TYPE 118: Object
        write(encoder, 118);
        const keys = Object.keys(data);
        writeVarUint(encoder, keys.length);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          writeVarString(encoder, key);
          writeAny(encoder, data[key]);
        }
      }
      break
    case 'boolean':
      // TYPE 120/121: boolean (true/false)
      write(encoder, data ? 120 : 121);
      break
    default:
      // TYPE 127: undefined
      write(encoder, 127);
  }
};

/**
 * Now come a few stateful encoder that have their own classes.
 */

/**
 * Basic Run Length Encoder - a basic compression implementation.
 *
 * Encodes [1,1,1,7] to [1,3,7,1] (3 times 1, 1 time 7). This encoder might do more harm than good if there are a lot of values that are not repeated.
 *
 * It was originally used for image compression. Cool .. article http://csbruce.com/cbm/transactor/pdfs/trans_v7_i06.pdf
 *
 * @note T must not be null!
 *
 * @template T
 */
class RleEncoder extends Encoder {
  /**
   * @param {function(Encoder, T):void} writer
   */
  constructor (writer) {
    super();
    /**
     * The writer
     */
    this.w = writer;
    /**
     * Current state
     * @type {T|null}
     */
    this.s = null;
    this.count = 0;
  }

  /**
   * @param {T} v
   */
  write (v) {
    if (this.s === v) {
      this.count++;
    } else {
      if (this.count > 0) {
        // flush counter, unless this is the first value (count = 0)
        writeVarUint(this, this.count - 1); // since count is always > 0, we can decrement by one. non-standard encoding ftw
      }
      this.count = 1;
      // write first value
      this.w(this, v);
      this.s = v;
    }
  }
}

/**
 * Basic diff decoder using variable length encoding.
 *
 * Encodes the values [3, 1100, 1101, 1050, 0] to [3, 1097, 1, -51, -1050] using writeVarInt.
 */
class IntDiffEncoder extends Encoder {
  /**
   * @param {number} start
   */
  constructor (start) {
    super();
    /**
     * Current state
     * @type {number}
     */
    this.s = start;
  }

  /**
   * @param {number} v
   */
  write (v) {
    writeVarInt(this, v - this.s);
    this.s = v;
  }
}

/**
 * A combination of IntDiffEncoder and RleEncoder.
 *
 * Basically first writes the IntDiffEncoder and then counts duplicate diffs using RleEncoding.
 *
 * Encodes the values [1,1,1,2,3,4,5,6] as [1,1,0,2,1,5] (RLE([1,0,0,1,1,1,1,1]) ⇒ RleIntDiff[1,1,0,2,1,5])
 */
class RleIntDiffEncoder extends Encoder {
  /**
   * @param {number} start
   */
  constructor (start) {
    super();
    /**
     * Current state
     * @type {number}
     */
    this.s = start;
    this.count = 0;
  }

  /**
   * @param {number} v
   */
  write (v) {
    if (this.s === v && this.count > 0) {
      this.count++;
    } else {
      if (this.count > 0) {
        // flush counter, unless this is the first value (count = 0)
        writeVarUint(this, this.count - 1); // since count is always > 0, we can decrement by one. non-standard encoding ftw
      }
      this.count = 1;
      // write first value
      writeVarInt(this, v - this.s);
      this.s = v;
    }
  }
}

/**
 * @param {UintOptRleEncoder} encoder
 */
const flushUintOptRleEncoder = encoder => {
  /* istanbul ignore else */
  if (encoder.count > 0) {
    // flush counter, unless this is the first value (count = 0)
    // case 1: just a single value. set sign to positive
    // case 2: write several values. set sign to negative to indicate that there is a length coming
    writeVarInt(encoder.encoder, encoder.count === 1 ? encoder.s : -encoder.s);
    if (encoder.count > 1) {
      writeVarUint(encoder.encoder, encoder.count - 2); // since count is always > 1, we can decrement by one. non-standard encoding ftw
    }
  }
};

/**
 * Optimized Rle encoder that does not suffer from the mentioned problem of the basic Rle encoder.
 *
 * Internally uses VarInt encoder to write unsigned integers. If the input occurs multiple times, we write
 * write it as a negative number. The UintOptRleDecoder then understands that it needs to read a count.
 *
 * Encodes [1,2,3,3,3] as [1,2,-3,3] (once 1, once 2, three times 3)
 */
class UintOptRleEncoder {
  constructor () {
    this.encoder = new Encoder();
    /**
     * @type {number}
     */
    this.s = 0;
    this.count = 0;
  }

  /**
   * @param {number} v
   */
  write (v) {
    if (this.s === v) {
      this.count++;
    } else {
      flushUintOptRleEncoder(this);
      this.count = 1;
      this.s = v;
    }
  }

  toUint8Array () {
    flushUintOptRleEncoder(this);
    return toUint8Array(this.encoder)
  }
}

/**
 * @param {IntDiffOptRleEncoder} encoder
 */
const flushIntDiffOptRleEncoder = encoder => {
  if (encoder.count > 0) {
    //          31 bit making up the diff | wether to write the counter
    // const encodedDiff = encoder.diff << 1 | (encoder.count === 1 ? 0 : 1)
    const encodedDiff = encoder.diff * 2 + (encoder.count === 1 ? 0 : 1);
    // flush counter, unless this is the first value (count = 0)
    // case 1: just a single value. set first bit to positive
    // case 2: write several values. set first bit to negative to indicate that there is a length coming
    writeVarInt(encoder.encoder, encodedDiff);
    if (encoder.count > 1) {
      writeVarUint(encoder.encoder, encoder.count - 2); // since count is always > 1, we can decrement by one. non-standard encoding ftw
    }
  }
};

/**
 * A combination of the IntDiffEncoder and the UintOptRleEncoder.
 *
 * The count approach is similar to the UintDiffOptRleEncoder, but instead of using the negative bitflag, it encodes
 * in the LSB whether a count is to be read. Therefore this Encoder only supports 31 bit integers!
 *
 * Encodes [1, 2, 3, 2] as [3, 1, 6, -1] (more specifically [(1 << 1) | 1, (3 << 0) | 0, -1])
 *
 * Internally uses variable length encoding. Contrary to normal UintVar encoding, the first byte contains:
 * * 1 bit that denotes whether the next value is a count (LSB)
 * * 1 bit that denotes whether this value is negative (MSB - 1)
 * * 1 bit that denotes whether to continue reading the variable length integer (MSB)
 *
 * Therefore, only five bits remain to encode diff ranges.
 *
 * Use this Encoder only when appropriate. In most cases, this is probably a bad idea.
 */
class IntDiffOptRleEncoder {
  constructor () {
    this.encoder = new Encoder();
    /**
     * @type {number}
     */
    this.s = 0;
    this.count = 0;
    this.diff = 0;
  }

  /**
   * @param {number} v
   */
  write (v) {
    if (this.diff === v - this.s) {
      this.s = v;
      this.count++;
    } else {
      flushIntDiffOptRleEncoder(this);
      this.count = 1;
      this.diff = v - this.s;
      this.s = v;
    }
  }

  toUint8Array () {
    flushIntDiffOptRleEncoder(this);
    return toUint8Array(this.encoder)
  }
}

/**
 * Optimized String Encoder.
 *
 * Encoding many small strings in a simple Encoder is not very efficient. The function call to decode a string takes some time and creates references that must be eventually deleted.
 * In practice, when decoding several million small strings, the GC will kick in more and more often to collect orphaned string objects (or maybe there is another reason?).
 *
 * This string encoder solves the above problem. All strings are concatenated and written as a single string using a single encoding call.
 *
 * The lengths are encoded using a UintOptRleEncoder.
 */
class StringEncoder {
  constructor () {
    /**
     * @type {Array<string>}
     */
    this.sarr = [];
    this.s = '';
    this.lensE = new UintOptRleEncoder();
  }

  /**
   * @param {string} string
   */
  write (string) {
    this.s += string;
    if (this.s.length > 19) {
      this.sarr.push(this.s);
      this.s = '';
    }
    this.lensE.write(string.length);
  }

  toUint8Array () {
    const encoder = new Encoder();
    this.sarr.push(this.s);
    this.s = '';
    writeVarString(encoder, this.sarr.join(''));
    writeUint8Array(encoder, this.lensE.toUint8Array());
    return toUint8Array(encoder)
  }
}

/**
 * Error helpers.
 *
 * @module error
 */

/* istanbul ignore next */
/**
 * @param {string} s
 * @return {Error}
 */
const create$6 = s => new Error(s);

/* istanbul ignore next */
/**
 * @throws {Error}
 * @return {never}
 */
const unexpectedCase = () => {
  throw create$6('Unexpected case')
};

/**
 * Efficient schema-less binary decoding with support for variable length encoding.
 *
 * Use [lib0/decoding] with [lib0/encoding]. Every encoding function has a corresponding decoding function.
 *
 * Encodes numbers in little-endian order (least to most significant byte order)
 * and is compatible with Golang's binary encoding (https://golang.org/pkg/encoding/binary/)
 * which is also used in Protocol Buffers.
 *
 * ```js
 * // encoding step
 * const encoder = new encoding.createEncoder()
 * encoding.writeVarUint(encoder, 256)
 * encoding.writeVarString(encoder, 'Hello world!')
 * const buf = encoding.toUint8Array(encoder)
 * ```
 *
 * ```js
 * // decoding step
 * const decoder = new decoding.createDecoder(buf)
 * decoding.readVarUint(decoder) // => 256
 * decoding.readVarString(decoder) // => 'Hello world!'
 * decoding.hasContent(decoder) // => false - all data is read
 * ```
 *
 * @module decoding
 */

const errorUnexpectedEndOfArray = create$6('Unexpected end of array');
const errorIntegerOutOfRange = create$6('Integer out of Range');

/**
 * A Decoder handles the decoding of an Uint8Array.
 */
class Decoder {
  /**
   * @param {Uint8Array} uint8Array Binary data to decode
   */
  constructor (uint8Array) {
    /**
     * Decoding target.
     *
     * @type {Uint8Array}
     */
    this.arr = uint8Array;
    /**
     * Current decoding position.
     *
     * @type {number}
     */
    this.pos = 0;
  }
}

/**
 * @function
 * @param {Uint8Array} uint8Array
 * @return {Decoder}
 */
const createDecoder = uint8Array => new Decoder(uint8Array);

/**
 * @function
 * @param {Decoder} decoder
 * @return {boolean}
 */
const hasContent = decoder => decoder.pos !== decoder.arr.length;

/**
 * Clone a decoder instance.
 * Optionally set a new position parameter.
 *
 * @function
 * @param {Decoder} decoder The decoder instance
 * @param {number} [newPos] Defaults to current position
 * @return {Decoder} A clone of `decoder`
 */
const clone = (decoder, newPos = decoder.pos) => {
  const _decoder = createDecoder(decoder.arr);
  _decoder.pos = newPos;
  return _decoder
};

/**
 * Create an Uint8Array view of the next `len` bytes and advance the position by `len`.
 *
 * Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
 *            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
 *
 * @function
 * @param {Decoder} decoder The decoder instance
 * @param {number} len The length of bytes to read
 * @return {Uint8Array}
 */
const readUint8Array = (decoder, len) => {
  const view = createUint8ArrayViewFromArrayBuffer(decoder.arr.buffer, decoder.pos + decoder.arr.byteOffset, len);
  decoder.pos += len;
  return view
};

/**
 * Read variable length Uint8Array.
 *
 * Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
 *            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
 *
 * @function
 * @param {Decoder} decoder
 * @return {Uint8Array}
 */
const readVarUint8Array = decoder => readUint8Array(decoder, readVarUint(decoder));

/**
 * Read the rest of the content as an ArrayBuffer
 * @function
 * @param {Decoder} decoder
 * @return {Uint8Array}
 */
const readTailAsUint8Array = decoder => readUint8Array(decoder, decoder.arr.length - decoder.pos);

/**
 * Skip one byte, jump to the next position.
 * @function
 * @param {Decoder} decoder The decoder instance
 * @return {number} The next position
 */
const skip8 = decoder => decoder.pos++;

/**
 * Read one byte as unsigned integer.
 * @function
 * @param {Decoder} decoder The decoder instance
 * @return {number} Unsigned 8-bit integer
 */
const readUint8 = decoder => decoder.arr[decoder.pos++];

/**
 * Read 2 bytes as unsigned integer.
 *
 * @function
 * @param {Decoder} decoder
 * @return {number} An unsigned integer.
 */
const readUint16 = decoder => {
  const uint =
    decoder.arr[decoder.pos] +
    (decoder.arr[decoder.pos + 1] << 8);
  decoder.pos += 2;
  return uint
};

/**
 * Read 4 bytes as unsigned integer.
 *
 * @function
 * @param {Decoder} decoder
 * @return {number} An unsigned integer.
 */
const readUint32 = decoder => {
  const uint =
    (decoder.arr[decoder.pos] +
    (decoder.arr[decoder.pos + 1] << 8) +
    (decoder.arr[decoder.pos + 2] << 16) +
    (decoder.arr[decoder.pos + 3] << 24)) >>> 0;
  decoder.pos += 4;
  return uint
};

/**
 * Read 4 bytes as unsigned integer in big endian order.
 * (most significant byte first)
 *
 * @function
 * @param {Decoder} decoder
 * @return {number} An unsigned integer.
 */
const readUint32BigEndian = decoder => {
  const uint =
    (decoder.arr[decoder.pos + 3] +
    (decoder.arr[decoder.pos + 2] << 8) +
    (decoder.arr[decoder.pos + 1] << 16) +
    (decoder.arr[decoder.pos] << 24)) >>> 0;
  decoder.pos += 4;
  return uint
};

/**
 * Look ahead without incrementing the position
 * to the next byte and read it as unsigned integer.
 *
 * @function
 * @param {Decoder} decoder
 * @return {number} An unsigned integer.
 */
const peekUint8 = decoder => decoder.arr[decoder.pos];

/**
 * Look ahead without incrementing the position
 * to the next byte and read it as unsigned integer.
 *
 * @function
 * @param {Decoder} decoder
 * @return {number} An unsigned integer.
 */
const peekUint16 = decoder =>
  decoder.arr[decoder.pos] +
  (decoder.arr[decoder.pos + 1] << 8);

/**
 * Look ahead without incrementing the position
 * to the next byte and read it as unsigned integer.
 *
 * @function
 * @param {Decoder} decoder
 * @return {number} An unsigned integer.
 */
const peekUint32 = decoder => (
  decoder.arr[decoder.pos] +
  (decoder.arr[decoder.pos + 1] << 8) +
  (decoder.arr[decoder.pos + 2] << 16) +
  (decoder.arr[decoder.pos + 3] << 24)
) >>> 0;

/**
 * Read unsigned integer (32bit) with variable length.
 * 1/8th of the storage is used as encoding overhead.
 *  * numbers < 2^7 is stored in one bytlength
 *  * numbers < 2^14 is stored in two bylength
 *
 * @function
 * @param {Decoder} decoder
 * @return {number} An unsigned integer.length
 */
const readVarUint = decoder => {
  let num = 0;
  let mult = 1;
  const len = decoder.arr.length;
  while (decoder.pos < len) {
    const r = decoder.arr[decoder.pos++];
    // num = num | ((r & binary.BITS7) << len)
    num = num + (r & BITS7) * mult; // shift $r << (7*#iterations) and add it to num
    mult *= 128; // next iteration, shift 7 "more" to the left
    if (r < BIT8) {
      return num
    }
    /* istanbul ignore if */
    if (num > MAX_SAFE_INTEGER) {
      throw errorIntegerOutOfRange
    }
  }
  throw errorUnexpectedEndOfArray
};

/**
 * Read signed integer (32bit) with variable length.
 * 1/8th of the storage is used as encoding overhead.
 *  * numbers < 2^7 is stored in one bytlength
 *  * numbers < 2^14 is stored in two bylength
 * @todo This should probably create the inverse ~num if number is negative - but this would be a breaking change.
 *
 * @function
 * @param {Decoder} decoder
 * @return {number} An unsigned integer.length
 */
const readVarInt = decoder => {
  let r = decoder.arr[decoder.pos++];
  let num = r & BITS6;
  let mult = 64;
  const sign = (r & BIT7) > 0 ? -1 : 1;
  if ((r & BIT8) === 0) {
    // don't continue reading
    return sign * num
  }
  const len = decoder.arr.length;
  while (decoder.pos < len) {
    r = decoder.arr[decoder.pos++];
    // num = num | ((r & binary.BITS7) << len)
    num = num + (r & BITS7) * mult;
    mult *= 128;
    if (r < BIT8) {
      return sign * num
    }
    /* istanbul ignore if */
    if (num > MAX_SAFE_INTEGER) {
      throw errorIntegerOutOfRange
    }
  }
  throw errorUnexpectedEndOfArray
};

/**
 * Look ahead and read varUint without incrementing position
 *
 * @function
 * @param {Decoder} decoder
 * @return {number}
 */
const peekVarUint = decoder => {
  const pos = decoder.pos;
  const s = readVarUint(decoder);
  decoder.pos = pos;
  return s
};

/**
 * Look ahead and read varUint without incrementing position
 *
 * @function
 * @param {Decoder} decoder
 * @return {number}
 */
const peekVarInt = decoder => {
  const pos = decoder.pos;
  const s = readVarInt(decoder);
  decoder.pos = pos;
  return s
};

/**
 * We don't test this function anymore as we use native decoding/encoding by default now.
 * Better not modify this anymore..
 *
 * Transforming utf8 to a string is pretty expensive. The code performs 10x better
 * when String.fromCodePoint is fed with all characters as arguments.
 * But most environments have a maximum number of arguments per functions.
 * For effiency reasons we apply a maximum of 10000 characters at once.
 *
 * @function
 * @param {Decoder} decoder
 * @return {String} The read String.
 */
/* istanbul ignore next */
const _readVarStringPolyfill = decoder => {
  let remainingLen = readVarUint(decoder);
  if (remainingLen === 0) {
    return ''
  } else {
    let encodedString = String.fromCodePoint(readUint8(decoder)); // remember to decrease remainingLen
    if (--remainingLen < 100) { // do not create a Uint8Array for small strings
      while (remainingLen--) {
        encodedString += String.fromCodePoint(readUint8(decoder));
      }
    } else {
      while (remainingLen > 0) {
        const nextLen = remainingLen < 10000 ? remainingLen : 10000;
        // this is dangerous, we create a fresh array view from the existing buffer
        const bytes = decoder.arr.subarray(decoder.pos, decoder.pos + nextLen);
        decoder.pos += nextLen;
        // Starting with ES5.1 we can supply a generic array-like object as arguments
        encodedString += String.fromCodePoint.apply(null, /** @type {any} */ (bytes));
        remainingLen -= nextLen;
      }
    }
    return decodeURIComponent(escape(encodedString))
  }
};

/**
 * @function
 * @param {Decoder} decoder
 * @return {String} The read String
 */
const _readVarStringNative = decoder =>
  /** @type any */ (utf8TextDecoder).decode(readVarUint8Array(decoder));

/**
 * Read string of variable length
 * * varUint is used to store the length of the string
 *
 * @function
 * @param {Decoder} decoder
 * @return {String} The read String
 *
 */
/* istanbul ignore next */
const readVarString = utf8TextDecoder ? _readVarStringNative : _readVarStringPolyfill;

/**
 * Look ahead and read varString without incrementing position
 *
 * @function
 * @param {Decoder} decoder
 * @return {string}
 */
const peekVarString = decoder => {
  const pos = decoder.pos;
  const s = readVarString(decoder);
  decoder.pos = pos;
  return s
};

/**
 * @param {Decoder} decoder
 * @param {number} len
 * @return {DataView}
 */
const readFromDataView = (decoder, len) => {
  const dv = new DataView(decoder.arr.buffer, decoder.arr.byteOffset + decoder.pos, len);
  decoder.pos += len;
  return dv
};

/**
 * @param {Decoder} decoder
 */
const readFloat32 = decoder => readFromDataView(decoder, 4).getFloat32(0, false);

/**
 * @param {Decoder} decoder
 */
const readFloat64 = decoder => readFromDataView(decoder, 8).getFloat64(0, false);

/**
 * @param {Decoder} decoder
 */
const readBigInt64 = decoder => /** @type {any} */ (readFromDataView(decoder, 8)).getBigInt64(0, false);

/**
 * @type {Array<function(Decoder):any>}
 */
const readAnyLookupTable = [
  decoder => undefined, // CASE 127: undefined
  decoder => null, // CASE 126: null
  readVarInt, // CASE 125: integer
  readFloat32, // CASE 124: float32
  readFloat64, // CASE 123: float64
  readBigInt64, // CASE 122: bigint
  decoder => false, // CASE 121: boolean (false)
  decoder => true, // CASE 120: boolean (true)
  readVarString, // CASE 119: string
  decoder => { // CASE 118: object<string,any>
    const len = readVarUint(decoder);
    /**
     * @type {Object<string,any>}
     */
    const obj = {};
    for (let i = 0; i < len; i++) {
      const key = readVarString(decoder);
      obj[key] = readAny(decoder);
    }
    return obj
  },
  decoder => { // CASE 117: array<any>
    const len = readVarUint(decoder);
    const arr = [];
    for (let i = 0; i < len; i++) {
      arr.push(readAny(decoder));
    }
    return arr
  },
  readVarUint8Array // CASE 116: Uint8Array
];

/**
 * @param {Decoder} decoder
 */
const readAny = decoder => readAnyLookupTable[127 - readUint8(decoder)](decoder);

/**
 * T must not be null.
 *
 * @template T
 */
class RleDecoder extends Decoder {
  /**
   * @param {Uint8Array} uint8Array
   * @param {function(Decoder):T} reader
   */
  constructor (uint8Array, reader) {
    super(uint8Array);
    /**
     * The reader
     */
    this.reader = reader;
    /**
     * Current state
     * @type {T|null}
     */
    this.s = null;
    this.count = 0;
  }

  read () {
    if (this.count === 0) {
      this.s = this.reader(this);
      if (hasContent(this)) {
        this.count = readVarUint(this) + 1; // see encoder implementation for the reason why this is incremented
      } else {
        this.count = -1; // read the current value forever
      }
    }
    this.count--;
    return /** @type {T} */ (this.s)
  }
}

class IntDiffDecoder extends Decoder {
  /**
   * @param {Uint8Array} uint8Array
   * @param {number} start
   */
  constructor (uint8Array, start) {
    super(uint8Array);
    /**
     * Current state
     * @type {number}
     */
    this.s = start;
  }

  /**
   * @return {number}
   */
  read () {
    this.s += readVarInt(this);
    return this.s
  }
}

class RleIntDiffDecoder extends Decoder {
  /**
   * @param {Uint8Array} uint8Array
   * @param {number} start
   */
  constructor (uint8Array, start) {
    super(uint8Array);
    /**
     * Current state
     * @type {number}
     */
    this.s = start;
    this.count = 0;
  }

  /**
   * @return {number}
   */
  read () {
    if (this.count === 0) {
      this.s += readVarInt(this);
      if (hasContent(this)) {
        this.count = readVarUint(this) + 1; // see encoder implementation for the reason why this is incremented
      } else {
        this.count = -1; // read the current value forever
      }
    }
    this.count--;
    return /** @type {number} */ (this.s)
  }
}

class UintOptRleDecoder extends Decoder {
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor (uint8Array) {
    super(uint8Array);
    /**
     * @type {number}
     */
    this.s = 0;
    this.count = 0;
  }

  read () {
    if (this.count === 0) {
      this.s = readVarInt(this);
      // if the sign is negative, we read the count too, otherwise count is 1
      const isNegative = isNegativeZero(this.s);
      this.count = 1;
      if (isNegative) {
        this.s = -this.s;
        this.count = readVarUint(this) + 2;
      }
    }
    this.count--;
    return /** @type {number} */ (this.s)
  }
}

class IntDiffOptRleDecoder extends Decoder {
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor (uint8Array) {
    super(uint8Array);
    /**
     * @type {number}
     */
    this.s = 0;
    this.count = 0;
    this.diff = 0;
  }

  /**
   * @return {number}
   */
  read () {
    if (this.count === 0) {
      const diff = readVarInt(this);
      // if the first bit is set, we read more data
      const hasCount = diff & 1;
      this.diff = floor(diff / 2); // shift >> 1
      this.count = 1;
      if (hasCount) {
        this.count = readVarUint(this) + 2;
      }
    }
    this.s += this.diff;
    this.count--;
    return this.s
  }
}

class StringDecoder {
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor (uint8Array) {
    this.decoder = new UintOptRleDecoder(uint8Array);
    this.str = readVarString(this.decoder);
    /**
     * @type {number}
     */
    this.spos = 0;
  }

  /**
   * @return {string}
   */
  read () {
    const end = this.spos + this.decoder.read();
    const res = this.str.slice(this.spos, end);
    this.spos = end;
    return res
  }
}

/**
 * Utility functions to work with buffers (Uint8Array).
 *
 * @module buffer
 */

/**
 * @param {number} len
 */
const createUint8ArrayFromLen = len => new Uint8Array(len);

/**
 * Create Uint8Array with initial content from buffer
 *
 * @param {ArrayBuffer} buffer
 * @param {number} byteOffset
 * @param {number} length
 */
const createUint8ArrayViewFromArrayBuffer = (buffer, byteOffset, length) => new Uint8Array(buffer, byteOffset, length);

/**
 * Create Uint8Array with initial content from buffer
 *
 * @param {ArrayBuffer} buffer
 */
const createUint8ArrayFromArrayBuffer = buffer => new Uint8Array(buffer);

/* istanbul ignore next */
/**
 * @param {Uint8Array} bytes
 * @return {string}
 */
const toBase64Browser = bytes => {
  let s = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    s += fromCharCode(bytes[i]);
  }
  // eslint-disable-next-line no-undef
  return btoa(s)
};

/**
 * @param {Uint8Array} bytes
 * @return {string}
 */
const toBase64Node = bytes => Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64');

/* istanbul ignore next */
/**
 * @param {string} s
 * @return {Uint8Array}
 */
const fromBase64Browser = s => {
  // eslint-disable-next-line no-undef
  const a = atob(s);
  const bytes = createUint8ArrayFromLen(a.length);
  for (let i = 0; i < a.length; i++) {
    bytes[i] = a.charCodeAt(i);
  }
  return bytes
};

/**
 * @param {string} s
 */
const fromBase64Node = s => {
  const buf = Buffer.from(s, 'base64');
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
};

/* istanbul ignore next */
const toBase64 = isBrowser ? toBase64Browser : toBase64Node;

/* istanbul ignore next */
const fromBase64 = isBrowser ? fromBase64Browser : fromBase64Node;

/**
 * Copy the content of an Uint8Array view to a new ArrayBuffer.
 *
 * @param {Uint8Array} uint8Array
 * @return {Uint8Array}
 */
const copyUint8Array = uint8Array => {
  const newBuf = createUint8ArrayFromLen(uint8Array.byteLength);
  newBuf.set(uint8Array);
  return newBuf
};

/**
 * Encode anything as a UInt8Array. It's a pun on typescripts's `any` type.
 * See encoding.writeAny for more information.
 *
 * @param {any} data
 * @return {Uint8Array}
 */
const encodeAny = data => {
  const encoder = createEncoder();
  writeAny(encoder, data);
  return toUint8Array(encoder)
};

/**
 * Decode an any-encoded value.
 *
 * @param {Uint8Array} buf
 * @return {any}
 */
const decodeAny = buf => readAny(createDecoder(buf));

/**
 * Fast Pseudo Random Number Generators.
 *
 * Given a seed a PRNG generates a sequence of numbers that cannot be reasonably predicted.
 * Two PRNGs must generate the same random sequence of numbers if  given the same seed.
 *
 * @module prng
 */

/**
 * Description of the function
 *  @callback generatorNext
 *  @return {number} A random float in the cange of [0,1)
 */

/**
 * A random type generator.
 *
 * @typedef {Object} PRNG
 * @property {generatorNext} next Generate new number
 */

const DefaultPRNG = Xoroshiro128plus;

/**
 * Create a Xoroshiro128plus Pseudo-Random-Number-Generator.
 * This is the fastest full-period generator passing BigCrush without systematic failures.
 * But there are more PRNGs available in ./PRNG/.
 *
 * @param {number} seed A positive 32bit integer. Do not use negative numbers.
 * @return {PRNG}
 */
const create$5 = seed => new DefaultPRNG(seed);

/**
 * Generates a single random bool.
 *
 * @param {PRNG} gen A random number generator.
 * @return {Boolean} A random boolean
 */
const bool = gen => (gen.next() >= 0.5);

/**
 * Generates a random integer with 53 bit resolution.
 *
 * @param {PRNG} gen A random number generator.
 * @param {Number} min The lower bound of the allowed return values (inclusive).
 * @param {Number} max The upper bound of the allowed return values (inclusive).
 * @return {Number} A random integer on [min, max]
 */
const int53 = (gen, min, max) => floor(gen.next() * (max + 1 - min) + min);

/**
 * Generates a random integer with 53 bit resolution.
 *
 * @param {PRNG} gen A random number generator.
 * @param {Number} min The lower bound of the allowed return values (inclusive).
 * @param {Number} max The upper bound of the allowed return values (inclusive).
 * @return {Number} A random integer on [min, max]
 */
const uint53 = (gen, min, max) => abs(int53(gen, min, max));

/**
 * Generates a random integer with 32 bit resolution.
 *
 * @param {PRNG} gen A random number generator.
 * @param {Number} min The lower bound of the allowed return values (inclusive).
 * @param {Number} max The upper bound of the allowed return values (inclusive).
 * @return {Number} A random integer on [min, max]
 */
const int32 = (gen, min, max) => floor(gen.next() * (max + 1 - min) + min);

/**
 * Generates a random integer with 53 bit resolution.
 *
 * @param {PRNG} gen A random number generator.
 * @param {Number} min The lower bound of the allowed return values (inclusive).
 * @param {Number} max The upper bound of the allowed return values (inclusive).
 * @return {Number} A random integer on [min, max]
 */
const uint32 = (gen, min, max) => int32(gen, min, max) >>> 0;

/**
 * @deprecated
 * Optimized version of prng.int32. It has the same precision as prng.int32, but should be preferred when
 * openaring on smaller ranges.
 *
 * @param {PRNG} gen A random number generator.
 * @param {Number} min The lower bound of the allowed return values (inclusive).
 * @param {Number} max The upper bound of the allowed return values (inclusive). The max inclusive number is `binary.BITS31-1`
 * @return {Number} A random integer on [min, max]
 */
const int31 = (gen, min, max) => int32(gen, min, max);

/**
 * Generates a random real on [0, 1) with 53 bit resolution.
 *
 * @param {PRNG} gen A random number generator.
 * @return {Number} A random real number on [0, 1).
 */
const real53 = gen => gen.next(); // (((gen.next() >>> 5) * binary.BIT26) + (gen.next() >>> 6)) / MAX_SAFE_INTEGER

/**
 * Generates a random character from char code 32 - 126. I.e. Characters, Numbers, special characters, and Space:
 *
 * @param {PRNG} gen A random number generator.
 * @return {string}
 *
 * (Space)!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[/]^_`abcdefghijklmnopqrstuvwxyz{|}~
 */
const char = gen => fromCharCode(int31(gen, 32, 126));

/**
 * @param {PRNG} gen
 * @return {string} A single letter (a-z)
 */
const letter = gen => fromCharCode(int31(gen, 97, 122));

/**
 * @param {PRNG} gen
 * @param {number} [minLen=0]
 * @param {number} [maxLen=20]
 * @return {string} A random word (0-20 characters) without spaces consisting of letters (a-z)
 */
const word = (gen, minLen = 0, maxLen = 20) => {
  const len = int31(gen, minLen, maxLen);
  let str = '';
  for (let i = 0; i < len; i++) {
    str += letter(gen);
  }
  return str
};

/**
 * TODO: this function produces invalid runes. Does not cover all of utf16!!
 *
 * @param {PRNG} gen
 * @return {string}
 */
const utf16Rune = gen => {
  const codepoint = int31(gen, 0, 256);
  return fromCodePoint(codepoint)
};

/**
 * @param {PRNG} gen
 * @param {number} [maxlen = 20]
 */
const utf16String = (gen, maxlen = 20) => {
  const len = int31(gen, 0, maxlen);
  let str = '';
  for (let i = 0; i < len; i++) {
    str += utf16Rune(gen);
  }
  return str
};

/**
 * Returns one element of a given array.
 *
 * @param {PRNG} gen A random number generator.
 * @param {Array<T>} array Non empty Array of possible values.
 * @return {T} One of the values of the supplied Array.
 * @template T
 */
const oneOf = (gen, array) => array[int31(gen, 0, array.length - 1)];

/**
 * @param {PRNG} gen
 * @param {number} len
 * @return {Uint8Array}
 */
const uint8Array = (gen, len) => {
  const buf = createUint8ArrayFromLen(len);
  for (let i = 0; i < buf.length; i++) {
    buf[i] = int32(gen, 0, BITS8);
  }
  return buf
};

/**
 * @param {PRNG} gen
 * @param {number} len
 * @return {Uint32Array}
 */
const uint32Array = (gen, len) => new Uint32Array(uint8Array(gen, len * 4).buffer);

/**
 * Utility helpers for generating statistics.
 *
 * @module statistics
 */

/**
 * @param {Array<number>} arr Array of values
 * @return {number} Returns null if the array is empty
 */
const median = arr => arr.length === 0 ? NaN : (arr.length % 2 === 1 ? arr[(arr.length - 1) / 2] : (arr[floor((arr.length - 1) / 2)] + arr[ceil((arr.length - 1) / 2)]) / 2);

/**
 * @param {Array<number>} arr
 * @return {number}
 */
const average = arr => arr.reduce(add$1, 0) / arr.length;

/**
 * Utility helpers to work with promises.
 *
 * @module promise
 */

/**
 * @template T
 * @callback PromiseResolve
 * @param {T|PromiseLike<T>} [result]
 */

/**
 * @template T
 * @param {function(PromiseResolve<T>,function(Error):void):any} f
 * @return {Promise<T>}
 */
const create$4 = f => /** @type {Promise<T>} */ (new Promise(f));

/**
 * @param {function(function():void,function(Error):void):void} f
 * @return {Promise<void>}
 */
const createEmpty = f => new Promise(f);

/**
 * `Promise.all` wait for all promises in the array to resolve and return the result
 * @template T
 * @param {Array<Promise<T>>} arrp
 * @return {Promise<Array<T>>}
 */
const all = arrp => Promise.all(arrp);

/**
 * @param {Error} [reason]
 * @return {Promise<never>}
 */
const reject = reason => Promise.reject(reason);

/**
 * @template T
 * @param {T|void} res
 * @return {Promise<T|void>}
 */
const resolve = res => Promise.resolve(res);

/**
 * @template T
 * @param {T} res
 * @return {Promise<T>}
 */
const resolveWith = res => Promise.resolve(res);

/**
 * @todo Next version, reorder parameters: check, [timeout, [intervalResolution]]
 *
 * @param {number} timeout
 * @param {function():boolean} check
 * @param {number} [intervalResolution]
 * @return {Promise<void>}
 */
const until = (timeout, check, intervalResolution = 10) => create$4((resolve, reject) => {
  const startTime = getUnixTime();
  const hasTimeout = timeout > 0;
  const untilInterval = () => {
    if (check()) {
      clearInterval(intervalHandle);
      resolve();
    } else if (hasTimeout) {
      /* istanbul ignore else */
      if (getUnixTime() - startTime > timeout) {
        clearInterval(intervalHandle);
        reject(new Error('Timeout'));
      }
    }
  };
  const intervalHandle = setInterval(untilInterval, intervalResolution);
});

/**
 * @param {number} timeout
 * @return {Promise<undefined>}
 */
const wait = timeout => create$4((resolve, reject) => setTimeout(resolve, timeout));

/**
 * Checks if an object is a promise using ducktyping.
 *
 * Promises are often polyfilled, so it makes sense to add some additional guarantees if the user of this
 * library has some insane environment where global Promise objects are overwritten.
 *
 * @param {any} p
 * @return {boolean}
 */
const isPromise = p => p instanceof Promise || (p && p.then && p.catch && p.finally);

/**
 * Testing framework with support for generating tests.
 *
 * ```js
 * // test.js template for creating a test executable
 * import { runTests } from 'lib0/testing'
 * import * as log from 'lib0/logging'
 * import * as mod1 from './mod1.test.js'
 * import * as mod2 from './mod2.test.js'

 * import { isBrowser, isNode } from 'lib0/environment.js'
 *
 * if (isBrowser) {
 *   // optional: if this is ran in the browser, attach a virtual console to the dom
 *   log.createVConsole(document.body)
 * }
 *
 * runTests({
 *  mod1,
 *  mod2,
 * }).then(success => {
 *   if (isNode) {
 *     process.exit(success ? 0 : 1)
 *   }
 * })
 * ```
 *
 * ```js
 * // mod1.test.js
 * /**
 *  * runTests automatically tests all exported functions that start with "test".
 *  * The name of the function should be in camelCase and is used for the logging output.
 *  *
 *  * @param {t.TestCase} tc
 *  *\/
 * export const testMyFirstTest = tc => {
 *   t.compare({ a: 4 }, { a: 4 }, 'objects are equal')
 * }
 * ```
 *
 * Now you can simply run `node test.js` to run your test or run test.js in the browser.
 *
 * @module testing
 */

const extensive = hasConf('extensive');

/* istanbul ignore next */
const envSeed = hasParam('--seed') ? Number.parseInt(getParam('--seed', '0')) : null;

class TestCase {
  /**
   * @param {string} moduleName
   * @param {string} testName
   */
  constructor (moduleName, testName) {
    /**
     * @type {string}
     */
    this.moduleName = moduleName;
    /**
     * @type {string}
     */
    this.testName = testName;
    this._seed = null;
    this._prng = null;
  }

  resetSeed () {
    this._seed = null;
    this._prng = null;
  }

  /**
   * @type {number}
   */
  /* istanbul ignore next */
  get seed () {
    /* istanbul ignore else */
    if (this._seed === null) {
      /* istanbul ignore next */
      this._seed = envSeed === null ? uint32$1() : envSeed;
    }
    return this._seed
  }

  /**
   * A PRNG for this test case. Use only this PRNG for randomness to make the test case reproducible.
   *
   * @type {prng.PRNG}
   */
  get prng () {
    /* istanbul ignore else */
    if (this._prng === null) {
      this._prng = create$5(this.seed);
    }
    return this._prng
  }
}

const repetitionTime = Number(getParam('--repetition-time', '50'));
/* istanbul ignore next */
const testFilter = hasParam('--filter') ? getParam('--filter', '') : null;

/* istanbul ignore next */
const testFilterRegExp = testFilter !== null ? new RegExp(testFilter) : new RegExp('.*');

const repeatTestRegex = /^(repeat|repeating)\s/;

/**
 * @param {string} moduleName
 * @param {string} name
 * @param {function(TestCase):void|Promise<any>} f
 * @param {number} i
 * @param {number} numberOfTests
 */
const run = async (moduleName, name, f, i, numberOfTests) => {
  const uncamelized = fromCamelCase(name.slice(4), ' ');
  const filtered = !testFilterRegExp.test(`[${i + 1}/${numberOfTests}] ${moduleName}: ${uncamelized}`);
  /* istanbul ignore if */
  if (filtered) {
    return true
  }
  const tc = new TestCase(moduleName, name);
  const repeat = repeatTestRegex.test(uncamelized);
  const groupArgs = [GREY, `[${i + 1}/${numberOfTests}] `, PURPLE, `${moduleName}: `, BLUE, uncamelized];
  /* istanbul ignore next */
  if (testFilter === null) {
    groupCollapsed(...groupArgs);
  } else {
    group$1(...groupArgs);
  }
  const times = [];
  const start = isomorphic_js.performance.now();
  let lastTime = start;
  /**
   * @type {any}
   */
  let err = null;
  isomorphic_js.performance.mark(`${name}-start`);
  do {
    try {
      const p = f(tc);
      if (isPromise(p)) {
        await p;
      }
    } catch (_err) {
      err = _err;
    }
    const currTime = isomorphic_js.performance.now();
    times.push(currTime - lastTime);
    lastTime = currTime;
    if (repeat && err === null && (lastTime - start) < repetitionTime) {
      tc.resetSeed();
    } else {
      break
    }
  } while (err === null && (lastTime - start) < repetitionTime)
  isomorphic_js.performance.mark(`${name}-end`);
  /* istanbul ignore if */
  if (err !== null && err.constructor !== SkipError) {
    printError(err);
  }
  isomorphic_js.performance.measure(name, `${name}-start`, `${name}-end`);
  groupEnd();
  const duration = lastTime - start;
  let success = true;
  times.sort((a, b) => a - b);
  /* istanbul ignore next */
  const againMessage = isBrowser
    ? `     - ${window.location.host + window.location.pathname}?filter=\\[${i + 1}/${tc._seed === null ? '' : `&seed=${tc._seed}`}`
    : `\nrepeat: npm run test -- --filter "\\[${i + 1}/" ${tc._seed === null ? '' : `--seed ${tc._seed}`}`;
  const timeInfo = (repeat && err === null)
    ? ` - ${times.length} repetitions in ${humanizeDuration(duration)} (best: ${humanizeDuration(times[0])}, worst: ${humanizeDuration(last(times))}, median: ${humanizeDuration(median(times))}, average: ${humanizeDuration(average(times))})`
    : ` in ${humanizeDuration(duration)}`;
  if (err !== null) {
    /* istanbul ignore else */
    if (err.constructor === SkipError) {
      print(GREY, BOLD, 'Skipped: ', UNBOLD, uncamelized);
    } else {
      success = false;
      print(RED, BOLD, 'Failure: ', UNBOLD, UNCOLOR, uncamelized, GREY, timeInfo, againMessage);
    }
  } else {
    print(GREEN, BOLD, 'Success: ', UNBOLD, UNCOLOR, uncamelized, GREY, timeInfo, againMessage);
  }
  return success
};

/**
 * Describe what you are currently testing. The message will be logged.
 *
 * ```js
 * export const testMyFirstTest = tc => {
 *   t.describe('crunching numbers', 'already crunched 4 numbers!') // the optional second argument can describe the state.
 * }
 * ```
 *
 * @param {string} description
 * @param {string} info
 */
const describe = (description, info = '') => print(BLUE, description, ' ', GREY, info);

/**
 * Describe the state of the current computation.
 * ```js
 * export const testMyFirstTest = tc => {
 *   t.info(already crunched 4 numbers!') // the optional second argument can describe the state.
 * }
 * ```
 *
 * @param {string} info
 */
const info = info => describe('', info);

const printCanvas = printCanvas$1;

/**
 * Group outputs in a collapsible category.
 *
 * ```js
 * export const testMyFirstTest = tc => {
 *   t.group('subtest 1', () => {
 *     t.describe('this message is part of a collapsible section')
 *   })
 *   await t.groupAsync('subtest async 2', async () => {
 *     await someaction()
 *     t.describe('this message is part of a collapsible section')
 *   })
 * }
 * ```
 *
 * @param {string} description
 * @param {function(void):void} f
 */
const group = (description, f) => {
  group$1(BLUE, description);
  try {
    f();
  } finally {
    groupEnd();
  }
};

/**
 * Group outputs in a collapsible category.
 *
 * ```js
 * export const testMyFirstTest = async tc => {
 *   t.group('subtest 1', () => {
 *     t.describe('this message is part of a collapsible section')
 *   })
 *   await t.groupAsync('subtest async 2', async () => {
 *     await someaction()
 *     t.describe('this message is part of a collapsible section')
 *   })
 * }
 * ```
 *
 * @param {string} description
 * @param {function(void):Promise<any>} f
 */
const groupAsync = async (description, f) => {
  group$1(BLUE, description);
  try {
    await f();
  } finally {
    groupEnd();
  }
};

/**
 * Measure the time that it takes to calculate something.
 *
 * ```js
 * export const testMyFirstTest = async tc => {
 *   t.measureTime('measurement', () => {
 *     heavyCalculation()
 *   })
 *   await t.groupAsync('async measurement', async () => {
 *     await heavyAsyncCalculation()
 *   })
 * }
 * ```
 *
 * @param {string} message
 * @param {function():void} f
 * @return {number} Returns a promise that resolves the measured duration to apply f
 */
const measureTime = (message, f) => {
  let duration;
  const start = isomorphic_js.performance.now();
  try {
    f();
  } finally {
    duration = isomorphic_js.performance.now() - start;
    print(PURPLE, message, GREY, ` ${humanizeDuration(duration)}`);
  }
  return duration
};

/**
 * Measure the time that it takes to calculate something.
 *
 * ```js
 * export const testMyFirstTest = async tc => {
 *   t.measureTimeAsync('measurement', async () => {
 *     await heavyCalculation()
 *   })
 *   await t.groupAsync('async measurement', async () => {
 *     await heavyAsyncCalculation()
 *   })
 * }
 * ```
 *
 * @param {string} message
 * @param {function():Promise<any>} f
 * @return {Promise<number>} Returns a promise that resolves the measured duration to apply f
 */
const measureTimeAsync = async (message, f) => {
  let duration;
  const start = isomorphic_js.performance.now();
  try {
    await f();
  } finally {
    duration = isomorphic_js.performance.now() - start;
    print(PURPLE, message, GREY, ` ${humanizeDuration(duration)}`);
  }
  return duration
};

/**
 * @template T
 * @param {Array<T>} as
 * @param {Array<T>} bs
 * @param {string} [m]
 * @return {boolean}
 */
const compareArrays = (as, bs, m = 'Arrays match') => {
  if (as.length !== bs.length) {
    fail(m);
  }
  for (let i = 0; i < as.length; i++) {
    if (as[i] !== bs[i]) {
      fail(m);
    }
  }
  return true
};

/**
 * @param {string} a
 * @param {string} b
 * @param {string} [m]
 * @throws {TestError} Throws if tests fails
 */
const compareStrings = (a, b, m = 'Strings match') => {
  if (a !== b) {
    const diff = simpleDiffString(a, b);
    print(GREY, a.slice(0, diff.index), RED, a.slice(diff.index, diff.remove), GREEN, diff.insert, GREY, a.slice(diff.index + diff.remove));
    fail(m);
  }
};

/**
 * @template K,V
 * @param {Object<K,V>} a
 * @param {Object<K,V>} b
 * @param {string} [m]
 * @throws {TestError} Throws if test fails
 */
const compareObjects = (a, b, m = 'Objects match') => { equalFlat(a, b) || fail(m); };

/**
 * @param {any} constructor
 * @param {any} a
 * @param {any} b
 * @param {string} path
 * @throws {TestError}
 */
const compareValues = (constructor, a, b, path) => {
  if (a !== b) {
    fail(`Values ${stringify(a)} and ${stringify(b)} don't match (${path})`);
  }
  return true
};

/**
 * @param {string?} message
 * @param {string} reason
 * @param {string} path
 * @throws {TestError}
 */
const _failMessage = (message, reason, path) => fail(
  message === null
    ? `${reason} ${path}`
    : `${message} (${reason}) ${path}`
);

/**
 * @param {any} a
 * @param {any} b
 * @param {string} path
 * @param {string?} message
 * @param {function(any,any,any,string,any):boolean} customCompare
 */
const _compare = (a, b, path, message, customCompare) => {
  // we don't use assert here because we want to test all branches (istanbul errors if one branch is not tested)
  if (a == null || b == null) {
    return compareValues(null, a, b, path)
  }
  if (a.constructor !== b.constructor) {
    _failMessage(message, 'Constructors don\'t match', path);
  }
  let success = true;
  switch (a.constructor) {
    case ArrayBuffer:
      a = new Uint8Array(a);
      b = new Uint8Array(b);
    // eslint-disable-next-line no-fallthrough
    case Uint8Array: {
      if (a.byteLength !== b.byteLength) {
        _failMessage(message, 'ArrayBuffer lengths match', path);
      }
      for (let i = 0; success && i < a.length; i++) {
        success = success && a[i] === b[i];
      }
      break
    }
    case Set: {
      if (a.size !== b.size) {
        _failMessage(message, 'Sets have different number of attributes', path);
      }
      // @ts-ignore
      a.forEach(value => {
        if (!b.has(value)) {
          _failMessage(message, `b.${path} does have ${value}`, path);
        }
      });
      break
    }
    case Map: {
      if (a.size !== b.size) {
        _failMessage(message, 'Maps have different number of attributes', path);
      }
      // @ts-ignore
      a.forEach((value, key) => {
        if (!b.has(key)) {
          _failMessage(message, `Property ${path}["${key}"] does not exist on second argument`, path);
        }
        _compare(value, b.get(key), `${path}["${key}"]`, message, customCompare);
      });
      break
    }
    case Object:
      if (length$1(a) !== length$1(b)) {
        _failMessage(message, 'Objects have a different number of attributes', path);
      }
      forEach$1(a, (value, key) => {
        if (!hasProperty(b, key)) {
          _failMessage(message, `Property ${path} does not exist on second argument`, path);
        }
        _compare(value, b[key], `${path}["${key}"]`, message, customCompare);
      });
      break
    case Array:
      if (a.length !== b.length) {
        _failMessage(message, 'Arrays have a different number of attributes', path);
      }
      // @ts-ignore
      a.forEach((value, i) => _compare(value, b[i], `${path}[${i}]`, message, customCompare));
      break
    /* istanbul ignore next */
    default:
      if (!customCompare(a.constructor, a, b, path, compareValues)) {
        _failMessage(message, `Values ${stringify(a)} and ${stringify(b)} don't match`, path);
      }
  }
  assert(success, message);
  return true
};

/**
 * @template T
 * @param {T} a
 * @param {T} b
 * @param {string?} [message]
 * @param {function(any,T,T,string,any):boolean} [customCompare]
 */
const compare = (a, b, message = null, customCompare = compareValues) => _compare(a, b, 'obj', message, customCompare);

/* istanbul ignore next */
/**
 * @param {boolean} condition
 * @param {string?} [message]
 * @throws {TestError}
 */
const assert = (condition, message = null) => condition || fail(`Assertion failed${message !== null ? `: ${message}` : ''}`);

/**
 * @param {function():void} f
 * @throws {TestError}
 */
const fails = f => {
  let err = null;
  try {
    f();
  } catch (_err) {
    err = _err;
    print(GREEN, '⇖ This Error was expected');
  }
  /* istanbul ignore if */
  if (err === null) {
    fail('Expected this to fail');
  }
};

/**
 * @param {Object<string, Object<string, function(TestCase):void|Promise<any>>>} tests
 */
const runTests = async tests => {
  const numberOfTests = map$3(tests, mod => map$3(mod, f => /* istanbul ignore next */ f ? 1 : 0).reduce(add$1, 0)).reduce(add$1, 0);
  let successfulTests = 0;
  let testnumber = 0;
  const start = isomorphic_js.performance.now();
  for (const modName in tests) {
    const mod = tests[modName];
    for (const fname in mod) {
      const f = mod[fname];
      /* istanbul ignore else */
      if (f) {
        const repeatEachTest = 1;
        let success = true;
        for (let i = 0; success && i < repeatEachTest; i++) {
          success = await run(modName, fname, f, testnumber, numberOfTests);
        }
        testnumber++;
        /* istanbul ignore else */
        if (success) {
          successfulTests++;
        }
      }
    }
  }
  const end = isomorphic_js.performance.now();
  print('');
  const success = successfulTests === numberOfTests;
  /* istanbul ignore next */
  if (success) {
    /* istanbul ignore next */
    print(GREEN, BOLD, 'All tests successful!', GREY, UNBOLD, ` in ${humanizeDuration(end - start)}`);
    /* istanbul ignore next */
    printImgBase64(nyanCatImage, 50);
  } else {
    const failedTests = numberOfTests - successfulTests;
    print(RED, BOLD, `> ${failedTests} test${failedTests > 1 ? 's' : ''} failed`);
  }
  return success
};

class TestError extends Error {}

/**
 * @param {string} reason
 * @throws {TestError}
 */
const fail = reason => {
  print(RED, BOLD, 'X ', UNBOLD, reason);
  throw new TestError('Test Failed')
};

class SkipError extends Error {}

/**
 * @param {boolean} cond If true, this tests will be skipped
 * @throws {SkipError}
 */
const skip = (cond = true) => {
  if (cond) {
    throw new SkipError('skipping..')
  }
};

// eslint-disable-next-line
const nyanCatImage = 'R0lGODlhjABMAPcAAMiSE0xMTEzMzUKJzjQ0NFsoKPc7//FM/9mH/z9x0HIiIoKCgmBHN+frGSkZLdDQ0LCwsDk71g0KCUzDdrQQEOFz/8yYdelmBdTiHFxcXDU2erR/mLrTHCgoKK5szBQUFNgSCTk6ymfpCB9VZS2Bl+cGBt2N8kWm0uDcGXhZRUvGq94NCFPhDiwsLGVlZTgqIPMDA1g3aEzS5D6xAURERDtG9JmBjJsZGWs2AD1W6Hp6eswyDeJ4CFNTU1LcEoJRmTMzSd14CTg5ser2GmDzBd17/xkZGUzMvoSMDiEhIfKruCwNAJaWlvRzA8kNDXDrCfi0pe1U/+GS6SZrAB4eHpZwVhoabsx9oiYmJt/TGHFxcYyMjOid0+Zl/0rF6j09PeRr/0zU9DxO6j+z0lXtBtp8qJhMAEssLGhoaPL/GVn/AAsWJ/9/AE3Z/zs9/3cAAOlf/+aa2RIyADo85uhh/0i84WtrazQ0UyMlmDMzPwUFBe16BTMmHau0E03X+g8pMEAoS1MBAf++kkzO8pBaqSZoe9uB/zE0BUQ3Sv///4WFheuiyzo880gzNDIyNissBNqF/8RiAOF2qG5ubj0vL1z6Avl5ASsgGkgUSy8vL/8n/z4zJy8lOv96uEssV1csAN5ZCDQ0Wz1a3tbEGHLeDdYKCg4PATE7PiMVFSoqU83eHEi43gUPAOZ8reGogeKU5dBBC8faHEez2lHYF4bQFMukFtl4CzY3kkzBVJfMGZkAAMfSFf27mP0t//g4/9R6Dfsy/1DRIUnSAPRD/0fMAFQ0Q+l7rnbaD0vEntCDD6rSGtO8GNpUCU/MK07LPNEfC7RaABUWWkgtOst+71v9AfD7GfDw8P19ATtA/NJpAONgB9yL+fm6jzIxMdnNGJxht1/2A9x//9jHGOSX3+5tBP27l35+fk5OTvZ9AhYgTjo0PUhGSDs9+LZjCFf2Aw0IDwcVAA8PD5lwg9+Q7YaChC0kJP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpGNEM2MUEyMzE0QTRFMTExOUQzRkE3QTBCRDNBMjdBQyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpERjQ0NEY0QkI2MTcxMUUxOUJEQkUzNUNGQTkwRTU2MiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpERjQ0NEY0QUI2MTcxMUUxOUJEQkUzNUNGQTkwRTU2MiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1OEE3RTIwRjcyQTlFMTExOTQ1QkY2QTU5QzVCQjJBOSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGNEM2MUEyMzE0QTRFMTExOUQzRkE3QTBCRDNBMjdBQyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAkKABEAIf4jUmVzaXplZCBvbiBodHRwczovL2V6Z2lmLmNvbS9yZXNpemUALAAAAACMAEwAAAj/ACMIHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXLkxEcuXMAm6jElTZaKZNXOOvOnyps6fInECHdpRKNGjSJMqXZrSKNOnC51CnUq1qtWrWLNC9GmQq9avYMOKHUs2aFmmUs8SlcC2rdu3cNWeTEG3rt27eBnIHflBj6C/gAMLHpxCz16QElJw+7tom+PHkCOP+8utiuHDHRP/5WICgefPkIYV8RAjxudtkwVZjqCnNeaMmheZqADm8+coHn5kyPBt2udFvKrc+7A7gITXFzV77hLF9ucYGRaYo+FhWhHPUKokobFgQYbjyCsq/3fuHHr3BV88HMBeZd357+HFpxBEvnz0961b3+8OP37DtgON5xxznpl3ng5aJKiFDud5B55/Ct3TQwY93COQgLZV0AUC39ihRYMggjhJDw9CeNA9kyygxT2G6TGfcxUY8pkeH3YHgTkMNrgFBJOYs8Akl5l4Yoor3mPki6BpUsGMNS6QiA772WjNPR8CSRAjWBI0B5ZYikGQGFwyMseVYWoZppcDhSkmmVyaySWaAqk5pkBbljnQlnNYEZ05fGaAJGieVQAMjd2ZY+R+X2Rgh5FVBhmBG5BGKumklFZq6aWYZqrpppTOIQQNNPjoJ31RbGibIRXQuIExrSSY4wI66P9gToJlGHOFo374MQg2vGLjRa65etErNoMA68ew2Bi7a6+/Aitsr8UCi6yywzYb7LDR5jotsMvyau0qJJCwGw0vdrEkeTRe0UknC7hQYwYMQrmAMZ2U4WgY+Lahbxt+4Ovvvm34i68fAAscBsD9+kvwvgYDHLDACAu8sL4NFwzxvgkP3EYhhYzw52dFhOPZD5Ns0Iok6PUwyaIuTJLBBwuUIckG8RCkhhrUHKHzEUTcfLM7Ox/hjs9qBH0E0ZUE3bPPQO9cCdFGIx300EwH/bTPUfuc9M5U30zEzhN87NkwcDyXgY/oxaP22vFQIR2JBT3xBDhEUyO33FffXMndT1D/QzTfdPts9915qwEO3377DHjdfBd++N2J47y44Ij7PMN85UgBxzCeQQKJbd9wFyKI6jgqUBqoD6G66qinvvoQ1bSexutDyF4N7bLTHnvruLd+++u5v76766vb3jvxM0wxnyBQxHEued8Y8cX01Fc/fQcHZaG97A1or30DsqPgfRbDpzF+FtyPD37r4ns/fDXnp+/9+qif//74KMj/fRp9TEIDAxb4ixIWQcACFrAMFkigAhPIAAmwyHQDYYMEJ0jBClrwghjMoAY3yMEOYhAdQaCBFtBAAD244oQoTKEKV5iCbizEHjCkoCVgCENLULAJNLTHNSZ4jRzaQ4Y5tOEE+X24Qwn2MIdApKEQJUhEHvowiTBkhh7QVqT8GOmKWHwgFiWghR5AkCA+DKMYx0jGMprxjGhMYw5XMEXvGAZF5piEhQyih1CZ4wt6kIARfORFhjwDBoCEQQkIUoJAwmAFBDEkDAhSCkMOciCFDCQiB6JIgoDAkYQ0JAgSaUhLYnIgFLjH9AggkHsQYHo1oyMVptcCgUjvCx34opAWkp/L1BIhtxxILmfJy17KxJcrSQswhykWYRLzI8Y8pjKXycxfNvOZMEkmNC0izWlSpJrWlAg2s8kQnkRgJt7kpja92ZNwivOcNdkmOqOyzoyos50IeSc850nPegIzIAAh+QQJCgARACwAAAAAjABMAAAI/wAjCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJcmKikihTZkx0UqXLlw5ZwpxJ02DLmjhz6twJkqVMnz55Ch1KtGhCmUaTYkSqtKnJm05rMl0aVefUqlhtFryatavXr2DDHoRKkKzYs2jTqpW61exani3jun0rlCvdrhLy6t3Lt+9dlykCCx5MuDCDvyU/6BHEuLHjx5BT6EEsUkIKbowXbdvMubPncYy5VZlM+aNlxlxMIFjNGtKwIggqDGO9DbSg0aVNpxC0yEQFMKxZRwmHoEiU4AgW8cKdu+Pp1V2OI6c9bdq2cLARQGEeIV7zjM+nT//3oEfPNDiztTOXoMf7d4vhxbP+ts6cORrfIK3efq+8FnN2kPbeRPEFF918NCywgBZafLNfFffEM4k5C0wi4IARFchaBV0gqGCFDX6zQQqZZPChhRgSuBtyFRiC3DcJfqgFDTTSYOKJF6boUIGQaFLBizF+KOSQKA7EyJEEzXHkkWIQJMaSjMxBEJSMJAllk0ZCKWWWS1q5JJYCUbllBEpC6SWTEehxzz0rBqdfbL1AEsONQ9b5oQ73DOTGnnz26eefgAYq6KCEFmoooCHccosdk5yzYhQdBmfIj3N++AAEdCqoiDU62LGAOXkK5Icfg2BjKjZejDqqF6diM4iqfrT/ig2spZ6aqqqsnvqqqrLS2uqtq7a666i9qlqrqbeeQEIGN2awYhc/ilepghAssM6JaCwAQQ8ufBpqBGGE28a4bfgR7rnktnFuuH6ku24Y6Zp7brvkvpuuuuvGuy6949rrbr7kmltHIS6Yw6AWjgoyXRHErTYnPRtskMEXdLrQgzlffKHDBjZ8q4Ya1Bwh8hFEfPyxOyMf4Y7JaqR8BMuVpFyyySiPXAnLLsOc8so0p3yzyTmbHPPIK8sxyYJr9tdmcMPAwdqcG3TSyQZ2fniF1N8+8QQ4LFOjtdY/f1zJ109QwzLZXJvs9ddhqwEO2WabjHbXZLf99tdxgzy32k8Y/70gK+5UMsNu5UiB3mqQvIkA1FJLfO0CFH8ajxZXd/JtGpgPobnmmGe++RDVdJ7G50OIXg3popMeeueod37656l/vrrnm5uOOgZIfJECBpr3sZsgUMQRLXLTEJJBxPRkkETGRmSS8T1a2CCPZANlYb3oDVhvfQOio6B9FrOn8X0W2H/Pfefeaz97NeOXr/35mI+//vcouJ9MO7V03gcDFjCmxCIADGAAr1CFG2mBWQhEoA600IMLseGBEIygBCdIwQpa8IIYzKAGMcgDaGTMFSAMoQhDaAE9HOyEKOyBewZijxZG0BItbKElItiEGNrjGhC8hg3t8UIbzhCCO8ThA+Z1aMMexvCHDwxiDndoRBk+8A03Slp/1CTFKpaHiv3JS9IMssMuevGLYAyjGMdIxjJ6EYoK0oNivmCfL+RIINAD0GT0YCI8rdAgz4CBHmFQAoKUYI8wWAFBAAkDgpQCkH0cyB/3KMiBEJIgIECkHwEJgkECEpKSVKQe39CCjH0gTUbIWAsQcg8CZMw78TDlF76lowxdUSBXfONArrhC9pSnlbjMpS7rssuZzKWXPQHKL4HZEWESMyXDPKZHkqnMZjrzLnZ5pjSnSc1qWmQuzLSmQrCpzW5685vfjCY4x0nOcprznB4JCAAh+QQJCgBIACwAAAAAjABMAAAI/wCRCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJcmGiRCVTqsyIcqXLlzBjypxJs6bNmzgPtjR4MqfPn0CDCh1KtKjNnkaTPtyptKlToEyfShUYderTqlaNnkSJNGvTrl6dYg1bdCzZs2jTqvUpoa3bt3DjrnWZoq7du3jzMphb8oMeQYADCx5MOIUeviIlpOAGeNG2x5AjSx4HmFuVw4g/KgbMxQSCz6AhDSuCoMIw0NsoC7qcWXMKQYtMVAADGnSUcAiKRKmNYBEv1q07bv7cZTfvz9OSfw5HGgEU1vHiBdc4/Djvb3refY5y2jlrPeCnY/+sbv1zjAzmzFGZBgnS5+f3PqTvIUG8RfK1i5vPsGDBpB8egPbcF5P0l0F99jV0z4ILCoQfaBV0sV9/C7jwwzcYblAFGhQemGBDX9BAAwH3HKbHa7xVYEht51FYoYgictghgh8iZMQ95vSnBYP3oBiaJhWwyJ+LRLrooUGlwKCkkgSVsCQMKxD0JAwEgfBkCU0+GeVAUxK0wpVZLrmlQF0O9OWSTpRY4ALp0dCjILy5Vxow72hR5J0U2oGZQPb06eefgAYq6KCEFmrooYj6CQMIICgAIw0unINiFBLWZkgFetjZnzU62EEkEw/QoIN/eyLh5zWoXmPJn5akek0TrLr/Cqirq/rZaqqw2ppqrX02QWusuAKr6p++7trnDtAka8o5NKDYRZDHZUohBBkMWaEWTEBwj52TlMrGt+CGK+645JZr7rnopquuuejU9YmPtRWBGwKZ2rCBDV98IeMCPaChRb7ybCBPqVkUnMbBaTRQcMENIJwGCgtnUY3DEWfhsMILN4wwxAtPfHA1EaNwccQaH8xxwR6nAfLCIiOMMcMI9wEvaMPA8VmmV3TSCZ4UGtNJGaV+PMTQQztMNNFGH+1wNUcPkbTSCDe9tNRRH51yGlQLDfXBR8ssSDlSwNFdezdrkfPOX7jAZjzcUrGAz0ATBA44lahhtxrUzD133XdX/6I3ONTcrcbf4Aiet96B9/134nb/zbfdh8/NuBp+I3535HQbvrjdM0zxmiBQxAFtbR74u8EGC3yRSb73qPMFAR8sYIM8KdCIBORH5H4EGYITofsR7gj++xGCV/I773f7rnvwdw9f/O9E9P7742o4f7c70AtOxhEzuEADAxYApsQi5JdPvgUb9udCteyzX2EAtiMRxvxt1N+GH/PP74f9beRPP//+CwP/8Je//dkvgPzrn/8G6D8D1g+BAFyg/QiYv1XQQAtoIIAeXMHBDnqQg1VQhxZGSMISjlCDBvGDHwaBjRZiwwsqVKEXXIiNQcTQDzWg4Q1Z6EIYxnCGLrRhDP9z6MId0tCHMqShEFVIxBYasYc3PIEecrSAHZUIPDzK4hV5pAcJ6IFBCHGDGMdIxjKa8YxoTKMa18jGNqJxDlNcQAYOc49JmGMS9ziIHr6Qni+Axwg56kGpDMKIQhIkAoUs5BwIIoZEMiICBHGkGAgyB0cuciCNTGRBJElJSzLSkZtM5CQHUslECuEe+SKAQO5BgHxJxyB6oEK+WiAQI+SrA4Os0UPAEx4k8DKXAvklQXQwR2DqMiVgOeZLkqnMlTCzmdCcy1aQwJVpRjMk06zmM6/pEbNwEyTb/OZHwinOjpCznNREJzaj4k11TiSZ7XSnPHESz3lW5JnntKc+94kTFnjyUyP1/OdSBErQghr0oB0JCAAh+QQFCgAjACwAAAAAjABMAAAI/wBHCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJkmCikihTWjw5giVLlTBjHkz0UmBNmThz6tzJs6fPkTRn3vxJtKjRo0iTbgxqUqlTiC5tPt05dOXUnkyval2YdatXg12/ih07lmZQs2bJql27NSzbqW7fOo0rN2nViBLy6t3Lt29dmfGqCB5MuLBhBvH+pmSQQpAgKJAjS54M2XEVBopLSmjseBGCz6BDi37lWFAVPZlHbnb8SvRnSL0qIKjQK/Q2y6hTh1z9ahuYKK4rGEJgSHboV1BO697d+HOFLq4/e/j2zTmYz8lR37u3vOPq6KGnEf/68mXaNjrAEWT/QL5b943fwX+OkWGBOT3TQie/92HBggwSvCeRHgQSKFB8osExzHz12UdDddhVQYM5/gEoYET3ZDBJBveghmBoRRhHn38LaKHFDyimYIcWJFp44UP39KCFDhno0WFzocERTmgjkrhhBkCy2GKALzq03Tk6LEADFffg+NowshU3jR1okGjllf658EWRMN7zhX80NCkIeLTpISSWaC4wSW4ElQLDm28SVAKcMKxAEJ0wEAQCnSXISaedA+FJ0Ap8+gknoAIJOhChcPYpUCAdUphBc8PAEZ2ZJCZC45UQWIPpmgTZI+qopJZq6qmopqrqqqy2eioMTtz/QwMNmTRXQRGXnqnIFw0u0EOVC9zDIqgDjXrNsddYQqolyF7TxLLNltqssqMyi+yz1SJLrahNTAvttd8mS2q32pJ6ATTQfCKma10YZ+YGV1wRJIkuzAgkvPKwOQIb/Pbr778AByzwwAQXbPDBBZvxSWNSbBMOrghEAR0CZl7RSSclJlkiheawaEwnZeibxchplJxGAyOP3IDJaaCQchbVsPxyFiyjnPLKJruccswlV/MyCjW/jHPJOo/Mcxo+pwy0yTarbHIfnL2ioGvvaGExxrzaJ+wCdvT3ccgE9TzE2GOzTDbZZp/NcjVnD5G22ia3vbbccZ99dBp0iw13yWdD/10aF5BERx899CzwhQTxxHMP4hL0R08GlxQEDjiVqGG5GtRMPnnll1eiOTjUXK7G5+CInrnmoXf+eeqWf8655adPzroanqN+eeyUm7665TNMsQlnUCgh/PDCu1JFD/6ZqPzyvhJgEOxHRH8EGaITIf0R7oh+/RGiV3I99ZdbL332l2/f/fVEVH/962qYf7k76ItOxhEzuABkBhbkr//++aeQyf0ADKDzDBKGArbhgG3wQwEL6AcEtmGBBnQgBMPgQAUusIEInKADHwjBCkIQgwfUoAQ7iEALMtAPa5iEfbTQIT0YgTxGKJAMvfSFDhDoHgT4AgE6hBA/+GEQ2AgiNvy84EMfekGI2BhEEf1QAyQuEYhCJGIRjyhEJRaxiUJ8IhKlaEQkWtGHWAyiFqO4RC/UIIUl2s4H9PAlw+lrBPHQQ4UCtDU7vJEgbsijHvfIxz768Y+ADKQgB0lIQGJjDdvZjkBstJ3EHCSRRLLRHQnCiEoSJAKVrOQcCCKGTDIiApTMpBgIMgdPbnIgncxkQTw5yoGUMpOnFEgqLRnKSrZSIK/U5Ag+kLjEDaSXCQGmQHzJpWIasyV3OaYyl8nMZi7nLsl0ZkagKc1qWvOa2JxLNLPJzW6+ZZvevAhdwrkStJCTI2gZ5zknos51shOc7oynPOdJz3ra857hDAgAOw==';

/**
 * @param {t.TestCase} tc
 */
const testAppend = tc => {
  const arr = [1, 2, 3];
  appendTo(arr, arr.slice());
  compareArrays(arr, [1, 2, 3, 1, 2, 3]);
};

/**
 * @param {t.TestCase} tc
 */
const testflatten = tc => {
  const arr = [[1, 2, 3], [4]];
  compareArrays(flatten(arr), [1, 2, 3, 4]);
};

/**
 * @param {t.TestCase} tc
 */
const testIsArray = tc => {
  assert(isArray([]));
  assert(isArray([1]));
  assert(isArray(Array.from(new Set([3]))));
  assert(!isArray(1));
  assert(!isArray(0));
  assert(!isArray(''));
};

var array = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testAppend: testAppend,
  testflatten: testflatten,
  testIsArray: testIsArray
});

const testLogging = () => {
  print(BLUE, 'blue ');
  print(BLUE, 'blue ', BOLD, 'blue,bold');
  print(GREEN, RED, 'red ', 'red');
  print(ORANGE, 'orange');
  print(BOLD, 'bold ', UNBOLD, 'nobold');
  print(GREEN, 'green ', UNCOLOR, 'nocolor');
  print('expecting objects from now on!');
  print({ 'my-object': 'isLogged' });
  print(GREEN, 'green ', { 'my-object': 'isLogged' });
  print(GREEN, 'green ', { 'my-object': 'isLogged' }, 'unformatted');
  print(BLUE, BOLD, 'number', 1);
  print(BLUE, BOLD, 'number', 1, {}, 's', 2);
  print({}, 'dtrn');
};

var logging = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testLogging: testLogging
});

/**
 * @param {t.TestCase} tc
 */
const testLowercaseTransformation = tc => {
  compareStrings(fromCamelCase('ThisIsATest', ' '), 'this is a test');
  compareStrings(fromCamelCase('Testing', ' '), 'testing');
  compareStrings(fromCamelCase('testingThis', ' '), 'testing this');
  compareStrings(fromCamelCase('testYAY', ' '), 'test y a y');
};

/**
 * @param {t.TestCase} tc
 */
const testRepeatStringUtf8Encoding = tc => {
  skip(!utf8TextDecoder);
  const str = utf16String(tc.prng, 1000000);
  let nativeResult, polyfilledResult;
  measureTime('TextEncoder utf8 encoding', () => {
    nativeResult = _encodeUtf8Native(str);
  });
  measureTime('Polyfilled utf8 encoding', () => {
    polyfilledResult = _encodeUtf8Polyfill(str);
  });
  compare(nativeResult, polyfilledResult, 'Encoded utf8 buffers match');
};

/**
 * @param {t.TestCase} tc
 */
const testRepeatStringUtf8Decoding = tc => {
  skip(!utf8TextDecoder);
  const buf = encodeUtf8(utf16String(tc.prng, 1000000));
  let nativeResult, polyfilledResult;
  measureTime('TextEncoder utf8 decoding', () => {
    nativeResult = _decodeUtf8Native(buf);
  });
  measureTime('Polyfilled utf8 decoding', () => {
    polyfilledResult = _decodeUtf8Polyfill(buf);
  });
  compare(nativeResult, polyfilledResult, 'Decoded utf8 buffers match');
};

/**
 * @param {t.TestCase} tc
 */
const testBomEncodingDecoding = tc => {
  const bomStr = '﻿bom';
  assert(bomStr.length === 4);
  const polyfilledResult = _decodeUtf8Polyfill(_encodeUtf8Polyfill(bomStr));
  assert(polyfilledResult.length === 4);
  assert(polyfilledResult === bomStr);
  if (utf8TextDecoder) {
    const nativeResult = _decodeUtf8Native(_encodeUtf8Native(bomStr));
    assert(nativeResult === polyfilledResult);
  }
};

/**
 * @param {t.TestCase} tc
 */
const testSplice = tc => {
  const initial = 'xyz';
  compareStrings(splice(initial, 0, 2), 'z');
  compareStrings(splice(initial, 0, 2, 'u'), 'uz');
};

var string = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testLowercaseTransformation: testLowercaseTransformation,
  testRepeatStringUtf8Encoding: testRepeatStringUtf8Encoding,
  testRepeatStringUtf8Decoding: testRepeatStringUtf8Decoding,
  testBomEncodingDecoding: testBomEncodingDecoding,
  testSplice: testSplice
});

/* global BigInt */

/**
 * @type {Array<function(prng.PRNG, number, boolean):any>}
 */
let genAnyLookupTable = [
  gen => BigInt(int53(gen, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER)), // TYPE 122
  _gen => undefined, // TYPE 127
  _gen => null, // TYPE 126
  gen => int53(gen, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER), // TYPE 125
  gen => real53(gen), // TYPE 124 and 123
  _gen => true, // TYPE 121
  _gen => false, // TYPE 120
  gen => utf16String(gen), // TYPE 119
  (gen, depth, toJsonCompatible) => ({ val: genAny(gen, depth + 1, toJsonCompatible) }), // TYPE 118
  (gen, depth, toJsonCompatible) => Array.from({ length: uint32(gen, 0, 20 - depth) }).map(() => genAny(gen, depth + 1, toJsonCompatible)), // TYPE 117
  gen => uint8Array(gen, uint32(gen, 0, 50)) // TYPE 116
];

const genAnyLookupTableJsonCompatible = genAnyLookupTable.slice(1);

if (typeof BigInt === 'undefined') {
  genAnyLookupTable = genAnyLookupTable.slice(1);
}

/**
 * @param {prng.PRNG} gen
 * @param {number} _depth The current call-depth
 */
const genAny = (gen, _depth = 0, toJsonCompatible = false) => oneOf(gen, toJsonCompatible ? genAnyLookupTableJsonCompatible : genAnyLookupTable)(gen, _depth, toJsonCompatible);

/**
 * Check if binary encoding is compatible with golang binary encoding - binary.PutVarUint.
 *
 * Result: is compatible up to 32 bit: [0, 4294967295] / [0, 0xffffffff]. (max 32 bit unsigned integer)
 */
const testGolangBinaryEncodingCompatibility = () => {
  const tests = [
    { in: 0, out: [0] },
    { in: 1, out: [1] },
    { in: 128, out: [128, 1] },
    { in: 200, out: [200, 1] },
    { in: 32, out: [32] },
    { in: 500, out: [244, 3] },
    { in: 256, out: [128, 2] },
    { in: 700, out: [188, 5] },
    { in: 1024, out: [128, 8] },
    { in: 1025, out: [129, 8] },
    { in: 4048, out: [208, 31] },
    { in: 5050, out: [186, 39] },
    { in: 1000000, out: [192, 132, 61] },
    { in: 34951959, out: [151, 166, 213, 16] },
    { in: 2147483646, out: [254, 255, 255, 255, 7] },
    { in: 2147483647, out: [255, 255, 255, 255, 7] },
    { in: 2147483648, out: [128, 128, 128, 128, 8] },
    { in: 2147483700, out: [180, 128, 128, 128, 8] },
    { in: 4294967294, out: [254, 255, 255, 255, 15] },
    { in: 4294967295, out: [255, 255, 255, 255, 15] }
  ];
  tests.forEach(test => {
    const encoder = createEncoder();
    writeVarUint(encoder, test.in);
    const buffer = toUint8Array(encoder);
    assert(buffer.byteLength === test.out.length);
    assert(buffer.length > 0);
    for (let j = 0; j < buffer.length; j++) {
      assert(buffer[j] === test.out[j]);
    }
  });
};

/**
 * @template T
 * @param {string} testname
 * @param {function(encoding.Encoder, T):void} write
 * @param {function(decoding.Decoder):T} read
 * @param {T} val
 * @param {boolean} doLog
 */
function test (testname, write, read, val, doLog = true) {
  const encoder = createEncoder();
  write(encoder, val);
  const reader = createDecoder(toUint8Array(encoder));
  const result = read(reader);
  const utf8ByteLength$1 = utf8ByteLength(val + '');
  const binaryByteLength = length(encoder);
  if (doLog) {
    describe(testname, ` utf8 encode: ${utf8ByteLength$1} bytes / binary encode: ${binaryByteLength} bytes`);
  }
  compare(val, result);
  return {
    utf8ByteLength: utf8ByteLength$1,
    binaryByteLength
  }
}

/**
 * @param {string} s
 */
const testVarString = s => {
  const encoder = createEncoder();
  writeVarString(encoder, s);
  const decoder = createDecoder(toUint8Array(encoder));
  const peeked = peekVarString(decoder);
  const result = readVarString(decoder);
  compareStrings(s, result);
  compareStrings(s, peeked);
};

const testVerifyLen = () => {
  const encoder = createEncoder();
  const vLen = encoder.cbuf.length + 1;
  const bufsLen = encoder.bufs.length;
  verifyLen(encoder, vLen);
  assert(encoder.cbuf.length >= vLen);
  assert(encoder.bufs.length >= bufsLen);
};

const testStringEncodingPerformanceNativeVsPolyfill = () => {
  const largeRepetitions = 20;
  let bigstr = '';
  for (let i = 0; i < 10000; i++) {
    bigstr += i;
  }

  const customTime = measureTime('large dataset: custom encoding', () => {
    const encoder = createEncoder();
    for (let i = 0; i < largeRepetitions; i++) {
      _writeVarStringPolyfill(encoder, 'i');
      _writeVarStringPolyfill(encoder, bigstr);
    }
  });
  const nativeTime = measureTime('large dataset: native encoding', () => {
    const encoder = createEncoder();
    for (let i = 0; i < largeRepetitions; i++) {
      _writeVarStringNative(encoder, 'i');
      _writeVarStringNative(encoder, bigstr);
    }
  });
  assert(nativeTime < customTime, 'We expect native encoding to be more performant for large data sets');

  const smallRepetitions = 100000;
  const customTimeSmall = measureTime('small dataset: custom encoding', () => {
    const encoder = createEncoder();
    for (let i = 0; i < smallRepetitions; i++) {
      _writeVarStringPolyfill(encoder, 'i');
      _writeVarStringPolyfill(encoder, 'bb');
      _writeVarStringPolyfill(encoder, 'ccc');
    }
  });
  const nativeTimeSmall = measureTime('small dataset: native encoding', () => {
    const encoder = createEncoder();
    for (let i = 0; i < smallRepetitions; i++) {
      _writeVarStringNative(encoder, 'i');
      _writeVarStringNative(encoder, 'bb');
      _writeVarStringNative(encoder, 'ccc');
    }
  });
  assert(nativeTimeSmall < customTimeSmall * 2, 'We expect native encoding to be not much worse than custom encoding for small data sets');
};

const testDecodingPerformanceNativeVsPolyfill = () => {
  const iterationsSmall = 10000;
  const iterationsLarge = 1000;
  let bigstr = '';
  for (let i = 0; i < 10000; i++) {
    bigstr += i;
  }
  const encoder = createEncoder();
  const encoderLarge = createEncoder();
  for (let i = 0; i < iterationsSmall; i++) {
    writeVarString(encoder, 'i');
    writeVarString(encoder, 'bb');
    writeVarString(encoder, 'ccc');
  }
  for (let i = 0; i < iterationsLarge; i++) {
    writeVarString(encoderLarge, bigstr);
  }
  const buf = toUint8Array(encoder);
  const bufLarge = toUint8Array(encoderLarge);

  const nativeTimeSmall = measureTime('small dataset: native encoding', () => {
    const decoder = createDecoder(buf);
    while (hasContent(decoder)) {
      _readVarStringNative(decoder);
    }
  });

  const polyfillTimeSmall = measureTime('small dataset: polyfill encoding', () => {
    const decoder = createDecoder(buf);
    while (hasContent(decoder)) {
      readVarString(decoder);
    }
  });

  const nativeTimeLarge = measureTime('large dataset: native encoding', () => {
    const decoder = createDecoder(bufLarge);
    while (hasContent(decoder)) {
      _readVarStringNative(decoder);
    }
  });

  const polyfillTimeLarge = measureTime('large dataset: polyfill encoding', () => {
    const decoder = createDecoder(bufLarge);
    while (hasContent(decoder)) {
      _readVarStringPolyfill(decoder);
    }
  });

  assert(nativeTimeSmall < polyfillTimeSmall * 1.5, 'Small dataset: We expect native decoding to be not much worse than');
  assert(nativeTimeLarge < polyfillTimeLarge, 'Large dataset: We expect native decoding to be much better than polyfill decoding');
};

const testStringDecodingPerformance = () => {
  // test if it is faster to read N single characters, or if it is faster to read N characters in one flush.
  // to make the comparison meaningful, we read read N characters in an Array
  const N = 2000000;
  const durationSingleElements = measureTime('read / write single elements', () => {
    const encoder = createEncoder();
    measureTime('read / write single elements - write', () => {
      for (let i = 0; i < N; i++) {
        writeVarString(encoder, 'i');
      }
    });
    const decoder = createDecoder(toUint8Array(encoder));
    measureTime('read / write single elements - read', () => {
      const arr = [];
      for (let i = 0; i < N; i++) {
        arr.push(readVarString(decoder));
      }
    });
  });

  const durationConcatElements = measureTime('read / write concatenated string', () => {
    let stringbuf = new Uint8Array();
    const encoder = createEncoder();
    const encoderLengths = createEncoder();
    measureTime('read / write concatenated string - write', () => {
      let s = '';
      for (let i = 0; i < N; i++) {
        s += 'i';
        writeVarUint(encoderLengths, 1); // we write a single char.
        if (i % 20 === 0) {
          writeVarString(encoder, s);
          s = '';
        }
      }
      writeVarString(encoder, s);
      stringbuf = toUint8Array(encoder);
    });
    const decoder = createDecoder(stringbuf);
    const decoderLengths = createDecoder(toUint8Array(encoderLengths));
    measureTime('read / write concatenated string - read', () => {
      const arr = [];
      const concatS = readVarString(decoder);
      for (let i = 0; i < N; i++) {
        const len = readVarUint(decoderLengths);
        arr.push(concatS.slice(i, len)); // push using slice
      }
    });
  });
  assert(durationConcatElements < durationSingleElements, 'We expect that the second approach is faster. If this fails, our expectantion is not met in your javascript environment. Please report this issue.');
};

/**
 * @param {t.TestCase} _tc
 */
const testAnyEncodeUnknowns = _tc => {
  const encoder = createEncoder();
  // @ts-ignore
  writeAny(encoder, Symbol('a'));
  writeAny(encoder, undefined);
  writeAny(encoder, () => {});
  const decoder = createDecoder(toUint8Array(encoder));
  assert(readAny(decoder) === undefined);
  assert(readAny(decoder) === undefined);
  assert(readAny(decoder) === undefined);
};

/**
 * @param {t.TestCase} _tc
 */
const testAnyEncodeDate = _tc => {
  test('Encode current date', writeAny, readAny, new Date().getTime());
};

/**
 * @param {t.TestCase} _tc
 */
const testEncodeMax32bitUint = _tc => {
  test('max 32bit uint', writeVarUint, readVarUint, BITS32);
};

/**
 * @param {t.TestCase} _tc
 */
const testVarUintEncoding = _tc => {
  test('varUint 1 byte', writeVarUint, readVarUint, 42);
  test('varUint 2 bytes', writeVarUint, readVarUint, 1 << 9 | 3);
  test('varUint 3 bytes', writeVarUint, readVarUint, 1 << 17 | 1 << 9 | 3);
  test('varUint 4 bytes', writeVarUint, readVarUint, 1 << 25 | 1 << 17 | 1 << 9 | 3);
  test('varUint of 2839012934', writeVarUint, readVarUint, 2839012934);
  test('varUint of 2^53', writeVarUint, readVarUint, MAX_SAFE_INTEGER);
};

/**
 * @param {t.TestCase} _tc
 */
const testVarIntEncoding = _tc => {
  test('varInt 1 byte', writeVarInt, readVarInt, -42);
  test('varInt 2 bytes', writeVarInt, readVarInt, -(1 << 9 | 3));
  test('varInt 3 bytes', writeVarInt, readVarInt, -(1 << 17 | 1 << 9 | 3));
  test('varInt 4 bytes', writeVarInt, readVarInt, -(1 << 25 | 1 << 17 | 1 << 9 | 3));
  test('varInt of -691529286', writeVarInt, readVarInt, -(691529286));
  test('varInt of 2^53', writeVarInt, readVarInt, MAX_SAFE_INTEGER);
  test('varInt of -2^53', writeVarInt, readVarInt, MIN_SAFE_INTEGER);
};

/**
 * @param {t.TestCase} tc
 */
const testRepeatVarUintEncoding = tc => {
  const n = uint32(tc.prng, 0, (1 << 28) - 1);
  test(`varUint of ${n}`, writeVarUint, readVarUint, n, false);
};

/**
 * @param {t.TestCase} tc
 */
const testRepeatVarUintEncoding53bit = tc => {
  const n = uint53(tc.prng, 0, MAX_SAFE_INTEGER);
  test(`varUint of ${n}`, writeVarUint, readVarUint, n, false);
};

/**
 * @param {t.TestCase} tc
 */
const testRepeatVarIntEncoding = tc => {
  const n = int32(tc.prng, LOWEST_INT32, BITS32);
  test(`varInt of ${n}`, writeVarInt, readVarInt, n, false);
};

/**
 * @param {t.TestCase} tc
 */
const testRepeatVarIntEncoding53bit = tc => {
  const n = int32(tc.prng, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER);
  test(`varInt of ${n}`, writeVarInt, readVarInt, n, false);
};

/**
 * @param {t.TestCase} tc
 */
const testRepeanntAnyEncoding = tc => {
  const n = genAny(tc.prng);
  test('any encoding', writeAny, readAny, n, false);
};

/**
 * @param {t.TestCase} tc
 */
const testRepeatPeekVarUintEncoding = tc => {
  const n = int32(tc.prng, 0, (1 << 28) - 1);
  test(`varUint of ${n}`, writeVarUint, peekVarUint, n, false);
};

/**
 * @param {t.TestCase} tc
 */
const testRepeatPeekVarIntEncoding = tc => {
  const n = int53(tc.prng, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER);
  test(`varInt of ${n}`, writeVarInt, peekVarInt, n, false);
};

/**
 * @param {t.TestCase} tc
 */
const testAnyVsJsonEncoding = tc => {
  const n = Array.from({ length: 5000 }).map(() => genAny(tc.prng, 5, true));
  measureTime('lib0 any encoding', () => {
    const encoder = createEncoder();
    writeAny(encoder, n);
    const buffer = toUint8Array(encoder);
    info('buffer length is ' + buffer.length);
    readAny(createDecoder(buffer));
  });
  measureTime('JSON.stringify encoding', () => {
    const encoder = createEncoder();
    writeVarString(encoder, JSON.stringify(n));
    const buffer = toUint8Array(encoder);
    info('buffer length is ' + buffer.length);
    JSON.parse(readVarString(createDecoder(buffer)));
  });
};

/**
 * @param {t.TestCase} _tc
 */
const testStringEncoding = _tc => {
  testVarString('hello');
  testVarString('test!');
  testVarString('☺☺☺');
  testVarString('');
  testVarString('1234');
  testVarString('쾟');
  testVarString('龟'); // surrogate length 3
  testVarString('😝'); // surrogate length 4
};

/**
 * @param {t.TestCase} tc
 */
const testRepeatStringEncoding = tc =>
  testVarString(utf16String(tc.prng));

/**
 * @param {t.TestCase} _tc
 */
const testSetMethods = _tc => {
  const encoder = createEncoder();
  writeUint8(encoder, 1);
  writeUint16(encoder, 33);
  writeUint32(encoder, 29329);
  setUint8(encoder, 0, 8);
  setUint16(encoder, 1, 16);
  setUint32(encoder, 3, 32);
  const buf = toUint8Array(encoder);
  const decoder = createDecoder(buf);
  assert(peekUint8(decoder) === 8);
  readUint8(decoder);
  assert(peekUint16(decoder) === 16);
  readUint16(decoder);
  assert(peekUint32(decoder) === 32);
  readUint32(decoder);
};

const defLen = 1000;
const loops = 10000;

/**
 * @param {any} a
 * @param {any} b
 * @return {boolean}
 */
const strictComparison = (a, b) => a === b;

/**
 * @typedef {Object} EncodingPair
 * @property {function(decoding.Decoder):any} EncodingPair.read
 * @property {function(encoding.Encoder,any):void} EncodingPair.write
 * @property {function(prng.PRNG):any} EncodingPair.gen
 * @property {function(any,any):boolean} EncodingPair.compare
 * @property {string} name
 */

/**
 * @template T
 * @type {Array<EncodingPair>}
 */
const encodingPairs = [
  { name: 'uint8Array', read: decoder => readUint8Array(decoder, defLen), write: writeUint8Array, gen: gen => uint8Array(gen, defLen), compare: compare },
  { name: 'varUint8Array', read: readVarUint8Array, write: writeVarUint8Array, gen: gen => uint8Array(gen, uint32(gen, 0, defLen)), compare: compare },
  { name: 'uint8', read: readUint8, write: writeUint8, gen: gen => uint32(gen, 0, BITS8), compare: strictComparison },
  { name: 'uint16', read: readUint16, write: writeUint16, gen: gen => uint32(gen, 0, BITS16), compare: strictComparison },
  { name: 'uint32', read: readUint32, write: writeUint32, gen: gen => uint32(gen, 0, BITS32), compare: strictComparison },
  { name: 'uint32bigEndian', read: readUint32BigEndian, write: writeUint32BigEndian, gen: gen => uint32(gen, 0, BITS32), compare: strictComparison },
  { name: 'varString', read: readVarString, write: writeVarString, gen: gen => utf16String(gen, uint32(gen, 0, defLen)), compare: strictComparison },
  { name: 'varUint', read: readVarUint, write: writeVarUint, gen: gen => uint53(gen, 0, MAX_SAFE_INTEGER), compare: strictComparison },
  { name: 'varInt', read: readVarInt, write: writeVarInt, gen: gen => int53(gen, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER), compare: strictComparison },
  { name: 'Any', read: readAny, write: writeAny, gen: genAny, compare: compare }
];

/**
 * @param {t.TestCase} tc
 */
const testRepeatRandomWrites = tc => {
  describe(`Writing ${loops} random values`, `defLen=${defLen}`);
  const gen = tc.prng;
  const ops = [];
  const encoder = createEncoder();
  for (let i = 0; i < 10000; i++) {
    const pair = oneOf(gen, encodingPairs);
    const val = pair.gen(gen);
    pair.write(encoder, val);
    ops.push({
      compare: pair.compare,
      read: pair.read,
      val,
      name: pair.name
    });
  }
  const tailData = uint8Array(gen, int32(gen, 0, defLen));
  writeUint8Array(encoder, tailData);
  const buf = toUint8Array(encoder);
  const decoder = createDecoder(buf);
  assert(length(encoder) === buf.byteLength);
  for (let i = 0; i < ops.length; i++) {
    const o = ops[i];
    const val = o.read(decoder);
    assert(o.compare(val, o.val), o.name);
  }
  compare(tailData, readTailAsUint8Array(decoder));
};

/**
 * @param {t.TestCase} _tc
 */
const testWriteUint8ArrayOverflow = _tc => {
  const encoder = createEncoder();
  const initialLen = encoder.cbuf.byteLength;
  const buf = createUint8ArrayFromLen(initialLen * 4);
  for (let i = 0; i < buf.length; i++) {
    buf[i] = i;
  }
  writeUint8Array(encoder, buf);
  write(encoder, 42);
  const res = toUint8Array(encoder);
  assert(res.length === initialLen * 4 + 1);
  for (let i = 0; i < buf.length - 1; i++) {
    assert(res[i] === (i % 256));
  }
  assert(res[initialLen * 4] === 42);
};

/**
 * @param {t.TestCase} _tc
 */
const testSetOnOverflow = _tc => {
  const encoder = createEncoder();
  const initialLen = encoder.cbuf.byteLength;
  encoder.cpos = initialLen - 2;
  writeUint32(encoder, BITS32);
  const buf = toUint8Array(encoder);
  assert(length(encoder) === initialLen + 2);
  const decoder = createDecoder(buf);
  const space = createUint8ArrayFromArrayBuffer(readUint8Array(decoder, initialLen - 2));
  for (let i = 0; i < initialLen - 2; i++) {
    assert(space[i] === 0);
  }
  assert(hasContent(decoder));
  assert(BITS32 === readUint32(decoder));
  assert(!hasContent(decoder));
  setUint8(encoder, 5, BITS8);
  setUint8(encoder, initialLen + 1, 7);
  const buf2 = toUint8Array(encoder);
  assert(buf2[5] === BITS8);
  assert(buf[5] === 0, 'old buffer is not affected');
  assert(buf2[initialLen + 1] === 7);
};

/**
 * @param {t.TestCase} _tc
 */
const testCloneDecoder = _tc => {
  const encoder = createEncoder();
  writeUint8(encoder, 12132);
  writeVarUint(encoder, 329840128734);
  writeVarString(encoder, 'dtrnuiaednudiaendturinaedt nduiaen dturinaed ');
  const buf = toUint8Array(encoder);
  const decoder = createDecoder(buf);
  skip8(decoder);
  const decoder2 = clone(decoder);
  const payload1 = readTailAsUint8Array(decoder);
  const payload2 = readTailAsUint8Array(decoder2);
  compare(payload1, payload2);
};

/**
 * @param {t.TestCase} _tc
 */
const testWriteBinaryEncoder = _tc => {
  const encoder = createEncoder();
  writeUint16(encoder, 4);
  const encoder2 = createEncoder();
  writeVarUint(encoder2, 143095);
  writeBinaryEncoder(encoder2, encoder);
  const buf = toUint8Array(encoder2);
  const decoder = createDecoder(buf);
  assert(readVarUint(decoder) === 143095);
  assert(readUint16(decoder) === 4);
};

/**
 * @param {t.TestCase} tc
 */
const testOverflowStringDecoding = tc => {
  const gen = tc.prng;
  const encoder = createEncoder();
  let longStr = '';
  while (longStr.length < 11000) {
    longStr += utf16String(gen, 100000);
  }
  writeVarString(encoder, longStr);
  const buf = toUint8Array(encoder);
  const decoder = createDecoder(buf);
  assert(longStr === readVarString(decoder));
};

/**
 * @param {t.TestCase} _tc
 */
const testRleEncoder = _tc => {
  const N = 100;
  const encoder = new RleEncoder(writeVarUint);
  for (let i = 0; i < N; i++) {
    encoder.write(i);
    for (let j = 0; j < i; j++) { // write additional i times
      encoder.write(i);
    }
  }
  const decoder = new RleDecoder(toUint8Array(encoder), readVarUint);
  for (let i = 0; i < N; i++) {
    assert(i === decoder.read());
    for (let j = 0; j < i; j++) { // read additional i times
      assert(i === decoder.read());
    }
  }
};

/**
 * @param {t.TestCase} _tc
 */
const testRleIntDiffEncoder = _tc => {
  const N = 100;
  const encoder = new RleIntDiffEncoder(0);
  for (let i = -N; i < N; i++) {
    encoder.write(i);
    for (let j = 0; j < i; j++) { // write additional i times
      encoder.write(i);
    }
  }
  const decoder = new RleIntDiffDecoder(toUint8Array(encoder), 0);
  for (let i = -N; i < N; i++) {
    assert(i === decoder.read());
    for (let j = 0; j < i; j++) { // read additional i times
      assert(i === decoder.read());
    }
  }
};

/**
 * @param {t.TestCase} _tc
 */
const testUintOptRleEncoder = _tc => {
  const N = 100;
  const encoder = new UintOptRleEncoder();
  for (let i = 0; i < N; i++) {
    encoder.write(i);
    for (let j = 0; j < i; j++) { // write additional i times
      encoder.write(i);
    }
  }
  const decoder = new UintOptRleDecoder(encoder.toUint8Array());
  for (let i = 0; i < N; i++) {
    assert(i === decoder.read());
    for (let j = 0; j < i; j++) { // read additional i times
      assert(i === decoder.read());
    }
  }
};

/**
 * @param {t.TestCase} _tc
 */
const testIntDiffRleEncoder = _tc => {
  const N = 100;
  const encoder = new IntDiffOptRleEncoder();
  for (let i = -N; i < N; i++) {
    encoder.write(i);
    for (let j = 0; j < i; j++) { // write additional i times
      encoder.write(i);
    }
  }
  const decoder = new IntDiffOptRleDecoder(encoder.toUint8Array());
  for (let i = -N; i < N; i++) {
    assert(i === decoder.read());
    for (let j = 0; j < i; j++) { // read additional i times
      assert(i === decoder.read());
    }
  }
};

/**
 * @param {t.TestCase} tc
 */
const testIntEncoders = tc => {
  const arrLen = 10000;
  const gen = tc.prng;
  /**
   * @type {Array<number>}
   */
  const vals = [];
  for (let i = 0; i < arrLen; i++) {
    if (bool(gen)) {
      vals.push(int53(gen, floor(MIN_SAFE_INTEGER / 2), floor(MAX_SAFE_INTEGER / 2)));
    } else {
      vals.push(int32(gen, -10, 10));
    }
  }
  /**
   * @type {Array<{ encoder: any, read: function(any):any }>}
   */
  const intEncoders = [
    { encoder: new IntDiffOptRleEncoder(), read: encoder => new IntDiffOptRleDecoder(encoder.toUint8Array()) },
    { encoder: new IntDiffEncoder(0), read: encoder => new IntDiffDecoder(toUint8Array(encoder), 0) },
    { encoder: new IntDiffEncoder(42), read: encoder => new IntDiffDecoder(toUint8Array(encoder), 42) },
    { encoder: new RleIntDiffEncoder(0), read: encoder => new RleIntDiffDecoder(toUint8Array(encoder), 0) }
  ];
  intEncoders.forEach(({ encoder, read }) => {
    vals.forEach(v => encoder.write(v));
    /**
     * @type {Array<number>}
     */
    const readVals = [];
    const dec = read(encoder);
    for (let i = 0; i < arrLen; i++) {
      readVals.push(dec.read());
    }
    compare(vals, readVals);
  });
};

/**
 * @param {t.TestCase} _tc
 */
const testIntDiffEncoder = _tc => {
  const N = 100;
  const encoder = new IntDiffEncoder(0);
  for (let i = -N; i < N; i++) {
    encoder.write(i);
  }
  const decoder = new IntDiffDecoder(toUint8Array(encoder), 0);
  for (let i = -N; i < N; i++) {
    assert(i === decoder.read());
  }
};

/**
 * @param {t.TestCase} tc
 */
const testStringDecoder = tc => {
  const gen = tc.prng;
  const N = 1000;
  const words = [];
  for (let i = 0; i < N; i++) {
    words.push(utf16String(gen));
    if (i % 100 === 0) {
      const char$1 = char(gen).slice(0, 1);
      words.push(char$1);
      words.push(char$1);
    }
    if (i % 107 === 0) {
      words.push(word(gen, 3000, 8000));
    }
  }
  const encoder = new StringEncoder();
  for (let i = 0; i < words.length; i++) {
    encoder.write(words[i]);
  }
  const decoder = new StringDecoder(encoder.toUint8Array());
  for (let i = 0; i < words.length; i++) {
    assert(decoder.read() === words[i]);
  }
};

/**
 * @param {t.TestCase} _tc
 */
const testLargeNumberAnyEncoding = _tc => {
  const encoder = createEncoder();
  const num = -2.2062063918362897e+50;
  writeAny(encoder, num);
  const decoder = createDecoder(toUint8Array(encoder));
  const readNum = readAny(decoder);
  assert(readNum === num);
};

/**
 * @param {t.TestCase} _tc
 */
const testInvalidVarIntEncoding = _tc => {
  const encoded = new Uint8Array(1);
  encoded[0] = 255;
  const decoder = createDecoder(encoded);
  fails(() => {
    readVarInt(decoder);
  });
  decoder.pos = 0;
  fails(() => {
    readVarUint(decoder);
  });
};

var encoding = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testGolangBinaryEncodingCompatibility: testGolangBinaryEncodingCompatibility,
  testVerifyLen: testVerifyLen,
  testStringEncodingPerformanceNativeVsPolyfill: testStringEncodingPerformanceNativeVsPolyfill,
  testDecodingPerformanceNativeVsPolyfill: testDecodingPerformanceNativeVsPolyfill,
  testStringDecodingPerformance: testStringDecodingPerformance,
  testAnyEncodeUnknowns: testAnyEncodeUnknowns,
  testAnyEncodeDate: testAnyEncodeDate,
  testEncodeMax32bitUint: testEncodeMax32bitUint,
  testVarUintEncoding: testVarUintEncoding,
  testVarIntEncoding: testVarIntEncoding,
  testRepeatVarUintEncoding: testRepeatVarUintEncoding,
  testRepeatVarUintEncoding53bit: testRepeatVarUintEncoding53bit,
  testRepeatVarIntEncoding: testRepeatVarIntEncoding,
  testRepeatVarIntEncoding53bit: testRepeatVarIntEncoding53bit,
  testRepeanntAnyEncoding: testRepeanntAnyEncoding,
  testRepeatPeekVarUintEncoding: testRepeatPeekVarUintEncoding,
  testRepeatPeekVarIntEncoding: testRepeatPeekVarIntEncoding,
  testAnyVsJsonEncoding: testAnyVsJsonEncoding,
  testStringEncoding: testStringEncoding,
  testRepeatStringEncoding: testRepeatStringEncoding,
  testSetMethods: testSetMethods,
  testRepeatRandomWrites: testRepeatRandomWrites,
  testWriteUint8ArrayOverflow: testWriteUint8ArrayOverflow,
  testSetOnOverflow: testSetOnOverflow,
  testCloneDecoder: testCloneDecoder,
  testWriteBinaryEncoder: testWriteBinaryEncoder,
  testOverflowStringDecoding: testOverflowStringDecoding,
  testRleEncoder: testRleEncoder,
  testRleIntDiffEncoder: testRleIntDiffEncoder,
  testUintOptRleEncoder: testUintOptRleEncoder,
  testIntDiffRleEncoder: testIntDiffRleEncoder,
  testIntEncoders: testIntEncoders,
  testIntDiffEncoder: testIntDiffEncoder,
  testStringDecoder: testStringDecoder,
  testLargeNumberAnyEncoding: testLargeNumberAnyEncoding,
  testInvalidVarIntEncoding: testInvalidVarIntEncoding
});

/**
 * @param {string} a
 * @param {string} b
 * @param {{index: number,remove:number,insert:string}} expected
 */
function runDiffTest (a, b, expected) {
  const result = simpleDiffString(a, b);
  compare(result, expected);
  compare(result, simpleDiffStringWithCursor(a, b, a.length)); // check that the withCursor approach returns the same result
  const arrResult = simpleDiffArray(a.split(''), b.split(''));
  compare(arrResult, assign({}, result, { insert: result.insert.split('') }));
}

/**
 * @param {t.TestCase} tc
 */
const testDiffing = tc => {
  runDiffTest('abc', 'axc', { index: 1, remove: 1, insert: 'x' });
  runDiffTest('bc', 'xc', { index: 0, remove: 1, insert: 'x' });
  runDiffTest('ab', 'ax', { index: 1, remove: 1, insert: 'x' });
  runDiffTest('b', 'x', { index: 0, remove: 1, insert: 'x' });
  runDiffTest('', 'abc', { index: 0, remove: 0, insert: 'abc' });
  runDiffTest('abc', 'xyz', { index: 0, remove: 3, insert: 'xyz' });
  runDiffTest('axz', 'au', { index: 1, remove: 2, insert: 'u' });
  runDiffTest('ax', 'axy', { index: 2, remove: 0, insert: 'y' });
};

/**
 * @param {t.TestCase} tc
 */
const testRepeatDiffing = tc => {
  const a = word(tc.prng);
  const b = word(tc.prng);
  const change = simpleDiffString(a, b);
  const recomposed = splice(a, change.index, change.remove, change.insert);
  compareStrings(recomposed, b);
};

/**
 * @param {t.TestCase} tc
 */
const testSimpleDiffWithCursor = tc => {
  const initial = 'Hello WorldHello World';
  const expected = 'Hello World';
  {
    const change = simpleDiffStringWithCursor(initial, 'Hello World', 0); // should delete the first hello world
    compare(change, { insert: '', remove: 11, index: 0 });
    const recomposed = splice(initial, change.index, change.remove, change.insert);
    compareStrings(expected, recomposed);
  }
  {
    const change = simpleDiffStringWithCursor(initial, 'Hello World', 11); // should delete the second hello world
    compare(change, { insert: '', remove: 11, index: 11 });
    const recomposedSecond = splice(initial, change.index, change.remove, change.insert);
    compareStrings(recomposedSecond, expected);
  }
  {
    const change = simpleDiffStringWithCursor(initial, 'Hello World', 5); // should delete in the midst of Hello World
    compare(change, { insert: '', remove: 11, index: 5 });
    const recomposed = splice(initial, change.index, change.remove, change.insert);
    compareStrings(expected, recomposed);
  }
  {
    const initial = 'Hello my World';
    const change = simpleDiffStringWithCursor(initial, 'Hello World', 0); // Should delete after the current cursor position
    compare(change, { insert: '', remove: 3, index: 5 });
    const recomposed = splice(initial, change.index, change.remove, change.insert);
    compareStrings(expected, recomposed);
  }
};

/**
 * @param {t.TestCase} tc
 */
const testArrayDiffing = tc => {
  const a = [[1, 2], { x: 'x' }];
  const b = [[1, 2], { x: 'x' }];
  compare(simpleDiffArray(a, b, equalityFlat), { index: 2, remove: 0, insert: [] });
  compare(simpleDiffArray(a, b, equalityStrict), { index: 0, remove: 2, insert: b });
  compare(simpleDiffArray([{ x: 'y' }, []], a, equalityFlat), { index: 0, remove: 2, insert: b });
};

var diff = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testDiffing: testDiffing,
  testRepeatDiffing: testRepeatDiffing,
  testSimpleDiffWithCursor: testSimpleDiffWithCursor,
  testArrayDiffing: testArrayDiffing
});

/**
 * @param {t.TestCase} tc
 */
const testComparing = tc => {
  compare({}, {});
  compare({ a: 4 }, { a: 4 }, 'simple compare (object)');
  compare([1, 2], [1, 2], 'simple compare (array)');
  compare({ a: [1, 2] }, { a: [1, 2] }, 'simple compare nested');
  compare(new Set(['3', 1234]), new Set(['3', 1234]), 'compare Sets');
  const map1 = create$a();
  map1.set(1, 2);
  map1.set('x', {});
  map1.set(98, 'tst');
  const map2 = new Map();
  map2.set(1, 2);
  map2.set('x', {});
  map2.set(98, 'tst');
  compare(map1, map2, 'compare Maps');

  describe('The following errors are expected!');
  fails(() => {
    compare({ a: 4 }, { b: 5 }, 'childs are not equal');
  });
  fails(() => {
    compare({ a: 4 }, { a: 5 }, 'childs are not equal');
  });
  fails(() => {
    compare({ a: 4 }, null, 'childs are not equal');
  });
  fails(() => {
    // @ts-ignore
    compare({ a: 4 }, [4], 'childs have different types');
  });
  fails(() => {
    compare({ a: 4 }, { a: 4, b: 5 }, 'childs have different length (object)');
  });
  fails(() => {
    compare([1], [1, 2]); // childs have different length (array) -- no message
  });
  fails(() => {
    compare(createUint8ArrayFromLen(1), createUint8ArrayFromLen(2), 'Uint8Arrays have different length');
  });
  fails(() => {
    compare(createUint8ArrayFromLen(1).buffer, createUint8ArrayFromLen(2).buffer, 'ArrayBuffer have different length');
  });
  fails(() => {
    compareStrings('str1', 'str2', 'Strings comparison can fail');
  });
  compareArrays([], [], 'Comparing empty arrays');
  fails(() => {
    compareArrays([1], [1, 2], 'Compare arrays with different length');
  });
  fails(() => {
    compareArrays([1], [2]); // Compare different arrays -- no message
  });
  compareObjects({ x: 1 }, { x: 1 }, 'comparing objects');
  fails(() => {
    compareObjects({}, { x: 1 }, 'compareObjects can fail');
  });
  fails(() => {
    compareObjects({ x: 3 }, { x: 1 }); // Compare different objects -- no message
  });
  fails(() => {
    compare({ x: undefined }, { y: 1 }, 'compare correctly handles undefined');
  });
  fails(() => {
    compareObjects({ x: undefined }, { y: 1 }, 'compare correctly handles undefined');
  });
  describe('Map fails');
  fails(() => {
    const m1 = new Map();
    m1.set(1, 2);
    const m2 = new Map();
    m2.set(1, 3);
    compare(m1, m2); // childs have different length (array) -- no message
  });
  fails(() => {
    const m1 = new Map();
    m1.set(2, 2);
    const m2 = new Map();
    m2.set(1, 2);
    compare(m1, m2); // childs have different length (array) -- no message
  });
  fails(() => {
    const m1 = new Map();
    m1.set(1, 2);
    const m2 = new Map();
    compare(m1, m2); // childs have different length (array) -- no message
  });
  describe('Set fails');
  fails(() => {
    compare(new Set([1]), new Set([1, 2])); // childs have different length (array) -- no message
  });
  fails(() => {
    compare(new Set([1]), new Set([2])); // childs have different length (array) -- no message
  });
};

const testFailing = () => {
  fails(() => {
    fail('This fail is expected');
  });
};

const testSkipping = () => {
  skip(false);
  assert(true);
  skip();
  /* istanbul ignore next */
  fail('should have skipped');
};

const testAsync = async () => {
  await measureTimeAsync('time', () => create$4(r => setTimeout(r)));
  await groupAsync('some description', () => wait(1));
};

const testRepeatRepetition = () => {
  const arr = [];
  const n = 100;
  for (let i = 1; i <= n; i++) {
    arr.push(i);
  }
  assert(arr.reduce(add$1, 0) === (n + 1) * n / 2);
};

var testing = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testComparing: testComparing,
  testFailing: testFailing,
  testSkipping: testSkipping,
  testAsync: testAsync,
  testRepeatRepetition: testRepeatRepetition
});

/* eslint-env browser */

/* istanbul ignore next */
/**
 * IDB Request to Promise transformer
 *
 * @param {IDBRequest} request
 * @return {Promise<any>}
 */
const rtop = request => create$4((resolve, reject) => {
  /* istanbul ignore next */
  // @ts-ignore
  request.onerror = event => reject(new Error(event.target.error));
  /* istanbul ignore next */
  // @ts-ignore
  request.onblocked = () => location.reload();
  // @ts-ignore
  request.onsuccess = event => resolve(event.target.result);
});

/* istanbul ignore next */
/**
 * @param {string} name
 * @param {function(IDBDatabase):any} initDB Called when the database is first created
 * @return {Promise<IDBDatabase>}
 */
const openDB = (name, initDB) => create$4((resolve, reject) => {
  const request = indexedDB.open(name);
  /**
   * @param {any} event
   */
  request.onupgradeneeded = event => initDB(event.target.result);
  /* istanbul ignore next */
  /**
   * @param {any} event
   */
  request.onerror = event => reject(create$6(event.target.error));
  /* istanbul ignore next */
  request.onblocked = () => location.reload();
  /**
   * @param {any} event
   */
  request.onsuccess = event => {
    /**
     * @type {IDBDatabase}
     */
    const db = event.target.result;
    /* istanbul ignore next */
    db.onversionchange = () => { db.close(); };
    /* istanbul ignore if */
    if (typeof addEventListener !== 'undefined') {
      addEventListener('unload', () => db.close());
    }
    resolve(db);
  };
});

/* istanbul ignore next */
/**
 * @param {string} name
 */
const deleteDB = name => rtop(indexedDB.deleteDatabase(name));

/* istanbul ignore next */
/**
 * @param {IDBDatabase} db
 * @param {Array<Array<string>|Array<string|IDBObjectStoreParameters|undefined>>} definitions
 */
const createStores = (db, definitions) => definitions.forEach(d =>
  // @ts-ignore
  db.createObjectStore.apply(db, d)
);

/* istanbul ignore next */
/**
 * @param {IDBObjectStore} store
 * @param {String | number | ArrayBuffer | Date | Array<any> } key
 * @return {Promise<String | number | ArrayBuffer | Date | Array<any>>}
 */
const get$1 = (store, key) =>
  rtop(store.get(key));

/* istanbul ignore next */
/**
 * @param {IDBObjectStore} store
 * @param {String | number | ArrayBuffer | Date | IDBKeyRange | Array<any> } key
 */
const del = (store, key) =>
  rtop(store.delete(key));

/* istanbul ignore next */
/**
 * @param {IDBObjectStore} store
 * @param {String | number | ArrayBuffer | Date | boolean} item
 * @param {String | number | ArrayBuffer | Date | Array<any>} [key]
 */
const put = (store, item, key) =>
  rtop(store.put(item, key));

/* istanbul ignore next */
/**
 * @param {IDBObjectStore} store
 * @param {String | number | ArrayBuffer | Date | boolean}  item
 * @param {String | number | ArrayBuffer | Date | Array<any>}  key
 * @return {Promise<any>}
 */
const add = (store, item, key) =>
  rtop(store.add(item, key));

/* istanbul ignore next */
/**
 * @param {IDBObjectStore} store
 * @param {String | number | ArrayBuffer | Date}  item
 * @return {Promise<number>} Returns the generated key
 */
const addAutoKey = (store, item) =>
  rtop(store.add(item));

/* istanbul ignore next */
/**
 * @param {IDBObjectStore} store
 * @param {IDBKeyRange} [range]
 * @return {Promise<Array<any>>}
 */
const getAll = (store, range) =>
  rtop(store.getAll(range));

/* istanbul ignore next */
/**
 * @param {IDBObjectStore} store
 * @param {IDBKeyRange} [range]
 * @return {Promise<Array<any>>}
 */
const getAllKeys = (store, range) =>
  rtop(store.getAllKeys(range));

/**
 * @typedef KeyValuePair
 * @type {Object}
 * @property {any} k key
 * @property {any} v Value
 */

/* istanbul ignore next */
/**
 * @param {IDBObjectStore} store
 * @param {IDBKeyRange} [range]
 * @return {Promise<Array<KeyValuePair>>}
 */
const getAllKeysValues = (store, range) =>
  // @ts-ignore
  all([getAllKeys(store, range), getAll(store, range)]).then(([ks, vs]) => ks.map((k, i) => ({ k, v: vs[i] })));

/* istanbul ignore next */
/**
 * @param {any} request
 * @param {function(IDBCursorWithValue):void|boolean} f
 * @return {Promise<void>}
 */
const iterateOnRequest = (request, f) => create$4((resolve, reject) => {
  /* istanbul ignore next */
  request.onerror = reject;
  /**
   * @param {any} event
   */
  request.onsuccess = event => {
    const cursor = event.target.result;
    if (cursor === null || f(cursor) === false) {
      return resolve()
    }
    cursor.continue();
  };
});

/* istanbul ignore next */
/**
 * Iterate on keys and values
 * @param {IDBObjectStore} store
 * @param {IDBKeyRange|null} keyrange
 * @param {function(any,any):void|boolean} f Callback that receives (value, key)
 * @param {'next'|'prev'|'nextunique'|'prevunique'} direction
 */
const iterate = (store, keyrange, f, direction = 'next') =>
  iterateOnRequest(store.openCursor(keyrange, direction), cursor => f(cursor.value, cursor.key));

/* istanbul ignore next */
/**
 * Iterate on the keys (no values)
 *
 * @param {IDBObjectStore} store
 * @param {IDBKeyRange|null} keyrange
 * @param {function(any):void|boolean} f callback that receives the key
 * @param {'next'|'prev'|'nextunique'|'prevunique'} direction
 */
const iterateKeys = (store, keyrange, f, direction = 'next') =>
  iterateOnRequest(store.openKeyCursor(keyrange, direction), cursor => f(cursor.key));

/* istanbul ignore next */
/**
 * Open store from transaction
 * @param {IDBTransaction} t
 * @param {String} store
 * @returns {IDBObjectStore}
 */
const getStore$1 = (t, store) => t.objectStore(store);

/* istanbul ignore next */
/**
 * @param {any} lower
 * @param {any} upper
 * @param {boolean} lowerOpen
 * @param {boolean} upperOpen
 */
const createIDBKeyRangeBound = (lower, upper, lowerOpen, upperOpen) => IDBKeyRange.bound(lower, upper, lowerOpen, upperOpen);

/* istanbul ignore next */
/**
 * @param {IDBDatabase} db
 */
const initTestDB = db => createStores(db, [['test', { autoIncrement: true }]]);
const testDBName = 'idb-test';

/* istanbul ignore next */
/**
 * @param {IDBDatabase} db
 */
const createTransaction = db => db.transaction(['test'], 'readwrite');

/* istanbul ignore next */
/**
 * @param {IDBTransaction} t
 * @return {IDBObjectStore}
 */
const getStore = t => getStore$1(t, 'test');

/* istanbul ignore next */
const testRetrieveElements = async () => {
  skip(!isBrowser);
  describe('create, then iterate some keys');
  await deleteDB(testDBName);
  const db = await openDB(testDBName, initTestDB);
  const transaction = createTransaction(db);
  const store = getStore(transaction);
  await put(store, 0, ['t', 1]);
  await put(store, 1, ['t', 2]);
  const expectedKeys = [['t', 1], ['t', 2]];
  const expectedVals = [0, 1];
  const expectedKeysVals = [{ v: 0, k: ['t', 1] }, { v: 1, k: ['t', 2] }];
  describe('idb.getAll');
  const valsGetAll = await getAll(store);
  compare(valsGetAll, expectedVals);
  describe('idb.getAllKeys');
  const valsGetAllKeys = await getAllKeys(store);
  compare(valsGetAllKeys, expectedKeys);
  describe('idb.getAllKeysVals');
  const valsGetAllKeysVals = await getAllKeysValues(store);
  compare(valsGetAllKeysVals, expectedKeysVals);

  /**
   * @param {string} desc
   * @param {IDBKeyRange?} keyrange
   */
  const iterateTests = async (desc, keyrange) => {
    describe(`idb.iterate (${desc})`);
    /**
     * @type {Array<{v:any,k:any}>}
     */
    const valsIterate = [];
    await iterate(store, keyrange, (v, k) => {
      valsIterate.push({ v, k });
    });
    compare(valsIterate, expectedKeysVals);
    describe(`idb.iterateKeys (${desc})`);
    /**
     * @type {Array<any>}
     */
    const keysIterate = [];
    await iterateKeys(store, keyrange, key => {
      keysIterate.push(key);
    });
    compare(keysIterate, expectedKeys);
  };
  await iterateTests('range=null', null);
  const range = createIDBKeyRangeBound(['t', 1], ['t', 2], false, false);
  // adding more items that should not be touched by iteration with above range
  await put(store, 2, ['t', 3]);
  await put(store, 2, ['t', 0]);
  await iterateTests('range!=null', range);

  describe('idb.get');
  const getV = await get$1(store, ['t', 1]);
  assert(getV === 0);
  describe('idb.del');
  await del(store, ['t', 0]);
  const getVDel = await get$1(store, ['t', 0]);
  assert(getVDel === undefined);
  describe('idb.add');
  await add(store, 99, 42);
  const idbVAdd = await get$1(store, 42);
  assert(idbVAdd === 99);
  describe('idb.addAutoKey');
  const key = await addAutoKey(store, 1234);
  const retrieved = await get$1(store, key);
  assert(retrieved === 1234);
};

var indexeddb = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testRetrieveElements: testRetrieveElements
});

/**
 * @module prng
 */
const N = 624;
const M = 397;

/**
 * @param {number} u
 * @param {number} v
 */
const twist = (u, v) => ((((u & 0x80000000) | (v & 0x7fffffff)) >>> 1) ^ ((v & 1) ? 0x9908b0df : 0));

/**
 * @param {Uint32Array} state
 */
const nextState = state => {
  let p = 0;
  let j;
  for (j = N - M + 1; --j; p++) {
    state[p] = state[p + M] ^ twist(state[p], state[p + 1]);
  }
  for (j = M; --j; p++) {
    state[p] = state[p + M - N] ^ twist(state[p], state[p + 1]);
  }
  state[p] = state[p + M - N] ^ twist(state[p], state[0]);
};

/**
 * This is a port of Shawn Cokus's implementation of the original Mersenne Twister algorithm (http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/MT2002/CODES/MTARCOK/mt19937ar-cok.c).
 * MT has a very high period of 2^19937. Though the authors of xorshift describe that a high period is not
 * very relevant (http://vigna.di.unimi.it/xorshift/). It is four times slower than xoroshiro128plus and
 * needs to recompute its state after generating 624 numbers.
 *
 * ```js
 * const gen = new Mt19937(new Date().getTime())
 * console.log(gen.next())
 * ```
 *
 * @public
 */
class Mt19937 {
  /**
   * @param {number} seed Unsigned 32 bit number
   */
  constructor (seed) {
    this.seed = seed;
    const state = new Uint32Array(N);
    state[0] = seed;
    for (let i = 1; i < N; i++) {
      state[i] = (imul(1812433253, (state[i - 1] ^ (state[i - 1] >>> 30))) + i) & BITS32;
    }
    this._state = state;
    this._i = 0;
    nextState(this._state);
  }

  /**
   * Generate a random signed integer.
   *
   * @return {Number} A 32 bit signed integer.
   */
  next () {
    if (this._i === N) {
      // need to compute a new state
      nextState(this._state);
      this._i = 0;
    }
    let y = this._state[this._i++];
    y ^= (y >>> 11);
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= (y >>> 18);
    return (y >>> 0) / (BITS32 + 1)
  }
}

const genTestData = 5000;

/**
 * @param {t.TestCase} tc
 * @param {prng.PRNG} gen
 */
const runGenTest = (tc, gen) => {
  group('next - average distribution', () => {
    let sum = 0;
    for (let i = 0; i < genTestData; i++) {
      const next = gen.next();
      if (next >= 1) {
        fail('unexpected prng result');
      }
      sum += next;
    }
    const avg = sum / genTestData;
    assert(avg >= 0.45);
    assert(avg <= 0.55);
  });

  group('bool - bool distribution is fair', () => {
    let head = 0;
    let tail = 0;
    let b;
    let i;

    for (i = 0; i < genTestData; i++) {
      b = bool(gen);
      if (b) {
        head++;
      } else {
        tail++;
      }
    }
    info(`Generated ${head} heads and ${tail} tails.`);
    assert(tail >= floor(genTestData * 0.45), 'Generated enough tails.');
    assert(head >= floor(genTestData * 0.45), 'Generated enough heads.');
  });
  group('int31 - integers average correctly', () => {
    let count = 0;
    let i;

    for (i = 0; i < genTestData; i++) {
      count += uint32(gen, 0, 100);
    }
    const average = count / genTestData;
    const expectedAverage = 100 / 2;
    info(`Average is: ${average}. Expected average is ${expectedAverage}.`);
    assert(abs(average - expectedAverage) <= 2, 'Expected average is at most 1 off.');
  });

  group('int32 - generates integer with 32 bits', () => {
    let largest = 0;
    let smallest = 0;
    let i;
    let newNum;
    for (i = 0; i < genTestData; i++) {
      newNum = int32(gen, -BITS31, BITS31);
      if (newNum > largest) {
        largest = newNum;
      }
      if (newNum < smallest) {
        smallest = newNum;
      }
    }
    assert(smallest < -1000, 'Smallest number is negative');
    assert(largest > 1000, 'Largest number is positive');
    info(`Largest number generated is ${largest} (0x${largest.toString(16)})`);
    info(`Smallest number generated is ${smallest} (0x${smallest.toString(16)})`);
    assert((smallest & BIT32) !== 0, 'Largest number is 32 bits long'); // largest.. assuming we convert int to uint
  });

  group('uint32 - generates unsigned integer with 32 bits', () => {
    let num = 0;
    let i;
    let newNum;
    for (i = 0; i < genTestData; i++) {
      newNum = uint32(gen, 0, BITS32);
      if (newNum > num) {
        num = newNum;
      }
    }
    info(`Largest number generated is ${num} (0x${num.toString(16)})`);
    assert((num & BIT32) !== 0, 'Largest number is 32 bits long.');
  });

  group('int53 - generates integer exceeding 32 bits', () => {
    let largest = 0;
    let smallest = 0;
    let i;
    let newNum;
    for (i = 0; i < genTestData; i++) {
      newNum = int53(gen, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
      if (newNum > largest) {
        largest = newNum;
      }
      if (newNum < smallest) {
        smallest = newNum;
      }
    }
    assert(smallest < -1000, 'Smallest number is negative');
    assert(largest > 1000, 'Largest number is positive');
    info(`Largest number generated is ${largest}`);
    info(`Smallest number generated is ${smallest}`);
    assert(largest > (BITS32 >>> 0), 'Largest number exceeds BITS32');
    assert(smallest < BITS32, 'Smallest Number is smaller than BITS32 (negative)');
  });

  group('uint53 - generates integer exceeding 32 bits', () => {
    let largest = 0;
    let smallest = 10000;
    let i;
    let newNum;
    for (i = 0; i < genTestData; i++) {
      newNum = uint53(gen, 0, Number.MAX_SAFE_INTEGER);
      if (newNum > largest) {
        largest = newNum;
      }
      /* istanbul ignore if */
      if (newNum < smallest) {
        smallest = newNum;
      }
    }
    assert(smallest >= 0, 'Smallest number is not negative');
    assert(largest > 1000, 'Largest number is positive');
    info(`Largest number generated is ${largest}`);
    info(`Smallest number generated is ${smallest}`);
    assert(largest > (BITS32 >>> 0), 'Largest number exceeds BITS32');
  });

  group('int31 - generates integer with 31 bits', () => {
    let num = 0;
    let i;
    let newNum;
    for (i = 0; i < genTestData; i++) {
      newNum = uint32(gen, 0, BITS31);
      if (newNum > num) {
        num = newNum;
      }
    }
    info(`Largest number generated is ${num} (0x${num.toString(16)})`);
    assert((num & BIT31) !== 0, 'Largest number is 31 bits long.');
  });

  group('real - has 53 bit resolution', () => {
    let num = 0;
    let i;
    let newNum;
    for (i = 0; i < genTestData; i++) {
      newNum = real53(gen) * MAX_SAFE_INTEGER;
      if (newNum > num) {
        num = newNum;
      }
    }
    info(`Largest number generated is ${num}.`);
    assert((MAX_SAFE_INTEGER - num) / MAX_SAFE_INTEGER < 0.01, 'Largest number is close to MAX_SAFE_INTEGER (at most 1% off).');
  });

  group('char - generates all ascii characters', () => {
    const charSet = new Set();
    const chars = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[/]^_`abcdefghijklmnopqrstuvwxyz{|}~"';
    for (let i = chars.length - 1; i >= 0; i--) {
      charSet.add(chars[i]);
    }
    for (let i = 0; i < genTestData; i++) {
      const char$1 = char(gen);
      charSet.delete(char$1);
    }
    info(`Charactes missing: ${charSet.size} - generating all of "${chars}"`);
    assert(charSet.size === 0, 'Generated all documented characters.');
  });
};

/**
 * @param {t.TestCase} tc
 */
const testGeneratorXoroshiro128plus = tc => runGenTest(tc, new Xoroshiro128plus(tc.seed));

/**
 * @param {t.TestCase} tc
 */
const testGeneratorXorshift32 = tc => {
  skip(!production);
  runGenTest(tc, new Xorshift32(tc.seed));
};

/**
 * @param {t.TestCase} tc
 */
const testGeneratorMt19937 = tc => {
  skip(!production);
  runGenTest(tc, new Mt19937(tc.seed));
};

/* istanbul ignore next */
/**
 * @param {prng.PRNG} gen
 * @param {t.TestCase} tc
 */
const printDistribution = (gen, tc) => {
  const DIAMETER = genTestData / 50;
  const canvas$1 = canvas(DIAMETER * 3, DIAMETER);
  const ctx = canvas$1.getContext('2d');
  if (ctx == null) {
    return skip()
  }
  ctx.fillStyle = 'blue';
  for (let i = 0; i < genTestData; i++) {
    const x = int32(gen, 0, DIAMETER * 3);
    const y = int32(gen, 0, DIAMETER);
    ctx.fillRect(x, y, 1, 2);
  }
  printCanvas(canvas$1, DIAMETER);
};

/* istanbul ignore next */
/**
 * @param {t.TestCase} tc
 */
const testNumberDistributions = tc => {
  skip(!isBrowser);
  group('Xoroshiro128plus', () => printDistribution(new Xoroshiro128plus(tc.seed), tc));
  group('Xorshift32', () => printDistribution(new Xorshift32(tc.seed), tc));
  group('MT19937', () => printDistribution(new Mt19937(tc.seed), tc));
};

var prng = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testGeneratorXoroshiro128plus: testGeneratorXoroshiro128plus,
  testGeneratorXorshift32: testGeneratorXorshift32,
  testGeneratorMt19937: testGeneratorMt19937,
  testNumberDistributions: testNumberDistributions
});

/**
 * @param {t.TestCase} tc
 */
const testMedian = tc => {
  assert(isNaN$1(median([])), 'median([]) = NaN');
  assert(median([1]) === 1, 'median([x]) = x');
  assert(median([1, 2, 3]) === 2, 'median([a,b,c]) = b');
  assert(median([1, 2, 3, 4]) === (2 + 3) / 2, 'median([a,b,c,d]) = (b+c)/2');
  assert(median([1, 2, 3, 4, 5]) === 3, 'median([a,b,c,d,e]) = c');
  assert(median([1, 2, 3, 4, 5, 6]) === (3 + 4) / 2, 'median([a,b,c,d,e,f]) = (c+d)/2');
};

var statistics = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testMedian: testMedian
});

/**
 * @param {t.TestCase} tc
 */
const testBitx = tc => {
  for (let i = 1; i <= 32; i++) {
    // @ts-ignore
    assert(binary$1[`BIT${i}`] === (1 << (i - 1)), `BIT${i}=${1 << (i - 1)}`);
  }
};

/**
 * @param {t.TestCase} tc
 */
const testBitsx = tc => {
  assert(BITS0 === 0);
  for (let i = 1; i < 32; i++) {
    const expected = ((1 << i) - 1) >>> 0;
    // @ts-ignore
    const have = binary$1[`BITS${i}`];
    assert(have === expected, `BITS${i}=${have}=${expected}`);
  }
  assert(BITS32 === 0xFFFFFFFF);
};

var binary = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testBitx: testBitx,
  testBitsx: testBitsx
});

/**
 * @param {t.TestCase} tc
 */
const testUint32 = tc => {
  const iterations = 10000;
  let largest = 0;
  let smallest = HIGHEST_INT32;
  let newNum = 0;
  let lenSum = 0;
  let ones = 0;
  for (let i = 0; i < iterations; i++) {
    newNum = uint32$1();
    lenSum += newNum.toString().length;
    ones += newNum.toString(2).split('').filter(x => x === '1').length;
    if (newNum > largest) {
      largest = newNum;
    }
    if (newNum < smallest) {
      smallest = newNum;
    }
  }
  info(`Largest number generated is ${largest} (0x${largest.toString(16)})`);
  info(`Smallest number generated is ${smallest} (0x${smallest.toString(16)})`);
  info(`Average decimal length of number is ${lenSum / iterations}`);
  info(`Average number of 1s in number is ${ones / iterations} (expecting ~16)`);
  assert(((largest & BITS32) >>> 0) === largest, 'Largest number is 32 bits long.');
  assert(((smallest & BITS32) >>> 0) === smallest, 'Smallest number is 32 bits long.');
};

/**
 * @param {t.TestCase} tc
 */
const testUint53 = tc => {
  const iterations = 10000;
  let largest = 0;
  let smallest = MAX_SAFE_INTEGER;
  let newNum = 0;
  let lenSum = 0;
  let ones = 0;
  for (let i = 0; i < iterations; i++) {
    newNum = uint53$1();
    lenSum += newNum.toString().length;
    ones += newNum.toString(2).split('').filter(x => x === '1').length;
    if (newNum > largest) {
      largest = newNum;
    }
    if (newNum < smallest) {
      smallest = newNum;
    }
  }
  info(`Largest number generated is ${largest}`);
  info(`Smallest number generated is ${smallest}`);
  info(`Average decimal length of number is ${lenSum / iterations}`);
  info(`Average number of 1s in number is ${ones / iterations} (expecting ~26.5)`);
  assert(largest > MAX_SAFE_INTEGER * 0.9);
};

/**
 * @param {t.TestCase} tc
 */
const testUuidv4 = tc => {
  info(`Generated a UUIDv4: ${uuidv4()}`);
};

/**
 * @param {t.TestCase} tc
 */
const testUuidv4Overlaps = tc => {
  skip(!production);
  const iterations = extensive ? 1000000 : 10000;
  const uuids = new Set();
  for (let i = 0; i < iterations; i++) {
    const uuid = uuidv4();
    if (uuids.has(uuid)) {
      fail('uuid already exists');
    } else {
      uuids.add(uuid);
    }
    if (uuids.size % (iterations / 20) === 0) {
      info(`${round(uuids.size * 100 / iterations)}% complete`);
    }
  }
  assert(uuids.size === iterations);
};

var random = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testUint32: testUint32,
  testUint53: testUint53,
  testUuidv4: testUuidv4,
  testUuidv4Overlaps: testUuidv4Overlaps
});

/**
 * @param {Promise<any>} p
 * @param {number} min
 * @param {number} max
 */
const measureP = (p, min, max) => {
  const start = getUnixTime();
  return p.then(() => {
    const duration = getUnixTime() - start;
    assert(duration <= max, 'Expected promise to take less time');
    assert(duration >= min, 'Expected promise to take more time');
  })
};

/**
 * @template T
 * @param {Promise<T>} p
 * @return {Promise<T>}
 */
const failsP = p => create$4((resolve, reject) => p.then(() => reject(create$6('Promise should fail')), resolve));

/**
 * @param {t.TestCase} tc
 */
const testRepeatPromise = async tc => {
  assert(createEmpty(r => r()).constructor === Promise, 'p.create() creates a Promise');
  assert(resolve().constructor === Promise, 'p.reject() creates a Promise');
  const rejectedP = reject();
  assert(rejectedP.constructor === Promise, 'p.reject() creates a Promise');
  rejectedP.catch(() => {});
  await createEmpty(r => r());
  await failsP(reject());
  await resolve();
  await measureP(wait(10), 7, 1000);
  await measureP(failsP(until(15, () => false)), 15, 1000);
  const startTime = getUnixTime();
  await measureP(until(0, () => (getUnixTime() - startTime) > 100), 100, 1000);
  await all([wait(5), wait(10)]);
};

/**
 * @param {t.TestCase} tc
 */
const testispromise = tc => {
  assert(isPromise(new Promise(() => {})));
  assert(isPromise(create$4(() => {})));
  const rej = reject();
  assert(isPromise(rej));
  rej.catch(() => {});
  assert(isPromise(resolve()));
  assert(isPromise({ then: () => {}, catch: () => {}, finally: () => {} }));
  fails(() => {
    assert(isPromise({ then: () => {}, catch: () => {} }));
  });
};

var promise = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testRepeatPromise: testRepeatPromise,
  testispromise: testispromise
});

class QueueNode {
  constructor () {
    /**
     * @type {QueueNode|null}
     */
    this.next = null;
  }
}

class Queue {
  constructor () {
    /**
     * @type {QueueNode | null}
     */
    this.start = null;
    /**
     * @type {QueueNode | null}
     */
    this.end = null;
  }
}

/**
 * @note The queue implementation is experimental and unfinished.
 * Don't use this in production yet.
 *
 * @return {Queue}
 */
const create$3 = () => new Queue();

/**
 * @param {Queue} queue
 */
const isEmpty$1 = queue => queue.start === null;

/**
 * @param {Queue} queue
 * @param {QueueNode} n
 */
const enqueue = (queue, n) => {
  if (queue.end !== null) {
    queue.end.next = n;
    queue.end = n;
  } else {
    queue.end = n;
    queue.start = n;
  }
};

/**
 * @param {Queue} queue
 * @return {QueueNode | null}
 */
const dequeue = queue => {
  const n = queue.start;
  if (n !== null) {
    // @ts-ignore
    queue.start = n.next;
    if (queue.start === null) {
      queue.end = null;
    }
    return n
  }
  return null
};

class QueueItem$1 extends QueueNode {
  /**
   * @param {number} v
   */
  constructor (v) {
    super();
    this.v = v;
  }
}

/**
 * @param {t.TestCase} tc
 */
const testEnqueueDequeue$1 = tc => {
  const N = 30;
  /**
   * @type {queue.Queue}
   */
  const q = create$3();
  assert(isEmpty$1(q));
  assert(dequeue(q) === null);
  for (let i = 0; i < N; i++) {
    enqueue(q, new QueueItem$1(i));
    assert(!isEmpty$1(q));
  }
  for (let i = 0; i < N; i++) {
    const item = /** @type {QueueItem} */ (dequeue(q));
    assert(item !== null && item.v === i);
  }
  assert(isEmpty$1(q));
  assert(dequeue(q) === null);
  for (let i = 0; i < N; i++) {
    enqueue(q, new QueueItem$1(i));
    assert(!isEmpty$1(q));
  }
  for (let i = 0; i < N; i++) {
    const item = /** @type {QueueItem} */ (dequeue(q));
    assert(item !== null && item.v === i);
  }
  assert(isEmpty$1(q));
  assert(dequeue(q) === null);
};

var queue = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testEnqueueDequeue: testEnqueueDequeue$1
});

/**
 * @param {t.TestCase} tc
 */
const testMap = tc => {
  const m = create$a();
  m.set(1, 2);
  m.set(2, 3);
  assert(map$4(m, (value, key) => value * 2 + key).reduce(add$1) === 13);
  let numberOfWrites = 0;
  const createT = () => {
    numberOfWrites++;
    return {}
  };
  setIfUndefined$1(m, 3, createT);
  setIfUndefined$1(m, 3, createT);
  setIfUndefined$1(m, 3, createT);
  compare(copy(m), m);
  assert(numberOfWrites === 1);
};

var map$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testMap: testMap
});

/**
 * @param {t.TestCase} tc
 */
const testEventloopOrder = tc => {
  let currI = 0;
  for (let i = 0; i < 10; i++) {
    const bi = i;
    enqueue$1(() => {
      assert(currI++ === bi);
    });
  }
  enqueue$1(() => {
    assert(currI === 10);
  });
  assert(currI === 0);
  return all([
    createEmpty(resolve => enqueue$1(resolve)),
    until(0, () => currI === 10)
  ])
};

/**
 * @param {t.TestCase} tc
 */
const testTimeout = async tc => {
  let set = false;
  const timeout$1 = timeout(0, () => {
    set = true;
  });
  timeout$1.destroy();
  await create$4(resolve => {
    timeout(10, resolve);
  });
  assert(set === false);
};

/**
 * @param {t.TestCase} tc
 */
const testInterval = async tc => {
  let set = false;
  const timeout = interval(1, () => {
    set = true;
  });
  timeout.destroy();
  let i = 0;
  interval(1, () => {
    i++;
  });
  await until(0, () => i > 2);
  assert(set === false);
  assert(i > 1);
};

/**
 * @param {t.TestCase} tc
 */
const testAnimationFrame = async tc => {
  let x = false;
  animationFrame(() => { x = true; });
  await until(0, () => x);
  assert(x);
};

/**
 * @param {t.TestCase} tc
 */
const testIdleCallback = async tc => {
  await create$4(resolve => {
    idleCallback(resolve);
  });
};

var eventloop = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testEventloopOrder: testEventloopOrder,
  testTimeout: testTimeout,
  testInterval: testInterval,
  testAnimationFrame: testAnimationFrame,
  testIdleCallback: testIdleCallback
});

/**
 * @param {t.TestCase} tc
 */
const testTime = tc => {
  const l = getDate().getTime();
  const r = getUnixTime();
  assert(abs(l - r) < 10, 'Times generated are roughly the same');
};

/**
 * @param {t.TestCase} tc
 */
const testHumanDuration = tc => {
  assert(humanizeDuration(10) === '10ms');
  assert(humanizeDuration(0.1) === '100μs');
  assert(humanizeDuration(61030) === '1min 1s');
  assert(humanizeDuration(60030) === '1min');
  assert(humanizeDuration(3600000) === '1h');
  assert(humanizeDuration(3640000) === '1h 1min');
  assert(humanizeDuration(3700000) === '1h 2min');
  assert(humanizeDuration(60 * 60 * 1000 + 29000) === '1h');
  assert(humanizeDuration(60 * 60 * 1000 + 31000) === '1h 1min');
  assert(humanizeDuration(60 * 60 * 1000 + 31000 * 3) === '1h 2min');
  assert(humanizeDuration(3600000 * 25) === '1d 1h');
  assert(humanizeDuration(3600000 * 24.6) === '1d 1h');
  assert(humanizeDuration(3600000 * 25.6) === '1d 2h');
  assert(humanizeDuration(3600000 * 24 * 400) === '400d');
  // test round
  assert(humanizeDuration(6001) === '6s');
};

var time = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testTime: testTime,
  testHumanDuration: testHumanDuration
});

/**
 * @param {t.TestCase} tc
 */
const testPair = tc => {
  const ps = [create$7(1, 2), create$7(3, 4), createReversed(6, 5)];
  describe('Counting elements in pair list');
  let countLeft = 0;
  let countRight = 0;
  forEach(ps, (left, right) => {
    countLeft += left;
    countRight += right;
  });
  assert(countLeft === 9);
  assert(countRight === 12);
  assert(countLeft === map$2(ps, left => left).reduce(add$1));
  assert(countRight === map$2(ps, (left, right) => right).reduce(add$1));
};

var pair = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testPair: testPair
});

/**
 * @param {t.TestCase} tc
 */
const testObject = tc => {
  assert(create$9().constructor === undefined, 'object.create creates an empty object without constructor');
  describe('object.equalFlat');
  assert(equalFlat({}, {}), 'comparing equal objects');
  assert(equalFlat({ x: 1 }, { x: 1 }), 'comparing equal objects');
  assert(equalFlat({ x: 'dtrn' }, { x: 'dtrn' }), 'comparing equal objects');
  assert(!equalFlat({ x: {} }, { x: {} }), 'flatEqual does not dive deep');
  assert(equalFlat({ x: undefined }, { x: undefined }), 'flatEqual handles undefined');
  assert(!equalFlat({ x: undefined }, { y: {} }), 'flatEqual handles undefined');
  describe('object.every');
  assert(every({ a: 1, b: 3 }, (v, k) => (v % 2) === 1 && k !== 'c'));
  assert(!every({ a: 1, b: 3, c: 5 }, (v, k) => (v % 2) === 1 && k !== 'c'));
  describe('object.some');
  assert(some({ a: 1, b: 3 }, (v, k) => v === 3 && k === 'b'));
  assert(!some({ a: 1, b: 5 }, (v, k) => v === 3));
  assert(some({ a: 1, b: 5 }, () => true));
  assert(!some({ a: 1, b: 5 }, (v, k) => false));
  describe('object.forEach');
  let forEachSum = 0;
  forEach$1({ x: 1, y: 3 }, (v, k) => { forEachSum += v; });
  assert(forEachSum === 4);
  describe('object.map');
  assert(map$3({ x: 1, z: 5 }, (v, k) => v).reduce(add$1) === 6);
  describe('object.length');
  assert(length$1({}) === 0);
  assert(length$1({ x: 1 }) === 1);
};

var object = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testObject: testObject
});

/**
 * @param {t.TestCase} tc
 */
const testMath = tc => {
  describe('math.abs');
  assert(abs(-1) === 1);
  assert(abs(Number.MIN_SAFE_INTEGER) === Number.MAX_SAFE_INTEGER);
  assert(abs(Number.MAX_SAFE_INTEGER) === Number.MAX_SAFE_INTEGER);
  describe('math.add');
  assert([1, 2, 3, 4, 5].reduce(add$1) === 15);
  describe('math.ceil');
  assert(ceil(1.5) === 2);
  assert(ceil(-1.5) === -1);
  describe('math.floor');
  assert(floor(1.5) === 1);
  assert(floor(-1.5) === -2);
  describe('math.isNaN');
  assert(isNaN$1(NaN));
  // @ts-ignore
  assert(!isNaN$1(null));
  describe('math.max');
  assert([1, 3, 65, 1, 314, 25, 3475, 2, 1].reduce(max) === 3475);
  describe('math.min');
  assert([1, 3, 65, 1, 314, 25, 3475, 2, 1].reduce(min) === 1);
  describe('math.round');
  assert(round(0.5) === 1);
  assert(round(-0.5) === 0);
};

var math = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testMath: testMath
});

/**
 * @param {t.TestCase} tc
 */
const testNumber = tc => {
  describe('isNaN');
  assert(isNaN(NaN));
  assert(!isNaN(1 / 0));
  // @ts-ignore
  assert(isNaN('a' / 0));
  assert(!isNaN(0));
  describe('isInteger');
  assert(!isInteger(1 / 0));
  assert(!isInteger(NaN));
  assert(isInteger(0));
  assert(isInteger(-1));
};

/**
 * This benchmark confirms performance of division vs shifting numbers.
 *
 * @param {t.TestCase} tc
 */
const testShiftVsDivision = tc => {
  /**
   * @type {Array<number>}
   */
  const numbers = [];

  for (let i = 0; i < 10000; i++) {
    numbers.push(uint32$1());
  }

  measureTime('comparison', () => {
    for (let i = 0; i < numbers.length; i++) {
      let n = numbers[i];
      while (n > 0) {
        const ns = n >>> 7;
        const nd = floor(n / 128);
        assert(ns === nd);
        n = nd;
      }
    }
  });

  measureTime('shift', () => {
    let x = 0;
    for (let i = 0; i < numbers.length; i++) {
      x = numbers[i] >>> 7;
    }
    info('' + x);
  });

  measureTime('division', () => {
    for (let i = 0; i < numbers.length; i++) {
      floor(numbers[i] / 128);
    }
  });

  {
    /**
     * @type {Array<number>}
     */
    const divided = [];
    /**
     * @type {Array<number>}
     */
    const shifted = [];
    measureTime('division', () => {
      for (let i = 0; i < numbers.length; i++) {
        divided.push(floor(numbers[i] / 128));
      }
    });

    measureTime('shift', () => {
      for (let i = 0; i < numbers.length; i++) {
        shifted.push(numbers[i] >>> 7);
      }
    });

    compareArrays(shifted, divided);
  }
};

var number = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testNumber: testNumber,
  testShiftVsDivision: testShiftVsDivision
});

/**
 * @param {t.TestCase} tc
 */
const testRepeatBase64Encoding = tc => {
  const gen = tc.prng;
  const barr = uint8Array(gen, 100000);
  const copied = copyUint8Array(barr);
  const encoded = toBase64(barr);
  assert(encoded.constructor === String);
  const decoded = fromBase64(encoded);
  assert(decoded.constructor === Uint8Array);
  assert(decoded.byteLength === barr.byteLength);
  for (let i = 0; i < barr.length; i++) {
    assert(barr[i] === decoded[i]);
  }
  compare(copied, decoded);
};

/**
 * @param {t.TestCase} tc
 */
const testAnyEncoding = tc => {
  const obj = { val: 1, arr: [1, 2], str: '409231dtrnä' };
  const res = decodeAny(encodeAny(obj));
  compare(obj, res);
};

var buffer = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testRepeatBase64Encoding: testRepeatBase64Encoding,
  testAnyEncoding: testAnyEncoding
});

/**
 * Utility module to work with sets.
 *
 * @module set
 */

const create$2 = () => new Set();

/**
 * @template T
 * @param {Set<T>} set
 * @return {T}
 */
const first = set => {
  return set.values().next().value || undefined
};

/**
 * @template T
 * @param {Iterable<T>} entries
 * @return {Set<T>}
 */
const from = entries => {
  return new Set(entries)
};

/**
 * @template T
 * @param {t.TestCase} tc
 */
const testFirst = tc => {
  const two = from(['a', 'b']);
  const one = from(['b']);
  const zero = create$2();
  assert(first(two) === 'a');
  assert(first(one) === 'b');
  assert(first(zero) === undefined);
};

var set$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testFirst: testFirst
});

/**
 * Efficient sort implementations.
 *
 * Note: These sort implementations were created to compare different sorting algorithms in JavaScript.
 * Don't use them if you don't know what you are doing. Native Array.sort is almost always a better choice.
 *
 * @module sort
 */

/**
 * @template T
 * @param {Array<T>} arr
 * @param {number} lo
 * @param {number} hi
 * @param {function(T,T):number} compare
 */
const _insertionSort = (arr, lo, hi, compare) => {
  for (let i = lo + 1; i <= hi; i++) {
    for (let j = i; j > 0 && compare(arr[j - 1], arr[j]) > 0; j--) {
      const tmp = arr[j];
      arr[j] = arr[j - 1];
      arr[j - 1] = tmp;
    }
  }
};

/**
 * @template T
 * @param {Array<T>} arr
 * @param {function(T,T):number} compare
 * @return {void}
 */
const insertionSort = (arr, compare) => {
  _insertionSort(arr, 0, arr.length - 1, compare);
};

/**
 * @template T
 * @param {Array<T>} arr
 * @param {number} lo
 * @param {number} hi
 * @param {function(T,T):number} compare
 */
const _quickSort = (arr, lo, hi, compare) => {
  if (hi - lo < 42) {
    _insertionSort(arr, lo, hi, compare);
  } else {
    const pivot = arr[floor((lo + hi) / 2)];
    let i = lo;
    let j = hi;
    while (true) {
      while (compare(pivot, arr[i]) > 0) {
        i++;
      }
      while (compare(arr[j], pivot) > 0) {
        j--;
      }
      if (i >= j) {
        break
      }
      // swap arr[i] with arr[j]
      // and increment i and j
      const arri = arr[i];
      arr[i++] = arr[j];
      arr[j--] = arri;
    }
    _quickSort(arr, lo, j, compare);
    _quickSort(arr, j + 1, hi, compare);
  }
};

/**
 * This algorithm beats Array.prototype.sort in Chrome only with arrays with 10 million entries.
 * In most cases [].sort will do just fine. Make sure to performance test your use-case before you
 * integrate this algorithm.
 *
 * Note that Chrome's sort is now a stable algorithm (Timsort). Quicksort is not stable.
 *
 * @template T
 * @param {Array<T>} arr
 * @param {function(T,T):number} compare
 * @return {void}
 */
const quicksort = (arr, compare) => {
  _quickSort(arr, 0, arr.length - 1, compare);
};

/**
 * @template T
 * @param {t.TestCase} tc
 * @param {Array<T>} arr
 * @param {function(T,T):number} compare
 * @param {function(T):number} getVal
 */
const runSortTest = (tc, arr, compare, getVal) => {
  const arrSort = arr;
  const arrQuicksort = arr.slice();
  const arrInsertionsort = arr.slice();
  measureTime('Array.constructor.sort', () => {
    arrSort.sort(compare);
  });
  if (arrInsertionsort.length <= 10000) {
    measureTime('Insertionsort', () => {
      insertionSort(arrInsertionsort, compare);
    });
    compareArrays(arrSort, arrInsertionsort, 'compare Insertionsort with expected result');
  }
  measureTime('Quicksort', () => {
    quicksort(arrQuicksort, compare);
  });
  // quickSort is not stable
  compareArrays(arrSort.map(getVal), arrQuicksort.map(getVal), 'compare Quicksort with expected result');
};

/**
 * @template T
 * @param {t.TestCase} tc
 * @param {function(number):Array<T>} createArray
 * @param {function(T,T):number} compare 0 if equal, 1 if a<b, -1 otherwise
 * @param {function(T):number} getVal
 */
const createSortTest = (tc, createArray, compare, getVal) => {
  describe('sort 10 elements');
  runSortTest(tc, createArray(10), compare, getVal);
  describe('sort 10 elements');
  runSortTest(tc, createArray(10), compare, getVal);
  describe('sort 10 elements');
  runSortTest(tc, createArray(10), compare, getVal);
  describe('sort 50 elements');
  runSortTest(tc, createArray(50), compare, getVal);
  describe('sort 100 elements');
  runSortTest(tc, createArray(100), compare, getVal);
  describe('sort 500 elements');
  runSortTest(tc, createArray(500), compare, getVal);
  describe('sort 1k elements');
  runSortTest(tc, createArray(1000), compare, getVal);
  describe('sort 10k elements');
  runSortTest(tc, createArray(10000), compare, getVal);
  describe('sort 100k elements');
  runSortTest(tc, createArray(100000), compare, getVal);
  if (extensive) {
    describe('sort 1M elements');
    runSortTest(tc, createArray(1000000), compare, getVal);
    describe('sort 10M elements');
    runSortTest(tc, createArray(10000000), compare, getVal);
  }
};

/**
 * @param {t.TestCase} tc
 */
const testSortUint16 = tc => {
  skip(!production);
  /**
   * @param {number} i
   * @return {number}
   */
  const getVal = i => i;
  /**
   * @param {number} a
   * @param {number} b
   * @return {number}
   */
  const compare = (a, b) => a - b;
  /**
   * @param {number} len
   * @return {Array<number>}
   */
  const createArray = len => Array.from(new Uint16Array(uint8Array(tc.prng, len * 2)));
  createSortTest(tc, createArray, compare, getVal);
};

/**
 * @param {t.TestCase} tc
 */
const testSortUint32 = tc => {
  skip(!production);
  /**
   * @param {number} i
   * @return {number}
   */
  const getVal = i => i;
  /**
   * @param {number} a
   * @param {number} b
   * @return {number}
   */
  const compare = (a, b) => a - b;
  /**
   * @param {number} len
   * @return {Array<number>}
   */
  const createArray = len => Array.from(uint32Array(tc.prng, len));
  createSortTest(tc, createArray, compare, getVal);
};

/**
 * @param {t.TestCase} tc
 */
const testSortObjectUint32 = tc => {
  /**
   * @param {{index:number}} obj
   * @return {number}
   */
  const getVal = obj => obj.index;
  /**
   * @param {{index:number}} a
   * @param {{index:number}} b
   * @return {number}
   */
  const compare = (a, b) => a.index - b.index;
  /**
   * @param {number} len
   * @return {Array<{index:number}>}
   */
  const createArray = len => Array.from(uint32Array(tc.prng, len)).map(index => ({ index }));
  createSortTest(tc, createArray, compare, getVal);
};

/**
 * @param {t.TestCase} tc
 */
const testListVsArrayPerformance = tc => {
  /**
   * @typedef {{ val: number }} Val
   * @typedef {{ val: Val, next: item }|null} item
   */
  const len = 100000;
  measureTime('array creation', () => {
    /**
     * @type {Array<Val>}
     */
    const array = new Array(len);
    for (let i = 0; i < len; i++) {
      array[i] = { val: i };
    }
  });
  measureTime('list creation', () => {
    /**
     * @type {item}
     */
    const listStart = { val: { val: 0 }, next: null };
    for (let i = 1, n = listStart; i < len; i++) {
      const next = { val: { val: i }, next: null };
      n.next = next;
      n = next;
    }
  });
};

var sort = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testSortUint16: testSortUint16,
  testSortUint32: testSortUint32,
  testSortObjectUint32: testSortObjectUint32,
  testListVsArrayPerformance: testListVsArrayPerformance
});

/**
 * Utility module to work with urls.
 *
 * @module url
 */

/**
 * Parse query parameters from an url.
 *
 * @param {string} url
 * @return {Object<string,string>}
 */
const decodeQueryParams = url => {
  /**
   * @type {Object<string,string>}
   */
  const query = {};
  const urlQuerySplit = url.split('?');
  const pairs = urlQuerySplit[urlQuerySplit.length - 1].split('&');
  for (var i = 0; i < pairs.length; i++) {
    const item = pairs[i];
    if (item.length > 0) {
      const pair = item.split('=');
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
  }
  return query
};

/**
 * @param {Object<string,string>} params
 * @return {string}
 */
const encodeQueryParams = params =>
  map$3(params, (val, key) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`).join('&');

/**
 * @param {Object<string,any>} params
 */
const paramTest = params => {
  const out = decodeQueryParams(encodeQueryParams(params));
  compareObjects(params, out, 'Compare params');
};

/**
 * @param {t.TestCase} tc
 */
const testUrlParamQuery = tc => {
  paramTest({});
  paramTest({ a: '4' });
  paramTest({ a: 'dtrn', b: '0x0' });

  compareObjects({ }, decodeQueryParams('http://localhost:8080/dtrn?'));
  compareObjects({ a: 'ay' }, decodeQueryParams('http://localhost:8080/dtrn?a=ay'));
  compareObjects({ a: '' }, decodeQueryParams('http://localhost:8080/dtrn?a='));
  compareObjects({ a: '' }, decodeQueryParams('http://localhost:8080/dtrn?a'));
  compareObjects({ a: 'ay' }, decodeQueryParams('http://localhost:8080/dtrn?a=ay&'));
  compareObjects({ a: 'ay', b: 'bey' }, decodeQueryParams('http://localhost:8080/dtrn?a=ay&b=bey'));
};

var url = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testUrlParamQuery: testUrlParamQuery
});

/**
 * @param {t.TestCase} tc
 */
const testMetricPrefix = tc => {
  compare(prefix(0), { n: 0, prefix: '' });
  compare(prefix(1, -1), { n: 1, prefix: 'm' });
  compare(prefix(1.5), { n: 1.5, prefix: '' });
  compare(prefix(100.5), { n: 100.5, prefix: '' });
  compare(prefix(1000.5), { n: 1.0005, prefix: 'k' });
  compare(prefix(0.3), { n: 300, prefix: 'm' });
  compare(prefix(0.001), { n: 1, prefix: 'm' });
  // up
  compare(prefix(10000), { n: 10, prefix: 'k' });
  compare(prefix(1e7), { n: 10, prefix: 'M' });
  compare(prefix(1e11), { n: 100, prefix: 'G' });
  compare(prefix(1e12 + 3), { n: (1e12 + 3) / 1e12, prefix: 'T' });
  compare(prefix(1e15), { n: 1, prefix: 'P' });
  compare(prefix(1e20), { n: 100, prefix: 'E' });
  compare(prefix(1e22), { n: 10, prefix: 'Z' });
  compare(prefix(1e24), { n: 1, prefix: 'Y' });
  compare(prefix(1e28), { n: 10000, prefix: 'Y' });
  // down
  compare(prefix(0.01), { n: 10, prefix: 'm' });
  compare(prefix(1e-4), { n: 100, prefix: 'μ' });
  compare(prefix(1e-9), { n: 1, prefix: 'n' });
  compare(prefix(1e-12), { n: 1, prefix: 'p' });
  compare(prefix(1e-14), { n: 10, prefix: 'f' });
  compare(prefix(1e-18), { n: 1, prefix: 'a' });
  compare(prefix(1e-21), { n: 1, prefix: 'z' });
  compare(prefix(1e-22), { n: 100, prefix: 'y' });
  compare(prefix(1e-30), { n: 0.000001, prefix: 'y' });
};

var metric = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testMetricPrefix: testMetricPrefix
});

/**
 * @param {t.TestCase} tc
 */
const testDeepEquality = tc => {
  assert(equalityDeep(1, 1));
  assert(!equalityDeep(1, 2));
  assert(!equalityDeep(1, '1'));
  assert(!equalityDeep(1, null));

  const obj = { b: 5 };
  const map1 = new Map();
  const map2 = new Map();
  const map3 = new Map();
  const map4 = new Map();
  map1.set('a', obj);
  map2.set('a', { b: 5 });
  map3.set('b', obj);
  map4.set('a', obj);
  map4.set('b', obj);

  assert(equalityDeep({ a: 4 }, { a: 4 }));
  assert(equalityDeep({ a: 4, obj: { b: 5 } }, { a: 4, obj }));
  assert(!equalityDeep({ a: 4 }, { a: 4, obj }));
  assert(equalityDeep({ a: [], obj }, { a: [], obj }));
  assert(!equalityDeep({ a: [], obj }, { a: [], obj: undefined }));

  assert(equalityDeep({}, {}));
  assert(!equalityDeep({}, { a: 4 }));

  assert(equalityDeep([{ a: 4 }, 1], [{ a: 4 }, 1]));
  assert(!equalityDeep([{ a: 4 }, 1], [{ a: 4 }, 2]));
  assert(!equalityDeep([{ a: 4 }, 1], [{ a: 4 }, 1, 3]));
  assert(equalityDeep([], []));
  assert(!equalityDeep([1], []));

  assert(equalityDeep(map1, map2));
  assert(!equalityDeep(map1, map3));
  assert(!equalityDeep(map1, map4));

  const set1 = new Set([1]);
  const set2 = new Set([true]);
  const set3 = new Set([1, true]);
  const set4 = new Set([true]);

  assert(equalityDeep(set2, set4));
  assert(!equalityDeep(set1, set2));
  assert(!equalityDeep(set1, set3));
  assert(!equalityDeep(set1, set4));
  assert(!equalityDeep(set2, set3));
  assert(equalityDeep(set2, set4));

  const buf1 = Uint8Array.from([1, 2]);
  const buf2 = Uint8Array.from([1, 3]);
  const buf3 = Uint8Array.from([1, 2, 3]);
  const buf4 = Uint8Array.from([1, 2]);

  assert(!equalityDeep(buf1, buf2));
  assert(!equalityDeep(buf2, buf3));
  assert(!equalityDeep(buf3, buf4));
  assert(equalityDeep(buf4, buf1));

  assert(!equalityDeep(buf1.buffer, buf2.buffer));
  assert(!equalityDeep(buf2.buffer, buf3.buffer));
  assert(!equalityDeep(buf3.buffer, buf4.buffer));
  assert(equalityDeep(buf4.buffer, buf1.buffer));

  assert(!equalityDeep(buf1, buf4.buffer));
};

var func = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testDeepEquality: testDeepEquality
});

/**
 * @param {t.TestCase} tc
 */
const testStorageModule = tc => {
  const s = varStorage;
  /**
   * @type {any}
   */
  let lastEvent = null;
  onChange(event => {
    lastEvent = event;
  });
  s.setItem('key', 'value');
  assert(lastEvent === null);
};

var storage = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testStorageModule: testStorageModule
});

class ListNode {
  constructor () {
    /**
     * @type {this|null}
     */
    this.next = null;
    /**
     * @type {this|null}
     */
    this.prev = null;
  }
}

/**
 * @template {ListNode} N
 */
class List {
  constructor () {
    /**
     * @type {N | null}
     */
    this.start = null;
    /**
     * @type {N | null}
     */
    this.end = null;
    this.len = 0;
  }
}

/**
 * @note The queue implementation is experimental and unfinished.
 * Don't use this in production yet.
 *
 * @template {ListNode} N
 *
 * @return {List<N>}
 */
const create$1 = () => new List();

/**
 * @template {ListNode} N
 *
 * @param {List<N>} queue
 */
const isEmpty = queue => queue.start === null;

/**
 * Remove a single node from the queue. Only works with Queues that operate on Doubly-linked lists of nodes.
 *
 * @template {ListNode} N
 *
 * @param {List<N>} queue
 * @param {N} node
 */
const remove$1 = (queue, node) => {
  const prev = node.prev;
  const next = node.next;
  if (prev) {
    prev.next = next;
  } else {
    queue.start = next;
  }
  if (next) {
    next.prev = prev;
  } else {
    queue.end = prev;
  }
  queue.len--;
  return node
};

/**
 * @deprecated @todo remove in next major release
 */
const removeNode = remove$1;

/**
 * @template {ListNode} N
 *
 * @param {List<N>} queue
 * @param {N| null} left
 * @param {N| null} right
 * @param {N} node
 */
const insertBetween = (queue, left, right, node) => {
  /* istanbul ignore if */
  if (left != null && left.next !== right) {
    throw unexpectedCase()
  }
  if (left) {
    left.next = node;
  } else {
    queue.start = node;
  }
  if (right) {
    right.prev = node;
  } else {
    queue.end = node;
  }
  node.prev = left;
  node.next = right;
  queue.len++;
};

/**
 * Remove a single node from the queue. Only works with Queues that operate on Doubly-linked lists of nodes.
 *
 * @template {ListNode} N
 *
 * @param {List<N>} queue
 * @param {N} node
 * @param {N} newNode
 */
const replace = (queue, node, newNode) => {
  insertBetween(queue, node, node.next, newNode);
  remove$1(queue, node);
};

/**
 * @template {ListNode} N
 *
 * @param {List<N>} queue
 * @param {N} n
 */
const pushEnd = (queue, n) =>
  insertBetween(queue, queue.end, null, n);

/**
 * @template {ListNode} N
 *
 * @param {List<N>} queue
 * @param {N} n
 */
const pushFront = (queue, n) =>
  insertBetween(queue, null, queue.start, n);

/**
 * @template {ListNode} N
 *
 * @param {List<N>} list
 * @return {N| null}
 */
const popFront = list =>
  list.start ? removeNode(list, list.start) : null;

/**
 * @template {ListNode} N
 *
 * @param {List<N>} list
 * @return {N| null}
 */
const popEnd = list =>
  list.end ? removeNode(list, list.end) : null;

/**
 * @template {ListNode} N
 * @template M
 *
 * @param {List<N>} list
 * @param {function(N):M} f
 * @return {Array<M>}
 */
const map = (list, f) => {
  /**
   * @type {Array<M>}
   */
  const arr = [];
  let n = list.start;
  while (n) {
    arr.push(f(n));
    n = n.next;
  }
  return arr
};

/**
 * @template {ListNode} N
 *
 * @param {List<N>} list
 */
const toArray = list => map(list, id);

class QueueItem extends ListNode {
  /**
   * @param {number} v
   */
  constructor (v) {
    super();
    this.v = v;
  }
}

/**
 * @param {t.TestCase} tc
 */
const testEnqueueDequeue = tc => {
  const N = 30;
  /**
   * @type {list.List<QueueItem>}
   */
  const q = create$1();
  assert(isEmpty(q));
  assert(popFront(q) === null);
  for (let i = 0; i < N; i++) {
    pushEnd(q, new QueueItem(i));
    assert(!isEmpty(q));
  }
  for (let i = 0; i < N; i++) {
    const item = /** @type {QueueItem} */ (popFront(q));
    assert(item !== null && item.v === i);
  }
  assert(isEmpty(q));
  assert(popFront(q) === null);
  for (let i = 0; i < N; i++) {
    pushEnd(q, new QueueItem(i));
    assert(!isEmpty(q));
  }
  for (let i = 0; i < N; i++) {
    const item = /** @type {QueueItem} */ (popFront(q));
    assert(item !== null && item.v === i);
  }
  assert(isEmpty(q));
  assert(popFront(q) === null);
};

/**
 * @param {t.TestCase} tc
 */
const testSelectivePop = tc => {
  /**
   * @type {list.List<QueueItem>}
   */
  const l = create$1();
  pushFront(l, new QueueItem(1));
  const q3 = new QueueItem(3);
  pushEnd(l, q3);
  const middleNode = new QueueItem(2);
  insertBetween(l, l.start, l.end, middleNode);
  replace(l, q3, new QueueItem(4));
  compare(map(l, n => n.v), [1, 2, 4]);
  compare(toArray(l).map(n => n.v), [1, 2, 4]);
  assert(l.len === 3);
  assert(remove$1(l, middleNode) === middleNode);
  assert(l.len === 2);
  compare(/** @type {QueueItem} */ (popEnd(l)).v, 4);
  assert(l.len === 1);
  compare(/** @type {QueueItem} */ (popEnd(l)).v, 1);
  assert(l.len === 0);
  compare(popEnd(l), null);
  assert(l.start === null);
  assert(l.end === null);
  assert(l.len === 0);
};

var list = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testEnqueueDequeue: testEnqueueDequeue,
  testSelectivePop: testSelectivePop
});

/**
 * @template K, V
 *
 * @implements {list.ListNode}
 */
class Entry {
  /**
   * @param {K} key
   * @param {V | Promise<V>} val
   */
  constructor (key, val) {
    /**
     * @type {this | null}
     */
    this.prev = null;
    /**
     * @type {this | null}
     */
    this.next = null;
    this.created = getUnixTime();
    this.val = val;
    this.key = key;
  }
}

/**
 * @template K, V
 */
class Cache {
  /**
   * @param {number} timeout
   */
  constructor (timeout) {
    this.timeout = timeout;
    /**
     * @type list.List<Entry<K, V>>
     */
    this._q = create$1();
    /**
     * @type {Map<K, Entry<K, V>>}
     */
    this._map = create$a();
  }
}

/**
 * @template K, V
 *
 * @param {Cache<K, V>} cache
 * @return {number} Returns the current timestamp
 */
const removeStale = cache => {
  const now = getUnixTime();
  const q = cache._q;
  while (q.start && now - q.start.created > cache.timeout) {
    cache._map.delete(q.start.key);
    popFront(q);
  }
  return now
};

/**
 * @template K, V
 *
 * @param {Cache<K, V>} cache
 * @param {K} key
 * @param {V} value
 */
const set = (cache, key, value) => {
  const now = removeStale(cache);
  const q = cache._q;
  const n = cache._map.get(key);
  if (n) {
    removeNode(q, n);
    pushEnd(q, n);
    n.created = now;
    n.val = value;
  } else {
    const node = new Entry(key, value);
    pushEnd(q, node);
    cache._map.set(key, node);
  }
};

/**
 * @template K, V
 *
 * @param {Cache<K, V>} cache
 * @param {K} key
 * @return {Entry<K, V> | undefined}
 */
const getNode = (cache, key) => {
  removeStale(cache);
  const n = cache._map.get(key);
  if (n) {
    return n
  }
};

/**
 * @template K, V
 *
 * @param {Cache<K, V>} cache
 * @param {K} key
 * @return {V | undefined}
 */
const get = (cache, key) => {
  const n = getNode(cache, key);
  return n && !(n.val instanceof Promise) ? n.val : undefined
};

/**
 * @template K, V
 *
 * @param {Cache<K, V>} cache
 * @param {K} key
 */
const refreshTimeout = (cache, key) => {
  const now = getUnixTime();
  const q = cache._q;
  const n = cache._map.get(key);
  if (n) {
    removeNode(q, n);
    pushEnd(q, n);
    n.created = now;
  }
};

/**
 * Works well in conjunktion with setIfUndefined which has an async init function.
 * Using getAsync & setIfUndefined ensures that the init function is only called once.
 *
 * @template K, V
 *
 * @param {Cache<K, V>} cache
 * @param {K} key
 * @return {V | Promise<V> | undefined}
 */
const getAsync = (cache, key) => {
  const n = getNode(cache, key);
  return n ? n.val : undefined
};

/**
 * @template K, V
 *
 * @param {Cache<K, V>} cache
 * @param {K} key
 */
const remove = (cache, key) => {
  const n = cache._map.get(key);
  if (n) {
    removeNode(cache._q, n);
    cache._map.delete(key);
    return n.val && !(n.val instanceof Promise) ? n.val : undefined
  }
};

/**
 * @template K, V
 *
 * @param {Cache<K, V>} cache
 * @param {K} key
 * @param {function():Promise<V>} init
 * @param {boolean} removeNull Optional argument that automatically removes values that resolve to null/undefined from the cache.
 * @return {Promise<V> | V}
 */
const setIfUndefined = (cache, key, init, removeNull = false) => {
  removeStale(cache);
  const q = cache._q;
  const n = cache._map.get(key);
  if (n) {
    return n.val
  } else {
    const p = init();
    const node = new Entry(key, p);
    pushEnd(q, node);
    cache._map.set(key, node);
    p.then(v => {
      if (p === node.val) {
        node.val = v;
      }
      if (removeNull && v == null) {
        remove(cache, key);
      }
    });
    return p
  }
};

/**
 * @param {number} timeout
 */
const create = timeout => new Cache(timeout);

/**
 * @param {t.TestCase} tc
 */
const testCache = async tc => {
  /**
   * @type {cache.Cache<string, string>}
   */
  const c = create(50);
  set(c, 'a', '1');
  assert(get(c, 'a') === '1');
  assert(await getAsync(c, 'a') === '1');
  const p = setIfUndefined(c, 'b', () => resolveWith('2'));
  const q = setIfUndefined(c, 'b', () => resolveWith('3'));
  assert(p === q);
  assert(get(c, 'b') == null);
  assert(getAsync(c, 'b') === p);
  assert(await p === '2');
  assert(get(c, 'b') === '2');
  assert(getAsync(c, 'b') === '2');

  await wait(5); // keys shouldn't be timed out yet
  assert(get(c, 'a') === '1');
  assert(get(c, 'b') === '2');

  /**
   * @type {any}
   */
  const m = c._map;
  const aTimestamp1 = m.get('a').created;
  const bTimestamp1 = m.get('b').created;

  // write new values and check later if the creation-timestamp was updated
  set(c, 'a', '11');
  set(c, 'b', '22');

  await wait(5); // keys should be updated and not timed out. Hence the creation time should be updated
  assert(get(c, 'a') === '11');
  assert(get(c, 'b') === '22');
  set(c, 'a', '11');
  set(c, 'b', '22');
  // timestamps should be updated
  assert(aTimestamp1 !== m.get('a').created);
  assert(bTimestamp1 !== m.get('b').created);

  await wait(60); // now the keys should be timed-out

  assert(get(c, 'a') == null);
  assert(getAsync(c, 'b') == null);

  assert(c._map.size === 0);
  assert(c._q.start === null && c._q.end === null);

  // test edge case of setIfUndefined
  const xp = setIfUndefined(c, 'a', () => resolve('x'));
  set(c, 'a', 'y');
  await xp;
  // we override the Entry.val property in cache when p resolves. However, we must prevent that when the value is overriden before p is resolved.
  assert(get(c, 'a') === 'y');

  // test that we can remove properties
  remove(c, 'a');
  remove(c, 'does not exist'); // remove a non-existent property to achieve full test-coverage
  assert(get(c, 'a') === undefined);

  // test that the optional property in setifUndefined works
  const yp = setIfUndefined(c, 'a', () => resolveWith(null), true);
  assert(await yp === null);
  assert(get(c, 'a') === undefined);

  // check manual updating of timeout
  set(c, 'a', '3');
  const ts1 = m.get('a').created;
  await wait(30);
  refreshTimeout(c, 'a');
  const ts2 = m.get('a').created;
  assert(ts1 !== ts2);
  refreshTimeout(c, 'x'); // for full test coverage
  assert(m.get('x') == null);
};

var cache = /*#__PURE__*/Object.freeze({
  __proto__: null,
  testCache: testCache
});

/* istanbul ignore if */
if (isBrowser) {
  createVConsole(document.body);
}

runTests({
  array,
  logging,
  string,
  encoding,
  diff,
  testing,
  indexeddb,
  prng,
  statistics,
  binary,
  random,
  promise,
  queue,
  map: map$1,
  eventloop,
  time,
  pair,
  object,
  math,
  number,
  buffer,
  set: set$1,
  sort,
  url,
  metric,
  func,
  storage,
  list,
  cache
}).then(success => {
  /* istanbul ignore next */
  if (isNode) {
    process.exit(success ? 0 : 1);
  }
});
//# sourceMappingURL=test.cjs.map
