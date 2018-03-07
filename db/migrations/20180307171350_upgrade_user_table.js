
exports.up = function(knex, Promise) {
  return knex.schema.table('users', function (table) {
    table.string('passhash');
    table.string('phone_number');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', function (table) {
    table.dropColumns('passhash', 'phone_number');
  });
};
