const {
  getContractById,
  getUserContracts,
} = require('../repository/contract.repository');

class ContractService {
  async getContractById(id, userId) {
    this.validateUser(userId);
    try {
      const contract = getContractById(id, userId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      return contract;
    } catch (error) {
      throw new Error(`Failed to retrieve contract: ${error.message}`);
    }
  }

  async getContracts(userId) {
    this.validateUser(userId);
    try {
      const contracts = await getUserContracts(userId);

      if (!contracts.length)
        throw new Error('No contracts found for this user');

      return contracts;
    } catch (error) {
      throw new Error(`Failed to retrieve contracts: ${error.message}`);
    }
  }

  validateUser(userId) {
    if (!userId) throw Error('invalid user');
    if (!Number.isInteger(userId)) throw new Error('invalid user id');
    return;
  }
}

module.exports = ContractService;
