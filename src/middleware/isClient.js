const { HttpStatusCode, type } = require('../helper/constants');

const isClient = async (req, res, next) => {
  const profile = req.profile;

  if (profile.type !== type.client)
    return res
      .status(HttpStatusCode.FORBIDDEN)
      .json({ message: 'for clients only' });

  next();
};

module.exports = { isClient };
