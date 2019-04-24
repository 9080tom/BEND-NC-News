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

exports.fetchAnArticle = params => {
  return connection
    .select([
      "articles.author",
      "title",
      "articles.article_id",
      "topic",
      "articles.created_at",
      "articles.votes",
      "articles.body"
    ])
    .from("articles")
    .count({ comment_count: "comments.article_id" })
    .leftJoin("comments", "articles.article_id", "comments.article_id")
    .groupBy("articles.article_id")
    .where("articles.article_id", "=", params.article_id)
    .then(([article]) => article);
};

exports.updateCommentCount = (body, params) => {
  return connection
    .from("articles")
    .where("article_id", "=", params.article_id)
    .increment({
      votes: body.inc_votes
    })
    .then(() =>
      connection
        .select([
          "articles.author",
          "title",
          "articles.article_id",
          "topic",
          "articles.created_at",
          "articles.votes",
          "articles.body"
        ])
        .from("articles")
        .count({ comment_count: "comments.article_id" })
        .leftJoin("comments", "articles.article_id", "comments.article_id")
        .groupBy("articles.article_id")
        .where("articles.article_id", "=", params.article_id)
    )
    .then(([article]) => article);
};
