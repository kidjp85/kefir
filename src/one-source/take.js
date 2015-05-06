const {createStream, createProperty} = require('../patterns/one-source');
const {VALUE, END} = require('../constants');

const mixin = {

  _init({n}) {
    this._n = n;
    if (n <= 0) {
      this._send(END);
    }
  },

  _handleValue(x) {
    this._n--;
    this._send(VALUE, x);
    if (this._n === 0) {
      this._send(END);
    }
  }

};

const S = createStream('take', mixin);
const P = createProperty('take', mixin);


module.exports = function takeWhile(obs, n) {
  return new (obs.ofSameType(S, P))(obs, {n});
};