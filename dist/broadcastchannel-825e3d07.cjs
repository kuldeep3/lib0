'use strict';

var map = require('./map-28a001c9.cjs');
var encoding = require('./buffer-9fdf7510.cjs');
var storage = require('./storage.cjs');

/* eslint-env browser */

/**
 * @typedef {Object} Channel
 * @property {Set<function(any, any):any>} Channel.subs
 * @property {any} Channel.bc
 */

/**
 * @type {Map<string, Channel>}
 */
const channels = new Map();

class LocalStoragePolyfill {
  /**
   * @param {string} room
   */
  constructor (room) {
    this.room = room;
    /**
     * @type {null|function({data:ArrayBuffer}):void}
     */
    this.onmessage = null;
    storage.onChange(e => e.key === room && this.onmessage !== null && this.onmessage({ data: encoding.fromBase64(e.newValue || '') }));
  }

  /**
   * @param {ArrayBuffer} buf
   */
  postMessage (buf) {
    storage.varStorage.setItem(this.room, encoding.toBase64(encoding.createUint8ArrayFromArrayBuffer(buf)));
  }
}

// Use BroadcastChannel or Polyfill
const BC = typeof BroadcastChannel === 'undefined' ? LocalStoragePolyfill : BroadcastChannel;

/**
 * @param {string} room
 * @return {Channel}
 */
const getChannel = room =>
  map.setIfUndefined(channels, room, () => {
    const subs = new Set();
    const bc = new BC(room);
    /**
     * @param {{data:ArrayBuffer}} e
     */
    bc.onmessage = e => subs.forEach(sub => sub(e.data, 'broadcastchannel'));
    return {
      bc, subs
    }
  });

/**
 * Subscribe to global `publish` events.
 *
 * @function
 * @param {string} room
 * @param {function(any, any):any} f
 */
const subscribe = (room, f) => getChannel(room).subs.add(f);

/**
 * Unsubscribe from `publish` global events.
 *
 * @function
 * @param {string} room
 * @param {function(any, any):any} f
 */
const unsubscribe = (room, f) => getChannel(room).subs.delete(f);

/**
 * Publish data to all subscribers (including subscribers on this tab)
 *
 * @function
 * @param {string} room
 * @param {any} data
 * @param {any} [origin]
 */
const publish = (room, data, origin = null) => {
  const c = getChannel(room);
  c.bc.postMessage(data);
  c.subs.forEach(sub => sub(data, origin));
};

var broadcastchannel = /*#__PURE__*/Object.freeze({
  __proto__: null,
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  publish: publish
});

exports.broadcastchannel = broadcastchannel;
exports.publish = publish;
exports.subscribe = subscribe;
exports.unsubscribe = unsubscribe;
//# sourceMappingURL=broadcastchannel-825e3d07.cjs.map
