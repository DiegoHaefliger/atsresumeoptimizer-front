type PageSizeChoice = {
	value: number;
	options: readonly number[];
	total: number;
	onChange: (pageSize: number) => void;
};

type PaginationProps = {
	page: number;
	pageCount: number;
	onChange: (page: number) => void;
	pageSize?: PageSizeChoice;
};

export function Pagination({ page, pageCount, onChange, pageSize }: PaginationProps) {
	const showSizes = pageSize !== undefined && pageSize.total > Math.min(...pageSize.options);
	if (pageCount <= 1 && !showSizes) {
		return null;
	}
	return (
		<nav className="pagination" aria-label="Paginação">
			{pageCount > 1 && (
				<>
					<button type="button" className="btn-secondary btn-small" disabled={page === 0} onClick={() => onChange(page - 1)}>
						Anterior
					</button>
					<span aria-live="polite">
						Página {page + 1} de {pageCount}
					</span>
					<button
						type="button"
						className="btn-secondary btn-small"
						disabled={page >= pageCount - 1}
						onClick={() => onChange(page + 1)}
					>
						Próxima
					</button>
				</>
			)}
			{showSizes && (
				<label className="pagination-size">
					Por página
					<select value={pageSize.value} onChange={(event) => pageSize.onChange(Number(event.target.value))}>
						{pageSize.options.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</label>
			)}
		</nav>
	);
}
