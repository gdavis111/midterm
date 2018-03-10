
module.exports = (knex) => {

  // These functions are used more than once in this file...

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
        const item_insert_promises = [];
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


  // And these are all the exports...
  return {

    // This guy uses a callback...
    applyToMenu: (callback) => {
      const menu = [];
      knex.select('products.id', 'categories.name as category', 'products.name', 'products.price')
      .from('products')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .orderBy('category_id')
      .then((result) => {
        if(!result) {
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

    // These guys use promises...
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

    getOrderPromise: (order_id) => {
      // STUFF.
    }

  };
};