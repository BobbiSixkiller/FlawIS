import { ReactNode, useContext } from "react";
import { Grid, List, Menu } from "semantic-ui-react";

import useWith from "../hooks/useWidth";
import Nav, { ContentWrapper } from "./MobileNav";
import Footer from "./Footer";
import { useTranslation } from "next-i18next";
import { ControlsContext } from "../providers/ControlsProvider";
import MainMenuItems from "./MainMenuItems";
import Image from "next/image";
import logo from "public/images/Flaw-logo-notext.png";
import Link from "next/link";

interface dashboardProps {
  children: ReactNode;
}

export default function Dashboard({ children }: dashboardProps) {
  const { rightPanelItems } = useContext(ControlsContext);
  const width = useWith();

  const { t } = useTranslation("common");

  if (width < 768) {
    return (
      <Nav transparent={false} locales={true}>
        <ContentWrapper>
          <Grid container>
            <Grid.Row>
              <Grid.Column>
                <div style={{ paddingTop: "1rem" }}>{rightPanelItems}</div>
                {children}
              </Grid.Column>
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
          <MainMenuItems />
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
