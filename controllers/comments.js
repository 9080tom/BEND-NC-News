const { updateVoteCount, removeComment } = require("../models/comments");

exports.voteOnComment = (req, res) => {
  updateVoteCount(req.body, req.params).then(article => {
    return res.status(200).send({ article });
  });
};

exports.deleteComment = (req, res) => {
  removeComment(req.params).then(() => {
    return res.sendStatus(204);
  });
};
