exports.up = function(knex, Promise) {
  console.log("creating articles table...");
  return knex.schema.createTable("articles", articles => {
    articles.increments("article_id").primary();
    articles.string("title").notNullable();
    articles.string("body", 2000).notNullable();
    articles.integer("votes").defaultTo("0");
    articles.string("topic").notNullable();
    articles.foreign("topic").references("topics.slug");
    articles.string("author").notNullable();
    articles.foreign("author").references("users.username");
    articles.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  console.log("removing articles tables...");
  return knex.schema.dropTable("articles");
};
