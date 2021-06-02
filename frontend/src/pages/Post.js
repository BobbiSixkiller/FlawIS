import React from "react";
import { useHistory } from "react-router-dom";

import API from "../api";
import { Jumbotron, Button } from "reactstrap";

export default function Post() {
	const history = useHistory();

	async function apiSearch() {
		try {
			setLoading(true);
			const res = await API.get(`post/api/search?q=${search}`, {
				headers: {
					authorization: accessToken,
				},
			});
			setSuggestions(res.data.posts);
			setLoading(false);
		} catch (err) {
			setLoading(false);
			console.log(err);
		}
	}
	return (
		<Jumbotron>
			<h1 className="display-3">Hello, world!</h1>
			<p className="lead">
				This is a simple hero unit, a simple Jumbotron-style component for
				calling extra attention to featured content or information.
			</p>
			<hr className="my-2" />
			<p>
				It uses utility classes for typography and spacing to space content out
				within the larger container.
			</p>
			<p className="lead">
				<Button color="primary" onClick={() => history.goBack()}>
					Späť
				</Button>
			</p>
		</Jumbotron>
	);
}
