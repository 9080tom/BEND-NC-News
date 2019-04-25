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

exports.updateVoteCount = (body, params) => {
  console.log(Object.keys(body));
  if (body.inc_votes === undefined) {
    console.log("undefined");
    return Promise.reject({ status: 400, msg: "no inc_votes on body" });
  } else if (Number.isInteger(body.inc_votes) === false) {
    console.log("not an integer");
    return Promise.reject({
      status: 400,
      msg: "inc_votes must be an integer"
    });
  } else if (
    Object.keys(body)[0] !== "inc_votes" ||
    Object.keys(body).length !== 1
  ) {
    console.log("not only inc votes");
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

exports.authorChecker = author => {
  if (author === undefined) return false;
  else {
    return connection("users")
      .select("username")
      .where("username", "=", author)
      .then(result => {
        return result.length === 0;
      });
  }
};

exports.topicChecker = topic => {
  if (topic === undefined) return false;
  else {
    return connection("topics")
      .select("slug")
      .where("slug", "=", topic)
      .then(result => {
        return result.length === 0;
      });
  }
};
