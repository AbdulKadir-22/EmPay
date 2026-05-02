const SystemConfig = require('../models/systemConfig.model');

const getSettings = async () => {
  return SystemConfig.find();
};

const updateSetting = async (key, value, description) => {
  return SystemConfig.findOneAndUpdate(
    { key },
    { $set: { value, description } },
    { upsert: true, new: true }
  );
};

const getCompanyProfile = async () => {
  // Simple: assume profile is stored as a special key or we use the model's structure
  // For this implementation, we'll store specific keys for profile
  const profileKeys = ['COMPANY_NAME', 'COMPANY_ADDRESS', 'COMPANY_LOGO', 'CONTACT_EMAIL'];
  const settings = await SystemConfig.find({ key: { $in: profileKeys } });
  
  const profile = {};
  settings.forEach(s => {
    profile[s.key] = s.value;
  });
  
  return profile;
};

const updateCompanyProfile = async (profileData) => {
  const operations = Object.entries(profileData).map(([key, value]) => ({
    updateOne: {
      filter: { key },
      update: { $set: { value } },
      upsert: true
    }
  }));

  return SystemConfig.bulkWrite(operations);
};

module.exports = {
  getSettings,
  updateSetting,
  getCompanyProfile,
  updateCompanyProfile,
};
