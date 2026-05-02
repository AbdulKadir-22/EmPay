const SalaryStructure = require('../models/salaryStructure.model');
const mongoose = require('mongoose');

const getSalaryStructure = async (userId) => {
  return SalaryStructure.findOne({ employee: userId });
};

const updateSalaryStructure = async (userId, data) => {
  return SalaryStructure.findOneAndUpdate(
    { employee: userId },
    { $set: data },
    { upsert: true, new: true, runValidators: true }
  );
};

module.exports = {
  getSalaryStructure,
  updateSalaryStructure,
};
