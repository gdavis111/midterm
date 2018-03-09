exports.seed = function(knex, Promise) {
  return knex('users').del()
    .then(function () {
      return Promise.all([
        knex('users').insert({username: 'Alice', passhash: 'fhsoqeidjsf', phone_number: '+4389905125'}),
        knex('users').insert({username: 'Bob', passhash: 'fhsoqeidjsf', phone_number: '+4389905125'}),
        knex('users').insert({username: 'Charlie', passhash: 'fhsoqeidjsf', phone_number: '+4389905125'})
      ]);
    });
};
