import Link from "next/link";
import { useRouter } from "next/router";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Button, Icon, Menu } from "semantic-ui-react";
import { Role, useLogoutMutation } from "../graphql/generated/schema";

import { ActionTypes, AuthContext } from "../providers/Auth";
import useWidth from "../hooks/useWidth";

function FlawisMenuItems() {
  const router = useRouter();
  const { dispatch, user } = useContext(AuthContext);
  const width = useWidth();

  const { t } = useTranslation("common");

  const [logout] = useLogoutMutation({
    onCompleted: () => dispatch({ type: ActionTypes.Logout }),
    update(cache) {
      cache.evict({});
      cache.gc();
    },
  });

  return (
    <>
      {!user ? (
        <>
          <Menu.Item
            as={Link}
            href="/login"
            active={router.asPath === "/login"}
          >
            {width < 768 && <Icon name="sign in" />}
            <b>{t("menu.login")}</b>
          </Menu.Item>
          <Menu.Item
            as={Link}
            href="/register"
            active={router.asPath === "/register"}
          >
            {width < 768 && <Icon name="signup" />}
            <b>{t("menu.register")}</b>
          </Menu.Item>
        </>
      ) : (
        <>
          {user?.role === Role.Admin && (
            <Menu.Item
              as={Link}
              href="/users"
              active={router.asPath.includes("/users")}
            >
              <b>{t("menu.users")}</b>
            </Menu.Item>
          )}
          {width < 768 ? (
            <Menu.Item>
              <Menu.Header>{user.name}</Menu.Header>
              <Menu vertical inverted>
                <Menu.Item
                  as={Link}
                  href="/profile"
                  name={t("menu.profile")}
                  active={router.asPath === "/profile"}
                />
                <Menu.Item
                  as={Link}
                  href="/"
                  name={t("menu.logout")}
                  onClick={() => logout()}
                />
              </Menu>
            </Menu.Item>
          ) : (
            <>
              <Menu.Item
                as={Link}
                href={"/profile"}
                active={router.asPath.includes("/profile")}
              >
                <b>{t("menu.profile")}</b>
              </Menu.Item>
              <Menu.Item as={Link} href="/" onClick={() => logout()}>
                <b>{t("menu.logout")}</b>
              </Menu.Item>
            </>
          )}
        </>
      )}
    </>
  );
}

function ConferencesMenuItems() {
  const router = useRouter();
  const { dispatch, user } = useContext(AuthContext);
  const width = useWidth();

  const { t } = useTranslation("common");

  const [logout] = useLogoutMutation({
    onCompleted: () => dispatch({ type: ActionTypes.Logout }),
    update(cache) {
      cache.evict({});
      cache.gc();
    },
  });

  if (router.pathname === "/conferences/[slug]") {
  }

  if (router.pathname === "/conferences/[slug]/dashboard") {
  }

  if (router.asPath.includes("/profile")) {
    if (width < 768) {
      return (
        <Menu.Item>
          <Menu.Header>{user?.name}</Menu.Header>
          <Menu vertical inverted>
            <Menu.Item
              as={Link}
              href="/profile"
              name={t("menu.profile")}
              active={router.asPath.includes("/profile")}
            />
            <Menu.Item
              as={Link}
              href="/"
              name={t("menu.logout")}
              onClick={() => logout()}
            />
          </Menu>
        </Menu.Item>
      );
    }
    return (
      <>
        <Menu.Item as={Button} onClick={() => router.back()}>
          <b>{t("menu.back")}</b>
        </Menu.Item>
        <Menu.Item as={Link} href="/" onClick={() => logout()}>
          <b>{t("menu.logout")}</b>
        </Menu.Item>
      </>
    );
  }

  return (
    <>
      {router.pathname === "/conferences/[slug]" && (
        <>
          <Menu.Item as={Link} href="/" active={router.asPath === "/"}>
            <Icon name="signup" />
            <b>{t("confMenu.register")}</b>
          </Menu.Item>
          <Menu.Item as={Link} href="/" active={router.asPath === "/"}>
            <Icon name="tag" />
            <b>{t("confMenu.sections")}</b>
          </Menu.Item>
          <Menu.Item as={Link} href="/" active={router.asPath === "/"}>
            <Icon name="home" />
            <b>{t("confMenu.programme")}</b>
          </Menu.Item>
          <Menu.Item as={Link} href="/" active={router.asPath === "/"}>
            <Icon name="home" />
            <b>{t("confMenu.fee")}</b>
          </Menu.Item>
          <Menu.Item as={Link} href="/" active={router.asPath === "/"}>
            <Icon name="home" />
            <b>{t("confMenu.guidelines")}</b>
          </Menu.Item>
          <Menu.Item as={Link} href="/" active={router.asPath === "/"}>
            <Icon name="home" />
            <b>{t("confMenu.dates")}</b>
          </Menu.Item>
          <Menu.Item as={Link} href="/" active={router.asPath === "/"}>
            <Icon name="home" />
            <b>{t("confMenu.archive")}</b>
          </Menu.Item>
          <Menu.Item as={Link} href="/" active={router.asPath === "/"}>
            <Icon name="home" />
            <b>{t("confMenu.contact")}</b>
          </Menu.Item>
        </>
      )}
      {!user ? (
        <>
          <Menu.Item
            as={Link}
            href="/login"
            active={router.asPath === "/login"}
          >
            {width < 768 && <Icon name="sign in" />}
            <b>{t("menu.login")}</b>
          </Menu.Item>
          <Menu.Item
            as={Link}
            href="/register"
            active={router.asPath === "/register"}
          >
            {width < 768 && <Icon name="signup" />}
            <b>{t("menu.register")}</b>
          </Menu.Item>
        </>
      ) : (
        <>
          {width < 768 ? (
            <Menu.Item>
              <Menu.Header>{user.name}</Menu.Header>
              <Menu vertical inverted>
                <Menu.Item
                  as={Link}
                  href="/profile"
                  name={t("menu.profile")}
                  active={router.asPath.includes("/profile")}
                />
                <Menu.Item
                  as={Link}
                  href="/"
                  name={t("menu.logout")}
                  onClick={() => logout()}
                />
              </Menu>
            </Menu.Item>
          ) : (
            <>
              <Menu.Item
                as={Link}
                href={"/profile"}
                active={router.asPath.includes("/profile")}
              >
                <b>{t("menu.profile")}</b>
              </Menu.Item>
              <Menu.Item as={Link} href="/" onClick={() => logout()}>
                <b>{t("menu.logout")}</b>
              </Menu.Item>
            </>
          )}
        </>
      )}
    </>
  );
}

export default function MainMenuItems() {
  if (window.location.hostname === "conferences.flaw.uniba.sk") {
    return <ConferencesMenuItems />;
  }

  return <ConferencesMenuItems />;
}
