const { HttpStatusCode } = require('../helper/constants');
const { HttpError } = require('../helper/httpError');
const { Profile } = require('../model');

async function findContractorProfileWithLock(contractorId, transaction) {
  try {
    return Profile.findOne({
      where: { id: contractorId },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });
  } catch (error) {
    throw new HttpError(`Unable to find contractor`, HttpStatusCode.NOT_FOUND);
  }
}

async function findClientProfileWithLock(clientId, transaction) {
  try {
    return Profile.findOne({
      where: { id: clientId },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });
  } catch (error) {
    throw new HttpError(`Unable to find client`, HttpStatusCode.NOT_FOUND);
  }
}

async function updateClientBalance(
  clientId,
  amount,
  transaction = null,
  isDeposit = false
) {
  const balanceChange = isDeposit ? amount : -amount;

  try {
    await Profile.increment('balance', {
      by: balanceChange,
      where: { id: clientId },
      ...(transaction && { transaction }),
    });
  } catch (error) {
    throw new HttpError(
      `Failed to update client balance`,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }
}

async function updateContractorBalance(contractorId, amount, transaction) {
  try {
    await Profile.increment('balance', {
      by: amount,
      where: { id: contractorId },
      transaction,
    });
  } catch (error) {
    throw new HttpError(
      'Failed to update contractor balance',
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }
}

module.exports = {
  findClientProfileWithLock,
  findContractorProfileWithLock,
  updateClientBalance,
  updateContractorBalance,
};
