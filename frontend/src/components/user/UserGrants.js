import React from 'react';
import { useHistory, useLocation } from "react-router-dom";
import { Fade, Alert, Spinner, Row, Table, Button, Container, Pagination, PaginationItem, PaginationLink } from 'reactstrap';

import { useUser } from '../../hooks/useUser';

import api from '../../api';

function UserGrants(props) {
	const history = useHistory();
	const location = useLocation();
	const { search, accessToken } = useUser();
	const { user, year, setHours } = props;

	const [ userGrants, setUserGrants ] = React.useState(null);
	const [ backendError, setBackendError ] = React.useState(null);

	const [pageSize, setPageSize] = React.useState(5);
	const [pagesCount, setPagesCount] = React.useState();
	const [currentPage, setCurrentPage] = React.useState(0);

	React.useEffect(() => {
		setBackendError(null);
		getData();
		console.log(userGrants);
		userGrants && setPagesCount(Math.ceil(userGrants.length / pageSize));
	}, [year]);

	async function getData() {
		try {
			const res = await api.get(`user/${user}/${year}`, {
				headers: {
					authToken: accessToken
				}
			});
			setUserGrants(res.data.grants);
			setHours(res.data.hoursTotal);
		} catch (err) {
			setHours(0);
			err.response.data.error && setBackendError(err.response.data.error)
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

	if (!userGrants) {
		return <Container className="text-center"><Spinner/></Container>
	} else if (backendError) {
		return(
			<Container className="text-center">
				<Alert className="text-center" color="danger">{backendError}</Alert>
			</Container>
		);			
	} else {
		return(
			<Fade>
				<Container className="my-5">
					{"_id" in userGrants[0] ? (
						<>
							<h2>Granty:</h2>
							<Table responsive hover>
								<thead>
									<tr>
										<th>#</th>
										<th>Názov</th>
										<th>Typ</th>
										<th>Cestovné</th>
										<th>Služby</th>
										<th>Materiál</th>
										<th>Hodiny</th>
										<th>Akcia</th>
									</tr>
								</thead>
								<tbody>
									{userGrants
										.filter(({name}) => (name).toLowerCase().indexOf(search.toLowerCase()) > - 1)
										.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
										.map((grant, index) => {
											return grant.budget.filter(budget => new Date(budget.year).getFullYear() == year).map(budget => 
												(
													<tr key={index}> 
														<td>{index}</td>
														<td>{grant.name}</td>
														<td>{grant.type}</td>
														<td>{budget.travel + " €"}</td>
														<td>{budget.services + " €"}</td>
														<td>{budget.material + " €"}</td>
														<td>
															{budget.members.map((member) => {
																if (member.member._id === user) return member.hours
															})}
														</td>
														{location.pathname.includes("/mygrants") ? 
															(<td><Button onClick={() => {history.push("/mygrants/" + grant._id)}} color="info">Detail</Button></td>) :
															(<td><Button onClick={() => {history.push("/grants/" + grant._id)}} color="info">Detail</Button></td>)
														}	
													</tr>
												)
											)
										})
									}
								</tbody>
							</Table>
							<Row className="justify-content-center">
								<Pagination aria-label="user's grants pagination nav">
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
					) : (
						<Alert className="text-center" color="info">Používateľ nemá pridelené žiadne granty!</Alert>
					)}
				</Container>
			</Fade>
		);
	}
}

export default UserGrants;