import { useMemo, useState } from "react";
import { EMPTY_FILTERS, filterJobs, seniorityOptions, type JobFilters } from "../lib/jobFilters";
import { workModelLabel } from "../lib/jobLabels";
import { scoreTone } from "../lib/score";
import type { Job } from "../lib/useJobs";
import { EyeIcon, PencilIcon, SpinnerIcon, TrashIcon } from "./icons";
import { JobFiltersBar } from "./JobFiltersBar";
import { LoadFailed } from "./LoadFailed";
import { Skeleton } from "./Skeleton";
import { StateMessage } from "./StateMessage";

type JobsTableProps = {
	jobs: Job[] | null;
	failed: boolean;
	onRetry: () => void;
	onRemove?: (jobId: string) => Promise<void>;
	onPreview?: (job: Job) => void;
	onEdit?: (job: Job) => void;
	selectedId?: string | null;
	onSelect?: (job: Job) => void;
};

const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

function jobMeta(job: Job): string {
	const when = job.lastUsedAt
		? `usada em ${dateFormat.format(new Date(job.lastUsedAt))}`
		: job.registeredAt && `cadastrada em ${dateFormat.format(new Date(job.registeredAt))}`;
	return [job.company, job.workModel && workModelLabel(job.workModel), when].filter(Boolean).join(" · ");
}

export function JobsTable({ jobs, failed, onRetry, onRemove, onPreview, onEdit, selectedId, onSelect }: JobsTableProps) {
	const hasActions = Boolean(onRemove || onPreview || onEdit);
	const [removingId, setRemovingId] = useState<string | null>(null);
	const [filters, setFilters] = useState<JobFilters>(EMPTY_FILTERS);
	const seniorities = useMemo(() => seniorityOptions(jobs ?? []), [jobs]);
	const visibleJobs = useMemo(() => filterJobs(jobs ?? [], filters), [jobs, filters]);

	async function remove(jobId: string) {
		if (!onRemove) {
			return;
		}
		setRemovingId(jobId);
		try {
			await onRemove(jobId);
		} finally {
			setRemovingId(null);
		}
	}

	if (failed) {
		return <LoadFailed message="Não deu pra carregar as vagas." onRetry={onRetry} />;
	}

	if (jobs === null) {
		return (
			<div className="recent-jobs" role="status" aria-busy="true">
				<span className="sr-only">Carregando vagas...</span>
				{[0, 1, 2].map((index) => (
					<div className="recent-jobs-skeleton-row" key={index} aria-hidden="true">
						<Skeleton width="70%" height={14} />
						<Skeleton width="45%" height={12} />
					</div>
				))}
			</div>
		);
	}

	const selectable = Boolean(onSelect);
	return (
		<>
			<JobFiltersBar
				filters={filters}
				onChange={setFilters}
				seniorities={seniorities}
				shown={visibleJobs.length}
				total={jobs.length}
			/>
			{visibleJobs.length === 0 ? (
				<StateMessage variant="empty" layout="inline" message="Nenhuma vaga combina com esses filtros." />
			) : (
			<div className="recent-jobs-scroll">
				<table className={`recent-jobs-table${selectable ? " recent-jobs-table-selectable" : ""}`}>
					<thead>
						<tr>
							<th scope="col">Vaga</th>
							<th scope="col" className="recent-jobs-score-col">
								Aderência
							</th>
							{hasActions && (
								<th scope="col" className="recent-jobs-action-col">
									<span className="sr-only">Ações</span>
								</th>
							)}
						</tr>
					</thead>
					<tbody>
						{visibleJobs.map((job) => {
							const selected = job.id === selectedId;
							return (
								<tr
									key={job.id}
									tabIndex={selectable ? 0 : undefined}
									aria-selected={selectable ? selected : undefined}
									className={selected ? "recent-jobs-row-selected" : undefined}
									onClick={() => onSelect?.(job)}
									onKeyDown={(event) => {
										if (onSelect && (event.key === "Enter" || event.key === " ")) {
											event.preventDefault();
											onSelect(job);
										}
									}}
								>
									<td>
										<span className="recent-jobs-title">{job.title ?? "Vaga sem título"}</span>
										<span className="recent-jobs-meta">{jobMeta(job)}</span>
									</td>
									<td className="recent-jobs-score-col">
										{job.preferenceScore != null ? (
											<span className={`preference-score preference-score-${scoreTone(job.preferenceScore)}`}>
												{job.preferenceScore}
											</span>
										) : (
											"—"
										)}
									</td>
									{hasActions && (
										<td className="recent-jobs-action-col">
											<div className="saved-resume-actions">
												{onPreview && (
													<button
														type="button"
														className="btn-icon"
														aria-label={`Ver prévia de ${job.title ?? "vaga"}`}
														title="Ver prévia"
														onClick={() => onPreview(job)}
													>
														<EyeIcon />
													</button>
												)}
												{onEdit && (
													<button
														type="button"
														className="btn-icon"
														aria-label={`Editar ${job.title ?? "vaga"}`}
														title="Editar vaga"
														onClick={() => onEdit(job)}
													>
														<PencilIcon />
													</button>
												)}
												{onRemove && (
													<button
														type="button"
														className="btn-icon"
														aria-label={`Remover ${job.title ?? "vaga"} da lista`}
														title="Remover da lista"
														disabled={removingId === job.id}
														onClick={() => remove(job.id)}
													>
														{removingId === job.id ? <SpinnerIcon /> : <TrashIcon />}
													</button>
												)}
											</div>
										</td>
									)}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			)}
		</>
	);
}
