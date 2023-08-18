import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { Dropdown } from "semantic-ui-react";

export default function LanguageToggler({ text }: { text?: boolean }) {
  const router = useRouter();
  const { t } = useTranslation("common");

  return (
    <Dropdown
      item
      text={!text ? undefined : t("menu.lang")}
      icon={!text ? "world" : undefined}
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
  );
}
