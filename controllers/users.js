const { fetchUser } = require("../models/users");

exports.getUser = (req, res, next) => {
  fetchUser(req.params)
    .then(user => {
      if (!user) return Promise.reject({ status: 404, msg: "id not found" });
      else return res.status(200).send({ user });
    })
    .catch(next);
};
