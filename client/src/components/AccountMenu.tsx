"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";
import Button from "./Button";
import Dropdown from "./Dropdown";
import Icon from "./Icon";

export default function AccountMenu({
  avatar,
  signInHref = "/login",
}: {
  avatar?: ReactNode;
  signInHref?: string;
}) {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation(lng, "dashboard");

  if (!avatar) {
    return (
      <Button
        as={Link}
        href={signInHref}
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label={t("login")}
      >
        <Icon name="arrow-right-start-on-rectangle" className="size-5" />
      </Button>
    );
  }

  return (
    <Dropdown
      anchor={{ gap: 6, to: "bottom" }}
      trigger={avatar}
      triggerProps={{
        size: "icon",
        className: "flex h-fit w-fit items-center rounded-full",
        "aria-label": t("profile"),
      }}
      items={[
        <Link href="/profile" prefetch={false} key="profile">
          <Icon name="user-circle" className="size-5" aria-hidden="true" />
          {t("profile")}
        </Link>,
        <Link href="/logout" prefetch={false} key="logout">
          <Icon
            name="arrow-left-start-on-rectangle"
            className="size-5"
            aria-hidden="true"
          />
          {t("logout")}
        </Link>,
      ]}
    />
  );
}
