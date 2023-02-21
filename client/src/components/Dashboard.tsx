import Image from "next/image";
import Link from "next/link";
import { ReactNode, useContext } from "react";
import { Grid, List, Menu } from "semantic-ui-react";

import logo from "public/images/Flaw-logo-notext.png";
import { ActionTypes, AuthContext } from "../providers/Auth";
import { useRouter } from "next/router";
import useWith from "../hooks/useWidth";
import Nav, { ContentWrapper } from "./Nav";
import { Role, useLogoutMutation } from "../graphql/generated/schema";
import Footer from "./Footer";
import { useTranslation } from "next-i18next";
import { ControlsContext } from "../providers/ControlsProvider";

interface dashboardProps {
	children: ReactNode;
}

export default function Dashboard({ children }: dashboardProps) {
	const { dispatch, user } = useContext(AuthContext);
	const { rightPanelItems } = useContext(ControlsContext);
	const router = useRouter();
	const width = useWith();

	const [logout] = useLogoutMutation({
		onCompleted: () => dispatch({ type: ActionTypes.Logout }),
		update(cache) {
			cache.evict({});
			cache.gc();
		},
	});

	const { t } = useTranslation("common");

	if (width < 768) {
		return (
			<Nav transparent={false} locales={true}>
				<ContentWrapper>
					<Grid container>
						<Grid.Row>
							<Grid.Column>{children}</Grid.Column>
						</Grid.Row>
					</Grid>
				</ContentWrapper>
				<Footer />
			</Nav>
		);
	}

	return (
		<Grid
			stackable
			container
			divided
			style={{ marginTop: 0, marginBottom: 0, minHeight: "100vh" }}
		>
			<Grid.Column floated="right" width={3} only="tablet computer">
				<Menu text vertical compact style={{ position: "fixed" }}>
					<Menu.Item as={Link} href="/">
						<Image alt="flaw-logo-notext" src={logo} height={35} width={35} />
					</Menu.Item>
					<Menu.Item as={Link} href="/" active={router.asPath === "/"}>
						<b>{t("menu.home")}</b>
					</Menu.Item>
					{user?.role === Role.Admin && (
						<Menu.Item
							as={Link}
							href="/users"
							active={router.asPath === "/users"}
						>
							<b>{t("menu.users")}</b>
						</Menu.Item>
					)}
					<Menu.Item
						as={Link}
						href="/profile"
						active={router.asPath === "/profile"}
					>
						<b>{t("menu.profile")}</b>
					</Menu.Item>
					<Menu.Item as={Link} href="/" onClick={() => logout()}>
						<b>{t("menu.logout")}</b>
					</Menu.Item>
				</Menu>
			</Grid.Column>
			<Grid.Column width={9}>{children}</Grid.Column>
			<Grid.Column width={4} only="tablet computer">
				<div
					style={{
						position: "sticky",
						top: 16,
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
						height: "calc(100vh - 48px)",
					}}
				>
					<div>{rightPanelItems}</div>
					<List link size="small">
						<List.Item as="a" href="#">
							{t("footer.menu.contact")}
						</List.Item>
						<List.Item as="a" href="#">
							{t("footer.menu.terms")}
						</List.Item>
					</List>
				</div>
			</Grid.Column>
		</Grid>
	);
}
