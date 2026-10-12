import { useMemo, useState } from "react";
import { filterJobs, loadFilters, saveFilters, seniorityOptions, type JobFilters } from "../lib/jobFilters";
import { jobLabel } from "../lib/jobCode";
import { jobMeta } from "../lib/jobMeta";
import { byProcessStage } from "../lib/jobOrder";
import { scoreTone } from "../lib/score";
import type { Job } from "../lib/useJobs";
import type { SelectionProcess } from "../api/types";
import { ConfirmDialog } from "./ConfirmDialog";
import type { JobActionHandlers } from "./JobActions";
import { JobCard } from "./JobCard";
import { JobCode } from "./JobCode";
import { EyeIcon } from "./icons";
import { JobFiltersBar } from "./JobFiltersBar";
import { LoadFailed } from "./LoadFailed";
import { Pagination } from "./Pagination";
import { StageBadge } from "./StageBadge";
import { Skeleton } from "./Skeleton";
import { StateMessage } from "./StateMessage";

type JobListView = "cards" | "table";

type JobListProps = Omit<JobActionHandlers, "onRemove"> & {
	jobs: Job[] | null;
	failed: boolean;
	onRetry: () => void;
	view?: JobListView;
	onRemove?: (jobId: string) => Promise<void>;
	processes?: Map<string, SelectionProcess>;
	selectedId?: string | null;
	onSelect?: (job: Job) => void;
	pageSize?: number;
};

const SKELETON_ITEMS = [0, 1, 2];

function ScoreCell({ score }: { score: number | null | undefined }) {
	return (
		<td className="recent-jobs-score-col">
			{score != null ? <span className={`preference-score preference-score-${scoreTone(score)}`}>{score}</span> : "—"}
		</td>
	);
}

export function JobList({
	jobs,
	failed,
	onRetry,
	view = "table",
	onRemove,
	processes,
	selectedId,
	onSelect,
	pageSize,
	...actions
}: JobListProps) {
	const [removingId, setRemovingId] = useState<string | null>(null);
	const [confirmingRemoval, setConfirmingRemoval] = useState<Job | null>(null);
	const [filters, setFilters] = useState<JobFilters>(loadFilters);
	const [page, setPage] = useState(0);
	function changeFilters(next: JobFilters) {
		setFilters(next);
		setPage(0);
		saveFilters(next);
	}
	const seniorities = useMemo(() => seniorityOptions(jobs ?? []), [jobs]);
	const visibleJobs = useMemo(() => filterJobs(jobs ?? [], filters), [jobs, filters]);
	const orderedJobs = useMemo(() => [...visibleJobs].sort(byProcessStage(processes)), [visibleJobs, processes]);
	const pageCount = pageSize ? Math.max(1, Math.ceil(orderedJobs.length / pageSize)) : 1;
	const currentPage = Math.min(page, pageCount - 1);
	const pageJobs = pageSize ? orderedJobs.slice(currentPage * pageSize, (currentPage + 1) * pageSize) : orderedJobs;

	async function remove(jobId: string) {
		if (!onRemove) {
			return;
		}
		setRemovingId(jobId);
		setConfirmingRemoval(null);
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
		return view === "cards" ? (
			<div className="job-grid" role="status" aria-busy="true">
				<span className="sr-only">Carregando vagas...</span>
				{SKELETON_ITEMS.map((index) => (
					<Skeleton key={index} width="100%" height={220} radius="var(--radius-xl)" />
				))}
			</div>
		) : (
			<div className="recent-jobs" role="status" aria-busy="true">
				<span className="sr-only">Carregando vagas...</span>
				{SKELETON_ITEMS.map((index) => (
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
				onChange={changeFilters}
				seniorities={seniorities}
				shown={visibleJobs.length}
				total={jobs.length}
			/>
			{visibleJobs.length === 0 ? (
				<StateMessage variant="empty" layout="inline" message="Nenhuma vaga combina com esses filtros." />
			) : view === "cards" ? (
				<div className="job-grid">
					{pageJobs.map((job) => (
						<JobCard
							key={job.id}
							job={job}
							process={processes?.get(job.id)}
							removing={removingId === job.id}
							onRemove={onRemove ? setConfirmingRemoval : undefined}
							{...actions}
						/>
					))}
				</div>
			) : (
				<div className="recent-jobs-scroll">
					<table className={`recent-jobs-table${selectable ? " recent-jobs-table-selectable" : ""}`}>
						<thead>
							<tr>
								<th scope="col">Vaga</th>
								<th scope="col" className="recent-jobs-score-col">
									Aderência
								</th>
								<th scope="col" className="recent-jobs-score-col">
									Nota ATS
								</th>
								{actions.onPreview && (
									<th scope="col" className="recent-jobs-action-col">
										Prévia
									</th>
								)}
							</tr>
						</thead>
						<tbody>
							{pageJobs.map((job) => {
								const selected = job.id === selectedId;
								const process = processes?.get(job.id);
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
											<span className="recent-jobs-title">
												<JobCode code={job.code} /> {job.title ?? "Vaga sem título"}
											</span>
											<span className="recent-jobs-meta">{jobMeta(job)}</span>
											{process && <StageBadge stage={process.stage} />}
										</td>
										<ScoreCell score={job.preferenceScore} />
										<ScoreCell score={job.atsScore} />
										{actions.onPreview && (
											<td className="recent-jobs-action-col">
												<button
													type="button"
													className="btn-icon recent-jobs-preview"
													aria-label={`Ver prévia de ${job.title ?? "vaga"}`}
													title="Ver prévia da vaga"
													onClick={(event) => {
														event.stopPropagation();
														actions.onPreview?.(job);
													}}
													onKeyDown={(event) => event.stopPropagation()}
												>
													<EyeIcon />
												</button>
											</td>
										)}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
			{pageSize && <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />}
			<ConfirmDialog
				open={confirmingRemoval !== null}
				title="Remover vaga da lista?"
				confirmLabel="Remover vaga"
				onConfirm={() => confirmingRemoval && remove(confirmingRemoval.id)}
				onCancel={() => setConfirmingRemoval(null)}
			>
				{confirmingRemoval && (
					<>
						<p>
							<strong>{jobLabel(confirmingRemoval.code, confirmingRemoval.title, confirmingRemoval.company)}</strong>
						</p>
						<p>
							A vaga deixa de aparecer na lista e as análises antigas continuam salvas.
							{processes?.has(confirmingRemoval.id) && " O processo seletivo dela também deixa de ficar acessível."}
						</p>
					</>
				)}
			</ConfirmDialog>
		</>
	);
}
