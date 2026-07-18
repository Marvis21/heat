/**
 * Consistent success envelope for every endpoint:
 * { success: true, data: ..., meta?: {...} }
 */
function sendSuccess(res, statusCode, data, meta) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess };
