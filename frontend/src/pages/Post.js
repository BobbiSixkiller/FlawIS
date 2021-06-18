import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";

import API from "../api";
import { Row, Fade, Jumbotron, Button, Spinner, Alert } from "reactstrap";

export default function Post() {
	const history = useHistory();
	const { id } = useParams();

	const [loading, setLoading] = useState(false);
	const [post, setPost] = useState({});
	const [backendError, setBackendError] = useState(null);

	useEffect(() => {
		async function getData() {
			try {
				setLoading(true);
				const res = await API.get(`post/${id}`);
				setPost(res.data);
				setLoading(false);
			} catch (err) {
				setLoading(false);
				setBackendError(err.response.data.error);
			}
		}
		getData();
	}, [id]);

	if (loading) {
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
						{post.tags && post.tags.map((tag) => `#${tag} `)}
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
