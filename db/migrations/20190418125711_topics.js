exports.up = function(knex, Promise) {
  return knex.schema.createTable("topics", topics => {
    topics
      .string("slug")
      .primary()
      .unique();
    topics.string("description").notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("topics");
};
