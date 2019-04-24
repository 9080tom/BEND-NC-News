const { fetchUser } = require("../models/users");

exports.getUser = (req, res) => {
  fetchUser(req.params).then(user => {
    return res.status(200).send({ user });
  });
};
