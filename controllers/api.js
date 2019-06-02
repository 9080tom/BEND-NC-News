const { getApiInfo } = require("../models/api");

exports.apiInfo = (req, res, next) => {
  const info = getApiInfo();
  return res.status(200).send(info);
};
