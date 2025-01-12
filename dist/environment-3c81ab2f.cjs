'use strict';

var map = require('./map-28a001c9.cjs');
var string = require('./string-ad04f734.cjs');
var conditions = require('./conditions-fb475c70.cjs');
var storage = require('./storage.cjs');
var _function = require('./function-3410854f.cjs');

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
const isMac = typeof navigator !== 'undefined'
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
      params = map.create();
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
      params = map.create(); // eslint-disable-next-line no-undef
      (location.search || '?').slice(1).split('&').forEach((kv) => {
        if (kv.length !== 0) {
          const [key, value] = kv.split('=');
          params.set(`--${string.fromCamelCase(key, '-')}`, value);
          params.set(`-${string.fromCamelCase(key, '-')}`, value);
        }
      });
    } else {
      params = map.create();
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
    ? conditions.undefinedToNull(process.env[name.toUpperCase()])
    : conditions.undefinedToNull(storage.varStorage.getItem(name));

/**
 * @param {string} name
 * @return {string|null}
 */
const getConf = (name) =>
  computeParams().get('--' + name) || getVariable(name);

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
  _function.isOneOf(process.env.FORCE_COLOR, ['true', '1', '2']);

/* istanbul ignore next */
const supportsColor = !hasParam('no-colors') &&
  (!isNode || process.stdout.isTTY || forceColor) && (
  !isNode || hasParam('color') || forceColor ||
    getVariable('COLORTERM') !== null ||
    (getVariable('TERM') || '').includes('color')
);

var environment = /*#__PURE__*/Object.freeze({
  __proto__: null,
  isNode: isNode,
  isBrowser: isBrowser,
  isMac: isMac,
  hasParam: hasParam,
  getParam: getParam,
  getVariable: getVariable,
  getConf: getConf,
  hasConf: hasConf,
  production: production,
  supportsColor: supportsColor
});

exports.environment = environment;
exports.getConf = getConf;
exports.getParam = getParam;
exports.getVariable = getVariable;
exports.hasConf = hasConf;
exports.hasParam = hasParam;
exports.isBrowser = isBrowser;
exports.isMac = isMac;
exports.isNode = isNode;
exports.production = production;
exports.supportsColor = supportsColor;
//# sourceMappingURL=environment-3c81ab2f.cjs.map
