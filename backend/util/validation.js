const Yup = require("yup");

module.exports.userSchema = Yup.object({
  firstName: Yup.string().max(50).required(),
  lastName: Yup.string().max(50).required(),
  email: Yup.string().email().required(),
  password: Yup.string()
    .required()
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
  repeatPass: Yup.mixed()
    .required()
    .oneOf([Yup.ref("password")]),
  role: Yup.mixed().required().oneOf(["basic", "supervisor", "admin"]),
});

module.exports.loginSchema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().required(),
});

module.exports.forgotPasswordSchema = Yup.object({
  email: Yup.string().email().required(),
});

module.exports.resetPasswordSchema = Yup.object({
  password: Yup.string()
    .required()
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
  repeatPass: Yup.mixed()
    .required()
    .oneOf([Yup.ref("password")]),
});

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
        })
      )
        .required()
        .min(1),
    })
  )
    .required()
    .min(1),
});

module.exports.announcementSchema = Yup.object({
  name: Yup.string().required(),
  content: Yup.string().required(),
  grantId: Yup.string(),
  scope: Yup.mixed().oneOf(["APVV", "VEGA", "KEGA", "ALL", "SINGLE"]),
});

module.exports.memberSchema = Yup.object({
  hours: Yup.number().required(),
  member: Yup.string().required(),
  role: Yup.mixed().oneOf(["basic", "deputy", "leader"]).required(),
  active: Yup.boolean(),
});

module.exports.budgetSchema = Yup.object({
  travel: Yup.number().required(),
  material: Yup.number().required(),
  services: Yup.number().required(),
  indirect: Yup.number().required(),
  salaries: Yup.number().required(),
});

module.exports.postSchema = Yup.object({
  name: Yup.string().required(),
  body: Yup.string().required(),
  tags: Yup.array().min(1).of(Yup.string().required()),
});
