const {
  findClientProfileWithLock,
  findContractorProfileWithLock,
  updateClientBalance,
  updateContractorBalance,
} = require('../repository/user.repository');
const { sumOfClientActiveJobs } = require('../repository/jobs.repository');
const { HttpError } = require('../helper/httpError');
const {
  HttpStatusCode,
  MAX_ALLOWED_PERCENTAGE,
} = require('../helper/constants');

class UserService {
  async findClientProfile(clientId, transaction) {
    return findClientProfileWithLock(clientId, transaction);
  }

  async findContractorProfile(contractorId, transaction) {
    return findContractorProfileWithLock(contractorId, transaction);
  }

  async updateClientBalance(
    clientId,
    amount,
    transaction = null,
    isDeposit = false
  ) {
    await updateClientBalance(clientId, amount, transaction, isDeposit);
  }

  async updateContractorBalance(contractorId, amount, transaction) {
    await updateContractorBalance(contractorId, amount, transaction);
  }

  async deposit(userId, amount) {
    UserService.validateAmount(amount);

    try {
      const sumOfActiveJobs = await sumOfClientActiveJobs(userId);
      if (sumOfActiveJobs === 0)
        throw new HttpError(
          'There are no active contracts at this time',
          HttpStatusCode.NOT_FOUND
        );

      const maxAllowedDeposit = sumOfActiveJobs * MAX_ALLOWED_PERCENTAGE;

      if (amount > maxAllowedDeposit)
        throw new HttpError(
          `Amount must be less than ${maxAllowedDeposit}`,
          HttpStatusCode.BAD_REQUEST
        );

      await updateClientBalance(userId, amount, null, true);
      return maxAllowedDeposit;
    } catch (error) {
      throw new HttpError(error.message, error.statusCode);
    }
  }

  static validateAmount(amount) {
    try {
      if (typeof amount !== 'number' || isNaN(amount))
        throw new HttpError(
          'Amount must be a valid number',
          HttpStatusCode.BAD_REQUEST
        );

      if (amount <= 0) {
        throw new HttpError(
          'Amount must be greater than zero',
          HttpStatusCode.BAD_REQUEST
        );
      }
    } catch (error) {
      throw new HttpError(error.message, error.statusCode);
    }
  }
}

module.exports = UserService;
