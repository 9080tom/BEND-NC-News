const {
  fetchAllArticles,
  fetchAnArticle,
  updateVoteCount,
  fetechArticleComments,
  addArticleComment,
  authorChecker,
  topicChecker,
  vaildArticle,
  vaildVote
} = require("../models/articles");

exports.getAllArticles = (req, res, next) => {
  Promise.all([
    fetchAllArticles(req.query),
    authorChecker(req.query.author),
    topicChecker(req.query.topic)
  ])
    .then(([articles, acheck, tcheck]) => {
      if (acheck === true) {
        return Promise.reject({ status: 404, msg: "username not found" });
      } else if (tcheck === true) {
        return Promise.reject({ status: 404, msg: "topic not found" });
      } else {
        return res.status(200).send({ articles });
      }
    })
    .catch(next);
};
exports.getAnArticle = (req, res, next) => {
  return fetchAnArticle(req.params)
    .then(article => {
      if (article === undefined) {
        return Promise.reject({ status: 404, msg: "id not found" });
      } else {
        return res.status(200).send({ article });
      }
    })
    .catch(next);
};

exports.patchAnArticle = (req, res, next) => {
  updateVoteCount(req.body, req.params)
    .then(article => {
      return res.status(200).send({ article });
    })
    .catch(next);
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
