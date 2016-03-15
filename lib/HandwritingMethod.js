'use strict';

var _ = require('lodash');
var path = require('path');
var utils = require('./utils');
var OPTIONAL_REGEX = /^optional!/;

/**
 * Create an API method from the declared spec.
 *
 * @param [spec.method='GET'] Request Method (POST, GET, DELETE, PUT)
 * @param [spec.path=''] Path to be appended to the API BASE_PATH, joined with 
 *  the instance's path (e.g. "render" or "handwriting")
 * @param [spec.required=[]] Array of required arguments in the order that they
 *  must be passed by the consumer of the API. Subsequent optional arguments are
 *  optionally passed through a hash (Object) as the penultimate argument
 *  (preceeding the also-optional callback argument
 */
module.exports = function stripeMethod(spec) {

  var commandPath = typeof spec.path == 'function' ? spec.path
                  : utils.makeURLInterpolator( spec.path || '' );
  var requestMethod = (spec.method || 'GET').toUpperCase();
  var urlParams = spec.urlParams || [];
  var reqQuery = spec.reqQuery || [];

  return function() {
    var self = this;
    var args = [].slice.call(arguments);

    var callback = typeof args[args.length - 1] == 'function' && args.pop();
    var deferred = this.createDeferred(callback);
    var urlData = this.createUrlData();

    for (var i = 0, l = urlParams.length; i < l; ++i) {
      var arg = args[0];
      var param = urlParams[i];

      var isOptional = OPTIONAL_REGEX.test(param);
      param = param.replace(OPTIONAL_REGEX, '');

      if (!arg) {
        if (isOptional) {
          urlData[param] = '';
          continue;
        }
        throw new Error('Handwriting: I require argument "' + urlParams[i] + '", but I got: ' + arg);
      }

      urlData[param] = args.shift();
    }

    for ( var j = 0, m = reqQuery.length; j < m; ++j){
      var arg = args[0];
      var query = reqQuery[j];

      if (!arg[query]) {
        throw new Error('Handwriting: I require argument "' + query);
      }
      if(j === m) {
        reqQuery[query] = args.shift();
      }
    }

    var data = utils.getDataFromArgs(args);
    var opts = utils.getOptionsFromArgs(args);

    if (args.length) {
      throw new Error(
        'Handwriting: Unknown arguments (' + args + '). Did you mean to pass an options object? '
      );
    }

    var requestPath = this.createFullPath(commandPath, urlData);
    var requestCallback = function(err, response) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(
          spec.transformResponseData ?
            spec.transformResponseData(response) :
            response
        );
      }
    };

    var options = {headers: _.extend(opts.headers, spec.headers)};
    self._request(requestMethod, requestPath, data, opts.auth, options, requestCallback);

    return deferred.promise;

  };
};
