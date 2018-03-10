/*jslint node: true */
"use strict";

const bcrypt    = require('bcrypt');
const express   = require('express');
const router    = express.Router();

const validPhoneNumber = (phone_number) => {
  return /^\+?\d+$/.test(phone_number) || /^\+?\d+-\d+-\d+$/.test(phone_number);
};

const validUsername = (username) => {
  return /^[a-z0-9]+$/i.test(username);
};

module.exports = (DataAccess) => {

  router.post("/register", (req, res) => {

    const username       = req.body.username;
    const phone_number   = req.body.phone_number;

    // console.log(username, phone_number);

    if(validUsername(username) && validPhoneNumber(phone_number)) {

      // console.log('valid');

      DataAccess.addUserPromise(username, bcrypt.hashSync(req.body.password, 10), phone_number)

      .then((username_and_id) => {
        req.session.username_and_id = username_and_id;
        res.status(201).send(username_and_id);
      })

      .catch((message) => {
        console.log('this is THE ONE!!!');
        res.status(400).send(message);
      });

    }
    else {
      res.status(400).send();
    }
  });

  router.put("/login", (req, res) => {
    const username = req.body.username;

    if(validUsername(username)) {
      DataAccess.findUserPromise(username)

      .then((user) => {
        if(bcrypt.compareSync(req.body.password, user.passhash)) {

          req.session.username_and_id = {
            username: user.username,
            id: user.id
          };

          res.status(200).send({
            username: user.username,
            id: user.id
          });
        }
        else {
          res.status(401).send();
        }
      })
      .catch((message) => {
        res.status(400).send(message);
      });
    }
    else {
      res.send(400).send('username invalid');
    }
  });

  router.put("/logout", (req, res) => {
    req.session = null;
    res.status(200).send();
  });

  return router;
};

