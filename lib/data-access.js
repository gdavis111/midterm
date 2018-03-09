//const knex = require('knex');

module.exports = (knex) => {
  return {

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

    addUserPromise: (username, passhash, phone_number) => {
      return new Promise(function(resolve, reject) {
        //TODO
      });
    }, 

    loginPromise: (username, passhash) => {
      return new Promise(function(resolve, reject) {
        //TODO
      });
    }

  };
};