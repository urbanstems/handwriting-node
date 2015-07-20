'use strict';

var fs = require('fs');
var http = require('http');
var https = require('https');
var path = require('path');
var Promise = require('bluebird');
var _ = require('lodash');

var utils = require('./utils');
var Error = require('./Error');

var hasOwn = {}.hasOwnProperty;


// Provide extension mechanism for Stripe Resource Sub-Classes
HandwritingResource.extend = utils.protoExtend;

// Expose method-creator & prepared (basic) methods
HandwritingResource.method = require('./HandwritingMethod');

/**
 * Encapsulates request logic for a Stripe Resource
 */
function HandwritingResource(handwriting, urlData) {
  this._handwriting = handwriting;
  this._urlData = urlData || {};

  this.path = utils.makeURLInterpolator(this.path);

  this.initialize.apply(this, arguments);

}

HandwritingResource.prototype = {

  path: '',

  initialize: function() {},

  // Function to override the default data processor. This allows full control
  // over how a HandwritingResource's request data will get converted into an HTTP
  // body. This is useful for non-standard HTTP requests. The function should
  // take method name, data, and headers as arguments.
  requestDataProcessor: null,

  // String that overrides the base API endpoint. If `overrideHost` is not null
  // then all requests for a particular resource will be sent to a base API
  // endpoint as defined by `overrideHost`.
  overrideHost: null,

  createFullPath: function(commandPath, urlData) {
    return path.join(
      this.path(urlData),
      typeof commandPath == 'function' ?
        commandPath(urlData) : commandPath
    ).replace(/\\/g, '/'); // ugly workaround for Windows
  },

  createUrlData: function() {
    var urlData = {};
    // Merge in baseData
    for (var i in this._urlData) {
      if (hasOwn.call(this._urlData, i)) {
        urlData[i] = this._urlData[i];
      }
    }
    return urlData;
  },

  createDeferred: function(callback) {
      var deferred = Promise.defer();

      if (callback) {
        // Callback, if provided, is a simply translated to Promise'esque:
        // (Ensure callback is called outside of promise stack)
        deferred.promise.then(function(res) {
          setTimeout(function(){ callback(null, res) }, 0);
        }, function(err) {
          setTimeout(function(){ callback(err, null); }, 0);
        });
      }

      return deferred;
  },

  _timeoutHandler: function(timeout, req, callback) {
    var self = this;
    return function() {
      var timeoutErr = new Error('ETIMEDOUT');
      timeoutErr.code = 'ETIMEDOUT';

      req._isAborted = true;
      req.abort();

      callback.call(
        self,
        new Error.HandwritingConnectionError({
          message: 'Request aborted due to timeout being reached (' + timeout + 'ms)',
          detail: timeoutErr
        }),
        null
      );
    }
  },

  _responsePdfHandler: function (req, callback) {
    var self = this;
    return function (res) {
      var chunks = [];

      res.on('data', function(chunk) {
        chunks.push(chunk);
      });

      res.on('end', function() {
        var headers = res.headers || {};
        var response;
        // Check the chunks array
        // if its length is <= 1, it is probably an error
        // but we'll make sure with the statusCode
        if (chunks.length <= 1 && res.statusCode >= 400) {

          var json = new Buffer(chunks[0], 'base64').toString('utf8');

          var err;

          try {
            response = JSON.parse(json);

            if (res.statusCode === 401) {
              err = new Error.HandwritingAuthenticationError(response.error);
            } else if (res.statusCode === 400) {
              err = new Error.HandwritingInvalidRequestError({
                message: response.error,
                code: 400
              });
            } else {
              err = Error.HandwritingError.generate(response.error);
            }

            return callback.call(self, err, null);
          } catch (e) {
            return callback.call(
              self,
              new Error.HandwritingAPIError({
                message: 'Invalid JSON received from the Handwriting.io API',
                response: json,
                exception: e,
                requestId: headers['request-id']
              }),
              null
            );
          }
        }

        // PDF downloaded - concatenate all chunked buffers
        var jsfile = Buffer.concat(chunks);
        
        return callback.call(self, null, jsfile);
      });
    }
  },

  _responseHandler: function(req, callback) {
    // if PDF request, move to different handler
    if(req._headers.accept === 'application/pdf'){
      return this._responsePdfHandler(req, callback);
    }
    var self = this;
    return function(res) {
      var response = '';

      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        response += chunk;
      });
      res.on('end', function() {
        var headers = res.headers || {};
// console.log('res: ', headers, '||', response, '******');
        try {
          response = JSON.parse(response);
          if (response.error) {
            var err;

            response.error.requestId = headers['request-id'];

            if (res.statusCode === 401) {
              err = new Error.HandwritingAuthenticationError(response.error);
            } else {
              err = Error.HandwritingError.generate(response.error);
            }
            return callback.call(self, err, null);
          }
        } catch (e) {
          return callback.call(
            self,
            new Error.HandwritingAPIError({
              message: 'Invalid JSON received from the Handwriting.io API',
              response: response,
              exception: e,
              requestId: headers['request-id']
            }),
            null
          );
        }
        callback.call(self, null, response);
      });
    };
  },

  _errorHandler: function(req, callback) {
    var self = this;
    return function(error) {
      if (req._isAborted) return; // already handled
      callback.call(
        self,
        new Error.HandwritingConnectionError({
          message: 'An error occurred with our connection to Handwriting.io',
          detail: error
        }),
        null
      );
    }
  },

  _request: function(method, path, data, auth, options, callback) {
    var self = this;
    var requestData;
    var agent = new http.Agent;
    agent.maxSockets = 1;

    if (self.requestDataProcessor) {
      requestData = self.requestDataProcessor(method, data, options.headers);
    } else {
      requestData = utils.stringifyRequestData(data || {});
    }

    if (method.toLowerCase() === 'get' && !_.isEmpty(requestData)) {
      path = path + '?' + requestData;
    }

    var apiVersion = this._handwriting.getApiField('version');

    var headers = {
      // Use specified auth token or use default from this stripe instance:
      'Authorization': auth ?
        'Basic ' + new Buffer(auth + ':').toString('base64') :
        this._handwriting.getApiField('auth'),
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': requestData.length,
      'User-Agent': 'Stripe/v1 NodeBindings/' + this._handwriting.getConstant('PACKAGE_VERSION')
    };

    if (apiVersion) {
      headers['Stripe-Version'] = apiVersion;
    }

    if (options.headers) {
      headers = _.extend(headers, options.headers);
    }
    makeRequest();

    function makeRequest() {

      var timeout = self._handwriting.getApiField('timeout');
      var isInsecureConnection = self._handwriting.getApiField('protocol') == 'http';

      var host = self.overrideHost || self._handwriting.getApiField('host');

      var req = (
        isInsecureConnection ? http : https
      ).request({
        host: host,
        port: self._handwriting.getApiField('port'),
        path: path,
        method: method,
        agent: self._handwriting.getApiField('agent'),
        headers: headers,
        ciphers: 'DEFAULT:!aNULL:!eNULL:!LOW:!EXPORT:!SSLv2:!MD5'
      });

      req.setTimeout(timeout, self._timeoutHandler(timeout, req, callback));
      req.on('response', self._responseHandler(req, callback));
      req.on('error', self._errorHandler(req, callback));

      req.on('socket', function(socket) {
        socket.on((isInsecureConnection ? 'connect' : 'secureConnect'), function() {
          // Send payload; we're safe:
          req.write(requestData);
          req.end();
        });
      });

    }

  }

};

module.exports = HandwritingResource;
