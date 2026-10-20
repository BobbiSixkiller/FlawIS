"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import Dropdown from "./dropdown";
import Icon from "./icon";

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
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label={t("login")}
        nativeButton={false}
        role="link"
        render={<Link href={signInHref} />}
      >
        <Icon name="arrow-right-start-on-rectangle" className="size-5" />
      </Button>
    );
  }

  return (
    <Dropdown
      anchor={{ gap: 6, to: "bottom" }}
      trigger={
        <>
          <span className="sr-only">{t("profile")}: </span>
          {avatar}
        </>
      }
      triggerProps={{
        size: "icon",
        className: "flex h-fit w-fit items-center rounded-full",
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
