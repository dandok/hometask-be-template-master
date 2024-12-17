const {
  findClientProfileWithLock,
  findContractorProfileWithLock,
  updateClientBalance,
  updateContractorBalance,
} = require('../repository/user.repository');

class UserService {
  constructor(profileRepository, sequelize) {
    this.profileRepository = profileRepository;
    this.sequelize = sequelize;
  }

  async findClientProfile(clientId, transaction) {
    return findClientProfileWithLock(clientId, transaction);
  }

  async findContractorProfile(contractorId, transaction) {
    return findContractorProfileWithLock(contractorId, transaction);
  }

  async updateClientBalance(clientId, amount, transaction) {
    await updateClientBalance(clientId, amount, transaction);
  }

  async updateContractorBalance(contractorId, amount, transaction) {
    await updateContractorBalance(contractorId, amount, transaction);
  }
}

module.exports = UserService;
