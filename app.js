const express = require("express");
const apiRouter = require("./routes/api");
const {
  routeNotFound,
  handle500,
  handleCustomErrors,
  handlePsqlErrors
} = require("./errors");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.all("/*", routeNotFound);

app.use(handlePsqlErrors);

app.use(handleCustomErrors);

app.use(handle500);

module.exports = app;
