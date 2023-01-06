import { useTranslation } from "next-i18next";
import { object, setLocale, string } from "yup";

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

	const perosnalInfoInputSchema = object({
		name: string().required(),
		email: string().required().email(),
		organisation: string().required(),
	});

	return { loginInputSchema, perosnalInfoInputSchema };
}
