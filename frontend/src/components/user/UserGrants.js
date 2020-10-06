import React from 'react';
import { useHistory, useLocation } from "react-router-dom";
import { Row, Table, Button, Container, Pagination, PaginationItem, PaginationLink } from 'reactstrap';

import { useUser } from '../../hooks/useUser';

function UserGrants(props) {
	const history = useHistory();
	const location = useLocation();
	const { search, user } = useUser();
	const { data } = props;

	const [pageSize, setPageSize] = React.useState(5);
	const [pagesCount, setPagesCount] = React.useState();
	const [currentPage, setCurrentPage] = React.useState(0);

	React.useEffect(() => {
		setPagesCount(Math.ceil(user.grants.length / pageSize));
	}, []);

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

	return(
		<Container className="my-5">
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
			    	{data.grants
			    		.filter(({name}) => (name).toLowerCase().indexOf(search.toLowerCase()) > - 1)
			    		.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
			    		.map((grant, index) => (
						  	<tr key={index}>
						  		<td>{index}</td>
						  		<td>{grant.name}</td>
						  		<td>{grant.type}</td>
						  		<td>
						  			{grant.budget.map((budget, i) => {
						  				if (new Date(budget.year).getFullYear() === new Date().getFullYear()) return <p key={i}>{budget.travel + " €"}</p>
						  			})}
						  		</td>
						  		<td>
						  			{grant.budget.map((budget, i) => {
						  				if (new Date(budget.year).getFullYear() === new Date().getFullYear()) return <p key={i}>{budget.services + " €"}</p>
						  			})}
						  		</td>
						  		<td>
						  			{grant.budget.map((budget, i) => {
						  				if (new Date(budget.year).getFullYear() === new Date().getFullYear()) return <p key={i}>{budget.material + " €"}</p>
						  			})}
						  		</td>
						  		<td>
						  			{grant.budget.map(budget => {
						  				if (new Date(budget.year).getFullYear() === new Date().getFullYear()) {
						  					return budget.members.map((member, i) => {
						  						if (member.member._id === data._id) return <p key={i}>{member.hours}</p>
						  					})
						  				}
						  			})}
						  		</td>
						  		{location.pathname.includes("/mygrants") ? 
						  			(<td><Button onClick={() => {history.push("/mygrants/" + grant._id)}} color="info">Detail</Button></td>) :
						  			(<td><Button onClick={() => {history.push("/grants/" + grant._id)}} color="info">Detail</Button></td>)
						  		}	
						  	</tr>
						))
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
		</Container>
	);
}

export default UserGrants;