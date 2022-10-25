import { NextPage } from "next";
import { useRouter } from "next/router";

const Submission: NextPage = () => {
  const router = useRouter();
  const { slug } = router.query;

  return <h1>{slug}</h1>;
};

Submission.getInitialProps = () => {
  return { protect: true };
};

export default Submission;
