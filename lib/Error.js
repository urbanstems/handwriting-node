'use strict';

var utils = require('./utils');

module.exports = _Error;

/**
 * Generic Error klass to wrap any errors returned by stripe-node
 */
function _Error(raw) {
  this.populate.apply(this, arguments);
  this.stack = (new Error(this.message)).stack;
}

// Extend Native Error
_Error.prototype = Object.create(Error.prototype);

_Error.prototype.type = 'GenericError';
_Error.prototype.populate = function(type, message) {
  this.type = type;
  this.message = message;
};

_Error.extend = utils.protoExtend;

/**
 * Create subclass of internal Error klass
 * (Specifically for errors returned from Stripe's REST API)
 */
var HandwritingError = _Error.HandwritingError = _Error.extend({
  type: 'HandwritingError',
  populate: function(raw) {

    // Move from prototype def (so it appears in stringified obj)
    this.type = this.type;

    this.stack = (new Error(raw.message)).stack;
    this.rawType = raw.type;
    this.code = raw.code;
    this.param = raw.param;
    this.message = raw.message;
    this.detail = raw.detail;
    this.raw = raw;
    this.requestId = raw.requestId;
  }
});

/**
 * Helper factory which takes raw stripe errors and outputs wrapping instances
 */
HandwritingError.generate = function(rawHandwritingError) {
  switch (rawHandwritingError.type) {
    case 'card_error':
      return new _Error.HandwritingCardError(rawHandwritingError);
    case 'invalid_request_error':
      return new _Error.HandwritingInvalidRequestError(rawHandwritingError);
    case 'api_error':
      return new _Error.HandwritingAPIError(rawHandwritingError);
  }
  return new _Error('Generic', 'Unknown Error');
};

// Specific Handwriting.io Error types:
_Error.HandwritingCardError = HandwritingError.extend({ type: 'HandwritingCardError' });
_Error.HandwritingInvalidRequestError = HandwritingError.extend({ type: 'HandwritingInvalidRequest' });
_Error.HandwritingAPIError = HandwritingError.extend({ type: 'HandwritingAPIError' });
_Error.HandwritingAuthenticationError = HandwritingError.extend({ type: 'HandwritingAuthenticationError' });
_Error.HandwritingConnectionError = HandwritingError.extend({ type: 'HandwritingConnectionError' });
