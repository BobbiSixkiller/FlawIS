export default function validateBudget(values) {
	let errors = {};
	let valid = {};

	if (!values.travel) {
		errors.travel = "Zadajte položku: Cestovné";
	} else {
		valid.travel = "Položka cestovné OK";
	}

	if (!values.material) {
		errors.material = "Zadajte položku: Materiál";
	} else {
		valid.material = "Položka materiál OK";
	}

	if (!values.services) {
		errors.services = "Zadajte položku: Služby";
	} else {
		valid.services = "Položka služby OK";
	}

	if (!values.indirect) {
		errors.indirect = "Zadajte položku: Nepriame náklady";
	} else {
		valid.indirect = "Položka nepriame náklady OK";
	}

	if (!values.salaries) {
		errors.salaries = "Zadajte položku: Mzdové náklady";
	} else {
		valid.salaries = "Položka mzdové náklady OK";
	}

	return { errors, valid };
}
