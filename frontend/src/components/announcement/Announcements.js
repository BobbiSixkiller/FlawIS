import React from 'react';
import api from '../../api';
import { Switch, Route, Redirect, useRouteMatch, useHistory } from 'react-router-dom';

import { Col, Alert, Fade, Button, ButtonGroup, Spinner, Container, Table, Row, Modal, ModalHeader, ModalBody, ModalFooter, Pagination, PaginationItem, PaginationLink } from 'reactstrap';

import { useUser } from '../../hooks/useUser';

import AddAnnouncement from './AddAnnouncement';
import EditAnnouncement from './EditAnnouncement';
import DeleteAnnouncement from './DeleteAnnouncement';

function Announcements() {
	const { path } = useRouteMatch();
	const history = useHistory();
	const { user, accessToken, search } = useUser();

	const [ announcements, setAnnouncements ] = React.useState([]);
	const [ loading, setLoading ] = React.useState(false);
	const [ backendError, setBackendError ] = React.useState(null);

	const [ modal, setModal ] = React.useState({show:false, data: null, action: ""});

	const [ pageSize, setPageSize ] = React.useState(10);
	const [ pagesCount, setPagesCount ] = React.useState();
	const [ currentPage, setCurrentPage ] = React.useState(0);

	React.useEffect(() => {
		if (user._id && user.role !== "basic") {
			getData(accessToken);
		}
	}, []);

	React.useEffect(() => {
		setPagesCount(Math.ceil(announcements.length / pageSize));
	}, [announcements]);

	async function getData(token) {
		setLoading(true);
		try {
			const res = await api.get("announcement/", { 
				  headers: {
				    authToken: token
				  } 
				});
			setAnnouncements(res.data);
			setLoading(false);
		} catch(err) {
			err.response.data.error && setBackendError(err.response.data.error);
			setLoading(false);
		}
	}

	function handlePageClick(e, index) {
		e.preventDefault();
		setCurrentPage(index);
	}

	function handlePrevClick(e) {
		e.preventDefault();
		setCurrentPage(currentPage - 1);
	}

	function handleNextClick(e) {
		e.preventDefault();
		setCurrentPage(currentPage + 1);
	}

	if (!user._id || user.role === "basic") {
		return <Redirect to={{path: "/"}}/>
	} else if (loading && announcements.length === 0) {
		return <Container className="text-center"><Spinner/></Container>
	} else {
		return(
			<Switch>
				<Route exact path={path}>
					<Fade>
						<Container>
							<Row form className="justify-content-between">
								<h1>Manažment oznamov</h1>
								<Button outline size="lg" color="success" onClick={() => history.push(`${path}/add`)}>Nový plošný oznam</Button>
							</Row>
							{backendError && 
					        	<Row row className="justify-content-center">
						          <Col>
						            <Alert color="danger">{backendError}<Button close onClick={() => setBackendError(null)} /></Alert>
						          </Col>
						        </Row>
					       	}
							{announcements.length === 0 ? 
								(<h2 className="text-center my-5">Žiadne oznamy</h2>) : 
								(
									<>
										<Table responsive className="my-5" hover>
											<thead>
												<tr>
													<th>#</th>
													<th>Názov</th>
													<th>Autor</th>
													<th>Prepojenia</th>
													<th>Vytvorený</th>
													<th>Upravený</th>
													<th>Akcia</th>
												</tr>
											</thead>
											<tbody>
												{announcements
													.filter(({name, issuedBy}) => 
														(name).toLowerCase().indexOf(search.toLowerCase()) > - 1 || 
														(issuedBy.fullName).toLowerCase().indexOf(search.toLowerCase()) > - 1)
													.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
													.map((announcement, i) => (
														<tr key={i}>
															<td>{i}</td>
															<td>{announcement.name}</td>
															<td>{announcement.issuedBy ? (announcement.issuedBy.fullName) : ("Používateľ bol zmazaný")}</td>
															<td>{announcement.grants.length}</td>
															<td>{new Date(announcement.createdAt).toLocaleString()}</td>
															<td>{new Date(announcement.updatedAt).toLocaleString()}</td>
															<td>
																<ButtonGroup>
																	<Button color="warning" onClick={() => setModal({show: true, data: announcement, action: "edit"})}>Upraviť</Button>
																	<Button color="danger" onClick={() => setModal({show: true, data: announcement, action: "delete"})}>Zmazať</Button>
																</ButtonGroup>
															</td>
														</tr>	
													))
												}
											</tbody>
										</Table>
										<Row className="justify-content-center">
											<Pagination aria-label="grants pagination nav">
												<PaginationItem disabled={currentPage <= 0}>
					  								<PaginationLink onClick={handlePrevClick} previous href="#" />
					  							</PaginationItem>
					  							{[...Array(pagesCount)].map((page, i) => (
												 	<PaginationItem active={i === currentPage} key={i}>
												   		<PaginationLink onClick={e => handlePageClick(e, i)} href="#">
												     		{i + 1}
												   		</PaginationLink>
												 	</PaginationItem>
												))}
												<PaginationItem disabled={currentPage >= pagesCount - 1}>
					  								<PaginationLink onClick={handleNextClick} next href="#" />
					  							</PaginationItem>
					  						</Pagination>
										</Row>
									</>
								)
							}
							<Button outline color="primary" onClick={() => history.goBack()}>Späť</Button>
							<Modal isOpen={modal.show} toggle={() => setModal(!modal)} >
								{modal.action === "delete" && <DeleteAnnouncement getData={getData} modal={modal} setModal={setModal} />}
								{modal.action === "edit" && <EditAnnouncement getData={getData} modal={modal} setModal={setModal} />}
							</Modal>
						</Container>
					</Fade>
				</Route>
				<Route path={`${path}/add`}>
					<AddAnnouncement getData={getData} />
				</Route>
			</Switch>
		);
	}
}

export default Announcements;