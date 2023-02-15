import { useState } from "react";

export default function useToggle({ defaultOpen }: { defaultOpen?: boolean }) {
  const [opened, toggle] = useState(defaultOpen || false);

  return { opened, toggle };
}
