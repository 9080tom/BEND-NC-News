const articlesRouter = require("express").Router();
const { methodNotAllowed } = require("../errors");
const {
  getAllArticles,
  getAnArticle,
  patchAnArticle,
  getArticleComments,
  postArticleComments
} = require("../controllers/articles");

articlesRouter
  .route("/")
  .get(getAllArticles)
  .all(methodNotAllowed);

articlesRouter
  .route("/:article_id")
  .get(getAnArticle)
  .patch(patchAnArticle);

articlesRouter
  .route("/:article_id/comments")
  .get(getArticleComments)
  .post(postArticleComments);

module.exports = articlesRouter;
