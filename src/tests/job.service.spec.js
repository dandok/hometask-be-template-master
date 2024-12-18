const JobService = require('../service/job.service');
const { HttpError } = require('../helper/httpError');
const { HttpStatusCode } = require('../helper/constants');

const {
  findUnpaidJobs,
  findJobWithLock,
  updateJobStatusToPaid,
  getBestProfession,
  getBestClients,
} = require('../repository/jobs.repository');

jest.mock('../repository/jobs.repository', () => ({
  findUnpaidJobs: jest.fn(),
  findJobWithLock: jest.fn(),
  updateJobStatusToPaid: jest.fn(),
  getBestProfession: jest.fn(),
  getBestClients: jest.fn(),
}));

jest.mock('../model', () => ({
  sequelize: {
    transaction: jest.fn().mockResolvedValue({
      commit: jest.fn(),
      rollback: jest.fn(),
    }),
  },
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

describe('JobService', () => {
  let jobService;
  let userService;

  beforeEach(() => {
    userService = {
      findClientProfile: jest.fn(),
      findContractorProfile: jest.fn(),
      updateClientBalance: jest.fn(),
      updateContractorBalance: jest.fn(),
    };
    jobService = new JobService(userService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUnpaidJobs', () => {
    it('should return unpaid jobs when found', async () => {
      const userId = 1;
      const unpaidJobs = [{ id: 1, paid: false }];
      findUnpaidJobs.mockResolvedValue(unpaidJobs);

      const result = await jobService.getUnpaidJobs(userId);
      expect(result).toEqual(unpaidJobs);
      expect(findUnpaidJobs).toHaveBeenCalledWith(userId);
    });

    it('should throw an error if no unpaid jobs found', async () => {
      const userId = 1;
      findUnpaidJobs.mockResolvedValue([]);

      try {
        await jobService.getUnpaidJobs(userId);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toBe('All active contracts have been paid for');
        expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      }
    });
  });

  describe('payForJob', () => {
    it('should successfully pay for a job and update balances', async () => {
      const jobId = 1;
      const amount = 100;
      const userId = 1;
      const job = {
        id: jobId,
        paid: false,
        Contract: { ClientId: 1, ContractorId: 2 },
      };
      const clientProfile = { id: 1, balance: 200 };
      const contractorProfile = { id: 2, balance: 50 };

      findJobWithLock.mockResolvedValue(job);
      userService.findClientProfile.mockResolvedValue(clientProfile);
      userService.findContractorProfile.mockResolvedValue(contractorProfile);
      userService.updateClientBalance.mockResolvedValue();
      userService.updateContractorBalance.mockResolvedValue();
      updateJobStatusToPaid.mockResolvedValue();

      await jobService.payForJob(jobId, amount, userId);

      expect(userService.updateClientBalance).toHaveBeenCalledWith(
        clientProfile.id,
        amount,
        expect.any(Object)
      );
      expect(userService.updateContractorBalance).toHaveBeenCalledWith(
        contractorProfile.id,
        amount,
        expect.any(Object)
      );
      expect(updateJobStatusToPaid).toHaveBeenCalledWith(
        job,
        expect.any(Object)
      );
    });

    it('should throw an error if the job has already been paid', async () => {
      const jobId = 1;
      const amount = 100;
      const userId = 1;
      const job = {
        id: jobId,
        paid: true,
        Contract: { ClientId: 1, ContractorId: 2 },
      };

      findJobWithLock.mockResolvedValue(job);

      try {
        await jobService.payForJob(jobId, amount, userId);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(HttpError);
        expect(error.message).toBe(`Job with id: ${jobId} has been paid`);
        expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      }
    });

    it('should throw an error if the client has insufficient balance', async () => {
      const jobId = 1;
      const amount = 100;
      const userId = 1;
      const job = {
        id: jobId,
        paid: false,
        Contract: { ClientId: 1, ContractorId: 2 },
      };
      const clientProfile = { id: 1, balance: 50 };
      const contractorProfile = { id: 2, balance: 50 };

      findJobWithLock.mockResolvedValue(job);
      userService.findClientProfile.mockResolvedValue(clientProfile);
      userService.findContractorProfile.mockResolvedValue(contractorProfile);

      try {
        await jobService.payForJob(jobId, amount, userId);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(HttpError);
        expect(error.message).toBe('Insufficient balance');
        expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      }
    });
  });

  describe('getBestProfession', () => {
    it('should return the best profession for the given date range', async () => {
      const start = '2024-01-01';
      const end = '2024-12-31';

      const mockResult = [
        {
          dataValues: {
            profession: 'Developer',
            totalEarnings: 100000,
          },
        },
      ];

      getBestProfession.mockResolvedValue(mockResult);

      const result = await jobService.getBestProfession(start, end);

      expect(result).toEqual({
        profession: 'Developer',
        totalEarnings: 100000,
      });

      expect(getBestProfession).toHaveBeenCalledWith(
        new Date(start),
        new Date(end)
      );
    });

    it('should throw an error if the start date is later than the end date', async () => {
      const start = '2024-12-31';
      const end = '2024-01-01';

      try {
        await jobService.getBestProfession(start, end);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(HttpError);
        expect(error.message).toBe('Start date cannot be later than end date');
        expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      }
    });
  });

  describe('bestClients', () => {
    it('should return the best clients for the given date range and limit', async () => {
      const start = '2024-01-01';
      const end = '2024-12-31';
      const limit = 3;

      const mockResult = [
        {
          dataValues: {
            ClientId: 1,
            fullName: 'John Doe',
            totalPayment: 1000,
          },
        },
        {
          dataValues: {
            ClientId: 2,
            fullName: 'Jane Smith',
            totalPayment: 800,
          },
        },
      ];

      getBestClients.mockResolvedValue(mockResult);

      const result = await jobService.bestClients(start, end, limit);

      expect(result).toEqual([
        { id: 1, fullName: 'John Doe', paid: 1000 },
        { id: 2, fullName: 'Jane Smith', paid: 800 },
      ]);

      expect(getBestClients).toHaveBeenCalledWith(
        new Date(start),
        new Date(end),
        limit
      );
    });

    it('should throw an error if the limit is invalid', async () => {
      const start = '2024-01-01';
      const end = '2024-12-31';
      const limit = -1;

      try {
        await jobService.bestClients(start, end, limit);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(HttpError);
        expect(error.message).toBe(
          'Invalid limit value. Limit should be a positive integer.'
        );
        expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      }
    });
  });

  describe('static validation methods', () => {
    it('should throw an error if the limit is invalid in validateLimit', () => {
      const limit = 0;

      expect(() => JobService.validateLimit(limit)).toThrowError(
        new HttpError(
          'Invalid limit value. Limit should be a positive integer.',
          HttpStatusCode.BAD_REQUEST
        )
      );
    });

    it('should throw an error if start date is later than end date in validateRange', () => {
      const start = '2024-12-31';
      const end = '2024-01-01';

      expect(() => JobService.validateRange(start, end)).toThrowError(
        new HttpError(
          'Start date cannot be later than end date',
          HttpStatusCode.BAD_REQUEST
        )
      );
    });
  });
});
