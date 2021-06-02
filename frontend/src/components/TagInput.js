import React from "react";

import {
	Row,
	Col,
	FormGroup,
	FormText,
	FormFeedback,
	Button,
	Input,
	List,
	ListInlineItem,
} from "reactstrap";

export default function TagInput(props) {
	const { handleBlur, values, setValues, errors, valid } = props;
	const [tags, setTags] = React.useState(values.tags);
	const [tag, setTag] = React.useState("");

	function addTag() {
		setTags([...tags, tag]);
	}

	function removeTag(i) {
		setTags(tags.filter((tag) => tags.indexOf(tag) !== i));
	}

	React.useEffect(() => {
		setValues({ ...values, tags });
	}, [tags]);

	return (
		<>
			<Row form className="justify-content-center">
				<Col sm={10}>
					<FormGroup>
						<Input
							type="text"
							id="tag"
							name="tag"
							placeholder="Názov oblasti"
							onBlur={handleBlur}
							onChange={(e) => setTag(e.target.value)}
							value={tag}
							invalid={errors.tags}
							valid={valid.tags}
							autoComplete="off"
						/>
						<FormFeedback invalid>{errors.tags}</FormFeedback>
						<FormFeedback valid>{valid.tags}</FormFeedback>
						<FormText color="muted">
							Tag reprezentuje oblasť Vášho príspevku
						</FormText>
					</FormGroup>
				</Col>
				<Col sm={2}>
					<Button outline color="primary" onClick={addTag}>
						Pridať
					</Button>
				</Col>
			</Row>
			<Row form className="justify-content-center">
				<Col>
					<FormGroup>
						<List type="inline">
							{tags.map((tag, i) => (
								<ListInlineItem key={i}>
									{tag}
									<Button onClick={() => removeTag(i)} size="sm" close />
								</ListInlineItem>
							))}
						</List>
					</FormGroup>
				</Col>
			</Row>
		</>
	);
}
