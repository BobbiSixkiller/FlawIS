import { LinkProps } from "next/link";
import NextLink from "next/link";
import { FC, ReactNode } from "react";

interface props extends LinkProps {
  children?: ReactNode;
}

const LocalizedLink: FC<props> = ({ href, children }) => {
  return (
    <NextLink href={href || ""}>
      <a>{children}</a>
    </NextLink>
  );
};

export default LocalizedLink;
