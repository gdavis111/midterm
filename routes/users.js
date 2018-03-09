/*jslint node: true */
"use strict";

const bcrypt  = require('bcrypt');
const express = require('express');
const router  = express.Router();

module.exports = (DataAccess) => {


  // TODO add dataAccess calls to /login and /logout handlers

  router.put("/register", (req, res) => {

  });

  router.put("/login", (req, res) => {
    console.log(req.body);
    res.send(req.body.username);
  });

  router.put("/logout", (req, res) => {
    console.log(req.session.username);
    res.send();
  });

  return {
    verify: (username) => {
      return false;
    },
    routes: router
  };
};

