const Sequelize = require('sequelize');
const sequelize = require('../model').sequelize;
const { Op } = require('sequelize');
const { Job, Contract } = require('../model');
const { HttpError } = require('../helper/httpError');
const { HttpStatusCode } = require('../helper/constants');

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
  try {
    job.paid = true;
    job.paymentDate = new Date();
    await job.save({ transaction });
  } catch (error) {
    throw new HttpError('Database Error', HttpStatusCode.INTERNAL_SERVER_ERROR);
  }
}

async function sumOfClientActiveJobs(userId) {
  try {
    const jobs = await Job.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('price')), 'totalPrice']],
      where: {
        [Op.and]: [{ [Op.or]: [{ paid: false }, { paid: { [Op.is]: null } }] }],
      },
      include: [
        {
          model: Contract,
          where: {
            ClientId: userId,
            status: 'in_progress',
          },
        },
      ],
    });

    return jobs.dataValues.totalPrice || 0;
  } catch (error) {
    throw new HttpError(
      `Database error 1: ${error.message}`,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }
}

module.exports = {
  findUnpaidJobs,
  findJobWithLock,
  updateJobStatusToPaid,
  sumOfClientActiveJobs,
};
