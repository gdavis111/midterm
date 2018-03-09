exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('products').del()
    .then(function () {
      return knex('categories').del();
    })
    .then(function () {
      return Promise.all([
        knex('categories').insert({id: 1, name: 'pizza'}),
        knex('categories').insert({id: 2, name: 'sandwich'}),
        knex('categories').insert({id: 3, name: 'side'}),
        knex('categories').insert({id: 4, name: 'dessert'}),
        knex('categories').insert({id: 5, name: 'drink'})
      ]);
    })
    .then(function () {
      return Promise.all([
        knex('products').insert({id: 1, name: 'Cheese pizza', price: '12.0', category_id: '1'}),
        knex('products').insert({id: 2, name: 'Pepperoni pizza', price: '13.50', category_id: '1'}),
        knex('products').insert({id: 3, name: 'Vegetarian pizza', price: '13.0', category_id: '1'}),
        knex('products').insert({id: 4, name: 'Canadian pizza', price: '15.50', category_id: '1'}),
        knex('products').insert({id: 5, name: 'Meat Lovers pizza', price: '16.50', category_id: '1'}),
        knex('products').insert({id: 6, name: 'Hawaiian pizza', price: '14.0', category_id: '1'}),
        knex('products').insert({id: 7, name: 'Hamburger', price: '10.0', category_id: '2'}),
        knex('products').insert({id: 8, name: 'Cheeseburger', price: '11.0', category_id: '2'}),
        knex('products').insert({id: 9, name: 'Chickenburger', price: '12.50', category_id: '2'}),
        knex('products').insert({id: 10, name: 'Turkey Club', price: '13.0', category_id: '2'}),
        knex('products').insert({id: 11, name: 'BLT', price: '12.50', category_id: '2'}),
        knex('products').insert({id: 12, name: 'Fresh Cut Fries', price: '4.0', category_id: '3'}),
        knex('products').insert({id: 13, name: 'Poutine', price: '6.50', category_id: '3'}),
        knex('products').insert({id: 14, name: 'Garden Salad', price: '5.0', category_id: '3'}),
        knex('products').insert({id: 15, name: 'Caesar Salad', price: '6.50', category_id: '3'}),
        knex('products').insert({id: 16, name: 'Garlic Bread', price: '3.50', category_id: '3'}),
        knex('products').insert({id: 17, name: 'Chocolate Cake', price: '6.0', category_id: '4'}),
        knex('products').insert({id: 18, name: 'Cheese Cake', price: '6.50', category_id: '4'}),
        knex('products').insert({id: 19, name: 'Icecream', price: '3.50', category_id: '4'}),
        knex('products').insert({id: 20, name: 'Brownie', price: '4.50', category_id: '4'}),
        knex('products').insert({id: 21, name: 'Cookies', price: '3.0', category_id: '4'}),
        knex('products').insert({id: 22, name: 'Coke', price: '3.0', category_id: '5'}),
        knex('products').insert({id: 23, name: 'Sprite', price: '3.0', category_id: '5'}),
        knex('products').insert({id: 24, name: 'Root Beer', price: '3.0', category_id: '5'}),
        knex('products').insert({id: 25, name: 'Orange Juice', price: '2.0', category_id: '5'}),
        knex('products').insert({id: 26, name: 'Apple Juice', price: '2.0', category_id: '5'}),
        knex('products').insert({id: 27, name: 'Milk Shake', price: '5.0', category_id: '5'})
      ]);
    });
};
