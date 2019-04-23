const articlesRouter = require("express").Router();
const { methodNotAllowed } = require("../errors");
const { getAllArticles } = require("../controllers/articles");

articlesRouter
  .route("/")
  .get(getAllArticles)
  .all(methodNotAllowed);

module.exports = articlesRouter;
