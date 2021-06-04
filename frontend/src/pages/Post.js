import React from "react";
import { useHistory, useParams, Redirect } from "react-router-dom";

import API from "../api";
import { useUser } from "../hooks/useUser";
import { Row, Fade, Jumbotron, Button, Spinner, Alert } from "reactstrap";

export default function Post() {
	const history = useHistory();
	const { postId } = useParams();
	const { accessToken, user } = useUser();

	const [loading, setLoading] = React.useState(false);
	const [post, setPost] = React.useState({});
	const [backendError, setBackendError] = React.useState(null);

	React.useEffect(() => {
		if (user._id) {
			getData(accessToken);
		}
	}, []);

	async function getData(token) {
		try {
			setLoading(true);
			const res = await API.get(`post/${postId}`, {
				headers: {
					authorization: token,
				},
			});
			setPost(res.data);
			console.log(res.data.tags);
			setLoading(false);
		} catch (err) {
			setLoading(false);
			setBackendError(err.response.data.error);
		}
	}

	if (!user._id) {
		return <Redirect to={{ path: "/" }} />;
	} else if (loading) {
		return (
			<Row className="justify-content-center">
				<Spinner />
			</Row>
		);
	} else if (backendError) {
		return (
			<Alert color="danger">
				{backendError} <Button close onClick={() => history.goBack()} />
			</Alert>
		);
	} else {
		return (
			<Fade>
				<Jumbotron>
					<h1 className="display-3">{post.name}</h1>
					<p className="lead">
						Autor: {post.author}, dňa{" "}
						{new Date(post.updatedAt).toLocaleDateString()}
					</p>
					<hr className="my-2" />
					<p className="text-muted">
						{post.tags && post.tags.map((tag) => `${tag}, `)}
					</p>
					<p>{post.body}</p>
					<p className="lead">
						<Button color="primary" onClick={() => history.goBack()}>
							Späť
						</Button>
					</p>
				</Jumbotron>
			</Fade>
		);
	}
}
