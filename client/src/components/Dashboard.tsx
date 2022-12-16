import Image from "next/image";
import Link from "next/link";
import { ReactNode, useContext } from "react";
import {
  Button,
  Grid,
  Header,
  Icon,
  List,
  Menu,
  Search,
} from "semantic-ui-react";

import logo from "public/images/Flaw-logo-notext.png";
import { AuthContext } from "../providers/Auth";
import { useRouter } from "next/router";
import useWith from "../hooks/useWidth";
import Nav, { ContentWrapper } from "./Nav";

interface dashboardProps {
  children: ReactNode;
}

export default function Dashboard({ children }: dashboardProps) {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const width = useWith();

  if (width < 768) {
    return (
      <Nav transparent={false} locales={true}>
        <ContentWrapper>
          <Grid padded>
            <Grid.Row>
              <Grid.Column>{children}</Grid.Column>
            </Grid.Row>
          </Grid>
        </ContentWrapper>
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
            <b>Home</b>
          </Menu.Item>
          {!user ? (
            <>
              <Menu.Item
                as={Link}
                href="/login"
                active={router.asPath === "/login"}
              >
                <Icon name="sign in" />
                <b>Login</b>
              </Menu.Item>
              <Menu.Item
                as={Link}
                href="/register"
                active={router.asPath === "/register"}
              >
                <Icon name="signup" />
                <b>Register</b>
              </Menu.Item>
            </>
          ) : (
            <>
              <Menu.Item
                as={Link}
                href="/user/profile"
                name="Profile"
                active={router.asPath === "/user/profile"}
              />
              <Menu.Item as={Link} href="/" name="Sign out" />
            </>
          )}
        </Menu>
      </Grid.Column>
      <Grid.Column width={9}>
        <Grid padded>
          <Grid.Row verticalAlign="middle">
            <Grid.Column width={8}>
              <Header>Grants</Header>
            </Grid.Column>
            <Grid.Column width={8}>
              <Button floated="right" icon="plus" />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>{children}</Grid.Column>
          </Grid.Row>
        </Grid>
      </Grid.Column>
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
          <Search placeholder="Search..." fluid input={{ fluid: true }} />
          <List link size="small">
            <List.Item as="a" href="#">
              Contact Us
            </List.Item>
            <List.Item as="a" href="#">
              Terms & Privacy
            </List.Item>
          </List>
        </div>
      </Grid.Column>
    </Grid>
  );
}
