//TODO make sure message to customer is working

/*jslint node: true */
"use strict";

const express       = require('express');
const router        = express.Router();
const secretToken   = require('./secretToken');
const C             = require('../lib/constants.js');
const twilio        = require('twilio');
const client        = new twilio(secretToken.accountSid, secretToken.authToken);

const CHEF_NUMBER = C.CHEF_NUMBER;
const TWILIO_NUMBER = C.TWILIO_NUMBER;

const TEST_ID = 38;

function formatOrderMessage(id, cart) {
  let message = `\nORDER ID: ${id}\n`;
  for(let key in cart) {
    let item     = cart[key];
    let details  = JSON.parse(item.json);
    message += `${item.qty}X ${details.name}\n`;
  }
  message += 'Response must be sent in the following format:\n';
  message += 'ID - MINUTES';
  return message;
}

function sendOrderToChef(order_id, cart) { // takes an array of objects and adds quantity and id of each to a message to the chef
  client.messages.create({
      body: formatOrderMessage(order_id, cart),
      to: CHEF_NUMBER,
      from: TWILIO_NUMBER
  });
}

function parseResponse(response) {
  if(!/^\s*\d+\s*-\s*\d+\s*$/.test(response)) {
    return null;
  }
  else {
    return response
            .match(/\d+/g)
            .map(Number);
  }
}

function sendErrorToChef(id_invalid=false) {
  let message = `
  Your response was not formatted correctly. 
  The order status has not been updated.`;

  if(id_invalid) {
    message = `
    The order id you provided is invalid.
    The order status has not been updated.`;
  }

  client.messages.create({
      body: message,
      to: CHEF_NUMBER,
      from: TWILIO_NUMBER
  });

}

function sendStatusToCustomer(minutes, customer_phone_number) {
  client.messages.create({
    body: `\n${C.MESSAGE_TO_CUSTOMER(minutes)}`,
    to: customer_phone_number, 
    from: TWILIO_NUMBER
  });
}


// console.log();
// const response_parsed = parseResponse(process.argv[2]);
// applyChefsResponse(response_parsed);



module.exports = (DataAccess) => {

  function applyChefsResponse([id, minutes]) {
    DataAccess.updateOrderStatusPromise(id, minutes)
    .then((customer_phone_number) => {
      console.log(customer_phone_number);
      sendStatusToCustomer(minutes, customer_phone_number);
    })
    .catch(() => {
      sendErrorToChef(true);
    }); 
  }

  router.post("/", (req, res) => {
    let json     = req.session.cart;

    try {
      const cart   = JSON.parse(json);
      const uai    = req.session.username_and_id;

      DataAccess.addOrderPromise(uai, cart)

      .then((data_cart) => {
        req.session.cart = null;
        sendOrderToChef(data_cart[0], cart);
        res.status(201).send();
      })

      .catch((message) => {
        console.log(message);
        res.status(400).send(message);
      });
    }
    catch(err) {
      res.status(400).send('there was a problem sending the order');
    }   
  });

  router.get("/", (req, res) => {
    const uai = req.session.username_and_id;
    DataAccess.getOrdersPromise(uai)
    .then((result) => {
      // console.log(result);
      res.render('orders', {
        username_and_id: uai,
        logged_in: true,
        orders: JSON.stringify(result)
      });
    })
    .catch((message) => {
      res.status(400).send('invalid user data');  
    });
  });

  router.post("/response", (req, res) => {
    const response          = req.body.Body;
    const response_parsed   = parseResponse(response);

    if(response_parsed) {
      applyChefsResponse(response_parsed);
      res.status(200).send();
    }
    else {
      sendErrorToChef();
      res.status(400).send();
    }
  });

  return router;
};
