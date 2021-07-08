import React from "react";
import { useParams } from "react-router-dom";

export default function Grant() {
  const { id } = useParams();
  console.log(id);

  return <div>GRANT PAGE</div>;
}
