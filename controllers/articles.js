const { fetchAllArticles } = require("../models/articles");

exports.getAllArticles = (req, res) => {
  fetchAllArticles(req.query).then(articles => {
    return res.status(200).send({ articles });
  });
};
