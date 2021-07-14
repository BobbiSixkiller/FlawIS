module.exports.ErrorResponse = class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
};

module.exports.errorHandler = function (err, req, res, next) {
  let error = { ...err };

  error.message = err.message;
};
