import { useReducer } from "react";

const INITIAL_STATE = {
  show: false,
  action: "",
  data: null,
};

function modalReducer(state, action) {
  switch (action.type) {
    case "TOGGLE":
      return { ...state, show: !state.show };
    case "ADD":
      return { ...state, show: true, action: "ADD" };
    case "UPDATE":
      return { ...state, show: true, action: "UPDATE", data: action.payload };
    case "DELETE":
      return { ...state, show: true, action: "DELETE", data: action.payload };

    default:
      return { ...state };
  }
}

export default function useModal() {
  const [state, dispatch] = useReducer(modalReducer, INITIAL_STATE);

  return {
    show: state.show,
    action: state.action,
    modalData: state.data,
    dispatch,
  };
}
