const { UserInputError } = require("./error");

module.exports = (schema) => async (req, res, next) => {
  const body = req.body;

  try {
    await schema.validate(body, { abortEarly: false });
    return next();
  } catch (err) {
    const errors = [];
    err.inner.map((e) => errors.push({ path: e.path, message: e.message }));
    next(new UserInputError("Bad user input!", errors));
  }
};
