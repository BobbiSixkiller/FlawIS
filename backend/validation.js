const Joi = require('@hapi/joi');

const registerValidation = data => {
	const schema = Joi.object({
		firstName: Joi.string().max(50).required(),
		lastName: Joi.string().max(50).required(),
		email: Joi.string().required().email(),
		password: Joi.string().min(8).required().pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
		repeatPass: Joi.ref('password')
	});

	return schema.validate(data);
}

const userAddValidation = data => {
	const schema = Joi.object({
		firstName: Joi.string().max(50).required(),
		lastName: Joi.string().max(50).required(),
		email: Joi.string().required().email(),
		password: Joi.string().min(8).required().pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
		repeatPass: Joi.ref('password'),
		role: Joi.string().valid('basic', 'supervisor', 'admin').required()
	});

	return schema.validate(data);
}

const loginValidation = data => {
	const schema = Joi.object({
		email: Joi.string().required().email(),
		password: Joi.string().min(8).required()
	});

	return schema.validate(data);
}

const forgotPasswordValidation = data => {
	const schema = Joi.object({
		email: Joi.string().required().email()
	});

	return schema.validate(data);
}

const resetPasswordValidation = data => {
	const schema = Joi.object({
		password: Joi.string().min(8).required().pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
		repeatPass: Joi.ref('password')
	});

	return schema.validate(data);
}

const userUpdateValidation = data => {
	const schema = Joi.object({
		firstName: Joi.string().max(50).required(),
		lastName: Joi.string().max(50).required(),
		email: Joi.string().required().email(),
		password: Joi.string().min(8).pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
		repeatPass: Joi.ref('password'),
		role: Joi.string().required().valid('basic', 'supervisor', 'admin')
	});

	return schema.validate(data);
}

const grantValidation = data => {
	const schema = Joi.object({
		name: Joi.string().max(500).required(),
		idNumber: Joi.string().max(100).required(),
		type: Joi.string().valid('APVV', 'VEGA', 'KEGA'),
		start: Joi.date().required(),
		end: Joi.date().required(),
		budget: Joi.array().items(Joi.object({year: Joi.number(), travel: Joi.number(), material: Joi.number(), services: Joi.number(), indirect: Joi.number(), members: Joi.array().items(Joi.object({member: Joi.string().required(), hours: Joi.number().required(), role: Joi.string(), active: Joi.boolean()}))})).required()
	});

	return schema.validate(data);
}

const announcementValidation = data => {
	const schema = Joi.object({
		name: Joi.string().required(),
		content: Joi.string().required(),
		issuedBy: Joi.string().required(),
		type: Joi.string().valid('APVV', 'VEGA', 'KEGA', 'ALL'),
		files: Joi.array()
	});

	return schema.validate(data);
}

const membersValidation = data => {
	const schema = Joi.object({
		hours: Joi.number(),
		member: Joi.string(),
		role: Joi.string().valid('basic', 'deputy', 'leader'),
		active: Joi.boolean()
	});

	return schema.validate(data);
}

const budgetValidation = data => {
	const schema = Joi.object({
		year: Joi.number().required(),
		travel: Joi.number().required(),
		material: Joi.number().required(),
		services: Joi.number().required(),
		indirect: Joi.number().required(),
		members: Joi.array().items(Joi.object({member: Joi.string().required(), hours: Joi.number().required(), role: Joi.string()}))
	});

	return schema.validate(data);
}

const budgetUpdateValidation = data => {
	const schema = Joi.object({
		travel: Joi.number().required(),
		material: Joi.number().required(),
		services: Joi.number().required(),
		indirect: Joi.number().required()
	});

	return schema.validate(data);
}

module.exports.registerValidation = registerValidation;
module.exports.userAddValidation = userAddValidation;
module.exports.loginValidation = loginValidation;
module.exports.forgotPasswordValidation = forgotPasswordValidation;
module.exports.resetPasswordValidation = resetPasswordValidation;
module.exports.userUpdateValidation = userUpdateValidation;
module.exports.grantValidation = grantValidation;
module.exports.announcementValidation = announcementValidation;
module.exports.membersValidation = membersValidation;
module.exports.budgetValidation = budgetValidation;
module.exports.budgetUpdateValidation = budgetUpdateValidation;