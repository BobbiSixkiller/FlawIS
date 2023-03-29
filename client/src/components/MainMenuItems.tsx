import Link from "next/link";
import { useRouter } from "next/router";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Icon, Menu } from "semantic-ui-react";
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

function ProfileMenuItems() {
  const router = useRouter();
  const { user, dispatch } = useContext(AuthContext);
  const { t } = useTranslation();

  const [logout] = useLogoutMutation({
    onCompleted: () => dispatch({ type: ActionTypes.Logout }),
    update(cache) {
      cache.evict({});
      cache.gc();
    },
  });

  return !user ? (
    <>
      <Menu.Item as={Link} href="/login" active={router.asPath === "/login"}>
        <Icon name="sign in" />
        <b>{t("menu.login")}</b>
      </Menu.Item>
      <Menu.Item
        as={Link}
        href="/register"
        active={router.asPath === "/register"}
      >
        <Icon name="signup" />
        <b>{t("menu.register")}</b>
      </Menu.Item>
    </>
  ) : (
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
  );
}

function ConferencePageMenuItems() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { dispatch, user } = useContext(AuthContext);
  const width = useWidth();

  const [logout] = useLogoutMutation({
    onCompleted: () => dispatch({ type: ActionTypes.Logout }),
    update(cache) {
      cache.evict({});
      cache.gc();
    },
  });

  return (
    <>
      <Menu.Item>
        <Menu.Header>{t("menu.conference")}</Menu.Header>
        <Menu vertical inverted>
          <Menu.Item as={Link} href="#register" active={router.asPath === "/"}>
            {t("confMenu.register")}
          </Menu.Item>
          <Menu.Item as={Link} href="#sections" active={router.asPath === "/"}>
            {t("confMenu.sections")}
          </Menu.Item>
          <Menu.Item as={Link} href="#programme" active={router.asPath === "/"}>
            {t("confMenu.programme")}
          </Menu.Item>
          <Menu.Item as={Link} href="#fee" active={router.asPath === "/"}>
            {t("confMenu.fee")}
          </Menu.Item>
          <Menu.Item
            as={Link}
            href="#guidelines"
            active={router.asPath === "/"}
          >
            {t("confMenu.guidelines")}
          </Menu.Item>
          <Menu.Item as={Link} href="#dates" active={router.asPath === "/"}>
            {t("confMenu.dates")}
          </Menu.Item>
          <Menu.Item as={Link} href="#archive" active={router.asPath === "/"}>
            {t("confMenu.archive")}
          </Menu.Item>
          <Menu.Item as={Link} href="#contact" active={router.asPath === "/"}>
            {t("confMenu.contact")}
          </Menu.Item>
        </Menu>
      </Menu.Item>
      <ProfileMenuItems />
    </>
  );
}

function DashboardMenuItems() {
  const router = useRouter();
  const { t } = useTranslation();
  const { dispatch, user } = useContext(AuthContext);

  const [logout] = useLogoutMutation({
    onCompleted: () => dispatch({ type: ActionTypes.Logout }),
    update(cache) {
      cache.evict({});
      cache.gc();
    },
  });

  return (
    <>
      <Menu.Item as="a" onClick={() => router.push(`/${router.query.slug}`)}>
        <b>{t("menu.back")}</b>
      </Menu.Item>
      {user?.role === Role.Admin && (
        <>
          <Menu.Item
            as={Link}
            href={`/${router.query.slug}/dashboard`}
            active={router.pathname === "/conferences/[slug]/[dashboard]"}
          >
            <b>Dashboard</b>
          </Menu.Item>
          <Menu.Item
            as={Link}
            href={`/${router.query.slug}/dashboard/attendees`}
            active={
              router.pathname === "/conferences/[slug]/[dashboard]/attendees"
            }
          >
            <b>Účastníci</b>
          </Menu.Item>
        </>
      )}
      <Menu.Item
        as={Link}
        href="/profile"
        active={router.asPath.includes("/profile")}
      >
        <b>{t("menu.profile")}</b>
      </Menu.Item>
      <Menu.Item as={Link} href="/" onClick={() => logout()}>
        <b>{t("menu.logout")}</b>
      </Menu.Item>
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
        <Menu.Item as="a" onClick={() => router.back()}>
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
      {router.pathname === "/conferences/[slug]/register" && (
        <>
          <Menu.Item as="a" onClick={() => router.back()}>
            <b>{t("menu.back")}</b>
          </Menu.Item>
          <Menu.Item as={Link} href="/" onClick={() => logout()}>
            <b>{t("menu.logout")}</b>
          </Menu.Item>
        </>
      )}
      {router.pathname === "/conferences" && <ProfileMenuItems />}
      {router.pathname === "/conferences/[slug]" && <ConferencePageMenuItems />}
      {router.pathname.includes("/conferences/[slug]/[dashboard]") && (
        <DashboardMenuItems />
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
