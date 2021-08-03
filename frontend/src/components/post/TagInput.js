import React, { useState } from "react";
import { getIn } from "formik";

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

export default function TagInput({ field, form, ...props }) {
	const [value, setValue] = useState("Finančné právo");
	const [other, setOther] = useState(false);

	const error =
		getIn(form.touched, field.name) && getIn(form.errors, field.name);
	const valid = getIn(form.touched, field.name) && !error;

	function addTag() {
		if (form.values.tags.find((tag) => tag === value || tag === other.value)) {
			return;
		}
		if (other.show) {
			form.setFieldValue(field.name, [...form.values.tags, other.value]);
		} else {
			form.setFieldValue(field.name, [...form.values.tags, value]);
		}
	}

	function removeTag(tag) {
		form.setFieldValue(
			field.name,
			form.values.tags.filter((t) => t !== tag)
		);
	}

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
							onChange={(e) => {
								setValue(e.target.value);
								setOther(false);
							}}
							invalid={error && true}
							valid={valid && true}
							value={value}
							onBlur={field.onBlur}
							name={field.name}
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

						{other.show && (
							<Input
								className="mt-1"
								type="text"
								placeholder="Názov oblasti"
								onChange={(e) =>
									setOther({ show: true, value: e.target.value })
								}
								value={other.value}
								invalid={error && true}
								valid={valid && true}
								autoComplete="off"
							/>
						)}
						<FormFeedback invalid="true">{error}</FormFeedback>
						<FormFeedback valid={true}>Tagy OK!</FormFeedback>
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
							{form.values.tags.map((tag, i) => (
								<ListInlineItem key={i}>
									{tag}
									<Button onClick={() => removeTag(tag)} size="sm" close />
								</ListInlineItem>
							))}
						</List>
					</FormGroup>
				</Col>
			</Row>
		</>
	);
}
