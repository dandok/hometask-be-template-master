const { HttpStatusCode } = require('../helper/constants');

class ContractController {
  constructor(contractService) {
    this.contractService = contractService;

    this.getContractById = this.getContractById.bind(this);
    this.getUserContracts = this.getUserContracts.bind(this);
  }

  async getContractById(req, res, next) {
    const { id } = req.params;
    const userId = req.profile.id;

    try {
      const contract = await this.contractService.getContractById(id, userId);
      res.json({
        statusCode: HttpStatusCode.OK,
        message: 'Contract fetched successfully',
        data: contract,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserContracts(req, res, next) {
    const userId = req.profile.id;

    try {
      const contracts = await this.contractService.getContracts(userId);
      res.json({
        status: HttpStatusCode.OK,
        message: 'Contracts retrieved successfully',
        data: contracts,
      });
    } catch (error) {
      next(error);
    }
  }

  async fetchUnpaidJobs(req, res) {}
}

module.exports = ContractController;
