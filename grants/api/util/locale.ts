import { Translation } from "./types";

export function localizeOutput(
	data: any,
	translations: any = [],
	locale: string
): any {
	if (locale === "en") return data;

	const translation = translations.find(
		(t: Translation) => t.language === locale
	);
	if (!translation) return data;

	for (const [key, value] of Object.entries(translation)) {
		if (Array.isArray(value)) {
			data[key].forEach((d: any) => localizeOutput(d, value, locale));
		} else {
			const temp = data[key];

			data[key] = value;
			translation[key] = temp;
		}
	}

	translation.language = "en";

	return data;
}

export function localizeInput(
	data: any,
	translations: any,
	locale: string
): any {
	if (locale === "en") return data;

	const translation = translations.find(
		(t: Translation) => t.language === "en"
	);
	if (!translation)
		throw new Error(
			"Default language of the system is English, please provide also English translation of the input data!"
		);

	for (const [key, value] of Object.entries(translation)) {
		if (Array.isArray(value)) {
			data[key].forEach((d: any) => localizeOutput(d, value, locale));
		} else {
			const temp = data[key];

			data[key] = value;
			translation[key] = temp;
		}
	}

	translation.language = locale;

	return data;
}
