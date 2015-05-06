const {createStream, createProperty} = require('../patterns/one-source');
const {VALUE, END} = require('../constants');
const now = require('../utils/now');


const mixin = {

  _init({wait, immediate}) {
    this._wait = Math.max(0, wait);
    this._immediate = immediate;
    this._lastAttempt = 0;
    this._timeoutId = null;
    this._laterValue = null;
    this._endLater = false;
    this._$later = () => this._later();
  },

  _free() {
    this._laterValue = null;
    this._$later = null;
  },

  _handleValue(x) {
    if (this._activating) {
      this._send(VALUE, x);
    } else {
      this._lastAttempt = now();
      if (this._immediate && !this._timeoutId) {
        this._send(VALUE, x);
      }
      if (!this._timeoutId) {
        this._timeoutId = setTimeout(this._$later, this._wait);
      }
      if (!this._immediate) {
        this._laterValue = x;
      }
    }
  },

  _handleEnd() {
    if (this._activating) {
      this._send(END);
    } else {
      if (this._timeoutId && !this._immediate) {
        this._endLater = true;
      } else {
        this._send(END);
      }
    }
  },

  _later() {
    let last = now() - this._lastAttempt;
    if (last < this._wait && last >= 0) {
      this._timeoutId = setTimeout(this._$later, this._wait - last);
    } else {
      this._timeoutId = null;
      if (!this._immediate) {
        this._send(VALUE, this._laterValue);
        this._laterValue = null;
      }
      if (this._endLater) {
        this._send(END);
      }
    }
  }

};

const S = createStream('debounce', mixin);
const P = createProperty('debounce', mixin);

module.exports = function debounce(obs, wait, {immediate}) {
  return new (obs.ofSameType(S, P))(obs, {wait, immediate});
};
