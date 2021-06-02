export default function validatePost(values) {
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
