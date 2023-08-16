import { useRouter } from "next/router";
import { Dropdown } from "semantic-ui-react";
import useWidth from "../hooks/useWidth";

export default function LanguageToggler() {
  const router = useRouter();
  const width = useWidth();
  console.log(width);

  return (
    <Dropdown
      item
      text={width > 1000 ? undefined : "Jazyk"}
      icon={width > 1000 ? "world" : undefined}
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
