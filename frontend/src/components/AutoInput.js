import React from "react";

import { Input, Label, FormGroup, FormFeedback, Col } from "reactstrap";

function AutoInput(props) {
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
		props.handleChange(e);
		setSearch(e.target.value);
		setDisplay(true);
	}

	function handleDropdownClick(memberObj) {
		const member = {...memberObj};
		props.setValues({...props.values, member: member._id});
		setSearch(member.firstName + " " + member.lastName);
		setDisplay(false);
	}

	return(
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
					onBlur={props.handleBlur}
					valid={props.valid.member && true}
					invalid={props.errors.member && true}
					autoComplete="off"
				/>
				<FormFeedback invalid>{props.errors.member}</FormFeedback>
				<FormFeedback valid>{props.valid.member}</FormFeedback>
				{display && (
					<Col className="dropDown">
						{props.users
							.filter(({firstName, lastName}) => (firstName + " " + lastName).toLowerCase().indexOf(search.toLowerCase()) > - 1)
							.map((member, i) => {
								return <div tabIndex="0" onClick={() => handleDropdownClick(member)} key={i}>{member.firstName + " " + member.lastName}</div>
						})}
					</Col>
				)}
			</FormGroup>
		</div>
	);
}

export default AutoInput;