'use strict';

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
 * @template C
 * @return {Array<C>}
 */
const create = () => /** @type {Array<C>} */ ([]);

/**
 * @template D
 * @param {Array<D>} a
 * @return {Array<D>}
 */
const copy = a => /** @type {Array<D>} */ (a.slice());

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
 * Transforms something array-like to an actual Array.
 *
 * @function
 * @template T
 * @param {ArrayLike<T>|Iterable<T>} arraylike
 * @return {T}
 */
const from = Array.from;

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
const every = (arr, f) => arr.every(f);

/**
 * True iff condition holds on some element in the Array.
 *
 * @function
 * @template S
 * @param {Array<S>} arr
 * @param {function(S, number, Array<S>):boolean} f
 * @return {boolean}
 */
const some = (arr, f) => arr.some(f);

/**
 * @template ELEM
 *
 * @param {Array<ELEM>} a
 * @param {Array<ELEM>} b
 * @return {boolean}
 */
const equalFlat = (a, b) => a.length === b.length && every(a, (item, index) => item === b[index]);

/**
 * @template ELEM
 * @param {Array<Array<ELEM>>} arr
 * @return {Array<ELEM>}
 */
const flatten = arr => arr.reduce((acc, val) => acc.concat(val), []);

const isArray = Array.isArray;

var array = /*#__PURE__*/Object.freeze({
  __proto__: null,
  last: last,
  create: create,
  copy: copy,
  appendTo: appendTo,
  from: from,
  every: every,
  some: some,
  equalFlat: equalFlat,
  flatten: flatten,
  isArray: isArray
});

exports.appendTo = appendTo;
exports.array = array;
exports.copy = copy;
exports.create = create;
exports.equalFlat = equalFlat;
exports.every = every;
exports.flatten = flatten;
exports.from = from;
exports.isArray = isArray;
exports.last = last;
exports.some = some;
//# sourceMappingURL=array-acefe0f2.cjs.map
