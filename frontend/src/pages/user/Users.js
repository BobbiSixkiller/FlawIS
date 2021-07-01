import React from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";

import User from "./User";

export default function Users() {
	const { path, url } = useRouteMatch();
	console.log(path, url);

	return (
		<Switch>
			<Route exact path={path}>
				<div>USERS</div>
			</Route>
			<Route path={`${path}/:id`}>
				<User />
			</Route>
		</Switch>
	);
}
