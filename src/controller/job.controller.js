class JobController {
  constructor(jobService) {
    this.jobService = jobService;

    this.fetchUnpaidJobs = this.fetchUnpaidJobs.bind(this);
  }

  async fetchUnpaidJobs(req, res) {
    const userId = req.profile.id; // Assuming profile is set via getProfile middleware

    res.json({
      status: 200, //use httpstatuses
      message: 'Unpaid jobs fetched successfully',
      data: await this.jobService.getUnpaidJobs(userId),
    });
  }
}

module.exports = JobController;
