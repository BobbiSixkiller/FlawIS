import React from "react";
import { useRouteMatch } from "react-router-dom";

export default function AddGrant() {
  const match = useRouteMatch();
  console.log(match);
  return <div>ADD GRANT PAGE</div>;
}
