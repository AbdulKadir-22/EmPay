const SalaryStructure = require('../models/salaryStructure.model');
const mongoose = require('mongoose');

const calculateSalaries = (data) => {
  const base = Number(data.baseSalary) || 0;
  const allowancesTotal = (data.allowances || []).reduce((acc, curr) => {
    const amt = Number(curr.amount) || 0;
    if (curr.rateType === 'PERCENTAGE') {
      return acc + (base * (amt / 100));
    }
    return acc + amt;
  }, 0);

  const gross = base + allowancesTotal;

  const deductionsTotal = (data.deductions || []).reduce((acc, curr) => {
    const amt = Number(curr.amount) || 0;
    if (curr.rateType === 'PERCENTAGE') {
      return acc + (gross * (amt / 100));
    }
    return acc + amt;
  }, 0);

  return {
    grossSalary: gross,
    netSalary: gross - deductionsTotal
  };
};

const getSalaryStructure = async (userId) => {
  return SalaryStructure.findOne({ employee: userId });
};

const updateSalaryStructure = async (userId, data) => {
  const { grossSalary, netSalary } = calculateSalaries(data);
  
  // Sanitize data to prevent updating immutable fields
  const { _id, __v, createdAt, updatedAt, employee, ...updateData } = data;
  
  // Ensure effectiveFrom is a valid Date
  if (updateData.effectiveFrom) {
    try {
      const d = new Date(updateData.effectiveFrom);
      if (!isNaN(d.getTime())) {
        updateData.effectiveFrom = d;
      } else {
        delete updateData.effectiveFrom; // Let Mongoose use existing or default if invalid
      }
    } catch (e) {
      delete updateData.effectiveFrom;
    }
  }
  
  return SalaryStructure.findOneAndUpdate(
    { employee: userId },
    { $set: { ...updateData, grossSalary, netSalary, employee: userId } },
    { upsert: true, new: true, runValidators: true }
  );
};

module.exports = {
  getSalaryStructure,
  updateSalaryStructure,
};
