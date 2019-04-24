const connection = require("../db/connection");

exports.updateVoteCount = (body, params) => {
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
};

exports.removeComment = params => {
  return connection
    .from("comments")
    .where("comment_id", params.comment_id)
    .del();
};
