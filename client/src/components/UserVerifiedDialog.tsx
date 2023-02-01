import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Button, Header, Message } from "semantic-ui-react";
import { useResendActivationLinkMutation } from "../graphql/generated/schema";
import { AuthContext } from "../providers/Auth";
import { DialogContext } from "../providers/Dialog";

export default function UserVerifiedDialog() {
	const { t } = useTranslation("activation");
	const [msg, setMsg] = useState("");

	const { pathname } = useRouter();
	const { user } = useContext(AuthContext);
	const { handleOpen } = useContext(DialogContext);

	const [resendActivationLink, { loading, error }] =
		useResendActivationLinkMutation({
			onCompleted: () => setMsg(t("dialog.msg")),
		});

	/* eslint-disable */
	useEffect(() => {
		const content = (
			<>
				<Header>{t("dialog.header")}</Header>
				<p>{t("dialog.body")}</p>
				<Button loading={loading} onClick={() => resendActivationLink()}>
					{t("dialog.button")}{" "}
				</Button>
				{msg && (
					<Message
						positive
						compact
						content={msg}
						onDismiss={() => setMsg("")}
					/>
				)}
				{error && <Message error compact content={error.message} />}
			</>
		);

		if (user && !user?.verified && !pathname.includes("/activate")) {
			handleOpen({ content, size: "tiny" });
		}
	}, [user, pathname, handleOpen, resendActivationLink, error, loading, msg]);

	return <div />;
}
