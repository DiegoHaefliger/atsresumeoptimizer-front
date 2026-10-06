type PaginationProps = {
	page: number;
	pageCount: number;
	onChange: (page: number) => void;
};

export function Pagination({ page, pageCount, onChange }: PaginationProps) {
	if (pageCount <= 1) {
		return null;
	}
	return (
		<nav className="pagination" aria-label="Paginação">
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
		</nav>
	);
}
