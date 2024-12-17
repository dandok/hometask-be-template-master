const ContractService = require('../service/contract.service');
const { HttpError } = require('../helper/httpError');
const {
  getContractById,
  getUserContracts,
} = require('../repository/contract.repository');
const { HttpStatusCode } = require('../helper/constants');

jest.mock('../repository/contract.repository', () => ({
  getContractById: jest.fn(),
  getUserContracts: jest.fn(),
}));

jest.mock('../helper/httpError', () => ({
  HttpError: class {
    constructor(message, statusCode) {
      this.message = message;
      this.statusCode = statusCode || 500;
      this.name = 'HttpError';
    }
  },
}));

describe('ContractService', () => {
  let contractService;

  beforeEach(() => {
    contractService = new ContractService();
  });

  describe('getContractById', () => {
    it('should return the contract if found', async () => {
      const contractId = 1;
      const userId = 1;
      const mockContract = { id: contractId, userId, status: 'active' };

      getContractById.mockResolvedValue(mockContract);

      const result = await contractService.getContractById(contractId, userId);

      expect(result).toEqual(mockContract);
      expect(getContractById).toHaveBeenCalledWith(contractId, userId);
    });

    it('should throw an error if the contract is not found', async () => {
      const contractId = 1;
      const userId = 1;

      getContractById.mockResolvedValue(null);

      try {
        await contractService.getContractById(contractId, userId);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(HttpError);
        expect(error.message).toBe(
          'Failed to retrieve contract: Contract not found'
        );
        expect(error.statusCode).toBe(HttpStatusCode.NOT_FOUND);
      }
    });
  });

  describe('getContracts', () => {
    it('should return the list of contracts if contracts are found', async () => {
      const userId = 1;
      const mockContracts = [
        { id: 1, userId, status: 'active' },
        { id: 2, userId, status: 'inactive' },
      ];

      getUserContracts.mockResolvedValue(mockContracts);

      const result = await contractService.getContracts(userId);

      expect(result).toEqual(mockContracts);
      expect(getUserContracts).toHaveBeenCalledWith(userId);
    });

    it('should throw an error if no contracts are found', async () => {
      const userId = 1;

      getUserContracts.mockResolvedValue([]);

      try {
        await contractService.getContracts(userId);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(HttpError);
        expect(error.message).toBe('No contracts found for this user');
        expect(error.statusCode).toBe(HttpStatusCode.NOT_FOUND);
      }
    });
  });
});
