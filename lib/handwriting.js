'use strict';

Handwriting.DEFAULT_HOST = 'api.handwriting.io';
Handwriting.DEFAULT_PORT = '443';

// Use node's default timeout:
Handwriting.DEFAULT_TIMEOUT = require('http').createServer().timeout;

Handwriting.PACKAGE_VERSION = require('../package.json').version;

Handwriting.USER_AGENT = {
  bindings_version: Handwriting.PACKAGE_VERSION,
  lang: 'node',
  uname: null
};

Handwriting.USER_AGENT_SERIALIZED = null;

var resources = {
  // Support Accounts for consistency, Account for backwards compat
  Handwritings: require('./resources/Handwritings'),
  Render: require('./resources/Render')
};

Handwriting.HandwritingResource = require('./HandwritingResource');
Handwriting.resources = resources;

function Handwriting(key, secret) {

  if (!(this instanceof Handwriting)) {
    return new Handwriting(key, secret);
  }

  this._api = {
    auth: null,
    host: Handwriting.DEFAULT_HOST,
    port: Handwriting.DEFAULT_PORT,
    timeout: Handwriting.DEFAULT_TIMEOUT,
    agent: null,
    dev: false
  };

  this._prepResources();
  this.setApiKey(key, secret);
}

Handwriting.prototype = {

  setHost: function(host, port, protocol) {
    this._setApiField('host', host);
    if (port) this.setPort(port);
    if (protocol) this.setProtocol(protocol);
  },

  setProtocol: function(protocol) {
    this._setApiField('protocol', protocol.toLowerCase());
  },

  setPort: function(port) {
    this._setApiField('port', port);
  },

  setApiVersion: function(version) {
    if (version) {
      this._setApiField('version', version);
    }
  },

  setApiKey: function(key, secret) {
    if (key && secret) {
      this._setApiField(
        'auth',
        'Basic ' + new Buffer(key + ':' + secret).toString('base64')
      );
    }
  },

  setTimeout: function(timeout) {
    this._setApiField(
      'timeout',
      timeout == null ? Handwriting.DEFAULT_TIMEOUT : timeout
    );
  },

  setHttpAgent: function(agent) {
    this._setApiField('agent', agent);
  },

  _setApiField: function(key, value) {
    this._api[key] = value;
  },

  getApiField: function(key) {
    return this._api[key];
  },

  getConstant: function(c) {
    return Handwriting[c];
  },

  getClientUserAgent: function(cb) {
    if (Handwriting.USER_AGENT_SERIALIZED) {
      return cb(Handwriting.USER_AGENT_SERIALIZED);
    }
  },

  _prepResources: function() {
    for (var name in resources) {
      this[
        name[0].toLowerCase() + name.substring(1)
      ] = new resources[name](this);
    }

  }

};

module.exports = Handwriting;
