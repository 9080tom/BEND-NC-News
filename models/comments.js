const connection = require("../db/connection");

exports.updateVoteCount = (body, params) => {
  if (Object.keys(body).length === 0) {
    return connection
      .select("*")
      .from("comments")
      .where("comment_id", "=", params.comment_id)
      .then(([comment]) => comment);
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
      .from("comments")
      .where("comment_id", "=", params.comment_id)
      .increment({
        votes: body.inc_votes
      })
      .then(() =>
        connection
          .select("*")
          .from("comments")
          .where("comment_id", "=", params.comment_id)
      )
      .then(([comment]) => comment);
  }
};

exports.removeComment = params => {
  return connection
    .from("comments")
    .where("comment_id", params.comment_id)
    .del();
};

exports.commentChecker = comment_id => {
  return connection("comments")
    .select("comment_id")
    .where("comment_id", "=", comment_id)
    .then(result => {
      return result.length === 0;
    });
};
