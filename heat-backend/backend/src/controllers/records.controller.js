const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const recordsService = require('../services/records.service');

// Milk
const createMilk = catchAsync(async (req, res) => {
  const record = await recordsService.createMilk(req.user.id, req.body);
  sendSuccess(res, 201, record);
});
const listMilk = catchAsync(async (req, res) => {
  const result = await recordsService.listMilk(req.user.id, req.query);
  sendSuccess(res, 200, result.items, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
});
const deleteMilk = catchAsync(async (req, res) => {
  await recordsService.deleteMilk(req.user.id, req.params.id);
  sendSuccess(res, 200, { message: 'Milk record deleted' });
});

// Breeding
const createBreeding = catchAsync(async (req, res) => {
  const record = await recordsService.createBreeding(req.user.id, req.body);
  sendSuccess(res, 201, record);
});
const listBreeding = catchAsync(async (req, res) => {
  const result = await recordsService.listBreeding(req.user.id, req.query);
  sendSuccess(res, 200, result.items, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
});
const deleteBreeding = catchAsync(async (req, res) => {
  await recordsService.deleteBreeding(req.user.id, req.params.id);
  sendSuccess(res, 200, { message: 'Breeding record deleted' });
});

// Oestrus
const createOestrusCheck = catchAsync(async (req, res) => {
  const record = await recordsService.createOestrusCheck(req.user.id, req.body);
  sendSuccess(res, 201, record);
});
const listOestrusChecks = catchAsync(async (req, res) => {
  const records = await recordsService.listOestrusChecks(req.user.id, req.query.animalId);
  sendSuccess(res, 200, records);
});

// Health
const createHealth = catchAsync(async (req, res) => {
  const record = await recordsService.createHealth(req.user.id, req.body);
  sendSuccess(res, 201, record);
});
const listHealth = catchAsync(async (req, res) => {
  const result = await recordsService.listHealth(req.user.id, req.query);
  sendSuccess(res, 200, result.items, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
});
const deleteHealth = catchAsync(async (req, res) => {
  await recordsService.deleteHealth(req.user.id, req.params.id);
  sendSuccess(res, 200, { message: 'Health record deleted' });
});

// Feed
const createFeed = catchAsync(async (req, res) => {
  const record = await recordsService.createFeed(req.user.id, req.body);
  sendSuccess(res, 201, record);
});
const listFeed = catchAsync(async (req, res) => {
  const result = await recordsService.listFeed(req.user.id, req.query);
  sendSuccess(res, 200, result.items, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
});
const deleteFeed = catchAsync(async (req, res) => {
  await recordsService.deleteFeed(req.user.id, req.params.id);
  sendSuccess(res, 200, { message: 'Feed record deleted' });
});

// Financial
const createFinancial = catchAsync(async (req, res) => {
  const record = await recordsService.createFinancial(req.user.id, req.body);
  sendSuccess(res, 201, record);
});
const listFinancial = catchAsync(async (req, res) => {
  const result = await recordsService.listFinancial(req.user.id, req.query);
  sendSuccess(res, 200, result.items, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
    summary: result.summary,
  });
});
const deleteFinancial = catchAsync(async (req, res) => {
  await recordsService.deleteFinancial(req.user.id, req.params.id);
  sendSuccess(res, 200, { message: 'Financial record deleted' });
});

module.exports = {
  createMilk,
  listMilk,
  deleteMilk,
  createBreeding,
  listBreeding,
  deleteBreeding,
  createOestrusCheck,
  listOestrusChecks,
  createHealth,
  listHealth,
  deleteHealth,
  createFeed,
  listFeed,
  deleteFeed,
  createFinancial,
  listFinancial,
  deleteFinancial,
};
