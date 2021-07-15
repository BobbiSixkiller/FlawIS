const Joi = require("@hapi/joi");

module.exports.registerValidation = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().max(50).required(),
    lastName: Joi.string().max(50).required(),
    email: Joi.string().required().email().required(),
    password: Joi.string()
      .min(8)
      .required()
      .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
    repeatPass: Joi.ref("password"),
    role: Joi.string().valid("basic", "supervisor", "admin"),
  });

  return schema.validate(data);
};

module.exports.loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  });

  return schema.validate(data);
};

module.exports.forgotPasswordValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().required().email(),
  });

  return schema.validate(data);
};

module.exports.resetPasswordValidation = (data) => {
  const schema = Joi.object({
    password: Joi.string()
      .min(8)
      .required()
      .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
    repeatPass: Joi.ref("password"),
  });

  return schema.validate(data);
};

module.exports.grantValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .required()
      .messages({
        "any.required": "Zadajte nazov grantu",
        "string.empty": "Nazov nemoze byt prazdny",
      }),
    idNumber: Joi.string().required(),
    type: Joi.string().valid("APVV", "VEGA", "KEGA").required(),
    start: Joi.date().required(),
    end: Joi.date().required(),
    budget: Joi.array()
      .items(
        Joi.object({
          year: Joi.number().required(),
          travel: Joi.number().required(),
          material: Joi.number().required(),
          services: Joi.number().required(),
          indirect: Joi.number().required(),
          salaries: Joi.number().required(),
          members: Joi.array().items(
            Joi.object({
              member: Joi.string().required(),
              hours: Joi.number().required(),
              role: Joi.string().required(),
              active: Joi.boolean().required(),
            })
          ),
        })
      )
      .required(),
  });

  return schema.validate(data, { abortEarly: false });
};

module.exports.announcementValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    content: Joi.string().required(),
    grantId: Joi.string(),
    scope: Joi.string().valid("APVV", "VEGA", "KEGA", "ALL", "SINGLE"),
    files: Joi.object(),
  });

  return schema.validate(data);
};

module.exports.memberValidation = (data) => {
  const schema = Joi.object({
    hours: Joi.number().required(),
    member: Joi.string().required(),
    role: Joi.string().valid("basic", "deputy", "leader").required(),
    active: Joi.boolean(),
  });

  return schema.validate(data);
};

module.exports.budgetValidation = (data) => {
  const schema = Joi.object({
    travel: Joi.number().required(),
    material: Joi.number().required(),
    services: Joi.number().required(),
    indirect: Joi.number().required(),
    salaries: Joi.number().required(),
  });

  return schema.validate(data);
};

module.exports.postValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string().required()).required(),
  });

  return schema.validate(data);
};
