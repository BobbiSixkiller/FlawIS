import React from 'react';
import { Row, Col, Alert, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import api from '../../api';
import { useUser } from '../../hooks/useUser';

function DeleteFile(props) {
    const { getData, setModal, nestedModal, setNestedModal } = props;
    const { accessToken } = useUser();

    const [ backendError, setBackendError ] = React.useState(null);
    const [ backendMsg, setBackendMsg ] = React.useState(null);

    async function deleteFile() {
        try {
            const res = await api.delete(`announcement/${nestedModal.announcement._id}/file/${nestedModal.file._id}`,
                {
                    headers: {
                        authToken: accessToken
                    }
                }
            );
            setBackendMsg(res.data.msg);
            setModal({show: true, data: res.data.announcement, action: "edit"});
            getData(accessToken);
        } catch (err) {
            err.response.data.error && setBackendError(err.response.data.error);
        }
    }
    
    return(
        <Modal isOpen={nestedModal.show} toggle={() => setNestedModal(!nestedModal)}>
            <ModalHeader>Zmazať súbor</ModalHeader>
            <ModalBody>
                <p>Potvrďte zmazanie súboru:</p>
                <p className="font-weight-bold">{nestedModal.file.name}</p>
                {backendError && 
		        	<Row row className="justify-content-center">
			          <Col>
			            <Alert color="danger">{backendError}<Button close onClick={() => setBackendError(null)} /></Alert>
			          </Col>
			        </Row>
		       	}
		       	{backendMsg && 
		        	<Row row className="justify-content-center">
			          <Col>
			            <Alert color="success">{backendMsg}<Button close onClick={() => setBackendMsg(null)} /></Alert>
			          </Col>
			        </Row>
		       	}
            </ModalBody>
            <ModalFooter>
                <Button color="danger" onClick={() => deleteFile()}>Submit</Button>
                <Button onClick={() => setNestedModal(!nestedModal)}>Zrušiť</Button>
            </ModalFooter>
        </Modal>
    );
}

export default DeleteFile;