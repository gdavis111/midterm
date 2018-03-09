
module.exports = (knex) => {

  const findUserPromise = (username) => {
    return new Promise(function(resolve, reject) {

      console.log('selecting');
      knex.select().from('users')
      .where({
        username: username
      })
      .then((user_row) => {

        // console.log(user_row, typeof user_row);
        if(user_row.length > 0) {
          // console.log('in if');
          resolve(user_row[0]);
        }
        else {
          // console.log('not in if');
          reject('user not found');
        }
      })
      .catch(() => {
        reject('user not found');
      });
    });
  };

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

          console.log(user);
          reject('user already exists');            
        })
        .catch((message) => {
          // console.log('in good catch');

          knex('users').insert({username: `${username}`, passhash: `${passhash}`, phone_number: `${phone_number}`}, 'id')
            .then(result => {
              resolve({ 
                username: username,
                id: result[0]
              });
            })
            .catch(() => {
              reject('could not insert user');
            });
        });
      });
    }, 

    findUserPromise: findUserPromise,

    verifyPromise: (username_and_id) => {
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
    }
  };
};