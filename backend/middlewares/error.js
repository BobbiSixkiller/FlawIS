module.exports.UserInputError = class UserInputError extends Error {
  constructor(message, errorsArray) {
    super(message);
    this.name = "ValidationError";
    this.status = 400;
    this.errors = errorsArray;
  }
};

module.exports.AuthError = class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthError";
    this.status = 401;
  }
};

module.exports.NotFoundError = class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.status = 404;
  }
};

module.exports.errorHandler = function (err, req, res, next) {
  console.log(err);

  res.status(err.status || 500).send({
    success: false,
    name: err.name,
    message: err.message || "Internal server error",
    errors: err.errors || [],
  });
};
