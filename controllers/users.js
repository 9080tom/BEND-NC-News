const { fetchUser } = require("../models/users");
const { authorChecker } = require("../models/articles");

exports.getUser = (req, res, next) => {
  authorChecker(req.params.username)
    .then(check => {
      if (check === true) {
        return Promise.reject({ status: 404, msg: "id not found" });
      } else {
        fetchUser(req.params).then(user => {
          return res.status(200).send({ user });
        });
      }
    })
    .catch(next);
};
