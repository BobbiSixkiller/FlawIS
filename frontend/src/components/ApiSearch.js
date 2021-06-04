import React from "react";
import { useHistory, useLocation } from "react-router-dom";

import { useUser } from "../hooks/useUser";

import API from "../api";
import { Row, Col, Input, Spinner, ListGroup, ListGroupItem } from "reactstrap";

export default function ApiSearch(props) {
	const history = useHistory();
	const { pathname } = useLocation();
	const { accessToken } = useUser();

	const [display, setDisplay] = React.useState(false);
	const [search, setSearch] = React.useState("");
	const [loading, setLoading] = React.useState(false);
	const [suggestions, setSuggestions] = React.useState(null);
	const autoWrapRef = React.useRef(null);

	React.useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [autoWrapRef]);

	React.useEffect(() => {
		apiSearch();
	}, [search]);

	function handleClickOutside(e) {
		if (autoWrapRef.current && !autoWrapRef.current.contains(e.target)) {
			setDisplay(false);
		}
	}

	function handleDropdownClick(id) {
		setDisplay(false);
		history.push(`${pathname}/${id}`);
	}

	async function apiSearch() {
		try {
			setLoading(true);
			const res = await API.get(`post/api/search?q=${search}`, {
				headers: {
					authorization: accessToken,
				},
			});
			setSuggestions(res.data.posts);
			setLoading(false);
		} catch (err) {
			setLoading(false);
			console.log(err);
		}
	}

	return (
		<div ref={autoWrapRef}>
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
					{loading && <Spinner />}
					{suggestions.length === 0 ? (
						<div className="text-muted">No results</div>
					) : (
						suggestions.map((suggestion, i) => {
							return (
								<div
									tabIndex="0"
									onClick={() => handleDropdownClick(suggestion._id)}
									key={i}
								>
									{suggestion.name}, {suggestion.author}, Oblasť:{" "}
									{suggestion.tags.map((tag) => `#${tag} `)}
								</div>
							);
						})
					)}
				</Col>
			)}
		</div>
	);
}
