/*jslint node: true */
"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (DataAccess) => {

  return {
    verify: (username) => {
      return false;
    },
    test: () => {
      DataAccess.applyToMenu((menu) => console.log(menu));
    }
  };
};