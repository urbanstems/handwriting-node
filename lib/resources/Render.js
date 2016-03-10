'use strict';

var HandwritingResource = require('../HandwritingResource');
var handwritingMethod = HandwritingResource.method;

module.exports = HandwritingResource.extend({

  path: '/render',

  createPdf: handwritingMethod({
    method: 'GET',
    path: '/pdf',
    headers: {
      'Accept': 'application/pdf',
    },
    reqQuery: ['handwriting_id', 'text']
  }),

  createPng: handwritingMethod({
    method: 'GET',
    path: '/png',
    headers: {
      'Accept': 'image/png',
    },
    reqQuery: ['handwriting_id', 'text']
  })

});

