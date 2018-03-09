/*jslint node: true */
"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const cookieSession = require("cookie-session");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

const DataAccess = require('./lib/data-access.js')(knex);

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  secret: 'Listen... doo wah oooh... Do you want to know a secret?.. doo wah oooh'
}));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));


// *--------*
// | ROUTES |
// *--------*

const userRoutes = require("./routes/users.js")(DataAccess);
const twilioMiddle = require("./routes/twilio.js")();
app.use("/users", userRoutes);
app.use("/twilio", twilioMiddle.routes);


app.get("/", (req, res) => {
  if(req.session) {
    if(req.session.isPopulated) {
      res.redirect('/home');
    }
    else {
      res.render("title");
    }
  }
  else {
    res.render("title");
  }
});

app.get("/menu", (req, res) => {
  DataAccess.applyToMenu((menu) => {
    res.json(menu);
  });
});

app.get("/home", (req, res) => {

  const uai = req.session.username_and_id;
  DataAccess.verifyPromise(uai)
  .then(() => {
    res.render("home", { 
      logged_in: true,
      username_and_id: uai,
      cart: req.session.cart
    });
  })
  .catch(() => {
    res.render("home", { 
      logged_in: false,
      username_and_id: {
        username: '',
        id: ''
      },
      cart: req.session.cart
    });
  });
  
});

app.get("/orders", (req, res) => {
  res.send('This will be the orders page.');
});

app.post("/cart/:id", (req, res) => {
  let cart;
  if(!req.session.cart) {
    cart = {};
  }
  else {
    cart = JSON.parse(req.session.cart);
  }

  cart[req.params.id] = {
    json: req.body.json,
    qty: req.body.qty
  };

  req.session.cart = JSON.stringify(cart);
  res.json(req.session.cart);
});

app.delete("/cart/:id", (req, res) => {
  let cart;
  if(!req.session.cart) {
    cart = {};
  }
  else {
    cart = JSON.parse(req.session.cart);
  }

  delete cart[req.params.id];
  req.session.cart = JSON.stringify(cart);
  res.json(req.session.cart);
});

app.listen(PORT, () => {
  console.log("Excellent food ordering app listening on port " + PORT);
});
