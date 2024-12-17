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
    if (amount <= 0)
      throw new HttpError(
        'Amount must be greater than zero',
        HttpStatusCode.BAD_REQUEST
      );

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

      await this.updateClientBalance(userId, amount, null, true);
      return maxAllowedDeposit;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService;
