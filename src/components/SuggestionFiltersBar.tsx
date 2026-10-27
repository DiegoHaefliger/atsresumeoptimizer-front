import {
	EMPTY_SUGGESTION_FILTERS,
	POSTED_WITHIN_OPTIONS,
	SUGGESTION_MIN_SCORES,
	hasActiveSuggestionFilters,
	type SuggestionFilters,
} from "../lib/suggestionFilters";
import { sourceLabel } from "../lib/suggestionLabels";

type SuggestionFiltersBarProps = {
	filters: SuggestionFilters;
	onChange: (filters: SuggestionFilters) => void;
	sources: string[];
	shown: number;
	total: number;
};

export function SuggestionFiltersBar({ filters, onChange, sources, shown, total }: SuggestionFiltersBarProps) {
	const update = <K extends keyof SuggestionFilters>(key: K, value: SuggestionFilters[K]) => onChange({ ...filters, [key]: value });
	const active = hasActiveSuggestionFilters(filters);

	return (
		<div className="job-filters" role="search" aria-label="Filtrar vagas sugeridas">
			<label className="job-filters-query">
				<span className="sr-only">Buscar vaga sugerida</span>
				<input
					type="search"
					value={filters.query}
					onChange={(event) => update("query", event.target.value)}
					placeholder="Buscar por título, empresa, local ou descrição"
				/>
			</label>
			{sources.length > 1 && (
				<label>
					<span className="job-filters-label">Site</span>
					<select className={filters.source ? "is-active" : undefined} value={filters.source} onChange={(event) => update("source", event.target.value)}>
						<option value="">Todos</option>
						{sources.map((value) => (
							<option key={value} value={value}>
								{sourceLabel(value)}
							</option>
						))}
					</select>
				</label>
			)}
			<label>
				<span className="job-filters-label">Aderência mínima</span>
				<select className={filters.minScore ? "is-active" : undefined} value={filters.minScore} onChange={(event) => update("minScore", Number(event.target.value))}>
					<option value={0}>Todas</option>
					{SUGGESTION_MIN_SCORES.map((value) => (
						<option key={value} value={value}>
							{value} ou mais
						</option>
					))}
				</select>
			</label>
			<label>
				<span className="job-filters-label">Publicada</span>
				<select
					className={filters.postedWithinDays ? "is-active" : undefined}
					value={filters.postedWithinDays}
					onChange={(event) => update("postedWithinDays", Number(event.target.value))}
				>
					<option value={0}>Qualquer data</option>
					{POSTED_WITHIN_OPTIONS.map((option) => (
						<option key={option.days} value={option.days}>
							{option.label}
						</option>
					))}
				</select>
			</label>
			<div className="job-filters-summary">
				<span aria-live="polite">
					{active ? `${shown} de ${total} ${total === 1 ? "vaga" : "vagas"}` : `${total} ${total === 1 ? "vaga" : "vagas"}`}
				</span>
				{active && (
					<button type="button" className="btn-secondary btn-small" onClick={() => onChange(EMPTY_SUGGESTION_FILTERS)}>
						Limpar filtros
					</button>
				)}
			</div>
		</div>
	);
}
