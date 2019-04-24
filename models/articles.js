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
exports.fetechArticleComments = (params, query) => {
  return connection
    .select(["comment_id", "votes", "created_at", "author", "body"])
    .from("comments")
    .orderBy(query.sort_by || "created_at", query.order || "desc")
    .where("article_id", "=", params.article_id);
};

exports.addArticleComment = (params, body) => {
  comment = {
    author: body.username,
    article_id: params.article_id,
    votes: 0,
    body: body.body
  };
  return connection("comments")
    .insert(comment)
    .returning("*")
    .then(([comment]) => comment);
};
