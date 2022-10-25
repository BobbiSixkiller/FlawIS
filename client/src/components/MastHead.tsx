import Link from "next/link";
import { FC, ReactElement, useContext } from "react";
import { Button, Container, Icon, IconProps } from "semantic-ui-react";
import useWith from "src/hooks/useWidth";
import { AuthContext } from "src/providers/Auth";
import styled, { keyframes } from "styled-components";

const opacityChange = keyframes`
	from{
		opacity: 0;
	}
	to{
		opacity: 1;
	}
`;

const CustomSegment = styled.div`
  position: relative;
  overflow: hidden;
  text-align: center;
  padding: 0em;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0px;
  border-bottom: none;
  background-color: black;
  transform: translate3d(0, 0, 0);
  &:after {
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: -1;
    width: 100%;
    height: 100%;
    content: "";
    /* background: radial-gradient(
      circle,
      rgba(180, 104, 122, 1) 34%,
      rgba(2, 0, 36, 1) 100%
    ); */
    animation: ${opacityChange} 3s ease-in;
  }
`;

const bounce = keyframes`
	0%   { transform: translateY(0); }
  50%  { transform: translateY(-25px); }
  100% { transform: translateY(0); }
`;

export const ArrowWrapper = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:hover > i {
    animation-duration: 2s;
    animation-iteration-count: infinite;
    transform-origin: bottom;
    animation-name: ${bounce};
    animation-timing-function: ease;
  }
`;

export const Arrow: FC<IconProps> = styled(Icon)`
  font-size: 1.5em !important;
  @media (max-width: 600px) {
    font-size: 1em !important;
  }
`;

const MastHead: FC<{
  children: ReactElement | ReactElement[];
  scrollToRef: () => void;
}> = ({ children, scrollToRef }) => {
  const { user } = useContext(AuthContext);
  const width = useWith();

  return (
    <CustomSegment>
      <Container
        text
        textAlign="center"
        style={{
          minHeight: "350px",
          height: "auto",
          padding: width > 600 ? "15rem 0rem" : "6rem 0rem",
        }}
      >
        {children}
        {user ? (
          <ArrowWrapper onClick={() => scrollToRef()}>
            <Arrow name="arrow down" />
          </ArrowWrapper>
        ) : (
          <Link href="/login">
            <Button inverted size="huge">
              Log In
            </Button>
          </Link>
        )}
      </Container>
    </CustomSegment>
  );
};

export default MastHead;
