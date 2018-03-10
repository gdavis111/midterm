/*jslint node: true */
"use strict";

const express       = require('express');
const router        = express.Router();
const secretToken   = require('./secretToken');
const twilio        = require('twilio');
const client        = new twilio(secretToken.accountSid, secretToken.authToken);

const CHEF_NUMBER = '+15194369581';
const TWILIO_NUMBER = '+15146127315';

function formatOrder(order_obj) {
  let order = "\n";
  for(let key in order_obj) {
    let item     = order_obj[key];
    let details  = JSON.parse(item.json);
    order += item.qty + "x " + details.name +"\n";
  }
  return order;
}

function chefsResponse(orderStatus, customer_phone_number) {
  client.messages.create({
      body: orderStatus,
      to: customer_phone_number, 
      from: TWILIO_NUMBER
  });
}

function messageChef(order_obj) { // takes an array of objects and adds quantity and id of each to a message to the chef
  client.messages.create({
      body: formatOrder(order_obj),
      to: CHEF_NUMBER,
      from: TWILIO_NUMBER
  });
}



module.exports = (DataAccess) => {

  // function validateOrder(cart) {
  //   console.log(cart);
  // }

  router.post("/", (req, res) => {

    // TODO verify order
    // TODO put order into the database


    let json     = req.session.cart;

    try {

      const cart   = JSON.parse(json);
      const uai    = req.session.username_and_id;

      // i;m adding a test bug here...
      //cart[1000] = { json: "{\"id\": \"1000\", \"name\": \"sharty sub\", \"price\": \"12\", \"category_id\": \"2\"}", qty: 2};
      //console.log(cart);

      DataAccess.addOrderPromise(uai, cart)
      .then((message) => {
        console.log('here', message);
      })
      .catch((message) => {
        console.log(message);
      });

      // DataAccess.verifyPromise(uai)
      // .then(() => {

      // })
      // .catch(() => console.log('success'));
      // DataAccess.addOrder()


      //DataAccess.addOrder(cart, user_id);
      //messageChef(cart);
      res.send();

    }
    catch(err) {
      res.status(400).send('there was a problem sending the order');
    }

    
  });

  router.get("/", (req, res) => {
    // TODO fetch orders from database here
    res.send('This will be the orders page.');
  });

  router.post("/response", (req, res) => {
    let message;
    res.send();
    chefsResponse(req.body.Body);
  });

  return router;
};
