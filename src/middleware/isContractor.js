const { HttpStatusCode, type } = require('../helper/constants');

const isContractor = async (req, res, next) => {
  const profile = req.profile;

  if (profile.type !== type.contractor)
    return res
      .status(HttpStatusCode.FORBIDDEN)
      .json({ message: 'for contractors only' });

  next();
};

module.exports = { isContractor };
