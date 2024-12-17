const { Op } = require('sequelize');
const { Contract } = require('../model');

function getContractById(id, userId) {
  console.log('getContractById', { id, userId });
  try {
    return Contract.findOne({
      where: {
        id,
        [Op.or]: [{ clientId: userId }, { contractorId: userId }],
      },
    });
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}

async function getUserContracts(userId) {
  console.log('coming *******', userId);

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
    console.log('Error ********', error.message);
    throw new Error(`Database error: ${error.message}`);
  }
}

module.exports = { getContractById, getUserContracts };
