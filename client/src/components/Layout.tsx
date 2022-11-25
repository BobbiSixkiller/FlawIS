import styled from "styled-components";
import { useInView } from "react-intersection-observer";
import { Container, Dropdown, Menu, Icon, Sidebar } from "semantic-ui-react";
import {
  createContext,
  Dispatch,
  ReactElement,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";

import logoInverted from "public/images/Flaw-logo-notext-inverted.png";
import logo from "public/images/Flaw-logo-notext.png";

import { useRouter } from "next/router";
import { ActionTypes, AuthContext } from "../providers/Auth";
import { Role, useLogoutMutation } from "../graphql/generated/schema";
import useWidth from "../hooks/useWidth";

interface navProps {
  inView: boolean;
  transparent: boolean;
  width: number;
}

const FollowingBar = styled.div<navProps>`
  position: fixed;
  z-index: 900;
  top: 0px;
  left: 0%;
  padding: ${(props) =>
    props.inView && props.width > 600 && props.transparent
      ? "2em 0em"
      : "0em 0em"};
  background-color: ${(props) =>
    props.inView && props.transparent ? "transparent" : "#FFFFFF"};
  width: 100%;
  box-shadow: ${(props) =>
    props.inView
      ? "0px 0px 0px 0px transparent"
      : "0px 3px 5px rgba(0, 0, 0, 0.2)"};
  border-bottom: ${(props) =>
    props.inView && props.transparent
      ? "1px solid transparent"
      : "1px solid #DDDDDD"};
  transition: padding 0.5s ease, background 0.5s ease, box-shadow 0.5s ease,
    border 0.5s ease;
`;

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;
export const ContentWrapper = styled.div`
  flex: 1;
  margin: 75px 0 2em 0;
`;

export const MenuItemsContext = createContext<{
  setMenuItems: Dispatch<SetStateAction<ReactNode>>;
}>({ setMenuItems: () => null });

export function Nav({
  children,
  transparent,
}: {
  children: ReactNode;
  transparent: boolean;
}) {
  const { ref, inView } = useInView({ threshold: 1, initialInView: true });
  const [opened, toggle] = useState(false);
  const [menuItems, setMenuItems] = useState<ReactNode>([]);

  const { user, dispatch } = useContext(AuthContext);

  const width = useWidth();

  const router = useRouter();

  useEffect(() => toggle(false), [router]);

  const [logout] = useLogoutMutation({
    onCompleted: () => {
      toggle(false);
      dispatch({ type: ActionTypes.Logout });
    },
  });

  useEffect(() => {
    toggle(false);
  }, [router.asPath]);

  return (
    <MenuItemsContext.Provider value={{ setMenuItems }}>
      <Sidebar.Pushable>
        <Sidebar
          as={Menu}
          animation="overlay"
          inverted
          onHide={() => toggle(false)}
          vertical
          visible={opened}
          style={{
            position: "fixed",
            top: "0px",
            bottom: "0px",
            overflowY: "auto",
          }}
        >
          <Link href="/">
            <Menu.Item as="a" active={router.asPath === "/"}>
              <Icon name="home" />
              <b>Home</b>
            </Menu.Item>
          </Link>
          <Menu.Item>
            <Menu.Header>{user ? user.name : "User"}</Menu.Header>
            {user ? (
              <Menu vertical inverted>
                <Link href="/user/profile">
                  <Menu.Item
                    as="a"
                    name="Personal Information"
                    active={router.asPath === "/user/profile"}
                  />
                </Link>
                {user.role === Role.Admin && (
                  <Link href="/new">
                    <Menu.Item as="a" name="new conference" />
                  </Link>
                )}
                <Link href="/">
                  <Menu.Item as="a" name="Sign out" onClick={() => logout()} />
                </Link>
              </Menu>
            ) : (
              <Menu vertical inverted>
                <Link href="/login">
                  <Menu.Item as="a" name="log in" />
                </Link>
                <Link href="register">
                  <Menu.Item as="a" name="register" />
                </Link>
              </Menu>
            )}
          </Menu.Item>
          {menuItems}
        </Sidebar>

        <Sidebar.Pusher dimmed={opened}>
          <div ref={ref}>
            <FollowingBar
              inView={inView}
              width={width}
              transparent={transparent}
            >
              <Container>
                <Menu
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                  inverted={inView && transparent ? true : false}
                  secondary
                  size="large"
                >
                  {width > 550 && (
                    <Link href="/">
                      <Menu.Item>
                        <Image
                          alt="flaw-logo-notext"
                          src={inView && transparent ? logoInverted : logo}
                          height={35}
                          width={35}
                          priority={true}
                        />
                      </Menu.Item>
                    </Link>
                  )}
                  <Menu.Item
                    style={{ marginLeft: 0, marginRight: 0 }}
                    onClick={() => toggle(true)}
                  >
                    <Icon name="sidebar" /> {width > 550 && "Menu"}
                  </Menu.Item>

                  {width < 550 && (
                    <Link
                      href="/"
                      style={{ marginLeft: "auto", marginRight: 0 }}
                    >
                      <Menu.Item>
                        <Image
                          alt="flaw-logo-notext"
                          src={inView && transparent ? logoInverted : logo}
                          height={35}
                          width={35}
                          priority={true}
                        />
                      </Menu.Item>
                    </Link>
                  )}
                  <Menu.Menu position="right">
                    <Dropdown
                      item
                      icon="world"
                      style={{ marginLeft: "auto", marginRight: 0 }}
                    >
                      <Dropdown.Menu>
                        <Dropdown.Header content="Language" />
                        <Dropdown.Item
                          key={1}
                          text={"English"}
                          value={"English"}
                          onClick={() => {
                            document.cookie = `NEXT_LOCALE=en; max-age=31536000; path=/`;
                            router.push(router.asPath, router.asPath, {
                              locale: "en",
                            });
                          }}
                        />
                        <Dropdown.Item
                          key={2}
                          text={"Slovak"}
                          value={"Slovak"}
                          onClick={() => {
                            document.cookie = `NEXT_LOCALE=sk; max-age=31536000; path=/`;
                            router.push(router.asPath, router.asPath, {
                              locale: "sk",
                            });
                          }}
                        />
                      </Dropdown.Menu>
                    </Dropdown>
                  </Menu.Menu>
                </Menu>
              </Container>
            </FollowingBar>
          </div>

          {children}
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </MenuItemsContext.Provider>
  );
}
