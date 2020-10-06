import React from "react";
import api from '../../../api';

import { Alert, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, Form, FormGroup, FormText, Label, CustomInput } from "reactstrap";

import { useUser } from '../../../hooks/useUser';

function AddFile(props) {
	const { accessToken } = useUser();
	const { modal, setModal, getData } = props;

	async function addDocument(formData) {
		setLoading(true);
		try {
			const res = await api.post(
				`grant/${modal.data._id}/file`,
        		formData,
        		{ 
		          headers: {
		          	'Content-type': 'multipart/form-data',
		            authToken: accessToken
		          } 
		        }
        	);
        	setBackendMsg(res.data.msg);
        	getData(accessToken);
        	setLoading(false);
		} catch(err) {
			err.response.data.error && setBackendError(err.response.data.error);
			setLoading(false);
		}
	}

	const [ backendError, setBackendError ] = React.useState(null);
	const [ backendMsg, setBackendMsg ] = React.useState(null);
	const [ loading, setLoading ] = React.useState(false);
	const [ files, setFiles ] = React.useState([]);

	async function handleChange(e) {
		await setFiles(e.target.files);
		console.log(files);
	}

	function handleSubmit(e) {
		e.preventDefault();
		const formData = new FormData();
		for (const key of Object.keys(files)) {
			console.log(files[key]);
			formData.append("files", files[key]);
		}
		addDocument(formData);
	}

	return(
		<Form onSubmit={handleSubmit}>
			<ModalHeader toggle={() => setModal(!modal)}>Pridať dokumenty</ModalHeader>
			<ModalBody>
		        <Row form className="justify-content-center">
		        	<Col>
			          <FormGroup>
		            	<Label for="file">Nový dokument</Label>
        				<CustomInput 
        					type="file" 
        					id="file" 
        					name="file" 
        					label="Vyberte súbor nového dokumentu."
        					onChange={handleChange}
        					multiple
        				/>
			          </FormGroup>
			          <FormText color="muted">
			            Maximálne je možné nahrať 5 súborov naraz!
			          </FormText>
			        </Col>
		       	</Row>
		        {backendError && 
		        	<Row row className="justify-content-center my-3">
    		          <Col>
    		            <Alert color="danger">{backendError}<Button close onClick={() => setBackendError(null)} /></Alert>
    		          </Col>
    		        </Row>
		       	}
		       	{backendMsg && 
		        	<Row row className="justify-content-center my-3">
    		          <Col>
    		            <Alert color="success">{backendMsg}<Button close onClick={() => setBackendMsg(null)} /></Alert>
    		          </Col>
    		        </Row>
		       	}
			</ModalBody>
			<ModalFooter>
				<Button type="submit" disabled={loading} color="success">Nahrať súbor</Button>{' '}
				<Button outline color="secondary" onClick={() => setModal(!modal)}>Zrušiť</Button>
			</ModalFooter>
		</Form>
	);
}

export default AddFile;