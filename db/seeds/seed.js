const {
  articlesData,
  commentsData,
  topicsData,
  usersData
} = require("../data");
const {
  timeStapConverter,
  swapBelongsToWithArticleId,
  swapCreatedByWithAuthor
} = require("../../utils/utils");

exports.seed = (knex, Promise) => {
  return knex.migrate
    .rollback()
    .then(() => knex.migrate.latest())
    .then(() => {
      return knex("topics")
        .insert(topicsData)
        .returning("*");
    })
    .then(() => {
      return knex("users")
        .insert(usersData)
        .returning("*");
    })
    .then(() => {
      const newArt = timeStapConverter(articlesData, "created_at");
      return knex("articles")
        .insert(newArt)
        .returning("*");
    })
    .then(articlesData => {
      let newComments = timeStapConverter(commentsData, "created_at");
      newComments = swapCreatedByWithAuthor(newComments);
      newComments = swapBelongsToWithArticleId(articlesData, newComments);
      return knex("comments")
        .insert(newComments)
        .returning("*");
    });
};
