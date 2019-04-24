const articlesRouter = require("express").Router();
const { methodNotAllowed } = require("../errors");
const {
  getAllArticles,
  getAnArticle,
  patchAnArticle
} = require("../controllers/articles");

articlesRouter
  .route("/")
  .get(getAllArticles)
  .all(methodNotAllowed);

articlesRouter
  .route("/:article_id")
  .get(getAnArticle)
  .patch(patchAnArticle);

module.exports = articlesRouter;
