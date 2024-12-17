const { Op } = require('sequelize');
const { Contract } = require('../model');
const { HttpError } = require('../helper/httpError');

function getContractById(id, userId) {
  try {
    return Contract.findOne({
      where: {
        id,
        [Op.or]: [{ clientId: userId }, { contractorId: userId }],
      },
    });
  } catch (error) {
    throw new HttpError(`Database error: ${error.message}`, 500);
  }
}

async function getUserContracts(userId) {
  try {
    return Contract.findAll({
      where: {
        [Op.or]: [
          { ClientId: userId }, // Check if the user is the client
          { ContractorId: userId }, // Check if the user is the contractor
        ],
        status: {
          [Op.ne]: 'terminated', // Exclude contracts with status 'terminated'
        },
      },
    });
  } catch (error) {
    throw new HttpError(`Database error: ${error.message}`, 500);
  }
}

module.exports = { getContractById, getUserContracts };
