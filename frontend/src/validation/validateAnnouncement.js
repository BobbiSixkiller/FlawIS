export default function validateAnnouncement(values) {
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
