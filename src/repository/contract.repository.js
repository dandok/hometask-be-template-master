const { Op } = require('sequelize');
const { Contract } = require('../model');
const { HttpError } = require('../helper/httpError');
const { HttpStatusCode } = require('../helper/constants');

function getContractById(id, userId) {
  try {
    return Contract.findOne({
      where: {
        id,
        [Op.or]: [{ clientId: userId }, { contractorId: userId }],
      },
    });
  } catch (error) {
    throw new HttpError(
      `Database error: ${error.message}`,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }
}

async function getUserContracts(userId) {
  try {
    return Contract.findAll({
      where: {
        [Op.or]: [{ ClientId: userId }, { ContractorId: userId }],
        status: {
          [Op.ne]: 'terminated',
        },
      },
    });
  } catch (error) {
    throw new HttpError(
      `Database error: ${error.message}`,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }
}

module.exports = { getContractById, getUserContracts };
