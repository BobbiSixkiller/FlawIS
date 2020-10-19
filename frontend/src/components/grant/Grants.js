import React from 'react';
import api from '../../api';
import { Switch, Route, Redirect, useRouteMatch, useHistory } from 'react-router-dom';

import { Fade, Alert, Button, ButtonGroup, Spinner, Container, Table, Row, Col, Modal, Pagination, PaginationItem, PaginationLink } from 'reactstrap';

import { useUser } from '../../hooks/useUser';

import GrantDetail from './GrantDetail';
import AddGrant from './AddGrant';
import DeleteGrant from './DeleteGrant';
import Announcements from '../announcement/Announcements';

function Grants() {
	const { path } = useRouteMatch();
	const history = useHistory();
	const { user, accessToken, search } = useUser();

	const [ grants, setGrants ] = React.useState([]);
	const [ loading, setLoading ] = React.useState(false);
	const [ backendError, setBackendError ] = React.useState(null);

	const [ modal, setModal ] = React.useState({show: false, data: null});

	const [ pageSize, setPageSize ] = React.useState(5);
	const [ pagesCount, setPagesCount ] = React.useState();
	const [ currentPage, setCurrentPage ] = React.useState(0);

	React.useEffect(() => {
		if (user._id && user.role !== "basic") {
			getData(accessToken);
		}
	}, []);

	React.useEffect(() => {
		setPagesCount(Math.ceil(grants.length / pageSize));
	}, [grants]);

	async function getData(token) {
		setLoading(true);
		try {
			const res = await api.get("grant/", { 
				  headers: {
				    authToken: token
				  } 
				});
			setGrants(res.data);
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
	} else if (loading && grants.length === 0) {
		return <Container className="text-center"><Spinner/></Container>
	} else {
		return(
			<Switch>
				<Route exact path={path}>
					<Fade>
						<Container>
							<Row form className="justify-content-between">
								<h1>Manažment grantov</h1>
								<Row form>
									<Button outline size="lg" color="primary" className="mr-3" onClick={() => history.push(`${path}/announcements`)}>Oznamy</Button>
									<Button outline size="lg" color="success" onClick={() => history.push(`${path}/add`)}>Nový grant</Button>	
								</Row>
							</Row>
							{backendError && 
					        	<Row row className="justify-content-center">
						          <Col>
						            <Alert color="danger">{backendError}<Button close onClick={() => setBackendError(null)} /></Alert>
						          </Col>
						        </Row>
					       	}
					       	{grants.length === 0 ?
					       		(<h2 className="text-center my-5">Žiadne granty</h2>) :
					       		(
					       			<>
					       				<Table responsive className="my-5" hover>
											<thead>
												<tr>
													<th>#</th>
													<th>Meno</th>
													<th>Typ</th>
													<th>ID</th>
													<th>Vytvorený</th>
													<th>Upravený</th>
													<th>Akcia</th>
												</tr>
											</thead>
											<tbody>
												{grants
													.filter(({name, idNumber}) => 
														(name).toLowerCase().indexOf(search.toLowerCase()) > - 1 || 
														(idNumber).toLowerCase().indexOf(search.toLowerCase()) > - 1)
													.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
													.map((grant, i) => (
														<tr key={i}>
															<td>{i}</td>
															<td>{grant.name}</td>
															<td>{grant.type}</td>
															<td>{grant.idNumber}</td>
															<td>{new Date(grant.createdAt).toLocaleString()}</td>
															<td>{new Date(grant.updatedAt).toLocaleString()}</td>
															<td>
																<ButtonGroup>
																	<Button color="info" onClick={() => {history.push("/grants/" + grant._id)}}>Detail</Button>
																	{user.role === "admin" && <Button color="danger" onClick={() => setModal({show: true, data: grant})}>Zmazať</Button>}
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
							<Button outline color="primary" onClick={() => {history.push("/")}}>Späť</Button>
							<Modal isOpen={modal.show} toggle={() => setModal(!modal)} >
								{modal.show && <DeleteGrant getData={getData} modal={modal} setModal={setModal} />}
							</Modal>
						</Container>
					</Fade>
				</Route>
				<Route path={`${path}/announcements`}>
					<Announcements />
				</Route>
				<Route path={`${path}/add`}>
					<AddGrant getData={getData} />
				</Route>
				<Route path={`${path}/:id`}>
					<GrantDetail />
				</Route>
			</Switch>
		);
	}
}

export default Grants;