'use strict';

// NOTE: testUtils should be require'd before anything else in each spec file!

require('mocha');
// Ensure we are using the 'as promised' libs before any tests are run:
require('chai').use(require('chai-as-promised'));

var utils = module.exports = {

  getUserHandwritingKey: function() {
    var key = process.env.HANDWRITING_TEST_API_KEY || '';

    return key;
  },

  getUserHandwritingSecret: function () {
    var secret = process.env.HANDWRITING_TEST_API_SECRET || '';

    return secret;
  },

  getSpyableHandwriting: function() {
    // Provide a testable handwriting.io instance
    // That is, with mock-requests built in and hookable

    var Handwriting = require('../lib/handwriting');
    var handwritingInstance = Handwriting('fakeAuthToken', 'fakeAuthSecret');

    handwritingInstance.REQUESTS = [];

    for (var i in handwritingInstance) {
      if (handwritingInstance[i] instanceof Handwriting.HandwritingResource) {

        // Override each _request method so we can make the params
        // available to consuming tests (revealing requests made on
        // REQUESTS and LAST_REQUEST):
        handwritingInstance[i]._request = function(method, url, data, auth, options, cb) {
          var req = handwritingInstance.LAST_REQUEST = {
            method: method,
            url: url,
            data: data,
            headers: options.headers || {},
          };
          if (auth) req.auth = auth;
          handwritingInstance.REQUESTS.push(req);
          cb.call(this, null, {});
        };

      }
    }

    return handwritingInstance;

  }

};



