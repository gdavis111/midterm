
exports.up = function(knex, Promise) {
  return knex.schema.createTable('orders', function (table) {
    table.increments('id');
    table.dateTime('time_stamp');
    table.float('total');
    table.text('status');
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users');
  });  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('orders');
};
