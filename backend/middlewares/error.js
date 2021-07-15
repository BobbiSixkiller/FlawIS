module.exports.ErrorResponse = class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
};

module.exports.errorHandler = function (err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  if (err.name === "ValidationError") {
    error.status = 400;
    error.message = Object.values(error.errors)
      .map((val) => val.properties.message)
      .join(" ");
  }

  console.log(error);

  res
    .status(error.status || 500)
    .send({ error: true, msg: error.message || "Internal server error" });
};
