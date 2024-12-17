const { Op } = require('sequelize');
const { Job, Contract } = require('../model');

function findUnpaidJobs(userId) {
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

module.exports = { findUnpaidJobs };
