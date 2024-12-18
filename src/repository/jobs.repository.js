const sequelize = require('../model').sequelize;
const { Op } = require('sequelize');
const { Job, Contract, Profile } = require('../model');
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
          attributes: ['status'],
        },
      ],
      attributes: {
        exclude: ['paid', 'paymentDate'],
      },
    });
  } catch (error) {
    throw new Error(
      `Error fetching unpaid jobs: ${error.message}`,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }
}

async function findJobWithLock(jobId, userId, transaction) {
  try {
    return Job.findOne({
      where: { id: jobId },
      include: [
        {
          model: Contract,
          where: { ClientId: userId },
        },
      ],
      lock: transaction.LOCK.UPDATE,
      transaction,
    });
  } catch (error) {
    throw new HttpError(
      `Database Error: ${error.messsage}`,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }
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

async function getBestProfession(startDate, endDate) {
  let whereClause = { paid: true };
  if (startDate && endDate) {
    whereClause.paymentDate = { [Op.gte]: startDate, [Op.lte]: endDate };
  }

  try {
    return Job.findAll({
      attributes: [
        [sequelize.fn('sum', sequelize.col('price')), 'totalEarnings'],
        [sequelize.col('Contract.ContractorId'), 'ContractorId'],
        [sequelize.col('Contract.Contractor.profession'), 'profession'],
      ],
      include: [
        {
          model: Contract,
          attributes: [],
          include: [
            {
              model: Profile,
              attributes: [],
              as: 'Contractor',
            },
          ],
        },
      ],
      where: whereClause,
      group: ['Contract.ContractorId'],
      order: [[sequelize.fn('sum', sequelize.col('price')), 'DESC']],
      limit: 1,
    });
  } catch (error) {
    throw new HttpError(
      `Database Error: ${error.message}`,
      HttpStatus.HTTP_INTERNAL_SERVER_ERROR
    );
  }
}

async function getBestClients(startDate, endDate, limit) {
  const whereClause = { paid: true };

  if (startDate && endDate)
    whereClause.paymentDate = { [Op.gte]: startDate, [Op.lte]: endDate };

  try {
    return Job.findAll({
      attributes: [
        [sequelize.fn('sum', sequelize.col('price')), 'totalPayment'],
        [sequelize.col('Contract.ClientId'), 'ClientId'],
        [
          sequelize.literal(
            "`Contract->Client`.`firstName` || ' ' || `Contract->Client`.`lastName`"
          ),
          'fullName',
        ],
      ],
      include: [
        {
          model: Contract,
          attributes: [],
          include: [
            {
              model: Profile,
              attributes: ['firstName', 'lastName'],
              as: 'Client',
            },
          ],
        },
      ],
      where: whereClause,
      group: [
        'Contract.ClientId',
        '`Contract->Client`.`firstName`',
        '`Contract->Client`.`lastName`',
      ],
      order: [[sequelize.fn('sum', sequelize.col('price')), 'DESC']],
      limit,
    });
  } catch (error) {
    throw new HttpError(
      `Database Error: ${error.message}`,
      HttpStatus.HTTP_INTERNAL_SERVER_ERROR
    );
  }
}

module.exports = {
  findUnpaidJobs,
  findJobWithLock,
  updateJobStatusToPaid,
  sumOfClientActiveJobs,
  getBestProfession,
  getBestClients,
};
