"use strict";
const express = require('express');
const router  = express.Router();
const secretToken = require('./secretToken');
const twilio = require('twilio');
const client = new twilio(secretToken.accountSid, secretToken.authToken);

function chefsResponse(orderStatus) {
  client.messages.create({
      body: orderStatus,
      to: '+15194369581', //could be a variable depending on customer. verified # only
      from: '+15146127315'
  });
}

let messageToChef = "";
function messageChef(orderItems) { // takes an array of objects and adds quantity and id of each to a message to the chef
  for (item of orderItems) {
    messageToChef += item.quantity + item.product_id + ', ';
  }
  client.messages.create({
      body: messageToChef,
      to: '+15194369581',
      from: '+15146127315'
  });
}


module.exports = () => {

  router.post("/", (req, res) => {
    let message;
    res.send();
    chefsResponse(req.body.Body);
  });

  return {
    routes: router
  };
};
