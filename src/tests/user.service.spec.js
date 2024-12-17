const UserService = require('../service/user.service');
const { updateClientBalance } = require('../repository/user.repository');
const { sumOfClientActiveJobs } = require('../repository/jobs.repository');
const { HttpError } = require('../helper/httpError');
const {
  HttpStatusCode,
  MAX_ALLOWED_PERCENTAGE,
} = require('../helper/constants');

jest.mock('../repository/user.repository', () => ({
  findClientProfileWithLock: jest.fn(),
  findContractorProfileWithLock: jest.fn(),
  updateClientBalance: jest.fn(),
  updateContractorBalance: jest.fn(),
}));

jest.mock('../repository/jobs.repository', () => ({
  sumOfClientActiveJobs: jest.fn(),
}));

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if the deposit amount is less than or equal to zero', async () => {
    const userId = 1;
    const amount = 0;

    try {
      await userService.deposit(userId, amount);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(HttpError);
      expect(error.message).toBe('Amount must be greater than zero');
      expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    }
  });

  it('should throw an error if there are no active contracts', async () => {
    const userId = 1;
    const amount = 100;

    sumOfClientActiveJobs.mockResolvedValue(0);

    try {
      await userService.deposit(userId, amount);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(HttpError);
      expect(error.message).toBe('There are no active contracts at this time');
      expect(error.statusCode).toBe(HttpStatusCode.NOT_FOUND);
    }
  });

  it('should throw an error if the deposit amount exceeds the maximum allowed deposit', async () => {
    const userId = 1;
    const amount = 200;

    // Mock sumOfClientActiveJobs to return 100 (active contracts exist)
    sumOfClientActiveJobs.mockResolvedValue(100);
    const maxAllowedDeposit = 100 * MAX_ALLOWED_PERCENTAGE;

    try {
      await userService.deposit(userId, amount);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(HttpError);
      expect(error.message).toBe(
        `Amount must be less than ${maxAllowedDeposit}`
      );
      expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    }
  });

  it('should update client balance if the deposit is valid', async () => {
    const userId = 1;
    const amount = 20; // Change from 50 to 20

    // Mock sumOfClientActiveJobs to return 100 (active contracts exist)
    sumOfClientActiveJobs.mockResolvedValue(100);

    // Mock updateClientBalance to resolve successfully
    updateClientBalance.mockResolvedValue(true);

    const result = await userService.deposit(userId, amount);
    expect(result).toBeTruthy();
    expect(updateClientBalance).toHaveBeenCalledWith(
      userId,
      amount,
      null,
      true
    );
  });
});
