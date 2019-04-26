const {
  updateVoteCount,
  removeComment,
  commentChecker
} = require("../models/comments");

exports.voteOnComment = (req, res, next) => {
  updateVoteCount(req.body, req.params)
    .then(article => {
      return res.status(200).send({ article });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  commentChecker(req.params.comment_id)
    .then(check => {
      if (check === true) {
        return Promise.reject({ status: 404, msg: "id not found" });
      } else {
        removeComment(req.params).then(() => {
          return res.sendStatus(204);
        });
      }
    })
    .catch(next);
};
