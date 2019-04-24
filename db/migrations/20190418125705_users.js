exports.up = function(knex, Promise) {
  return knex.schema.createTable("users", userTable => {
    userTable
      .string("username")
      .primary()
      .unique();
    userTable.string("avatar_url").notNullable();
    userTable.string("name").notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("users");
};
