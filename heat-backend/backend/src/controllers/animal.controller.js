const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const animalService = require('../services/animal.service');
const ApiError = require('../utils/ApiError');

const list = catchAsync(async (req, res) => {
  const result = await animalService.list(req.user.id, req.query);
  sendSuccess(res, 200, result.items, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
});

const getById = catchAsync(async (req, res) => {
  const animal = await animalService.getById(req.user.id, req.params.id);
  sendSuccess(res, 200, animal);
});

const create = catchAsync(async (req, res) => {
  const animal = await animalService.create(req.user.id, req.body);
  sendSuccess(res, 201, animal);
});

const update = catchAsync(async (req, res) => {
  const animal = await animalService.update(req.user.id, req.params.id, req.body);
  sendSuccess(res, 200, animal);
});

const remove = catchAsync(async (req, res) => {
  await animalService.remove(req.user.id, req.params.id);
  sendSuccess(res, 200, { message: 'Animal deleted successfully' });
});

const uploadPhoto = catchAsync(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No photo file was provided');
  const photoUrl = `/uploads/animals/${req.file.filename}`;
  const animal = await animalService.update(req.user.id, req.params.id, { photoUrl });
  sendSuccess(res, 200, animal);
});

module.exports = { list, getById, create, update, remove, uploadPhoto };
