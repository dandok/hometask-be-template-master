const { HttpStatusCode } = require('../helper/constants');
const { HttpError } = require('../helper/httpError');
const {
  getContractById,
  getUserContracts,
} = require('../repository/contract.repository');

class ContractService {
  async getContractById(id, userId) {
    try {
      const contract = getContractById(id, userId);
      if (!contract)
        throw new HttpError('Contract not found', HttpStatusCode.NOT_FOUND);

      return contract;
    } catch (error) {
      throw error;
    }
  }

  async getContracts(userId) {
    try {
      const contracts = await getUserContracts(userId);

      if (!contracts.length)
        throw new HttpError(
          'No contracts found for this user',
          HttpStatusCode.NOT_FOUND
        );

      return contracts;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ContractService;
