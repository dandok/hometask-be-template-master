const { Profile } = require('../model');

async function findContractorProfileWithLock(contractorId, transaction) {
  return Profile.findOne({
    where: { id: contractorId },
    lock: transaction.LOCK.UPDATE,
    transaction,
  });
}

async function findClientProfileWithLock(clientId, transaction) {
  return Profile.findOne({
    where: { id: clientId },
    lock: transaction.LOCK.UPDATE,
    transaction,
  });
}

async function updateClientBalance(
  clientId,
  amount,
  transaction = null,
  isDeposit = false
) {
  const balanceChange = isDeposit ? amount : -amount; // If it's a deposit, add the amount; otherwise, subtract it

  await Profile.increment('balance', {
    by: balanceChange,
    where: { id: clientId },
    ...(transaction && { transaction }), // Add the transaction if it exists
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
