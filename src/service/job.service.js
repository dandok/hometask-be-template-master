const { findUnpaidJobs } = require('../repository/jobs.repository');

class JobService {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  async getUnpaidJobs(userId) {
    this.validateUser(userId); //manage this validation better
    try {
      const unpaidJobs = findUnpaidJobs(userId);
      if (unpaidJobs.length === 0)
        throw new Error('All active contracts have been paid for');

      return unpaidJobs;
    } catch (err) {
      throw new Error(`Failed to retrieve unpaid jobs: ${err.message}`);
    }
  }

  validateUser(userId) {
    if (!userId) throw Error('invalid user');
    if (!Number.isInteger(userId)) throw new Error('invalid user id');
    return;
  }
}

module.exports = JobService;
