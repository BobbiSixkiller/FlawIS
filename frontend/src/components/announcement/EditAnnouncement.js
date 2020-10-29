import React from 'react';
import api from '../../api';

import { useUser } from '../../hooks/useUser';
import useFormValidation from "../../hooks/useFormValidation";
import validateAnnouncement from "../../validation/validateAnnouncement";

import { FileEarmark } from 'react-bootstrap-icons';
import { Alert, ModalHeader, ModalBody, ModalFooter, NavLink, Button, Row, Col, Form, FormGroup, FormText, FormFeedback, Label, Input, CustomInput } from "reactstrap";

import DeleteFile from './DeleteFile';

function EditAnnouncement(props) {
	const { accessToken, user } = useUser();
	const { announcements, getData, modal, setModal } = props;

	const INITIAL_STATE = {
		name: modal.data.name,
		content: modal.data.content,
		issuedBy: user._id,
		files: modal.data.files
	}

	const [ nestedModal, setNestedModal ] = React.useState({show: false, data: null});
	const [ backendError, setBackendError ] = React.useState(null);
	const [ backendMsg, setBackendMsg ] = React.useState(null);

	const { handleSubmit, handleChange, handleBlur, values, errors, valid, isSubmitting } = useFormValidation(INITIAL_STATE, validateAnnouncement, update);

	async function update() {
		try {
			const formData = new FormData();
			for (const key of Object.keys(values.files)) {
				formData.append("files", values.files[key]);
			}
			formData.append("name", values.name);
			formData.append("content", values.content);
			formData.append("issuedBy", values.issuedBy);

			const res = await api.put(`announcement/${modal.data._id}`,
				formData,
				{ 
				  headers: {
					'Content-type': 'multipart/form-data',
				    authToken: accessToken
				  } 
				}
			);
			setBackendMsg(res.data.msg);
			setModal({show: true, data: res.data.announcement, action: "edit"});
			getData(accessToken);
		} catch(err) {
			err.response.data.error && setBackendError(err.response.data.error);
		}
	}

	return(
		<Form onSubmit={handleSubmit}>
			<ModalHeader toggle={()=> setModal(!modal)}>Upraviť oznam</ModalHeader>
			<ModalBody>
				<Row form className="justify-content-center">
		        	<Col>
			          <FormGroup>
		            	<Label for="name">Názov:</Label>
			            <Input 
			            	type="text"
			            	id="name" 
			            	name="name" 
			            	placeholder="Názov oznamu" 
			            	onBlur={handleBlur} 
			            	onChange={handleChange} 
			            	value={values.name}
			            	invalid={errors.name}
			                valid={valid.name} 
			                autoComplete="off"
			            />
			            <FormFeedback invalid>{errors.name}</FormFeedback>
		            	<FormFeedback valid>{valid.name}</FormFeedback>
			          </FormGroup>
			        </Col>
		       	</Row>
		        <Row form className="justify-content-center">
		        	<Col>
			          <FormGroup>
		            	<Label for="content" >Oznam:</Label>
			            <Input 
			            	type="textarea"
			            	id="content" 
			            	name="content" 
			            	placeholder="Text oznamu..." 
			            	onBlur={handleBlur} 
			            	onChange={handleChange} 
			            	value={values.content}
			            	invalid={errors.content}
			                valid={valid.content} 
			                autoComplete="off"
			            />
			            <FormFeedback invalid>{errors.content}</FormFeedback>
		            	<FormFeedback valid>{valid.content}</FormFeedback>
			          </FormGroup>
			        </Col>
		       	</Row>
				<Row form className="justify-content-center">
					<Col>
						<FormGroup>
							<Label for="files">Pripojiť dokument:</Label>
							<CustomInput 
								type="file" 
								id="files" 
								name="files" 
								label="Vyberte súbor nového dokumentu."
								onChange={handleChange}
								multiple
								invalid={errors.files}
			                	valid={valid.files} 
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
				{modal.data.files.map((file, key) => 
					(	
						<FormGroup className="mx-1" row>
							<Button key={key} tag={NavLink} target="_blank" href={file.url} outline color="primary"><FileEarmark /> {file.name}</Button>	
							<Button close onClick={() => setNestedModal({show: true, announcement: modal.data, file: file})} className="pl-1" />												
						</FormGroup>
					)
				)}
		       	{backendMsg && 
		        	<Row row className="justify-content-center my-3">
    		          <Col>
    		            <Alert color="success">{backendMsg}<Button close onClick={() => setBackendMsg(null)} /></Alert>
    		          </Col>
    		        </Row>
		       	}
		        {backendError && 
		        	<Row row className="justify-content-center my-3">
    		          <Col>
    		            <Alert color="danger">{backendError}<Button close onClick={() => setBackendError(null)} /></Alert>
    		          </Col>
    		        </Row>
		       	}
				{nestedModal.show && 
					<DeleteFile getData={getData} setModal={setModal} nestedModal={nestedModal} setNestedModal={setNestedModal} />
				}
			</ModalBody>
			<ModalFooter>
				<Button type="submit" disabled={isSubmitting} color="warning">Upraviť</Button>{' '}
				<Button outline color="secondary" onClick={() => setModal(!modal)}>Zrušiť</Button>
			</ModalFooter>
		</Form>
	);
}

export default EditAnnouncement;