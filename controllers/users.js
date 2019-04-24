const { fetchUser } = require("../models/users");

exports.getUser = (req, res) => {
  fetchUser(req.query).then(articles => {
    return res.status(200).send({ articles });
  });
};
