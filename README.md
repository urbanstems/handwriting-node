# Handwriting.io node.js bindings

## Installation

`npm install handwriting`

## Documentation

Documentation will come soon.

## API Overview

Every resource is accessed via your `handwriting` instance:

```js
var handwriting = require('handwriting')(' your handwriting.io key ', ' your handwriting.io secret ');
// handwriting.{ RESOURCE_NAME }.{ METHOD_NAME }
```

Every resource method accepts an optional callback as the last argument:

```js
handwriting.handwritings.list()
.then(function(handwritings){
  var thisHandwriting = handwritings[0];
  return handwriting.render.pdf({
    handwriting_id: thisHandwriting.id,
    text: 'customer@example.com'
  });
}).then(function(renderedPdf) {
  renderedPdf; // the pdf object
}).catch(function(err){
  err; // err object with reason and status code
});
```

### Available resources & methods

*Where you see `params` it is a plain JavaScript object, e.g. `{ email: 'foo@example.com' }`*

 * account
  * [`retrieve()`](https://stripe.com/docs/api/node#retrieve_account)
 * balance
  * [`retrieve()`](https://stripe.com/docs/api/node#retrieve_balance)
  * [`listTransactions([params])`](https://stripe.com/docs/api/node#balance_history)
  * [`retrieveTransaction(transactionId)`](https://stripe.com/docs/api/node#retrieve_balance_transaction)
 * charges
  * [`create(params)`](https://stripe.com/docs/api/node#create_charge)
  * [`list([params])`](https://stripe.com/docs/api/node#list_charges)
  * [`retrieve(chargeId)`](https://stripe.com/docs/api/node#retrieve_charge)
  * [`capture(chargeId[, params])`](https://stripe.com/docs/api/node#charge_capture)
  * [`refund(chargeId[, params])`](https://stripe.com/docs/api/node#create_refund)
  * [`update(chargeId[, params])`](https://stripe.com/docs/api/node#update_charge)
  * [`updateDispute(chargeId[, params])`](https://stripe.com/docs/api/node#update_dispute)
  * [`closeDispute(chargeId[, params])`](https://stripe.com/docs/api/node#close_dispute)
  * `setMetadata(chargeId, metadataObject)` ([metadata info](https://stripe.com/docs/api/node#metadata))
  * `setMetadata(chargeId, key, value)`
  * `getMetadata(chargeId)`
  * `markAsSafe(chargeId)`
  * `markAsFraudulent(chargeId)`
 * coupons
  * [`create(params)`](https://stripe.com/docs/api/node#create_coupon)
  * [`list([params])`](https://stripe.com/docs/api/node#list_coupons)
  * [`retrieve(chargeId)`](https://stripe.com/docs/api/node#retrieve_coupon)
  * [`del(chargeId)`](https://stripe.com/docs/api/node#delete_coupon)
 * customers
  * [`create(params)`](https://stripe.com/docs/api/node#create_customer)
  * [`list([params])`](https://stripe.com/docs/api/node#list_customers)
  * [`update(customerId[, params])`](https://stripe.com/docs/api/node#update_customer)
  * [`retrieve(customerId)`](https://stripe.com/docs/api/node#retrieve_customer)
  * [`del(customerId)`](https://stripe.com/docs/api/node#delete_customer)
  * `setMetadata(customerId, metadataObject)` ([metadata info](https://stripe.com/docs/api/node#metadata))
  * `setMetadata(customerId, key, value)`
  * `getMetadata(customerId)`
  * [`createSubscription(customerId, params)`](https://stripe.com/docs/api/node#create_subscription)
  * [`updateSubscription(customerId, subscriptionId, [, params])`](https://stripe.com/docs/api/node#update_subscription)
  * [`cancelSubscription(customerId, subscriptionId, [, params])`](https://stripe.com/docs/api/node#cancel_subscription)
  * [`listSubscriptions(params)`](https://stripe.com/docs/api/node#list_subscriptions)
  * [`createSource(customerId[, params])`](https://stripe.com/docs/api/node#create_card)
  * [`listCards(customerId)`](https://stripe.com/docs/api/node#list_cards)
  * [`retrieveCard(customerId, cardId)`](https://stripe.com/docs/api/node#retrieve_card)
  * [`updateCard(customerId, cardId[, params])`](https://stripe.com/docs/api/node#update_card)
  * [`deleteCard(customerId, cardId)`](https://stripe.com/docs/api/node#delete_card)
  * [`deleteDiscount(customerId)`](https://stripe.com/docs/api/node#delete_discount)
 * events (*[types of events](https://stripe.com/docs/api/node#event_types)*)
  * [`list([params])`](https://stripe.com/docs/api/node#list_events)
  * [`retrieve(eventId)`](https://stripe.com/docs/api/node#retrieve_event)
 * invoiceItems
  * [`create(params)`](https://stripe.com/docs/api/node#create_invoiceitem)
  * [`list([params])`](https://stripe.com/docs/api/node#list_invoiceitems)
  * [`update(invoiceItemId[, params])`](https://stripe.com/docs/api/node#update_invoiceitem)
  * [`retrieve(invoiceItemId)`](https://stripe.com/docs/api/node#retrieve_invoiceitem)
  * [`del(invoiceItemId)`](https://stripe.com/docs/api/node#delete_invoiceitem)
 * invoices
  * [`create(params)`](https://stripe.com/docs/api/node#create_invoice)
  * [`list([params])`](https://stripe.com/docs/api/node#list_customer_invoices)
  * [`update(invoiceId[, params])`](https://stripe.com/docs/api/node#update_invoice)
  * [`retrieve(invoiceId)`](https://stripe.com/docs/api/node#retrieve_invoice)
  * [`retrieveLines(invoiceId)`](https://stripe.com/docs/api/node#invoice_lines)
  * [`retrieveUpcoming(customerId[, params])`](https://stripe.com/docs/api/node#retrieve_customer_invoice)
  * [`pay(invoiceId)`](https://stripe.com/docs/api/node#pay_invoice)
 * plans
  * [`create(params)`](https://stripe.com/docs/api/node#create_plan)
  * [`list([params])`](https://stripe.com/docs/api/node#list_plans)
  * [`update(planId[, params])`](https://stripe.com/docs/api/node#update_plan)
  * [`retrieve(planId)`](https://stripe.com/docs/api/node#retrieve_plan)
  * [`del(planId)`](https://stripe.com/docs/api/node#delete_plan)
 * recipients
  * [`create(params)`](https://stripe.com/docs/api/node#create_recipient)
  * [`list([params])`](https://stripe.com/docs/api/node#list_recipients)
  * [`update(recipientId[, params])`](https://stripe.com/docs/api/node#update_recipient)
  * [`retrieve(recipientId)`](https://stripe.com/docs/api/node#retrieve_recipient)
  * [`del(recipientId)`](https://stripe.com/docs/api/node#delete_recipient)
  * `setMetadata(recipientId, metadataObject)` ([metadata info](https://stripe.com/docs/api/node#metadata))
  * `setMetadata(recipientId, key, value)`
  * `getMetadata(recipientId)`
 * tokens
  * [`create(params)`](https://stripe.com/docs/api/node#create_card_token)
  * [`retrieve(tokenId)`](https://stripe.com/docs/api/node#retrieve_token)
 * transfers
  * [`create(params)`](https://stripe.com/docs/api/node#create_transfer)
  * [`list([params])`](https://stripe.com/docs/api/node#list_transfers)
  * [`retrieve(transferId)`](https://stripe.com/docs/api/node#retrieve_transfer)
  * [`update(transferId[, params])`](https://stripe.com/docs/api/node#update_transfer)
  * [`reverse(transferId[, params])`](https://stripe.com/docs/api/node#create_transfer_reversal)
  * `cancel(transferId)` (Deprecated -- use `reverse`)
  * [`listTransactions(transferId[, params])`](https://stripe.com/docs/api/curl#list_transfers)
  * `setMetadata(transferId, metadataObject)` ([metadata info](https://stripe.com/docs/api/node#metadata))
  * `setMetadata(transferId, key, value)`
  * `getMetadata(transferId)`
 * bitcoinReceivers
  * [`create(params)`](https://stripe.com/docs/api/node#create_bitcoin_receiver)
  * [`retrieve(receiverId)`](https://stripe.com/docs/api/node#retrieve_bitcoin_receiver)
  * [`list([params])`](https://stripe.com/docs/api/node#list_bitcoin_receivers)
  * `getMetadata(receiverId)`


## Development

To run the tests you'll need a Handwriting.io *Test* API key (from your [Handwriting.io Dashboard](https://handwriting.io/account)):

```bash
$ npm install -g mocha
$ npm test
```

## Thanks

This repository is almost a wholesale clone of [Stripe's Node library](https://github.com/stripe/stripe-node). A huge thanks goes to their awesome tech team for creating a great model Node library.
