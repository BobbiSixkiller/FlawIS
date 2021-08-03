import React, { useState, useEffect, useRef } from "react";
import { useRouteMatch, useLocation, Link } from "react-router-dom";

import { useDataFetch } from "../../hooks/useApi";

import { Input, Spinner, ListGroup, ListGroupItem } from "reactstrap";

export default function PostApiSearch() {
	const { url } = useRouteMatch();
	const { pathname } = useLocation();

	const [display, setDisplay] = useState(false);
	const [search, setSearch] = useState("");

	const autoWrapRef = useRef(null);
	const activeSuggestionRef = useRef(null);

	const { loading, error, data, setUrl } = useDataFetch(
		`post/api/search?q=${search}`,
		[]
	);

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [autoWrapRef]);

	useEffect(() => {
		setUrl(`post/api/search?q=${search}`);
	}, [search, setUrl]);

	useEffect(() => {
		activeSuggestionRef.current = pathname.split("/")[3];
	}, [pathname]);

	function handleClickOutside(e) {
		if (autoWrapRef.current && !autoWrapRef.current.contains(e.target)) {
			setDisplay(false);
		}
	}

	return (
		<div ref={autoWrapRef}>
			<Input
				className="autoInput"
				id="search"
				name="search"
				placeholder="Hľadať..."
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
					{data.posts.length === 0 || error ? (
						<ListGroupItem className="text-muted">
							Žiadne výsledky
						</ListGroupItem>
					) : (
						data.posts.map((post, i) => (
							<ListGroupItem
								key={i}
								onClick={() => setDisplay(false)}
								tag={Link}
								to={`${url}/${post._id}`}
								action
								active={activeSuggestionRef.current === post._id}
							>
								{post.name}, {post.author}, Oblasť:{" "}
								{post.tags.map((tag) => `#${tag} `)}
							</ListGroupItem>
						))
					)}
				</ListGroup>
			)}
		</div>
	);
}
