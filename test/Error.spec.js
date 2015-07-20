'use strict';

require('./testUtils');

var Error = require('../lib/Error');
var expect = require('chai').expect;

describe('Error', function() {

  it('Populates with type and message params', function() {
    var e = new Error('FooError', 'Foo happened');
    expect(e).to.have.property('type', 'FooError');
    expect(e).to.have.property('message', 'Foo happened');
    expect(e).to.have.property('stack');
  });

  describe('HandwritingError', function() {
    it('Generates specific instance depending on error-type', function() {
      expect(Error.HandwritingError.generate({ type: 'card_error' })).to.be.instanceOf(Error.HandwritingCardError);
      expect(Error.HandwritingError.generate({ type: 'invalid_request_error' })).to.be.instanceOf(Error.HandwritingInvalidRequestError);
      expect(Error.HandwritingError.generate({ type: 'api_error' })).to.be.instanceOf(Error.HandwritingAPIError);
    });

    it('Pulls in request IDs', function() {
      var e = Error.HandwritingError.generate({ type: 'card_error', requestId: 'foo'});
      expect(e).to.have.property('requestId', 'foo');
    });
  });
});
