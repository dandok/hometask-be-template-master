const HttpStatusCode = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const type = {
  client: 'client',
  contractor: 'contractor',
};

const status = {
  IN_PROGRESS: 'in_progress',
  TERMINATED: 'terminated',
  NEW: 'new',
};

const MAX_ALLOWED_PERCENTAGE = 0.25;

module.exports = { HttpStatusCode, type, status, MAX_ALLOWED_PERCENTAGE };
