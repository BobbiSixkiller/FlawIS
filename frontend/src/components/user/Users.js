import React from 'react';
import api from '../../api';
import { Redirect, Switch, Route, useHistory, useRouteMatch } from 'react-router-dom';
import { Fade, Button, ButtonGroup, Spinner, Container, Table, Row, Modal, ModalHeader, ModalBody, ModalFooter, Pagination, PaginationItem, PaginationLink } from 'reactstrap';

import User from './User';
import AddUser from './AddUser';
import EditUser from './EditUser';
import DeleteUser from './DeleteUser';

import { useUser } from '../../hooks/useUser';

function Users() {
	const { path } = useRouteMatch();
	const history = useHistory();
	const { user, accessToken, search } = useUser();
	
	const [ users, setUsers ] = React.useState([]);
	const [ backendError, setBackendError ] = React.useState(null);
	const [ form, setForm ] = React.useState();

	const [ pageSize, setPageSize ] = React.useState(5);
	const [ pagesCount, setPagesCount ] = React.useState();
	const [ currentPage, setCurrentPage ] = React.useState(0);

	const [ modal, setModal ] = React.useState({show: false, data: null, action: ""});

	React.useEffect(() => {
		if (user._id && user.role !== "basic") {
			getData(accessToken);
		}
	}, []);

	React.useEffect(() => {
		setPagesCount(Math.ceil(users.length / pageSize));
	}, [users]);

	async function getData(token) {
		try {
			const res = await api.get("user", { 
				  headers: {
				    authToken: token
				  } 
				});
			setUsers(res.data);
		} catch(err) {
			err.response.data.error && setBackendError(err.response.data.error);
		}
	}

	async function editUser(id, token) {
		const res = await api.get(`user/${id}`, {
			headers: {
				'authToken': token
			}
		});
		setForm(res.data);
		history.push("/users/update/" + id);
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

	const role = user.role;

	if (!user._id || role === "basic") {
		return <Redirect to={{path: "/"}}/>
	} else if (users.length === 0) {
		return <Container className="text-center"><Spinner/></Container>
	} else {
		return(
			<Switch>
				<Route exact path={path}>
					<Fade>
						<Container>
							<Row form className="justify-content-between">
								<h1>Manažment používateľov</h1>
								<Button outline size="lg" color="success" onClick={() => history.push(`${path}/add`)}>Nový používateľ</Button>
							</Row>
							<Table responsive className="my-5" hover>
								<thead>
									<tr>
										<th>#</th>
										<th>Meno</th>
										<th>Email</th>
										<th>Rola</th>
										<th>Hodiny</th>
										<th>Vytvorený</th>
										<th>Upravený</th>
										<th>Akcia</th>
									</tr>
								</thead>
								<tbody>
									{users
										.filter(({firstName, lastName}) => (firstName + " " + lastName).toLowerCase().indexOf(search.toLowerCase()) > - 1)
										.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
										.map((user, i) => (
											<tr key={i}>
												<td>{i}</td>
												<td>{user.firstName + ' ' + user.lastName}</td>
												<td>{user.email}</td>
												<td>{user.role}</td>
												<td>{user.hoursTotal}</td>
												<td>{new Date(user.createdAt).toLocaleString()}</td>
												<td>{new Date(user.updatedAt).toLocaleString()}</td>
												<td>
													<ButtonGroup>
														<Button color="info" onClick={() => history.push("/users/" + user._id)}>Detail</Button>
														<Button color="warning" onClick={() => editUser(user._id, accessToken)}>Upraviť</Button>	
														{role === "admin" && <Button color="danger" onClick={() => setModal({show: true, data: user, action: "deleteUser"})}>Zmazať</Button>}																																				
													</ButtonGroup>
												</td>
											</tr>
										))
									}
								</tbody>
							</Table>
							<Row className="justify-content-center">
								<Pagination aria-label="users pagination nav">
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
							<Button outline color="primary" onClick={() => {history.push("/")}}>Späť</Button>
							<Modal isOpen={modal.show} toggle={() => setModal(!modal.show)} >
								{modal.show && <DeleteUser getData={getData} modal={modal} setModal={setModal}/>}
							</Modal>
						</Container>
					</Fade>
				</Route>
				<Route path={`${path}/add`}>
					<AddUser getData={getData}/>
				</Route>
				<Route path={`${path}/update/:id`}>
					<EditUser form={form} getData={getData}/>
				</Route>
				<Route path={`${path}/:id`}>
					<User />
				</Route>
			</Switch>		
		);
	}	
}

export default Users;