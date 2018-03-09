
exports.up = function(knex, Promise) {
  return knex.schema.createTable('order_items', function (table) {
    table.increments('id');
    table.integer('quantity');
    table.float('price_sum');
    table.integer('product_id').unsigned().notNullable();
    table.foreign('product_id').references('id').inTable('products');
    table.integer('order_id').unsigned().notNullable();
    table.foreign('order_id').references('id').inTable('orders');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('order_items');
};
