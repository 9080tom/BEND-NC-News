const {
  fetchAllArticles,
  fetchAnArticle,
  updateVoteCount,
  fetechArticleComments,
  addArticleComment,
  authorChecker,
  topicChecker,
  article_idChecker
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

exports.getArticleComments = (req, res, next) => {
  article_idChecker(req.params.article_id)
    .then(check => {
      if (check === true)
        return Promise.reject({ status: 404, msg: "id not found" });
    })
    .then(() => fetechArticleComments(req.params, req.query))
    .then(comments => {
      return res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postArticleComments = (req, res, next) => {
  authorChecker(req.body.username)
    .then(check => {
      if (check === true) {
        return Promise.reject({ status: 404, msg: "username not found" });
      }
    })
    .then(() => addArticleComment(req.params, req.body))
    .then(comment => {
      return res.status(201).send({ comment });
    })
    .catch(next);
};
