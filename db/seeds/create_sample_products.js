
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('products').del()
    .then(function () {
      return knex('categories').del();
    })
    .then(function () {
      return Promise.all([
        knex('categories').insert({id: 1, name: 'sandwich'}),
        knex('categories').insert({id: 2, name: 'drink'}),
        knex('categories').insert({id: 3, name: 'dessert'})
      ]);
    })
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('products').insert({id: 1, name: 'Turkey Club', price: '16.0', category_id: '1'}),
        knex('products').insert({id: 2, name: 'BLT', price: '12.0', category_id: '1'}),
        knex('products').insert({id: 3, name: 'Sprite', price: '3.0', category_id: '2'}),
        knex('products').insert({id: 4, name: 'Coke', price: '3', category_id: '2'}),
        knex('products').insert({id: 5, name: 'Cookies', price: '3', category_id: '3'})
      ]);
    });
};
