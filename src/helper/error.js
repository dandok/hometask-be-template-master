const { HttpStatusCode } = require('./constants');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR;
  const status = err.status || getStatusFromStatusCode(statusCode);
  const message = err.message || 'Error occurred';
  const responseObj = { statusCode, status, message };

  return res.status(statusCode).json(responseObj);
}

function getStatusFromStatusCode(statusCode) {
  switch (statusCode) {
    case HttpStatusCode.NOT_FOUND:
      return 'Not Found';
    case HttpStatusCode.UNAUTHORIZED:
      return 'Unauthorized';
    default:
      return 'Internal Server Error';
  }
}

module.exports = errorHandler;
