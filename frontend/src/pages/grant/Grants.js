import React, { useEffect, useContext } from "react";
import {
	Switch,
	Route,
	Link,
	useRouteMatch,
	useLocation,
} from "react-router-dom";

import { Row, Button, Table, Spinner, Fade, Modal } from "reactstrap";
import { Trash2Fill } from "react-bootstrap-icons";

import useModal from "../../hooks/useModal";
import { useDataFetch } from "../../hooks/useApi";
import { AuthContext } from "../../context/auth";

import Grant from "./Grant";
import AddGrant from "../../components/grant/AddGrant";
import DeleteGrant from "../../components/grant/DeleteGrant";
import PaginationComponent from "../../components/PaginationComponent";

export default function Grants() {
	const auth = useContext(AuthContext);
	const { path, url } = useRouteMatch();
	const page = parseInt(new URLSearchParams(useLocation().search).get("page"));

	const { dispatch, show, action, modalData } = useModal();

	const { loading, data, setUrl, refreshData } = useDataFetch("grant/", []);

	useEffect(() => {
		setUrl(`grant?page=${page}`);
	}, [page, setUrl]);

	function toggle() {
		dispatch({ type: "TOGGLE" });
		refreshData();
	}

	if (loading) {
		return (
			<Row className="justify-content-center">
				<Spinner />
			</Row>
		);
	}
	return (
		<Switch>
			<Route exact path={path}>
				<Fade>
					<Row className="justify-content-between mb-3">
						<h1>Manažment grantov</h1>
						<Button
							outline
							color="success"
							size="lg"
							onClick={() => dispatch({ type: "ACTION", name: "ADD" })}
						>
							Nový grant
						</Button>
					</Row>
					<Table className="my-2" hover responsive>
						<thead>
							<tr>
								<th>Názov</th>
								<th>ID</th>
								<th>Typ</th>
								<th>Začiatok</th>
								<th>Koniec</th>
								<th>Aktualizovaný</th>
								<th>Akcia</th>
							</tr>
						</thead>
						<tbody>
							{data.grants &&
								data.grants.map((grant) => (
									<tr key={grant._id}>
										<td>{grant.name}</td>
										<td>{grant.idNumber}</td>
										<td>{grant.type}</td>
										<td>{new Date(grant.start).toLocaleDateString()}</td>
										<td>{new Date(grant.end).toLocaleDateString()}</td>
										<td>{new Date(grant.updatedAt).toLocaleString()}</td>
										<td>
											<Button
												tag={Link}
												to={`${url}/${grant._id}`}
												size="sm"
												color="info"
											>
												Zobraziť
											</Button>{" "}
											{auth.user.role === "admin" && (
												<Button
													outline
													size="sm"
													color="danger"
													onClick={() =>
														dispatch({
															type: "ACTION",
															name: "DELETE",
															payload: grant,
														})
													}
												>
													<Trash2Fill />
												</Button>
											)}
										</td>
									</tr>
								))}
						</tbody>
					</Table>
					<PaginationComponent page={page} pages={data.pages} />
					<Button tag={Link} to="/" outline color="primary">
						Späť
					</Button>
					<Modal isOpen={show} toggle={toggle}>
						{action === "DELETE" && (
							<DeleteGrant toggle={toggle} grant={modalData} />
						)}
						{action === "ADD" && <AddGrant toggle={toggle} />}
					</Modal>
				</Fade>
			</Route>
			<Route path={`${path}/:id`}>
				<Grant />
			</Route>
		</Switch>
	);
}
