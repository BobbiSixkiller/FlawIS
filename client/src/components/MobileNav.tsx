import styled from "styled-components";
import { useInView } from "react-intersection-observer";
import { Container, Dropdown, Menu, Icon, Sidebar } from "semantic-ui-react";
import { ReactNode, useContext, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Cookies from "js-cookie";

import logoInverted from "public/images/Flaw-logo-notext-inverted.png";
import logo from "public/images/Flaw-logo-notext.png";

import { useRouter } from "next/router";
import { ActionTypes, AuthContext } from "../providers/Auth";
import { useLogoutMutation } from "../graphql/generated/schema";
import useWidth from "../hooks/useWidth";
import MainMenu from "./MainMenuItems";
import { useApollo } from "../lib/apollo";
import { useTranslation } from "next-i18next";

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
  margin: 60px 0 2em 0;
`;

export default function MobileNav({
  children,
  transparent,
  locales,
}: {
  children: ReactNode;
  transparent: boolean;
  locales?: boolean;
}) {
  const { ref, inView } = useInView({ threshold: 1, initialInView: true });
  const [opened, toggle] = useState(false);

  const { user, dispatch } = useContext(AuthContext);

  const width = useWidth();

  const router = useRouter();

  useEffect(() => toggle(false), [router]);

  const [logout] = useLogoutMutation({
    onCompleted: () => {
      dispatch({ type: ActionTypes.Logout });
      toggle(false);
    },
    update(cache) {
      cache.evict({ id: `User:${user?.id}` });
      cache.gc();
    },
  });

  const client = useApollo({});
  const { i18n } = useTranslation();

  useEffect(() => {
    Cookies.set("NEXT_locale", i18n.language, {
      path: "/",
      expires: 31536000,
      domain:
        process.env.NODE_ENV === "production" ? "flaw.uniba.sk" : "localhost",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });
    client.cache.reset();
    client.refetchQueries({
      include: "active",
    });
  }, [i18n.language]);

  return (
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
          <Menu.Item>
            <Image
              alt="flaw-logo-notext"
              src={logoInverted}
              height={35}
              width={35}
              style={{ height: 35, width: 35 }}
            />
          </Menu.Item>
        </Link>
        <MainMenu />
      </Sidebar>

      <Sidebar.Pusher dimmed={opened}>
        <div ref={ref}>
          <FollowingBar inView={inView} width={width} transparent={transparent}>
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
                        style={{ height: 35, width: 35 }}
                      />
                    </Menu.Item>
                  </Link>
                )}
                <Menu.Item
                  style={{ marginLeft: 0, marginRight: 0 }}
                  onClick={() => toggle(true)}
                >
                  <Icon name="sidebar" style={{ margin: 0 }} />
                  {width > 550 && "Menu"}
                </Menu.Item>

                {width < 550 && (
                  <Link
                    href="/"
                    style={{
                      marginLeft: "auto",
                      marginRight: locales ? "-60px" : 0,
                    }}
                  >
                    <Menu.Item>
                      <Image
                        alt="flaw-logo-notext"
                        src={inView && transparent ? logoInverted : logo}
                        height={35}
                        width={35}
                        style={{ height: 35, width: 35 }}
                      />
                    </Menu.Item>
                  </Link>
                )}
                <Menu.Menu position="right">
                  {user ? (
                    <Menu.Item
                      onClick={() => logout()}
                      style={{ marginLeft: 0, marginRight: 0 }}
                    >
                      <Icon name="sign out" />
                    </Menu.Item>
                  ) : (
                    <Menu.Item
                      onClick={() => router.push("/login")}
                      style={{ marginLeft: 0, marginRight: 0 }}
                    >
                      <Icon name="sign in" />
                    </Menu.Item>
                  )}
                  {locales && (
                    <Dropdown
                      item
                      icon="world"
                      style={{ marginLeft: "auto", marginRight: 0 }}
                    >
                      <Dropdown.Menu>
                        <Dropdown.Header content="Language" />
                        <Dropdown.Item
                          style={{ textAlign: "center" }}
                          key={1}
                          text={"English"}
                          value={"English"}
                          onClick={async () =>
                            router.push(router.asPath, undefined, {
                              locale: "en",
                            })
                          }
                        />
                        <Dropdown.Item
                          style={{ textAlign: "center" }}
                          key={2}
                          text={"Slovak"}
                          value={"Slovak"}
                          onClick={() =>
                            router.push(router.asPath, undefined, {
                              locale: "sk",
                            })
                          }
                        />
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </Menu.Menu>
              </Menu>
            </Container>
          </FollowingBar>
        </div>

        {children}
      </Sidebar.Pusher>
    </Sidebar.Pushable>
  );
}
