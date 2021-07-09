import React from "react";
import { Row, Pagination, PaginationItem, PaginationLink } from "reactstrap";

export default function PaginationComponent({ page, pages, changePage }) {
	let links;

	if (pages <= 5) {
		links = [...Array(pages)].map((_, i) => (
			<PaginationItem
				key={i + 1}
				onClick={() => changePage(i + 1)}
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
						onClick={() => changePage(start + i + 1)}
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
					onClick={() => changePage(pages)}
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
							key={1}
							active={page === 1}
							onClick={() => changePage(1)}
						>
							<PaginationLink>1</PaginationLink>
						</PaginationItem>
						<PaginationItem disabled>
							<PaginationLink>...</PaginationLink>
						</PaginationItem>

						{[...Array(5)].map((_, i) => (
							<PaginationItem
								key={start + i + 1}
								onClick={() => changePage(start + i + 1)}
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
							onClick={() => changePage(pages)}
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
							key={1}
							active={page === 1}
							onClick={() => changePage(1)}
						>
							<PaginationLink>1</PaginationLink>
						</PaginationItem>
						<PaginationItem disabled>
							<PaginationLink>...</PaginationLink>
						</PaginationItem>
						{[...Array(lastFew)].map((_, i) => (
							<PaginationItem
								className={start + i + 1 > pages && `d-none`}
								key={start + i + 1}
								onClick={() => changePage(start + i + 1)}
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
				<Pagination aria-label="Page navigation example">
					<PaginationItem
						disabled={page === 1}
						onClick={() => page !== 1 && changePage(page - 1)}
					>
						<PaginationLink previous />
					</PaginationItem>
					{links}
					<PaginationItem
						disabled={page === pages}
						onClick={() => page !== pages && changePage(page + 1)}
					>
						<PaginationLink next />
					</PaginationItem>
				</Pagination>
			</Row>
		)
	);
}
