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
  secret: 'Listen... doo wah oooh... Do you want to know a secret?.. doo wah oooh',
  maxAge: 24 * 60 * 60 * 1000
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
const orderRoutes = require("./routes/orders.js")(DataAccess);
app.use("/users", userRoutes);
app.use("/orders", orderRoutes);

// If the user has a session going, we send them
// straight to the menu. Otherwise, we send them to the title page
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

// Get the menu and put it in JSON format
app.get("/menu", (req, res) => {
  DataAccess.applyToMenu((menu) => {
    res.json(menu);
  });
});

// Verify potential returning visitor. In either case
// their cart is preserved. This allows non-registered users
// to fill and preserve their carts 
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

// A PUT to /cart/:id is used to add an item to the cart.
// I use PUT not POST here because this request is idempotent:
// in our application if a user attempts to add an item to their cart
// that is already in their cart in some quantity, the original instance
// is replaced
app.put("/cart/:id", (req, res) => {
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

// And a DELETE is used to remove an item from their cart.
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




