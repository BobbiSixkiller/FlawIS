import React from "react";
import { useParams } from "react-router-dom";

export default function User() {
	const params = useParams();
	console.log(params);

	return <div>USER</div>;
}
