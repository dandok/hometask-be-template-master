const { Op } = require('sequelize');
const { Job, Contract } = require('../model');

async function findUnpaidJobs(userId) {
  try {
    return Job.findAll({
      where: {
        [Op.or]: [{ paid: null }, { paid: false }],
      },
      include: [
        {
          model: Contract,
          where: {
            [Op.or]: [{ ClientId: userId }, { ContractorId: userId }],
            status: 'in_progress',
          },
          attributes: ['status'], // Do not return contract details
        },
      ],
      attributes: {
        exclude: ['paid', 'paymentDate'], // Remove unnecessary fields
      },
    });
  } catch (error) {
    throw new Error(`Error fetching unpaid jobs: ${error.message}`);
  }
}

async function findJobWithLock(jobId, userId, transaction) {
  return Job.findOne({
    where: { id: jobId },
    include: [
      {
        model: Contract,
        where: { ClientId: userId },
      },
    ],
    lock: transaction.LOCK.UPDATE, // Lock row for update
    transaction,
  });
}

async function updateJobStatusToPaid(job, transaction) {
  job.paid = true;
  job.paymentDate = new Date();
  await job.save({ transaction });
}

module.exports = {
  findUnpaidJobs,
  findJobWithLock,
  updateJobStatusToPaid,
};
