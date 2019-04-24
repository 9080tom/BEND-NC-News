const connection = require("../db/connection");

exports.fetchAllArticles = function({ author, topic, sort_by, order }) {
  return connection
    .select([
      "articles.author",
      "title",
      "articles.article_id",
      "topic",
      "articles.created_at",
      "articles.votes"
    ])
    .from("articles")
    .modify(query => {
      if (author) query.where("articles.author", "=", author);
      if (topic) query.where("articles.topic", "=", topic);
    })
    .orderBy(sort_by || "created_at", order || "desc")
    .count({ comment_count: "comments.article_id" })
    .leftJoin("comments", "articles.article_id", "comments.article_id")
    .groupBy("articles.article_id");
};

// const fetchAllTreasure = function({ sort_by, limit, ascending, colour }) {
//   return connection
//     .select("*")
//     .from("treasures")
//     .leftJoin("shops", "treasures.shop_id", "shops.shop_id")
//     .orderBy(sort_by || "cost_at_auction", ascending || "asc")
//     .limit(+limit || 25)
//     .modify(query => {
//       if (colour) query.where({ colour });
//     });
