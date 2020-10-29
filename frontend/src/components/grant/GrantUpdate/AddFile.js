import React from "react";
import api from '../../../api';

import { Alert, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, Form, FormGroup, FormFeedback, FormText, Label, CustomInput } from "reactstrap";

import { useUser } from '../../../hooks/useUser';
import useFormValidation from '../../../hooks/useFormValidation';
import validateDocument from '../../../validation/validateDocument';

const INITIAL_STATE = {
	files: {}
}

function AddFile(props) {
	const { accessToken } = useUser();
	const { modal, setModal, getData } = props;

	const {handleChange, handleSubmit, values, errors, valid} = useFormValidation(INITIAL_STATE, validateDocument, addDocument);

	async function addDocument(formData) {
		setLoading(true);
		try {
			const formData = new FormData();
			for (const key of Object.keys(values.files)) {
				formData.append("files", values.files[key]);
			}

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

	return(
		<Form onSubmit={handleSubmit}>
			<ModalHeader toggle={() => setModal(!modal)}>Pridať dokumenty</ModalHeader>
			<ModalBody>
		        <Row form className="justify-content-center">
		        	<Col>
			          <FormGroup>
		            	<Label for="files">Nový dokument</Label>
        				<CustomInput 
        					type="file" 
        					id="files" 
        					name="files" 
        					label="Vyberte súbor nového dokumentu."
							onChange={handleChange}
							valid={valid.files}
							invalid={errors.files}
							multiple
        				>
							<FormFeedback invalid>{errors.files}</FormFeedback>
	            			<FormFeedback valid>{valid.files}</FormFeedback>
						</CustomInput>
						<FormText color="muted">
							Maximálne je možné nahrať 5 súborov naraz!
						</FormText>
			          </FormGroup>
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