import React from "react";
import {
	useRouteMatch,
	useHistory,
	useParams,
	Redirect,
	Switch,
	Route,
	Link,
} from "react-router-dom";

import {
	Fade,
	Modal,
	Spinner,
	Container,
	Row,
	Card,
	ButtonGroup,
	Button,
	CardTitle,
	CardText,
	CardColumns,
	CardSubtitle,
	CardBody,
	Alert,
} from "reactstrap";
import { Trash2Fill, PencilFill } from "react-bootstrap-icons";

import { useUser } from "../hooks/useUser";
import API from "../api";

import PaginationComponent from "../components/PaginationComponent";
import EditPost from "../components/post/EditPost";
import AddPost from "../components/post/AddPost";
import DeletePost from "../components/post/DeletePost";
import Post from "../pages/Post";

export default function Posts() {
	const history = useHistory();
	const { path } = useRouteMatch();
	const params = useParams();
	const { accessToken, user, search } = useUser();

	const [loading, setLoading] = React.useState(false);
	const [posts, setPosts] = React.useState([]);
	const [modal, setModal] = React.useState(false);

	const [page, setPage] = React.useState(params.page || 1);
	const [pages, setPages] = React.useState(1);

	React.useEffect(() => {
		getData();
	}, [page]);

	async function getData() {
		try {
			setLoading(true);
			const res = await API.get(`post?page=${page}`, {
				headers: {
					authorization: accessToken,
				},
			});
			setPosts(res.data.posts);
			setPages(res.data.pages);
			setLoading(false);
		} catch (error) {
			setLoading(false);
			console.log(error);
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
	} else {
		return (
			<Switch>
				<Route exact path={path}>
					<Fade>
						<Row className="justify-content-between mb-3">
							<h1>Prehľad postov</h1>
							<Button
								outline
								size="lg"
								color="success"
								onClick={() => setModal({ show: true, action: "add" })}
							>
								Nový post
							</Button>
						</Row>
						{posts.length === 0 ? (
							<Alert color="primary" className="text-center">
								Pridajte nový post na nástenku.
							</Alert>
						) : (
							<>
								<CardColumns>
									{posts.map((post, i) => (
										<Card key={i}>
											<CardBody>
												<CardTitle tag="h5">{post.name}</CardTitle>
												<CardSubtitle tag="h6" className="mb-2 text-muted">
													{post.author +
														", " +
														new Date(post.updatedAt).toLocaleDateString()}
												</CardSubtitle>
												<CardText>
													Oblasť: {post.tags.map((tag) => `${tag}, `)}
												</CardText>
												<Button
													onClick={() => history.push(`${path}/${post._id}`)}
													size="sm"
													color="info"
												>
													Zobraziť
												</Button>{" "}
												{(user.id === post.userId ||
													user.role === "admin" ||
													user.role === "supervisor") && (
													<ButtonGroup>
														<Button
															outline
															size="sm"
															color="warning"
															onClick={() =>
																setModal({ show: true, action: "edit", post })
															}
														>
															<PencilFill />
														</Button>
														<Button
															outline
															size="sm"
															color="danger"
															onClick={() =>
																setModal({ show: true, action: "delete", post })
															}
														>
															<Trash2Fill />
														</Button>
													</ButtonGroup>
												)}
											</CardBody>
										</Card>
									))}
								</CardColumns>
								<PaginationComponent
									pages={pages}
									page={page}
									changePage={setPage}
								/>
							</>
						)}
						<Row className="my-5">
							<Button onClick={() => history.push("/")} outline color="primary">
								Späť
							</Button>
						</Row>
						<Modal isOpen={modal.show} toggle={() => setModal(!modal)}>
							{modal.action === "add" && (
								<AddPost getData={getData} modal={modal} setModal={setModal} />
							)}
							{modal.action === "delete" && (
								<DeletePost
									getData={getData}
									modal={modal}
									setModal={setModal}
								/>
							)}
							{modal.action === "edit" && (
								<EditPost getData={getData} modal={modal} setModal={setModal} />
							)}
						</Modal>
					</Fade>
				</Route>
				<Route path={`${path}/:id`}>
					<Post />
				</Route>
			</Switch>
		);
	}
}
