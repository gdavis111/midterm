# Ahpnhayme

Ahpnhayme is a restaurant order app that will allow users to register/login and select whatever menu items they wish to order.  Once the order has been placed by a signed-in user, the app directs them to the orders page where they can see the details of their order along with an order status.  Meanwhile, when the order is placed a text message will be directed to the restaurant's chef who will be given an order id and all of the details.  The chef will then respond to that message with the order id followed by the estimated time until the food will be ready for pickup.  The site is updated with this information and provides a countdown in the status.  The user will then receive a message via text to the phone number they provided on registration with a formatted message telling them how long it will be until their food is ready.  The text messages are programmed through the use of the Twilio API.

## Final Product

!["Screenshot of title page"](https://github.com/hlowso/midterm/blob/master/docs/title.png?raw=true)
!["Screenshot of menu page"](https://github.com/hlowso/midterm/blob/master/docs/menu.png?raw=true)
!["Screenshot of login pop-up"](https://github.com/hlowso/midterm/blob/master/docs/login.png?raw=true)
!["Screenshot of register pop-up"](https://github.com/hlowso/midterm/blob/master/docs/register.png?raw=true)
!["Screenshot of orders/status page"](https://github.com/hlowso/midterm/blob/master/docs/orders.png?raw=true)

## Dependencies

- node
- npm
- bcrypt
- body-parser
- cookie-session
- dotenv
- ejs
- express
- knex
- knex-logger
- morgan
- node-sass-middleware
- pg
- twilio

## DevDependencies

- nodemon
