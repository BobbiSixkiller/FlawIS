import { useReducer } from "react";

function modalReducer(state, action) {
  switch (action.type) {
    case "TOGGLE":
      return { ...state, show: !state.show, data: null };
    case "ACTION":
      return {
        ...state,
        show: true,
        action: action.name,
        data: action.payload,
      };
    case "UPDATE_DATA":
      return { ...state, data: action.payload };

    default:
      return { ...state };
  }
}

export default function useModal(initData) {
  const [state, dispatch] = useReducer(modalReducer, {
    show: false,
    action: "",
    data: initData,
  });

  return {
    show: state.show,
    action: state.action,
    modalData: state.data,
    dispatch,
  };
}
