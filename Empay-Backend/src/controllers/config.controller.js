const configService = require('../services/config.service');
const asyncHandler = require('../utils/asyncHandler');
const { formatResponse } = require('../utils/response.util');

const getSettings = asyncHandler(async (req, res) => {
  const settings = await configService.getSettings();
  res.status(200).json(
    formatResponse(true, 'System settings fetched', { settings }, null, req)
  );
});

const updateSetting = asyncHandler(async (req, res) => {
  const { key, value, description } = req.body;
  const setting = await configService.updateSetting(key, value, description);
  res.status(200).json(
    formatResponse(true, 'Setting updated', { setting }, null, req)
  );
});

const getProfile = asyncHandler(async (req, res) => {
  const profile = await configService.getCompanyProfile();
  res.status(200).json(
    formatResponse(true, 'Company profile fetched', { profile }, null, req)
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  await configService.updateCompanyProfile(req.body);
  res.status(200).json(
    formatResponse(true, 'Company profile updated', null, null, req)
  );
});

module.exports = {
  getSettings,
  updateSetting,
  getProfile,
  updateProfile,
};
