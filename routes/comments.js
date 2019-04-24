const commentsRouter = require("express").Router();
const { methodNotAllowed } = require("../errors");
const { voteOnComment, deleteComment } = require("../controllers/comments");

commentsRouter
  .route("/:comment_id")
  .patch(voteOnComment)
  .delete(deleteComment)
  .all(methodNotAllowed);

module.exports = commentsRouter;
