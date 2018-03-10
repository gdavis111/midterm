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

  router.post("/", (req, res) => {
    let json     = req.session.cart;

    try {
      const cart   = JSON.parse(json);
      const uai    = req.session.username_and_id;

      DataAccess.addOrderPromise(uai, cart)
      .then((data_cart) => {
        // console.log(data_cart);
        messageChef(cart);
        res.status(201).send({
          username_and_id: uai,
          logged_in: true,
          cart: cart
        });
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
      console.log(result);
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
    let message;
    res.send();
    chefsResponse(req.body.Body);
  });

  return router;
};
