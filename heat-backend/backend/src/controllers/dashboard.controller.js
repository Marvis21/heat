const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const dashboardService = require('../services/dashboard.service');

const getSummary = catchAsync(async (req, res) => {
  const summary = await dashboardService.getSummary(req.user.id);
  sendSuccess(res, 200, summary);
});

module.exports = { getSummary };
