import React from "react";
import { useHistory } from "react-router-dom";

import {
	Fade,
	Spinner,
	Container,
	Row,
	Card,
	Button,
	CardTitle,
	CardText,
	CardDeck,
	CardSubtitle,
	CardBody,
} from "reactstrap";

import { useUser } from "../hooks/useUser";
import API from "../api";

function MyWork() {
	const history = useHistory();
	const { accessToken } = useUser();

	const [posts, setPosts] = React.useState([]);

	React.useEffect(() => {
		getPosts();
	}, [posts]);

	async function getPosts() {
		try {
			const res = await API.get("post", {
				headers: {
					authorization: accessToken,
				},
			});
			console.log(res);
			setPosts(res.data.posts);
		} catch (error) {
			console.log(error);
		}
	}

	async function addPost() {
		console.log("ADD POST!");
	}

	return (
		<Container>
			{posts.length === 0 ? (
				<Row className="justify-content-center">
					<Spinner />
				</Row>
			) : (
				<Fade>
					<Row className="justify-content-between mb-3">
						<h1>Prehľad postov</h1>
						<Button outline size="lg" color="success">
							Nový post
						</Button>
					</Row>
					<CardDeck>
						{posts.map((post) => (
							<Card>
								<CardBody>
									<CardTitle tag="h5">{post.name}</CardTitle>
									<CardSubtitle tag="h6" className="mb-2 text-muted">
										{post.author +
											", " +
											new Date(post.updatedAt).toLocaleDateString()}
									</CardSubtitle>
									<CardText>
										Tagy: {post.tags.map((tag) => `${tag}, `)}
									</CardText>
									<Button>Zobraziť</Button>
								</CardBody>
							</Card>
						))}
					</CardDeck>
					<Row className="my-5">
						<Button onClick={() => history.push("/")} outline color="primary">
							Späť
						</Button>
					</Row>
				</Fade>
			)}
		</Container>
	);
}

export default MyWork;
