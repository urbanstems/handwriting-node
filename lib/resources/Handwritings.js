'use strict';

var HandwritingResource = require('../HandwritingResource');
var handwritingMethod = HandwritingResource.method;
var utils = require('../utils');

module.exports = HandwritingResource.extend({
  // Since path can either be `account` or `accounts`, support both through stripeMethod path

  list: handwritingMethod({
    method: 'GET',
    path: '/handwritings'
  }),

  retrieve: handwritingMethod({
    method: 'GET',
    path: '/handwritings/{id}',
    urlParams: ['id']
  })

});
