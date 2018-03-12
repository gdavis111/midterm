
// A file of constants, separated to keep code dry
// and to keep static data in one place
const C = require('../lib/constants.js');

module.exports = (knex) => {

  // find a user in the database
  const findUserPromise = (username) => {
    return new Promise(function(resolve, reject) {
      knex.select().from('users')
      .where({
        username: username
      })
      .then((user_row) => {
        if(user_row.length > 0) {
          resolve(user_row[0]);
        }
        else {
          reject('user not found');
        }
      })
      .catch(() => {
        reject('there was a problem in the find user knex call');
      });
    });
  };

  // verify that a user with username username_and_id.username
  // exists in the database. username_and_id is what's stored in the 
  // session cookie to keep track of users
  const verifyPromise = (username_and_id) => {
    return new Promise(function(resolve, reject) {
      if(username_and_id) {
        findUserPromise(username_and_id.username)
        .then((user) => resolve())
        .catch(() => reject());
      }
      else {
        reject();
      }
    });
  };

  // validate an item that could come from a user's cart
  const validateOrderItemPromise = (item, qty) => {

    if(qty < 1) {
      throw 'item quantity must be greater than 0';
    }

    return new Promise(function(resolve, reject) {
      knex.select().from('products')
      .where({
        name: item.name
      })
      .then((product_row) => {
        if(product_row.length > 0) {
          resolve(product_row[0]);
        }
        else {
          reject('product not found');
        }
      }, () => {
        reject('there was a problem in the find product knex call');
      });
    });
  };

  // validate the entire order using the user's cart 
  // as input
  const validateOrderPromise = (cart) => {

    if(cart.length < 1) {
      throw 'cart empty';
    }
    if(typeof cart !== 'object') {
      throw 'cart is not an object';
    }

    const item_validation_promises = [];

    for(let key in cart) {
      item_validation_promises.push(
        validateOrderItemPromise(
          JSON.parse(cart[key].json), 
          Number(cart[key].qty)
        )
      );
    }

    return Promise.all(item_validation_promises);

  };

  // This function actually adds the whole order to the database
  const addOrderToDatabasePromise = (username_and_id, products, qties) => {
    const total = products
                  .map((p, i) => p.price * qties[i])
                  .reduce((a, b) => a + b, 0);

    return knex('orders').insert({
        time_stamp: new Date().toISOString(),
        total: total,
        status: 'Order sent. Waiting for response.',
        user_id: username_and_id.id
      }, 'id')

      .then(([id]) => {
        const item_insert_promises = [id];
        for(let i = 0; i < products.length; i ++) {
          item_insert_promises.push(
            knex('order_items').insert({
              quantity:   qties[i],
              price_sum:  qties[i] * products[i].price,
              product_id: products[i].id,
              order_id:   id 
            })
          );
        }
        return Promise.all(item_insert_promises);
      });
  };

  // The order data returned by the function getOrdersPromise (found below)
  // comes straight from our database. I've written this function to give it
  // a format that's more useful client-side. This function also determines how
  // old an order is so that it's status (i.e Ready in 15 minutes) is accurate.
  function massageOrderData(order_data) {
    const orders = [];
    for(let i = 0; i < order_data.length; i += 5) {

      let t, message, diff;
      
      t = new Date(order_data[i + 4]);
      diff = Math.floor((t - new Date()) / 60000);

      if(diff > 0) {
        message = C.MESSAGE_TO_CUSTOMER(diff);
      }
      else if(isNaN(diff)) {
        message = order_data[i + 4];
      }
      else {
        message = 'Ready for pickup.';
      }
      

      orders.push({
        id:         order_data[i],
        time_stamp: order_data[i + 1],
        total:      order_data[i + 2],
        items:      order_data[i + 3],
        status:     message 
      });
    } 
    return orders;
  }

  // these are all the actual exports...
  return {

    // This function is essentially the getMenu function. It 
    // gets all the items from the products table, puts them in 
    // an array (menu), and applies the callback to it. It's only
    // used once: to render the menu when a use visits the user page.
    // I use a callback here simply because I didn't know how to use
    // promises when I wrote it
    applyToMenu: (callback) => {
      const menu = [];
      knex.select('products.id', 'categories.name as category', 'products.name', 'products.price')
      .from('products')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .orderBy('category_id')
      .then((result) => {
        if(!result.length) {
          callback({error: "no results found"});
        }
        else {
          for(let i = 0; i < result.length; i ++) {
            menu.push(result[i]);
          }
          callback(menu);
        }
      });
    },

    // insert a user if he/she is not found in the database
    addUserPromise: (username, passhash, phone_number) => {
      return new Promise(function(resolve, reject) {
        findUserPromise(username)
        .then((user) => {
          reject('user already exists');            
        })
        .catch((message) => {
          knex('users').insert({username: `${username}`, passhash: `${passhash}`, phone_number: `${phone_number}`}, 'id')
          .then((result) => {
            resolve({ 
              username: username,
              id: result[0]
            });
          })
          .catch(() => {
            reject('there was a problem in the addUser knex call');
          });
        });
      });
    }, 

    findUserPromise: findUserPromise,
    verifyPromise: verifyPromise,

    // attempt to add an order to the database if the
    // user who made it is verified
    addOrderPromise: (username_and_id, cart) => {
      return new Promise(function(resolve, reject) {

        verifyPromise(username_and_id)

        .then(() => {
          return validateOrderPromise(cart);
        }, () => {
          reject('invalid user');
        })

        .then((products) => {
          const qties = [];
          for(let key in cart) {
            qties.push(cart[key].qty);
          }
          return addOrderToDatabasePromise(
            username_and_id,
            products, 
            qties
          );
        }, () => {
          reject('invalid order');
        })

        .then((result) => {
          resolve(result);
        }, () => {
          reject('there was a problem inserting the order items into the database');
        }); 
      });
    },

    // get all the orders pertaining to a particular user. 
    // We only retrieve those that are not more than an hour old.
    // This keeps a returning user's order page from being blown up 
    // with past orders
    getOrdersPromise: (username_and_id) => {
      return verifyPromise(username_and_id)
        .then(() => {
          let hour_ago = new Date();
          hour_ago.setHours(hour_ago.getHours() - 1);
          return knex.select('id', 'time_stamp', 'total', 'status')
          .from('orders')
          .where({
            user_id: username_and_id.id
          })
          .andWhere('time_stamp', '>', hour_ago.toISOString());
        }, () => {
          reject('invalid user');
        }) 

        .then((order_rows) => {
          const order_items_promises = [];
          for(let key in order_rows) {
            order_items_promises.push(
              order_rows[key].id,
              order_rows[key].time_stamp, 
              order_rows[key].total,
              knex
                .select('quantity', 'name', 'price_sum')
                .from('order_items')
                .leftJoin('products', 'order_items.product_id', 'products.id')
                .where('order_items.order_id', '=', `${order_rows[key].id}`),
              order_rows[key].status
            );
          }        
          return Promise.all(order_items_promises);
        })

        .then((order_data) => {
          return massageOrderData(order_data);
        });
    },

    // This is called when the chef makes a response to an
    // order. It updates the status field of an order to be 
    // the time when the order will be ready in string format.
    // That string is later used to inform users how long it will 
    // take for an order to be ready 
    updateOrderStatusPromise: (id, minutes) => {

      let t = new Date();
      t.setMinutes(t.getMinutes() + minutes);

      return knex('orders')
             .where('id', '=', id)
             .update({
               status: t.toISOString()
             }, 'user_id')

             .then((result) => {
               if(!result.length) {
                throw 'order_id invalid';
               }
               return knex('users')
                      .select('phone_number')
                      .where('id', '=', result[0]);
             })

             .then(([user]) => {
               return user.phone_number;
             });
    }
  };
};
















