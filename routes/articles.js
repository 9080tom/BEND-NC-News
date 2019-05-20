const articlesRouter = require("express").Router();
const { methodNotAllowed } = require("../errors");
const {
  getAllArticles,
  getAnArticle,
  patchAnArticle,
  getArticleComments,
  postArticleComments,
  postAnArticle
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
  .all(methodNotAllowed);

articlesRouter
  .route("/:article_id/comments")
  .get(getArticleComments)
  .post(postArticleComments)
  .all(methodNotAllowed);

module.exports = articlesRouter;
