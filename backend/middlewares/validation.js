const { UserInputError } = require("./error");

module.exports = (schema) => async (req, res, next) => {
  const body = req.body;

  try {
    await schema.validate(body, { abortEarly: false });
    return next();
  } catch ({ errors }) {
    next(new UserInputError("Bad user input!", errors));
  }
};
