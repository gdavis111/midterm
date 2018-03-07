exports.up = function(knex, Promise) {
  return knex.schema.createTable('products', function (table) {
    table.increments('id');
    table.string('name');
    table.float('price');
    table.integer('category_id').unsigned().notNullable();
    table.foreign('category_id').references('id').inTable('categories');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('products');
};
