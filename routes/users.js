const usersRouter = require("express").Router();
const { methodNotAllowed } = require("../errors");
const { getUser } = require("../controllers/users");

usersRouter
  .route("/:username")
  .get(getUser)
  .all(methodNotAllowed);

module.exports = usersRouter;
