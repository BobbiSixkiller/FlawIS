import { ReactNode, useRef, useState } from "react";
import { Segment } from "semantic-ui-react";
import useOnClickOutside from "../hooks/useOnClickOutside";

export default function DropdownComponent({ trigger }: { trigger: ReactNode }) {
  const [toggle, setToggle] = useState(false);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(dropdownContainerRef, () => setToggle(false));

  return (
    <div style={{ position: "relative" }}>
      {trigger}
      <div style={{ position: "absolute", marginTop: "5px" }}>
        <Segment></Segment>
      </div>
    </div>
  );
}
