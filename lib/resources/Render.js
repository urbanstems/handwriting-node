'use strict';

var HandwritingResource = require('../HandwritingResource');
var handwritingMethod = HandwritingResource.method;

module.exports = HandwritingResource.extend({

  path: '/render',

  getPdf: handwritingMethod({
    method: 'GET',
    path: '/pdf',
    headers: {
      'Accept': 'application/pdf',
    },
    reqQuery: ['handwriting_id', 'text']
  }),

  getPng: handwritingMethod({
    method: 'GET',
    path: '/png'
  })

});

