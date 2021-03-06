import React from "react";

import {
	Row,
	Col,
	FormGroup,
	FormText,
	FormFeedback,
	Label,
	Button,
	Input,
	List,
	ListInlineItem,
} from "reactstrap";

export default function TagInput(props) {
	const { handleBlur, values, setValues, errors, valid } = props;
	const [tags, setTags] = React.useState(values.tags);
	const [value, setValue] = React.useState("Finančné právo");
	const [other, setOther] = React.useState(false);

	function addTag() {
		if (tags.find((tag) => tag === value || tag === other.value)) {
			return;
		}
		if (other.show) {
			setTags([...tags, other.value]);
		} else {
			setTags([...tags, value]);
		}
	}

	function removeTag(i) {
		setTags(tags.filter((tag) => tags.indexOf(tag) !== i));
	}

	React.useEffect(() => {
		setValues({ ...values, tags });
	}, [tags]);

	return (
		<>
			<Row form>
				<Label for="tag">Tag:</Label>
			</Row>
			<Row form className="justify-content-center">
				<Col sm={10}>
					<FormGroup>
						<Input
							type="select"
							name="tags"
							id="tags"
							onChange={(e) => {
								setValue(e.target.value);
								setOther(false);
							}}
							invalid={errors.tags}
							valid={valid.tags}
						>
							<option>Finančné právo</option>
							<option>Medzinárodné právo</option>
							<option>Obchodné právo</option>
							<option>Občianske právo</option>
							<option>Pracovné právo</option>
							<option>Právo duševného vlastníctva</option>
							<option>Právo Európskej únie</option>
							<option>Právo informačných technológií</option>
							<option>Právo životného prostredia</option>
							<option>Správne právo</option>
							<option>Teória práva</option>
							<option>Trestné právo</option>
							<option>Ústavné právo</option>
							<option onClick={() => setOther({ show: true, value: "" })}>
								Iné...
							</option>
						</Input>
						<FormFeedback invalid>{errors.tags}</FormFeedback>
						<FormFeedback valid>{valid.tags}</FormFeedback>
						{other.show && (
							<Input
								className="mt-1"
								type="text"
								id="tag"
								name="tag"
								placeholder="Názov oblasti"
								onBlur={handleBlur}
								onChange={(e) =>
									setOther({ show: true, value: e.target.value })
								}
								value={other.value}
								invalid={errors.tags}
								valid={valid.tags}
								autoComplete="off"
							/>
						)}
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
