const connection = require("../db/connection");

exports.fetchAllArticles = function({
  author,
  topic,
  sort_by,
  order,
  p,
  limit
}) {
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
    .orderBy(
      [
        "author",
        "title",
        "article_id",
        "topic",
        "created_at",
        "votes",
        "comment_count"
      ].indexOf(sort_by) === -1
        ? "created_at"
        : sort_by,
      order === "asc" || order === "desc" ? order : "desc"
    )
    .count({ comment_count: "comments.article_id" })
    .leftJoin("comments", "articles.article_id", "comments.article_id")
    .groupBy("articles.article_id")
    .then(articles => {
      return {
        articles: articles.slice(
          ((p || 1) - 1) * (limit || 10),
          (p || 1) * (limit || 10)
        ),
        total_count: articles.length
      };
    });
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

exports.updateVoteCount = (body, params) => {
  if (Object.keys(body).length === 0) {
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
  } else if (body.inc_votes === undefined) {
    return Promise.reject({ status: 400, msg: "no inc_votes on body" });
  } else if (Number.isInteger(body.inc_votes) === false) {
    return Promise.reject({
      status: 400,
      msg: "inc_votes must be an integer"
    });
  } else if (
    Object.keys(body)[0] !== "inc_votes" ||
    Object.keys(body).length !== 1
  ) {
    return Promise.reject({
      status: 400,
      msg: "inc_votes must be the only key on the body"
    });
  } else {
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
  }
};
exports.fetechArticleComments = (params, query) => {
  return connection
    .select(["comment_id", "votes", "created_at", "author", "body"])
    .from("comments")
    .orderBy(
      ["author", "body", "comment_id", "created_at", "votes"].indexOf(
        query.sort_by
      ) === -1
        ? "created_at"
        : query.sort_by,
      query.order === "asc" || query.order === "desc" ? query.order : "desc"
    )
    .where("article_id", "=", params.article_id)
    .limit(query.limit || 10)
    .offset((query.p - 1) * query.limit || 0);
};

exports.addArticleComment = (params, body) => {
  if (
    body.username === undefined ||
    body.body === undefined ||
    Object.keys(body).length !== 2
  ) {
    return Promise.reject({ status: 400, msg: "incorect keys on body" });
  } else if (typeof body.body !== "string") {
    return Promise.reject({
      status: 400,
      msg: "body must be a string"
    });
  } else if (typeof body.username !== "string") {
    return Promise.reject({
      status: 400,
      msg: "username must be a string"
    });
  } else {
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
  }
};

exports.authorChecker = author => {
  if (!author) {
    return new Promise(resolve => resolve(false));
  } else {
    return connection("users")
      .select("username")
      .where("username", "=", author)
      .then(result => {
        return result.length === 0;
      });
  }
};

exports.topicChecker = topic => {
  if (!topic) return false;
  else {
    return connection("topics")
      .select("slug")
      .where("slug", "=", topic)
      .then(result => {
        return result.length === 0;
      });
  }
};

exports.article_idChecker = article_id => {
  return connection("articles")
    .select("articles")
    .where("article_id", "=", article_id)
    .then(result => {
      return result.length === 0;
    });
};
