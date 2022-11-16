import { NextPage } from "next";
import { useRouter } from "next/router";
import { useContext } from "react";
import { useLogoutMutation } from "../../graphql/generated/schema";
import { ActionTypes, AuthContext } from "../../providers/Auth";

const HomePage: NextPage = () => {
  const router = useRouter();
  const { user, dispatch } = useContext(AuthContext);
  const [logout] = useLogoutMutation({
    onCompleted: () => {
      dispatch({ type: ActionTypes.Logout });
      router.push("/");
    },
  });

  return (
    <div>
      <h1>GRANTS HOME PAGE</h1>
      <div>
        {user ? (
          <button onClick={() => logout()}>logout</button>
        ) : (
          <button onClick={() => router.push("/login")}>login</button>
        )}
      </div>
    </div>
  );
};

export default HomePage;
