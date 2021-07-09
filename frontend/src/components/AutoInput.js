import React from "react";

import { Input, Label, FormGroup, FormFeedback, Col } from "reactstrap";

function AutoInput({
	handleChange,
	handleBlur,
	valid,
	errors,
	values,
	setValues,
	data,
}) {
	const [display, setDisplay] = React.useState(false);
	const [search, setSearch] = React.useState("");
	const autoWrapRef = React.useRef(null);

	React.useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [autoWrapRef]);

	function handleClickOutside(e) {
		if (autoWrapRef.current && !autoWrapRef.current.contains(e.target)) {
			setDisplay(false);
		}
	}

	function handleDropdownChange(e) {
		handleChange(e);
		setSearch(e.target.value);
		setDisplay(true);
	}

	function handleDropdownClick(memberObj) {
		const member = { ...memberObj };
		setValues({ ...values, member: member._id });
		setSearch(member.firstName + " " + member.lastName);
		setDisplay(false);
	}

	return (
		<div ref={autoWrapRef}>
			<FormGroup>
				<Label for="member">Riešiteľ:</Label>
				<Input
					className="autoInput"
					id="member"
					name="member"
					placeholder="Meno riešiteľa"
					value={search}
					onClick={() => setDisplay(!display)}
					onChange={(e) => handleDropdownChange(e)}
					onBlur={handleBlur}
					valid={valid.member && true}
					invalid={errors.member && true}
					autoComplete="off"
				/>
				<FormFeedback invalid>{errors.member}</FormFeedback>
				<FormFeedback valid>{valid.member}</FormFeedback>
				{display && (
					<Col className="dropDown">
						{data
							.filter(
								({ firstName, lastName }) =>
									(firstName + " " + lastName)
										.toLowerCase()
										.indexOf(search.toLowerCase()) > -1
							)
							.map((member, i) => {
								return (
									<div
										tabIndex="0"
										onClick={() => handleDropdownClick(member)}
										key={i}
									>
										{member.firstName + " " + member.lastName}
									</div>
								);
							})}
					</Col>
				)}
			</FormGroup>
		</div>
	);
}

export default AutoInput;
