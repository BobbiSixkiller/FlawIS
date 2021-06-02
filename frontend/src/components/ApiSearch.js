import React from "react";
import { useHistory } from "react-router-dom";

import { useUser } from "../hooks/useUser";

import API from "../api";
import { Form, FormGroup, Col, Button, Input } from "reactstrap";

export default function ApiSearch(props) {
	const history = useHistory();
	const { accessToken } = useUser();

	const [display, setDisplay] = React.useState(false);
	const [search, setSearch] = React.useState("");
	const [suggestions, setSuggestions] = React.useState([]);
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

	function handleDropdownClick(id) {
		setDisplay(false);
	}

	async function APIcall(e) {
		e.preventDefault();

		try {
			const res = await API.get(`post/api/search?q=${search}`, {
				headers: {
					authorization: accessToken,
				},
			});
			setSuggestions(res.data.data);
		} catch (err) {
			console.log(err);
		}
	}

	return (
		<div ref={autoWrapRef}>
			<Form inline onSubmit={APIcall}>
				<FormGroup>
					<Input
						className="autoInput"
						id="search"
						name="search"
						placeholder="Search..."
						value={search}
						onClick={() => setDisplay(!display)}
						onChange={(e) => setSearch(e.target.value)}
						autoComplete="off"
					/>
					{display && (
						<Col className="dropDown">
							{suggestions.length === 0 ? (
								<div className="text-muted">No results</div>
							) : (
								suggestions.map((suggestion, i) => {
									return (
										<div
											tabIndex="0"
											onClick={() => handleDropdownClick(suggestion)}
											key={i}
										>
											res{i}
										</div>
									);
								})
							)}
						</Col>
					)}
				</FormGroup>
				<FormGroup>
					<Button disabled={search.length === 0} type="submit" color="success">
						Search
					</Button>
				</FormGroup>
			</Form>
		</div>
	);
}
