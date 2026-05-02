const LeaveType = require('../models/leaveType.model');
const LeaveAllocation = require('../models/leaveAllocation.model');

/**
 * Auto-allocate all active leave types to a user for the current year.
 * Uses $setOnInsert so it never overwrites existing allocations.
 * Safe to call multiple times (idempotent).
 */
const allocateLeavesForUser = async (userId, year) => {
  const currentYear = year || new Date().getFullYear();
  const activeTypes = await LeaveType.find({ isActive: true });

  const results = [];
  for (const lt of activeTypes) {
    const allocation = await LeaveAllocation.findOneAndUpdate(
      { employee: userId, leaveType: lt._id, year: currentYear },
      { $setOnInsert: { totalDays: lt.totalDays, remainingDays: lt.totalDays, usedDays: 0 } },
      { upsert: true, new: true }
    );
    results.push(allocation);
  }

  return results;
};

module.exports = { allocateLeavesForUser };
