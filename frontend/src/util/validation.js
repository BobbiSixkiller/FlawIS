export function validateAnnouncement(values) {
	let errors = {};
	let valid = {};

	if (!values.name) {
		errors.name = "Zadajte názov oznamu!";
	} else {
		valid.name = "Názov oznamu OK";
	}

	if (!values.content) {
		errors.content = "Zadajte text oznamu!";
	} else if (values.content.length > 3000) {
		errors.content = "Text oznamu nesmie byť dlhší ako 3000 znakov!";
	} else {
		valid.content = "Oznam OK";
	}

	if (values.files && Object.keys(values.files).length > 5) {
		errors.files = "Presiahli ste maximálny počet súborov pri uploade!";
	} else {
		valid.files = "Súbory dokumentov OK.";
	}

	return { errors, valid };
}

export function validateDocument(values) {
	let errors = {};
	let valid = {};

	if (Object.keys(values.files).length === 0) {
		errors.files = "Nahrajte súbory dokumentu/ov!";
	} else if (Object.keys(values.files).length > 5) {
		errors.files = "Presiahli ste maximálny počet súborov pri uploade!";
	} else {
		valid.files = "Súbory dokumentov OK.";
	}

	return { errors, valid };
}

export function validatePost(values) {
	let errors = {};
	let valid = {};

	if (!values.name) {
		errors.name = "Zadajte názov oznamu!";
	} else {
		valid.name = "Názov oznamu OK";
	}

	if (!values.body) {
		errors.body = "Zadajte text oznamu!";
	} else if (values.body.length > 3000) {
		errors.body = "Text oznamu nesmie byť dlhší ako 3000 znakov!";
	} else {
		valid.body = "Oznam OK";
	}

	if (values.tags.length === 0) {
		errors.tags = "Zadajte aspoň jednu oblasť príspevku!";
	} else {
		valid.tags = "Tagy OK";
	}

	return { errors, valid };
}

const Yup = require("yup");

export const userSchema = Yup.object({
	firstName: Yup.string()
		.max(50, "Maximálna dĺžka je 50 znakov!")
		.required("Zadajte krstné meno"),
	lastName: Yup.string()
		.max(50, "Maximálna dĺžka je 50 znakov!")
		.required("Zadajte priezvisko"),
	email: Yup.string().email().required("Zadajte email adresu!"),
	password: Yup.string()
		.required("Zadajte heslo!")
		.matches(
			/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
			"Minimálna dĺžka 8 znakov, aspoň 1 písmeno a 1 číslo, bez znakov!"
		),
	repeatPass: Yup.mixed()
		.required("Zopakujte heslo!")
		.oneOf([Yup.ref("password")], "Heslá sa nezhodujú!"),
	role: Yup.mixed().oneOf(
		["basic", "supervisor", "admin"],
		"Zadaná rola nie ja podporovaná"
	),
});

export const loginSchema = Yup.object({
	email: Yup.string()
		.email("Nesprávny formát email adresy!")
		.required("Zadajte email adresu!"),
	password: Yup.string().required("Zadajte heslo!"),
});

export const forgotPasswordSchema = Yup.object({
	email: Yup.string()
		.email("Nesprávny formát email adresy!")
		.required("Zadajte email adresu!"),
});

export const resetPasswordSchema = Yup.object({
	password: Yup.string()
		.required("Zadajte nové heslo!")
		.matches(
			/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
			"Minimálna dĺžka 8 znakov, aspoň 1 písmeno a 1 číslo, bez znakov!"
		),
	repeatPass: Yup.mixed()
		.required("Zopakujte nové heslo!")
		.oneOf([Yup.ref("password")], "Heslá sa nezhodujú!"),
});

export const memberSchema = Yup.object({
	hours: Yup.number().min(1).required(),
	member: Yup.string().required(),
	name: Yup.string().required(),
	role: Yup.mixed().oneOf(["basic", "deputy", "leader"]).required(),
	active: Yup.boolean(),
});

export const budgetSchema = Yup.object({
	year: Yup.date().required(),
	travel: Yup.number().required(),
	material: Yup.number().required(),
	services: Yup.number().required(),
	indirect: Yup.number().required(),
	salaries: Yup.number().required(),
	members: Yup.array(memberSchema).min(1),
});

export const grantIdSchema = Yup.object({
	name: Yup.string().required(),
	idNumber: Yup.string().required(),
	type: Yup.mixed().required().oneOf(["APVV", "VEGA", "KEGA"]),
	start: Yup.date().max(Yup.ref("end")).required(),
	end: Yup.date().min(Yup.ref("start")).required(),
});

export const grantBudgetSchema = Yup.object({
	budget: Yup.array().of(budgetSchema).required().min(1),
});

export const announcementSchema = Yup.object({
	name: Yup.string().required(),
	content: Yup.string().required(),
	grantId: Yup.string(),
	scope: Yup.mixed().oneOf(["APVV", "VEGA", "KEGA", "ALL", "SINGLE"]),
});

export const postSchema = Yup.object({
	name: Yup.string().required("Zadajte názov postu!"),
	body: Yup.string().required("Zadajte text postu!"),
	tags: Yup.array()
		.min(1, "Zadajte aspoň jedno označenie postu!")
		.of(Yup.string().required("Tag neobsahuje žiadne znaky!")),
});
