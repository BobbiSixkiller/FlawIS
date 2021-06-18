import React from "react";
import { useRouteMatch, Link } from "react-router-dom";

import API from "../../api";
import { Input, Spinner, ListGroup, ListGroupItem } from "reactstrap";

export default function ApiSearch() {
	const match = useRouteMatch();

	const [display, setDisplay] = React.useState(false);
	const [search, setSearch] = React.useState("");
	const [loading, setLoading] = React.useState(false);
	const [suggestions, setSuggestions] = React.useState(null);
	const autoWrapRef = React.useRef(null);
	const activeSuggestionRef = React.useRef(null);

	React.useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [autoWrapRef]);

	React.useEffect(() => {
		async function apiSearch() {
			try {
				setLoading(true);
				const res = await API.get(`post/api/search?q=${search}`);
				setSuggestions(res.data.posts);
				setLoading(false);
			} catch (err) {
				setLoading(false);
				setSuggestions([]);
				console.log(err);
			}
		}
		apiSearch();
	}, [search]);

	function handleClickOutside(e) {
		if (autoWrapRef.current && !autoWrapRef.current.contains(e.target)) {
			setDisplay(false);
		}
	}

	function handleSuggestionClick(i) {
		activeSuggestionRef.current = i;
		setDisplay(false);
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
				<ListGroup className="suggestions">
					{loading && (
						<ListGroupItem>
							<Spinner size="sm" />
						</ListGroupItem>
					)}
					{suggestions.length === 0 ? (
						<ListGroupItem className="text-muted">No results</ListGroupItem>
					) : (
						suggestions.map((suggestion, i) => (
							<ListGroupItem
								key={i}
								onClick={() => handleSuggestionClick(i)}
								tag={Link}
								to={`${match.url}/${suggestion._id}`}
								action
								active={activeSuggestionRef.current === i}
							>
								{suggestion.name}, {suggestion.author}, Oblasť:{" "}
								{suggestion.tags.map((tag) => `#${tag} `)}
							</ListGroupItem>
						))
					)}
				</ListGroup>
			)}
		</div>
	);
}
