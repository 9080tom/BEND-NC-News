const {
  fetchAllArticles,
  fetchAnArticle,
  updateVoteCount,
  fetechArticleComments,
  addArticleComment
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
  updateVoteCount(req.body, req.params).then(article => {
    return res.status(200).send({ article });
  });
};

exports.getArticleComments = (req, res) => {
  fetechArticleComments(req.params, req.query).then(article => {
    return res.status(200).send({ article });
  });
};

exports.postArticleComments = (req, res) => {
  addArticleComment(req.params, req.body).then(article => {
    return res.status(201).send({ article });
  });
};
