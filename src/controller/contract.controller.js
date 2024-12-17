class ContractController {
  constructor(contractService) {
    this.contractService = contractService;

    this.getContractById = this.getContractById.bind(this);
    this.getUserContracts = this.getUserContracts.bind(this);
  }

  async getContractById(req, res) {
    const { id } = req.params;
    const userId = req.profile.id;

    try {
      const contract = await this.contractService.getContractById(id, userId);
      res.json({
        status: 200,
        message: 'Contract fetched successfully',
        data: contract,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserContracts(req, res) {
    const userId = req.profile.id;

    try {
      const contracts = await this.contractService.getContracts(userId);
      res.json({
        status: 200,
        message: 'Contracts retrieved successfully',
        data: contracts,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async fetchUnpaidJobs(req, res) {}
}

module.exports = ContractController;
