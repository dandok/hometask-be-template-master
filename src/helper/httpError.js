class HttpError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 500; // Ensure default statusCode is 500
    this.status = this.getStatusFromStatusCode(statusCode);
    this.name = this.constructor.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  getStatusFromStatusCode(statusCode) {
    switch (statusCode) {
      case 404:
        return 'Not Found';
      case 400:
        return 'Bad Request';
      case 500:
        return 'Internal Server Error';
      case 401:
        return 'Unauthorized';
      default:
        return 'Internal Server Error';
    }
  }
}

module.exports = { HttpError };
