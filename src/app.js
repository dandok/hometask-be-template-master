const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model');
const { getProfile } = require('./middleware/getProfile');
const ContractController = require('./controller/contract.controller');
const ContractService = require('./service/contract.service');
const JobController = require('./controller/job.controller');
const JobService = require('./service/job.service');
const UserService = require('./service/user.service');
const UserController = require('./controller/user.controller');
const errorHandler = require('../src/helper/error');
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

const { Op } = require('sequelize');
const { isClient } = require('./middleware/isClient');
const { isContractor } = require('./middleware/isContractor');

const contractService = new ContractService();
const contractController = new ContractController(contractService);
const userService = new UserService();
const userController = new UserController(userService);
const jobService = new JobService(userService);
const jobController = new JobController(jobService);

app.get('/contracts/:id', getProfile, contractController.getContractById);
app.get('/contracts', getProfile, contractController.getUserContracts);
app.get('/jobs/unpaid', getProfile, jobController.fetchUnpaidJobs);
app.post('/jobs/:job_id/pay', getProfile, isClient, jobController.payForJob);
app.post(
  '/balances/deposit/:userId',
  getProfile,
  isClient,
  userController.deposit
);
app.get(
  '/admin/best-profession',
  getProfile,
  isContractor,
  jobController.bestProfession
);

app.use(errorHandler);

module.exports = app;
