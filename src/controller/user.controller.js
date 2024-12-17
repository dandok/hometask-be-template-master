const { HttpStatusCode } = require('../helper/constants');

class UserController {
  constructor(userService) {
    this.userService = userService;
    this.deposit = this.deposit.bind(this);
  }

  async deposit(req, res, next) {
    const userId = req.profile.id;
    const { amount } = req.body;
    await this.userService.deposit(userId, amount);

    try {
      res.json({
        statusCode: HttpStatusCode.OK,
        message: 'Deposit done successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
