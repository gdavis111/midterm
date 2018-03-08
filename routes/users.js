/*jslint node: true */
"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (DataAccess) => {


  // TODO add dataAccess calls to /login and /logout handlers

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

// "use strict";

// const express = require('express');
// const router  = express.Router();

// module.exports = (knex) => {

//   router.get("/", (req, res) => {
//     knex
//       .select("*")
//       .from("users")
//       .then((results) => {
//         res.json(results);
//     });
//   });

//   return router;
// };
