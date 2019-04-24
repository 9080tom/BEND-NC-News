const connection = require("../db/connection");

exports.fetchUser = params => {
  return connection
    .select("*")
    .from("users")
    .where("username", "=", params.username)
    .then(([user]) => user);
};
