const { fetchAllTopics } = require("../models/topics");

exports.getAllTopics = (req, res) => {
  fetchAllTopics().then(topics => {
    return res.status(200).send({ topics });
  });
};
