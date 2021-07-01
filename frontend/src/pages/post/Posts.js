import React, { useContext, useState, useEffect } from "react";
import { useRouteMatch, Switch, Route, Link } from "react-router-dom";

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

import { useDataFetch } from "../../hooks/useApi";
import { AuthContext } from "../../context/auth";

import PaginationComponent from "../../components/PaginationComponent";
import EditPost from "../../components/post/EditPost";
import AddPost from "../../components/post/AddPost";
import DeletePost from "../../components/post/DeletePost";
import Post from "./Post";

export default function Posts() {
  const { path, url } = useRouteMatch();
  const { user } = useContext(AuthContext);

  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [tags, setTags] = useState([]);

  const {
    state: { loading, data },
    setUrl,
    refreshData,
  } = useDataFetch("post/", [], "GET");

  useEffect(() => {
    setUrl(
      `post?page=${page}${authors.map((a) => `&author=${a}`)}${tags.map(
        (t) => `&tag=${t}`
      )}`
    );
  }, [page, tags, authors, setUrl]);

  function addAuthorFilter(author) {
    if (!authors.includes(author)) {
      setAuthors([...authors, author]);
    }
  }

  function addTagsFilter(tag) {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
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
            <Row className="my-3">
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
            {data.posts && data.posts.length === 0 ? (
              <Alert color="primary" className="text-center">
                Pridajte nový post na nástenku.
              </Alert>
            ) : (
              <>
                <CardColumns>
                  {data.posts &&
                    data.posts.map((post, i) => (
                      <Card key={i}>
                        <CardBody>
                          <CardTitle tag="h5">{post.name}</CardTitle>
                          <CardSubtitle tag="h6" className="mb-2 text-muted">
                            <CardLink
                              onClick={() => addAuthorFilter(post.author)}
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
                                onClick={() => addTagsFilter(tag)}
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
                                  setModal({
                                    show: true,
                                    action: "delete",
                                    post,
                                  })
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
                  pages={data.pages}
                  page={page}
                  changePage={setPage}
                />
              </>
            )}
            <Button tag={Link} to="/" outline color="primary">
              Späť
            </Button>
            <Modal
              isOpen={modal.show}
              toggle={() => {
                setModal(!modal);
                refreshData();
              }}
            >
              {modal.action === "add" && (
                <AddPost
                  refresh={refreshData}
                  modal={modal}
                  setModal={setModal}
                />
              )}
              {modal.action === "delete" && (
                <DeletePost
                  refresh={refreshData}
                  modal={modal}
                  setModal={setModal}
                />
              )}
              {modal.action === "edit" && (
                <EditPost
                  refresh={refreshData}
                  modal={modal}
                  setModal={setModal}
                />
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
