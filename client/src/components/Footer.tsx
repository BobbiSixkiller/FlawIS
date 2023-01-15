import { useTranslation } from "next-i18next";
import Image from "next/image";
import logo from "public/images/PraF_logo_text_BP_horizontal_inverted.png";

import {
	Segment,
	Container,
	Grid,
	Header,
	List,
	Divider,
} from "semantic-ui-react";

export default function Footer() {
	const { t } = useTranslation("common");

	return (
		<Segment
			inverted
			style={{
				padding: "5em 0em",
			}}
			vertical
		>
			<Container textAlign="center">
				<Grid>
					<Grid.Row>
						<Grid.Column>
							<Header inverted as="h4" content={t("footer.heading")} />
							<p>{t("footer.text")}</p>
						</Grid.Column>
					</Grid.Row>
				</Grid>
				<Divider inverted section />
				<div
					style={{
						display: "flex",
						justifyContent: "center",
					}}
				>
					<Image
						alt="flaw-logo-notext"
						src={logo}
						height={130}
						width={300}
						style={{ height: 130, width: 300 }}
						priority
					/>
				</div>

				<List horizontal inverted divided link size="small">
					<List.Item as="a" href="mailto:matus.muransky@flaw.uniba.sk">
						{t("footer.menu.contact")}
					</List.Item>
					<List.Item as="a" href="https://uniba.sk/ochrana-osobnych-udajov/">
						{t("footer.menu.terms")}
					</List.Item>
				</List>
			</Container>
		</Segment>
	);
}
