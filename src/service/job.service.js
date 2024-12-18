const {
  findUnpaidJobs,
  findJobWithLock,
  updateJobStatusToPaid,
  getBestProfession,
  getBestClients,
} = require('../repository/jobs.repository');
const sequelize = require('../model').sequelize;
const { HttpError } = require('../helper/httpError');
const { HttpStatusCode } = require('../helper/constants');
class JobService {
  constructor(userService) {
    this.userService = userService;
    this.sequelize = sequelize;
  }

  async getUnpaidJobs(userId) {
    try {
      const unpaidJobs = await findUnpaidJobs(userId);
      if (unpaidJobs.length === 0)
        throw new HttpError(
          'All active contracts have been paid for',
          HttpStatusCode.BAD_REQUEST
        );

      return unpaidJobs;
    } catch (error) {
      throw error;
    }
  }

  async payForJob(id, amount, userId) {
    JobService.validateAmount(amount);
    const transaction = await this.sequelize.transaction();

    try {
      const job = await findJobWithLock(id, userId, transaction);
      if (!job) throw new HttpError('Job not found', HttpStatusCode.NOT_FOUND);
      if (job.paid)
        throw new HttpError(
          `Job with id: ${job.id} has been paid`,
          HttpStatusCode.BAD_REQUEST
        );

      const [clientProfile, contractorProfile] = await Promise.all([
        this.userService.findClientProfile(job.Contract.ClientId, transaction),
        this.userService.findContractorProfile(
          job.Contract.ContractorId,
          transaction
        ),
      ]);

      if (clientProfile.balance < amount)
        throw new HttpError('Insufficient balance', HttpStatusCode.BAD_REQUEST);

      await Promise.all([
        this.userService.updateClientBalance(
          clientProfile.id,
          amount,
          transaction
        ),
        this.userService.updateContractorBalance(
          contractorProfile.id,
          amount,
          transaction
        ),
      ]);

      await updateJobStatusToPaid(job, transaction);
      await transaction.commit();
      return;
    } catch (error) {
      await transaction.rollback();
      throw new HttpError(error.message, error.statusCode);
    }
  }

  async getBestProfession(start, end) {
    JobService.validateRange(start, end);

    try {
      const result = await getBestProfession(new Date(start), new Date(end));

      if (!result || result.length === 0) {
        throw new HttpError(
          'No data found for the specified time range',
          HttpStatusCode.NOT_FOUND
        );
      }

      const { profession, totalEarnings } = result[0].dataValues;
      return { profession, totalEarnings };
    } catch (error) {
      throw error;
    }
  }

  async bestClients(start, end, limit = 2) {
    JobService.validateRange(start, end);
    JobService.validateLimit(limit);

    try {
      const result = await getBestClients(
        new Date(start),
        new Date(end),
        limit
      );

      if (!result || result.length === 0) {
        throw new HttpError(
          'No data found for the specified time range',
          HttpStatusCode.NOT_FOUND
        );
      }

      return result.map((client) => ({
        id: client.dataValues.ClientId,
        fullName: client.dataValues.fullName,
        paid: client.dataValues.totalPayment,
      }));
    } catch (error) {
      throw error;
    }
  }

  static validateLimit(limit) {
    if (!Number.isInteger(Number(limit)) || Number(limit) <= 0) {
      throw new HttpError(
        'Invalid limit value. Limit should be a positive integer.',
        HttpStatusCode.BAD_REQUEST
      );
    }
  }

  static validateRange(start, end) {
    if (!start || !end) {
      throw new HttpError(
        'Both startDate and endDate are required',
        HttpStatusCode.BAD_REQUEST
      );
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime())) {
      throw new HttpError(
        `Invalid start date: ${start}`,
        HttpStatusCode.BAD_REQUEST
      );
    }

    if (isNaN(endDate.getTime())) {
      throw new HttpError(
        `Invalid end date: ${end}`,
        HttpStatusCode.BAD_REQUEST
      );
    }

    if (startDate > endDate) {
      throw new HttpError(
        'Start date cannot be later than end date',
        HttpStatusCode.BAD_REQUEST
      );
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

module.exports = JobService;
