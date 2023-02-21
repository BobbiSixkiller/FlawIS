import { useTranslation } from "next-i18next";
import { object, ref, setLocale, string } from "yup";

export function checkIfFilesAreTooBig(file: File): boolean {
	console.log(file.size, 10000000);
	return file.size < 10000000; //1MB
}

export function checkIfFilesAreCorrectType(file: File): boolean {
	return [
		"application/pdf",
		"image/jpeg",
		"image/png",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	].includes(file.type);
}

export default function Validation() {
	const { t } = useTranslation("validation");

	setLocale({
		mixed: {
			required: t("required"),
		},
		string: {
			email: t("email"),
		},
	});

	const loginInputSchema = object({
		email: string().email().required(),
		password: string().required(),
	});

	const registerInputSchema = object({
		name: string().required(),
		email: string()
			.required()
			.email()
			.test(
				"isUniba",
				t("unibaEmail"),
				(val) =>
					val !== undefined &&
					val?.includes("@") &&
					val?.split("@")[1].includes("uniba")
			),
		password: string()
			.required()
			.matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, t("password")),
		repeatPass: string()
			.required()
			.oneOf([ref("password")], t("passNoMatch")),
	});

	const forgotPasswordInputSchema = object({
		email: string().required().email(),
	});

	const passwordInputSchema = object({
		password: string()
			.required()
			.matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, t("password")),
		repeatPass: string()
			.required()
			.oneOf([ref("password")], t("passNoMatch")),
	});

	const perosnalInfoInputSchema = object({
		name: string().required(),
		email: string().required().email(),
		organisation: string().required(),
		telephone: string().required(),
	});

	return {
		loginInputSchema,
		registerInputSchema,
		forgotPasswordInputSchema,
		passwordInputSchema,
		perosnalInfoInputSchema,
	};
}
