const {
  findUnpaidJobs,
  findJobWithLock,
  updateJobStatusToPaid,
} = require('../repository/jobs.repository');
const Sequelize = require('sequelize');
const sequelize = require('../model').sequelize;
const { HttpError } = require('../helper/httpError');
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
    } catch (err) {
      throw err;
    }
  }

  async payForJob(id, amount, userId) {
    this.validateUser(userId);
    const transaction = await this.sequelize.transaction();

    try {
      const job = await findJobWithLock(id, userId, transaction);
      if (!job) throw new HttpError('Job not found', 404);
      if (job.paid)
        throw new HttpError(`Job with id: ${job.id} has been paid`, 400);

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

  validateUser(userId) {
    if (!userId) throw HttpError('invalid user', 400);
    if (!Number.isInteger(userId)) throw new Error('invalid user id');
    return;
  }
}

module.exports = JobService;
