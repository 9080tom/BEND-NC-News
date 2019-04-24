const {
  fetchAllArticles,
  fetchAnArticle,
  updateCommentCount
} = require("../models/articles");

exports.getAllArticles = (req, res) => {
  fetchAllArticles(req.query).then(articles => {
    return res.status(200).send({ articles });
  });
};

exports.getAnArticle = (req, res) => {
  fetchAnArticle(req.params).then(article => {
    return res.status(200).send({ article });
  });
};

exports.patchAnArticle = (req, res) => {
  updateCommentCount(req.body, req.params).then(article => {
    return res.status(200).send({ article });
  });
};
