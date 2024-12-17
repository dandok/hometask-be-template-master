const { HttpStatusCode } = require('../helper/constants');

class JobController {
  constructor(jobService) {
    this.jobService = jobService;

    this.fetchUnpaidJobs = this.fetchUnpaidJobs.bind(this);
    this.payForJob = this.payForJob.bind(this);
    this.bestProfession = this.bestProfession.bind(this);
    this.bestClients = this.bestClients.bind(this);
  }

  async fetchUnpaidJobs(req, res, next) {
    const userId = req.profile.id;

    try {
      res.json({
        statusCode: HttpStatusCode.OK,
        message: 'Unpaid jobs fetched successfully',
        data: await this.jobService.getUnpaidJobs(userId),
      });
    } catch (error) {
      next(error);
    }
  }

  async payForJob(req, res, next) {
    const userId = req.profile.id;
    const { job_id } = req.params;
    const { amount } = req.body;

    try {
      res.json({
        statusCode: HttpStatusCode.OK,
        message: 'Job paid for successfully',
        data: await this.jobService.payForJob(job_id, amount, userId),
      });
    } catch (error) {
      next(error);
    }
  }

  async bestProfession(req, res, next) {
    const { start, end } = req.query;

    try {
      res.json({
        statusCode: HttpStatusCode.OK,
        message: 'Best profession fetched successfully',
        data: await this.jobService.getBestProfession(start, end),
      });
    } catch (error) {
      next(error);
    }
  }

  async bestClients(req, res, next) {
    const { start, end, limit } = req.query;

    try {
      res.json({
        statusCode: HttpStatusCode.OK,
        message: 'Best clients fetched successfully',
        data: await this.jobService.bestClients(start, end, limit),
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = JobController;
