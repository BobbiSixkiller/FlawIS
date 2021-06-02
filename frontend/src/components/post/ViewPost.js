import React from "react";

import { ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

function ViewPost(props) {
	const {
		modal: { post },
		setModal,
	} = props;

	return (
		<>
			<ModalHeader toggle={() => setModal(!post)}>{post.name}</ModalHeader>
			<ModalBody>
				<p>{post.body}</p>
				<p className="text-muted">{post.tags.map((tag) => `${tag}, `)}</p>
			</ModalBody>
			<ModalFooter>
				<Button outline color="secondary" onClick={() => setModal(!post)}>
					Zrušiť
				</Button>
			</ModalFooter>
		</>
	);
}

export default ViewPost;
