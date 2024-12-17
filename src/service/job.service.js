const {
  findUnpaidJobs,
  findJobWithLock,
  updateJobStatusToPaid,
  getBestProfession,
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
    this.validateUser(userId); //manage this validation better
    try {
      const unpaidJobs = await findUnpaidJobs(userId);
      if (unpaidJobs.length === 0)
        throw new HttpError('All active contracts have been paid for', 400);

      return unpaidJobs;
    } catch (error) {
      throw err;
    }
  }

  async payForJob(id, amount, userId) {
    this.validateUser(userId);
    if (amount <= 0)
      throw new HttpError('Amount must be greater than zero', 400);

    const transaction = await this.sequelize.transaction();

    try {
      const job = await findJobWithLock(id, userId, transaction);
      if (!job) throw new HttpError('Job not found', 404);
      if (job.paid)
        throw new HttpError(`Job with id: ${job.id} has been paid`, 400);

      console.log(job);

      const [clientProfile, contractorProfile] = await Promise.all([
        this.userService.findClientProfile(job.Contract.ClientId, transaction),
        this.userService.findContractorProfile(
          job.Contract.ContractorId,
          transaction
        ),
      ]);

      if (clientProfile.balance < amount)
        throw new HttpError('Insufficient balance', 400);

      await this.userService.updateClientBalance(
        clientProfile.id,
        amount,
        transaction
      );
      await this.userService.updateContractorBalance(
        contractorProfile.id,
        amount,
        transaction
      );

      await updateJobStatusToPaid(job, transaction);
      await transaction.commit();
      return;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getBestProfession(start, end) {
    if (start && end && new Date(start) > new Date(end)) {
      throw new HttpError(
        'Start date cannot be later than end date',
        HttpStatusCode.BAD_REQUEST
      );
    }

    try {
      const result = await getBestProfession(start, end);
      return result;
    } catch (error) {
      throw error;
    }
  }

  validateUser(userId) {
    if (!userId) throw HttpError('invalid user', 400);
    if (!Number.isInteger(userId)) throw new Error('invalid user id');
    return;
  }
}

module.exports = JobService;
