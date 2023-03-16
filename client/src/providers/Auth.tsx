import { createContext, Dispatch, ReactNode, useReducer } from "react";
import { Loader } from "semantic-ui-react";
import { useMeQuery, User } from "../graphql/generated/schema";

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export enum ActionTypes {
  Login = "LOGIN",
  Logout = "LOGOUT",
}

type ActionPayload = {
  [ActionTypes.Login]: { user: User };
  [ActionTypes.Logout]: undefined;
};

type AuthActions = ActionMap<ActionPayload>[keyof ActionMap<ActionPayload>];

type AuthStateType = {
  loading: boolean;
  user: User | undefined;
};

function authReducer(state: AuthStateType, action: AuthActions) {
  switch (action.type) {
    case ActionTypes.Login:
      return { user: action.payload.user, loading: false };

    case ActionTypes.Logout:
      return { user: undefined, loading: false };

    default:
      return state;
  }
}

const AuthContext = createContext<
  AuthStateType & { dispatch: Dispatch<AuthActions> }
>({
  loading: true,
  user: undefined,
  dispatch: () => null,
});

function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    loading: true,
    user: undefined,
  });

  const { loading } = useMeQuery({
    onCompleted: ({ me }) =>
      dispatch({ type: ActionTypes.Login, payload: { user: me as User } }),
    onError: (error) => {
      console.log(error);
      dispatch({ type: ActionTypes.Logout });
    },
  });

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {state.loading || loading ? <Loader active /> : children}
    </AuthContext.Provider>
  );
}

export { AuthProvider, AuthContext };
