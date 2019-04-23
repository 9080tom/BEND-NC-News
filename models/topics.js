const connection = require("../db/connection");

exports.fetchAllTopics = function() {
  return connection.select("*").from("topics");
};
