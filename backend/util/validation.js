const Yup = require("yup");

const userSchema = Yup.object({
	firstName: Yup.string().max(50).required(),
	lastName: Yup.string().max(50).required(),
	email: Yup.string().email().required(),
	password: Yup.string()
		.required()
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/),
	repeatPass: Yup.mixed()
		.required()
		.oneOf([Yup.ref("password")]),
	role: Yup.mixed().oneOf(["basic", "supervisor", "admin"]),
});

const loginSchema = Yup.object({
	email: Yup.string().email().required(),
	password: Yup.string().required(),
});

const forgotPasswordSchema = Yup.object({
	email: Yup.string().email().required(),
});

const resetPasswordSchema = Yup.object({
	password: Yup.string()
		.required()
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/),
	repeatPass: Yup.mixed()
		.required()
		.oneOf([Yup.ref("password")]),
});

const memberSchema = Yup.object({
	hours: Yup.number().required(),
	member: Yup.string().required(),
	role: Yup.mixed().oneOf(["basic", "deputy", "leader"]).required(),
	active: Yup.boolean(),
});

const budgetSchema = Yup.object({
	travel: Yup.number().required(),
	material: Yup.number().required(),
	services: Yup.number().required(),
	indirect: Yup.number().required(),
	salaries: Yup.number().required(),
});

const grantSchema = Yup.object({
	name: Yup.string().required(),
	idNumber: Yup.string().required(),
	type: Yup.mixed().required().oneOf(["APVV", "VEGA", "KEGA"]),
	start: Yup.date().max(Yup.ref("end")).required(),
	end: Yup.date().min(Yup.ref("start")).required(),
	budget: Yup.array()
		.of(
			budgetSchema.shape({
				year: Yup.date().required(),
				members: Yup.array().of(memberSchema).required().min(1),
			})
		)
		.required()
		.min(1),
});

const announcementSchema = Yup.object({
	name: Yup.string().required(),
	content: Yup.string().required(),
	grantId: Yup.string(),
	scope: Yup.mixed().oneOf(["APVV", "VEGA", "KEGA", "ALL", "SINGLE"]),
	files: Yup.array().of(
		Yup.object({
			name: Yup.string().required(),
			url: Yup.string().required(),
			path: Yup.string().required(),
		})
	),
});

const postSchema = Yup.object({
	name: Yup.string().required(),
	body: Yup.string().required(),
	tags: Yup.array().min(1).of(Yup.string().required()),
});

module.exports.userSchema = userSchema;
module.exports.loginSchema = loginSchema;
module.exports.forgotPasswordSchema = forgotPasswordSchema;
module.exports.resetPasswordSchema = resetPasswordSchema;
module.exports.grantSchema = grantSchema;
module.exports.budgetSchema = budgetSchema;
module.exports.memberSchema = memberSchema;
module.exports.announcementSchema = announcementSchema;
module.exports.postSchema = postSchema;
