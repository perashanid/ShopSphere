// Utility functions for consistent API responses

const sendResponse = (res, statusCode, success, message, data = null, meta = null) => {
  const response = {
    success,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const sendSuccess = (res, message, data = null, statusCode = 200, meta = null) => {
  return sendResponse(res, statusCode, true, message, data, meta);
};

const sendError = (res, message, statusCode = 500, data = null) => {
  return sendResponse(res, statusCode, false, message, data);
};

const sendCreated = (res, message, data = null) => {
  return sendSuccess(res, message, data, 201);
};

const sendNoContent = (res, message = 'Operation completed successfully') => {
  return sendSuccess(res, message, null, 204);
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendError,
  sendCreated,
  sendNoContent
};