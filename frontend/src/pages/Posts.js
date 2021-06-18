import React, { useContext, useState, useEffect } from "react";
import {
	useRouteMatch,
	useParams,
	Switch,
	Route,
	Link,
} from "react-router-dom";

import {
	Fade,
	Modal,
	Spinner,
	ListGroup,
	ListGroupItem,
	Row,
	Col,
	ButtonGroup,
	Button,
	Card,
	CardTitle,
	CardText,
	CardColumns,
	CardSubtitle,
	CardBody,
	CardLink,
	Alert,
} from "reactstrap";
import { Trash2Fill, PencilFill } from "react-bootstrap-icons";

import { AuthContext } from "../context/auth";
import API from "../api";

import PaginationComponent from "../components/PaginationComponent";
import EditPost from "../components/post/EditPost";
import AddPost from "../components/post/AddPost";
import DeletePost from "../components/post/DeletePost";
import Post from "../pages/Post";

export default function Posts() {
	const { path, url } = useRouteMatch();
	const params = useParams();
	const { user } = useContext(AuthContext);

	const [loading, setLoading] = useState(false);
	const [posts, setPosts] = useState([]);
	const [authors, setAuthors] = useState([]);
	const [tags, setTags] = useState([]);
	const [modal, setModal] = useState(false);

	const [page, setPage] = useState(params.page || 1);
	const [pages, setPages] = useState(1);

	useEffect(() => {
		getData();
	}, [page, authors, tags]);

	async function getData() {
		try {
			setLoading(true);
			const res = await API.get(
				`post?page=${page}${authors.map((a) => `&author=${a}`)}${tags.map(
					(t) => `&tag=${t}`
				)}`
			);
			setPosts(res.data.posts);
			setPages(res.data.pages);
			setLoading(false);
		} catch (error) {
			setLoading(false);
			console.log(error);
		}
	}

	if (loading) {
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
						<Row className="mb-3">
							<Col sm={8}>
								<h1>Prehľad postov</h1>
								<ListGroup horizontal>
									{authors.length !== 0 &&
										authors.map((a, i) => (
											<ListGroupItem key={i}>
												{a}
												<Button
													onClick={() =>
														setAuthors(authors.filter((author) => author !== a))
													}
													size="sm"
													close
												/>
											</ListGroupItem>
										))}
									{tags.length !== 0 &&
										tags.map((t, i) => (
											<ListGroupItem key={i}>
												#{t}
												<Button
													onClick={() =>
														setTags(tags.filter((tag) => tag !== t))
													}
													size="sm"
													close
												/>
											</ListGroupItem>
										))}
								</ListGroup>
							</Col>
							<Col sm={4}>
								<Button
									className="float-md-right "
									outline
									size="lg"
									color="success"
									onClick={() => setModal({ show: true, action: "add" })}
								>
									Nový post
								</Button>
							</Col>
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
													<CardLink
														onClick={() =>
															setAuthors([...authors, post.author])
														}
													>
														{post.author}
													</CardLink>
													, {new Date(post.updatedAt).toLocaleDateString()}
												</CardSubtitle>
												<CardText>
													Oblasť:{" "}
													{post.tags.map((tag, i) => (
														<CardLink
															key={i}
															onClick={() => setTags([...tags, tag])}
														>
															#{tag}
														</CardLink>
													))}
												</CardText>
												<Button
													tag={Link}
													to={`${url}/${post._id}`}
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
							<Button tag={Link} to="/" outline color="primary">
								Späť
							</Button>
						</Row>
						<Modal
							isOpen={modal.show}
							toggle={() => {
								setModal(!modal);
								getData();
							}}
						>
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
