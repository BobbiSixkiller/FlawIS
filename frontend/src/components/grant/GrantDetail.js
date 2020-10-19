import React from 'react';
import { useHistory, useParams, Redirect } from 'react-router-dom';
import api from '../../api';

import { FileEarmark } from 'react-bootstrap-icons';

import { Jumbotron, Fade, Button, ButtonGroup, Spinner, Container, Row, Col, FormGroup, Input, Label, Modal, Alert, NavLink } from 'reactstrap';

import getUsers from '../../hooks/useAPI';
import { useUser } from '../../hooks/useUser';

import Budget from './Budget';
import EditBudget from './GrantUpdate/EditBudget';
import EditMember from './GrantUpdate/EditMember';
import DeleteMember from './GrantUpdate/DeleteMember';
import AddMember from './GrantUpdate/AddMember';
import AddAnnouncement from './GrantUpdate/AddAnnouncement';
import DeleteAnnouncement from '../announcement/DeleteAnnouncement';
import AddFile from './GrantUpdate/AddFile';
import DeleteFile from './GrantUpdate/DeleteFile';
import DeleteFiles from './GrantUpdate/DeleteFiles';

function GrantDetail() {
	const history = useHistory();
	const url = useParams();
	const { user, accessToken } = useUser();

	const [ backendError, setBackendError ] = React.useState(null);
	const [ grant, setGrant ] = React.useState({});
	const [ loading, setLoading ] = React.useState(false);

	const [ modal, setModal ] = React.useState({show: false, data: null, action: ""});
	
	const users = getUsers("user/", "GET", accessToken);

	React.useEffect(() => {
		getData(accessToken);
	}, []);

	async function getData(token) {
		setLoading(true);
		try {
			const res = await api.get(`grant/${url.id}`, {
				headers: {
					authToken: token
				}
			});
			setGrant(res.data);
			setLoading(false);
		} catch(err) {
			err.response.data.error && setBackendError(err.response.data.error);
			setLoading(false);
		}
	}

	if (!user._id) {
		return <Redirect to={{path: "/"}}/>
	} else if (loading && Object.keys(grant).length === 0) {
		return <Container className="text-center"><Spinner/></Container>
	} else {
		return(
			<Fade>
				<Container>
					{backendError && 
			        	<Row row className="justify-content-center">
				          <Col>
				            <Alert color="danger">{backendError}<Button close onClick={() => setBackendError(null)} /></Alert>
				          </Col>
				        </Row>
			       	}
			       	{Object.keys(grant).length !== 0 &&
			       		<>
				       		<Jumbotron>
								<h1>{grant.name}</h1>
								<Row className="my-3" form>
									<FormGroup>
										<Col>
											<Label for="grantID">ID:</Label>
											<Input id="grantID" plaintext readOnly value={grant.idNumber} />
										</Col>
									</FormGroup>
									<FormGroup>
										<Col>
											<Label for="grantType">Typ:</Label>
											<Input id="grantType" plaintext readOnly value={grant.type} />
										</Col>
									</FormGroup>
									<FormGroup>
										<Col>
											<Label for="start">Začiatok grantu:</Label>
											<Input id="start" plaintext readOnly value={new Date(grant.start).toDateString()} />
										</Col>
									</FormGroup>
									<FormGroup>
										<Col>
											<Label for="end">Koniec grantu:</Label>
											<Input id="end" plaintext readOnly value={new Date(grant.start).toDateString()} />
										</Col>
									</FormGroup>
								</Row>
								<Row form>
									<FormGroup>
										<Col>
											<Label for="created">Vytvorený:</Label>
											<Input id="created" plaintext readOnly value={new Date(grant.createdAt).toLocaleString()}/>
										</Col>
									</FormGroup>
									<FormGroup>
										<Col>
											<Label for="modiffied">Upravený:</Label>
											<Input id="modiffied" plaintext readOnly value={new Date(grant.updatedAt).toLocaleString()}/>
										</Col>
									</FormGroup>
								</Row>
								{user.role !== "basic" &&
									<Row form>
										<FormGroup>
											<Col>
												<Button color="success" onClick={() => setModal({show: true, data: grant, action: "addAnnouncement"})}>Pridať oznam</Button>
											</Col>
										</FormGroup>
										<FormGroup>
											<Col>
												<ButtonGroup>
													<Button color="success" onClick={() => setModal({show: true, data: grant, action: "addDocument"})}>Pridať dokumenty</Button>
													<Button color="danger" onClick={() => setModal({show: true, data: grant, action: "deleteDocuments"})}>Zmazať všetky</Button>
												</ButtonGroup>
											</Col>
										</FormGroup>
									</Row>
								}
								{grant.files && grant.files.length > 0 &&	
									<>
										<hr />
										<Row form>
											{grant.files.map((file, key) => 
												(	
													<FormGroup className="mx-1" row>
														<Button key={key} tag={NavLink} target="_blank" href={file.url} outline color="primary"><FileEarmark /> {file.name}</Button>													
														{user.role !== "basic" && <Button close onClick={() => setModal({show: true, grant: grant, file: file, action: "deleteDocument"})} className="pl-1" />}
													</FormGroup>
												)
											)}
										</Row>
									</>
								}
								{grant.announcements && grant.announcements.length !== 0 && 
									<>
										<hr />
										{grant.announcements.map((announcement, key) => {
											const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
											return (
												<Row form>
													<Col>
													<Alert key={key} color="primary">
														{user.role !== "basic" && <Button close onClick={() => setModal({show: true, data: announcement, action: "deleteAnnouncement"})}/>}
														<p className="font-weight-bold">{announcement.name}</p>
														<p>{announcement.content}</p>
														<p>Zverejnil: {announcement.issuedBy ? (announcement.issuedBy.fullName) : ("Používateľ bol zmazaný")}, {new Date(announcement.updatedAt).toLocaleDateString('sk-SK', options)}</p>	
													</Alert>
													</Col>
												</Row>
											)
										})}
										
									</>
								}
							</Jumbotron>
							<Budget 
								users={users} 
								grant={grant} 
								budget={grant.budget} 
								modal={modal} 
								setModal={setModal} 
							/>
						</>
			       	}
					<Container>
						<Button onClick={() => history.goBack()} outline color="primary">Späť</Button>
					</Container>
					<Modal isOpen={modal.show} toggle={() => setModal(!modal)}>
				        {modal.action === "editBudget" && <EditBudget getData={getData} modal={modal} setModal={setModal} />}
				        {modal.action === "editMember" && <EditMember getData={getData} modal={modal} setModal={setModal} />}
				        {modal.action === "deleteMember" && <DeleteMember getData={getData} modal={modal} setModal={setModal} />}						
						{modal.action === "addMember" && <AddMember users={users} getData={getData} modal={modal} setModal={setModal} />}
						{modal.action === "addAnnouncement" && <AddAnnouncement getData={getData} modal={modal} setModal={setModal} />}						
						{modal.action === "deleteAnnouncement" && <DeleteAnnouncement getData={getData} modal={modal} setModal={setModal} />}
						{modal.action === "addDocument" && <AddFile getData={getData} modal={modal} setModal={setModal} />}
						{modal.action === "deleteDocuments" && <DeleteFiles getData={getData} modal={modal} setModal={setModal} />}
						{modal.action === "deleteDocument" && <DeleteFile getData={getData} modal={modal} setModal={setModal} />}
					</Modal>	 
				</Container>
			</Fade>
		);
	}
}

export default GrantDetail;