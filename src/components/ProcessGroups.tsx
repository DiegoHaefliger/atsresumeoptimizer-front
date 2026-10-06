import { useMemo } from "react";
import type { SelectionProcess } from "../api/types";
import { ProcessCard } from "./ProcessCard";
import { ExternalLinkIcon } from "./icons";

type ProcessGroupsProps = {
	processes: SelectionProcess[];
	onMove: (process: SelectionProcess) => void;
	onRemove: (process: SelectionProcess) => void;
};

function groupByJob(processes: SelectionProcess[]): SelectionProcess[][] {
	const groups = new Map<string, SelectionProcess[]>();
	for (const process of processes) {
		groups.set(process.jobPostingId, [...(groups.get(process.jobPostingId) ?? []), process]);
	}
	return [...groups.values()];
}

export function ProcessGroups({ processes, onMove, onRemove }: ProcessGroupsProps) {
	const groups = useMemo(() => groupByJob(processes), [processes]);
	return (
		<div className="process-groups">
			{groups.map(([first, ...others]) => (
				<section key={first.jobPostingId} className="panel process-group" aria-label={first.jobTitle ?? "Vaga sem título"}>
					<header className="process-group-header">
						<div>
							<h2 className="process-group-title">{first.jobTitle ?? "Vaga sem título"}</h2>
							{first.company && <span className="process-card-meta">{first.company}</span>}
						</div>
						<div className="process-group-side">
							{first.jobUrl && (
								<a href={first.jobUrl} target="_blank" rel="noopener noreferrer" className="link process-card-link">
									Link da vaga <ExternalLinkIcon />
								</a>
							)}
							<span className="process-group-count">
								{others.length + 1} {others.length === 0 ? "processo" : "processos"}
							</span>
						</div>
					</header>
					{[first, ...others].map((process) => (
						<ProcessCard key={process.id} process={process} onMove={onMove} onRemove={onRemove} />
					))}
				</section>
			))}
		</div>
	);
}
