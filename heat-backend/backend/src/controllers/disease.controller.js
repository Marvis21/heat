const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const diseaseService = require('../services/disease.service');

const listSymptoms = catchAsync(async (req, res) => {
  const symptoms = await diseaseService.listSymptoms();
  sendSuccess(res, 200, symptoms);
});

const match = catchAsync(async (req, res) => {
  const results = await diseaseService.matchSymptoms(req.query.symptoms);
  sendSuccess(res, 200, results);
});

module.exports = { listSymptoms, match };
