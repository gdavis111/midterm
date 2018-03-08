/*jslint node: true */
"use strict";

const express = require('express');
const router  = express.Router();

module.exports = () => {

  router.post("/", (req, res) => {
    let message;
    res.send(message);
  });

  return {
    routes: router
  };
};
