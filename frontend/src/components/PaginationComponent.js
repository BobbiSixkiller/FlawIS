import React from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Pagination, PaginationItem, PaginationLink } from "reactstrap";

export default function PaginationComponent({ page, pages, changePage }) {
	const params = useParams();
	const links = [];
	let renderLinks;

	for (let index = 0; index < pages; index++) {
		links.push(
			<PaginationItem
				active={params.page == index + 1 || index + 1 === page}
				onClick={() => changePage(index + 1)}
			>
				<PaginationLink tag={Link} to={`/posts/${index + 1}`}>
					{index + 1}
				</PaginationLink>
			</PaginationItem>
		);
	}

	if (pages > 5 && page <= pages) {
		renderLinks = (
			<>
				{links.slice(0, 5)}
				<PaginationItem>
					<PaginationLink>...</PaginationLink>
				</PaginationItem>
			</>
		);
	}

	return (
		pages > 1 && (
			<Row className="justify-content-center">
				<Pagination aria-label="Page navigation example">
					<PaginationItem
						disabled={page === 1}
						onClick={() => changePage(page - 1)}
					>
						<PaginationLink previous />
					</PaginationItem>
					{links}
					<PaginationItem
						disabled={page === pages}
						onClick={() => changePage(page + 1)}
					>
						<PaginationLink next />
					</PaginationItem>
				</Pagination>
			</Row>
		)
	);
}
