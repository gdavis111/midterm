exports.seed = function(knex, Promise) {
  return knex('users').del()
    .then(function () {
      return Promise.all([
        knex('users').insert({id: 1, username: 'Alice', passhash: 'fhsoqeidjsf', phone_number: '+4389905125'}),
        knex('users').insert({id: 2, username: 'Bob', passhash: 'fhsoqeidjsf', phone_number: '+4389905125'}),
        knex('users').insert({id: 3, username: 'Charlie', passhash: 'fhsoqeidjsf', phone_number: '+4389905125'})
      ]);
    });
};
