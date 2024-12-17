const { Profile } = require('../model');

async function findContractorProfileWithLock(contractorId, transaction) {
  return Profile.findOne({
    where: { id: contractorId },
    lock: transaction.LOCK.UPDATE,
    transaction,
  });
}

async function findClientProfileWithLock(clientId, transaction) {
  await Profile.findOne({
    where: { id: clientId },
    lock: transaction.LOCK.UPDATE,
    transaction,
  });
}

async function updateClientBalance(clientId, amount, transaction) {
  await Profile.increment('balance', {
    by: -amount,
    where: { id: clientId },
    transaction,
  });
}

async function updateContractorBalance(contractorId, amount, transaction) {
  await Profile.increment('balance', {
    by: amount,
    where: { id: contractorId },
    transaction,
  });
}

module.exports = {
  findClientProfileWithLock,
  findContractorProfileWithLock,
  updateClientBalance,
  updateContractorBalance,
};
