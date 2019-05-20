const articlesRouter = require("express").Router();
const { methodNotAllowed } = require("../errors");
const {
  getAllArticles,
  getAnArticle,
  patchAnArticle,
  getArticleComments,
  postArticleComments,
  postAnArticle,
  deleteAnArticle
} = require("../controllers/articles");

articlesRouter
  .route("/")
  .get(getAllArticles)
  .post(postAnArticle)
  .all(methodNotAllowed);

articlesRouter
  .route("/:article_id")
  .get(getAnArticle)
  .patch(patchAnArticle)
  .delete(deleteAnArticle)
  .all(methodNotAllowed);

articlesRouter
  .route("/:article_id/comments")
  .get(getArticleComments)
  .post(postArticleComments)
  .all(methodNotAllowed);

module.exports = articlesRouter;
