import type { ContractType, WorkModel } from "../api/types";
import { EMPTY_FILTERS, MIN_SCORE_OPTIONS, hasActiveFilters, type JobFilters } from "../lib/jobFilters";
import { CONTRACT_TYPE_LABELS, WORK_MODEL_LABELS } from "../lib/jobLabels";

type JobFiltersBarProps = {
	filters: JobFilters;
	onChange: (filters: JobFilters) => void;
	seniorities: string[];
	shown: number;
	total: number;
};

export function JobFiltersBar({ filters, onChange, seniorities, shown, total }: JobFiltersBarProps) {
	const update = <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => onChange({ ...filters, [key]: value });

	return (
		<div className="job-filters" role="search" aria-label="Filtrar vagas">
			<label className="job-filters-query">
				<span className="sr-only">Buscar vaga</span>
				<input
					type="search"
					value={filters.query}
					onChange={(event) => update("query", event.target.value)}
					placeholder="Buscar por título, empresa ou descrição"
				/>
			</label>
			<label>
				<span className="job-filters-label">Modelo de trabalho</span>
				<select className={filters.workModel ? "is-active" : undefined} value={filters.workModel} onChange={(event) => update("workModel", event.target.value as WorkModel | "")}>
					<option value="">Todos</option>
					{(Object.keys(WORK_MODEL_LABELS) as WorkModel[]).map((value) => (
						<option key={value} value={value}>
							{WORK_MODEL_LABELS[value]}
						</option>
					))}
				</select>
			</label>
			<label>
				<span className="job-filters-label">Tipo de contrato</span>
				<select
					className={filters.contractType ? "is-active" : undefined}
					value={filters.contractType}
					onChange={(event) => update("contractType", event.target.value as ContractType | "")}
				>
					<option value="">Todos</option>
					{(Object.keys(CONTRACT_TYPE_LABELS) as ContractType[]).map((value) => (
						<option key={value} value={value}>
							{CONTRACT_TYPE_LABELS[value]}
						</option>
					))}
				</select>
			</label>
			{seniorities.length > 0 && (
				<label>
					<span className="job-filters-label">Senioridade</span>
					<select className={filters.seniority ? "is-active" : undefined} value={filters.seniority} onChange={(event) => update("seniority", event.target.value)}>
						<option value="">Todas</option>
						{seniorities.map((value) => (
							<option key={value} value={value}>
								{value}
							</option>
						))}
					</select>
				</label>
			)}
			<label>
				<span className="job-filters-label">Aderência mínima</span>
				<select className={filters.minScore ? "is-active" : undefined} value={filters.minScore} onChange={(event) => update("minScore", Number(event.target.value))}>
					<option value={0}>Todas</option>
					{MIN_SCORE_OPTIONS.map((value) => (
						<option key={value} value={value}>
							{value} ou mais
						</option>
					))}
				</select>
			</label>
			<div className="job-filters-summary">
				<span aria-live="polite">
					{hasActiveFilters(filters)
						? `${shown} de ${total} ${total === 1 ? "vaga" : "vagas"}`
						: `${total} ${total === 1 ? "vaga" : "vagas"}`}
				</span>
				{hasActiveFilters(filters) && (
					<button type="button" className="btn-secondary btn-small" onClick={() => onChange(EMPTY_FILTERS)}>
						Limpar filtros
					</button>
				)}
			</div>
		</div>
	);
}
