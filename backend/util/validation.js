const Joi = require("@hapi/joi");
const Yup = require("yup");

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

module.exports.grantSchema = Yup.object({
  name: Yup.string().required(),
  idNumber: Yup.string().required(),
  type: Yup.mixed().required().oneOf(["APVV", "VEGA", "KEGA"]),
  start: Yup.date().required(),
  end: Yup.date().required(),
  budget: Yup.array(
    Yup.object({
      year: Yup.date().required(),
      travel: Yup.number().required(),
      material: Yup.number().required(),
      services: Yup.number().required(),
      indirect: Yup.number().required(),
      salaries: Yup.number().required(),
      members: Yup.array(
        Yup.object({
          member: Yup.string().required(),
          hours: Yup.number().required(),
          role: Yup.string().required(),
          active: Yup.boolean().required(),
        }).required()
      ),
    })
  ).required(),
});

module.exports.announcementSchema = Yup.object({
  name: Yup.string().required(),
  content: Yup.string().required(),
  grantId: Yup.string(),
  scope: Yup.mixed()
    .oneOf(["APVV", "VEGA", "KEGA", "ALL", "SINGLE"])
    .required(),
});

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
