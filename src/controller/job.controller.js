class JobController {
  constructor(jobService) {
    this.jobService = jobService;

    this.fetchUnpaidJobs = this.fetchUnpaidJobs.bind(this);
    this.payForJob = this.payForJob.bind(this);
  }

  async fetchUnpaidJobs(req, res) {
    const userId = req.profile.id; // Assuming profile is set via getProfile middleware

    try {
      res.json({
        statusCode: 200, //use httpstatuses
        message: 'Unpaid jobs fetched successfully',
        data: await this.jobService.getUnpaidJobs(userId),
      });
    } catch (error) {
      res.status(error.statusCode).json({
        statusCode: error.statusCode,
        status: error.status,
        error: error.message,
      });
    }
  }

  async payForJob(req, res) {
    const userId = req.profile.id;
    const { job_id } = req.params;
    const { amount } = req.body;

    try {
      res.json({
        statusCode: 200, //use httpstatuses
        message: 'Job paid for successfully',
        data: await this.jobService.payForJob(job_id, amount, userId),
      });
    } catch (error) {
      res.status(error.statusCode).json({
        statusCode: error.statusCode,
        status: error.status,
        error: error.message,
      });
    }
  }
}

module.exports = JobController;
