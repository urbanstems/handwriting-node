# Handwriting.io node.js bindings

## Installation

`npm install handwriting-node`

## Documentation

Documentation will come soon.

## API Overview

Every resource is accessed via your `handwriting` instance:

```js
var handwriting = require('handwriting-node')(' your handwriting.io key ', ' your handwriting.io secret ');
// handwriting.{ RESOURCE_NAME }.{ METHOD_NAME }
```

Every resource method accepts an optional callback as the last argument:

```js
handwriting.handwritings.list()
  .then(function (handwritings) {
    var firstHandwriting = handwritings[0]; // choosing the first handwritings
    return handwriting.render.createPdf({
      handwriting_id: firstHandwriting.id,
      text: 'This is a message.\nThis is the next line.'
    });
  })
  .then(function (renderedPdf) {
    renderedPdf; // the pdf object
  })
  .catch(function (err) {
    err; // err object with reason and status code
  });
```

### Available resources & methods

*Where you see `params` it is a plain JavaScript object, e.g. `{ email: 'foo@example.com' }`*

 * handwritings
  * [`list()`](https://handwriting.io/docs/#get-handwritings)
  * [`retrieve(params)`](https://handwriting.io/docs/#get-handwritings--id-)
 * render
  * [`createPdf(params)`](https://handwriting.io/docs/#get-render-pdf)
  * [`createPng(params)`](https://handwriting.io/docs/#get-render-png)


## Development

To run the tests you'll need a Handwriting.io *Test* API key (from your [Handwriting.io Dashboard](https://handwriting.io/account)):

```bash
$ npm install -g mocha
$ npm test
```

## Thanks

This repository is almost a wholesale clone of [Stripe's Node library](https://github.com/stripe/stripe-node). A huge thanks goes to their awesome tech team for creating a great model Node library.
