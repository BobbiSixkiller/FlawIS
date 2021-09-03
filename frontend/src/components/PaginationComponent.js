import React from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Row, Pagination, PaginationItem, PaginationLink } from "reactstrap";

export default function PaginationComponent({ page, pages }) {
	const history = useHistory();
	const { pathname } = useLocation();

	let links;

	if (pages <= 5) {
		links = [...Array(pages)].map((_, i) => (
			<PaginationItem
				key={i + 1}
				onClick={() => history.push(pathname + `?page=${i + 1}`)}
				active={page === i + 1}
			>
				<PaginationLink>{i + 1}</PaginationLink>
			</PaginationItem>
		));
	} else {
		const start = Math.floor((page - 1) / 5) * 5;

		links = (
			<>
				{[...Array(5)].map((_, i) => (
					<PaginationItem
						key={start + i + 1}
						onClick={() => history.push(pathname + `?page=${start + i + 1}`)}
						active={page === start + i + 1}
					>
						<PaginationLink>{start + i + 1}</PaginationLink>
					</PaginationItem>
				))}
				<PaginationItem disabled>
					<PaginationLink>...</PaginationLink>
				</PaginationItem>
				<PaginationItem
					key={pages}
					active={page === pages}
					onClick={() => history.push(pathname + `?page=${pages}`)}
				>
					<PaginationLink>{pages}</PaginationLink>
				</PaginationItem>
			</>
		);

		if (page > 5) {
			if (pages - page >= 5) {
				links = (
					<>
						<PaginationItem
							active={page === 1}
							onClick={() => history.push(pathname + `?page=${1}`)}
						>
							<PaginationLink>1</PaginationLink>
						</PaginationItem>
						<PaginationItem disabled>
							<PaginationLink>...</PaginationLink>
						</PaginationItem>
						<PaginationItem>
							<PaginationLink
								onClick={() => history.push(pathname + `?page=${start}`)}
							>
								{start}
							</PaginationLink>
						</PaginationItem>
						{[...Array(5)].map((_, i) => (
							<PaginationItem
								key={start + i + 1}
								onClick={() =>
									history.push(pathname + `?page=${start + i + 1}`)
								}
								active={page === start + i + 1}
							>
								<PaginationLink>{start + i + 1}</PaginationLink>
							</PaginationItem>
						))}
						<PaginationItem disabled>
							<PaginationLink>...</PaginationLink>
						</PaginationItem>
						<PaginationItem
							active={page === pages}
							onClick={() => history.push(pathname + `?page=${pages}`)}
						>
							<PaginationLink>{pages}</PaginationLink>
						</PaginationItem>
					</>
				);
			} else {
				let lastFew = pages - page + 5;

				links = (
					<>
						<PaginationItem
							active={page === 1}
							onClick={() => history.push(pathname + `?page=${1}`)}
						>
							<PaginationLink>1</PaginationLink>
						</PaginationItem>
						<PaginationItem disabled>
							<PaginationLink>...</PaginationLink>
						</PaginationItem>
						<PaginationItem>
							<PaginationLink
								onClick={() => history.push(pathname + `?page=${start}`)}
							>
								{start}
							</PaginationLink>
						</PaginationItem>
						{[...Array(lastFew)].map((_, i) => (
							<PaginationItem
								className={start + i + 1 > pages ? "d-none" : null}
								key={start + i + 1}
								onClick={() =>
									history.push(pathname + `?page=${start + i + 1}`)
								}
								active={page === start + i + 1}
							>
								<PaginationLink>{start + i + 1}</PaginationLink>
							</PaginationItem>
						))}
					</>
				);
			}
		}
	}

	return (
		pages > 1 && (
			<Row className="justify-content-center">
				<Pagination aria-label="Pagination">
					<PaginationItem
						disabled={page === 1}
						onClick={() =>
							page !== 1 && history.push(pathname + `?page=${page - 1}`)
						}
					>
						<PaginationLink previous />
					</PaginationItem>
					{links}
					<PaginationItem
						disabled={page === pages}
						onClick={() =>
							page !== pages && history.push(pathname + `?page=${page + 1}`)
						}
					>
						<PaginationLink next />
					</PaginationItem>
				</Pagination>
			</Row>
		)
	);
}
