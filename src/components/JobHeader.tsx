import { Link, NavLink, useLocation } from "react-router-dom";
import type { SelectionProcess } from "../api/types";
import type { Job } from "../lib/useJobs";
import { BackLink } from "./BackLink";
import { JobCode } from "./JobCode";
import { PencilIcon } from "./icons";
import { StageAge } from "./StageAge";
import { StageBadge } from "./StageBadge";

const SECTIONS = [
	{ path: "summary", label: "Resumo" },
	{ path: "preview", label: "Descrição" },
	{ path: "process", label: "Processo seletivo" },
	{ path: "assistant", label: "Assistente" },
	{ path: "cost", label: "Custo de IA" },
] as const;

type JobHeaderProps = {
	jobId: string;
	job: Job | null;
	process?: SelectionProcess | null;
};

export function JobHeader({ jobId, job, process }: JobHeaderProps) {
	const { state } = useLocation();
	return (
		<div className="job-header">
			<header className="page-header job-header-top">
				<div>
					<span className="eyebrow">Vaga</span>
					<h1>{job ? <><JobCode code={job.code} /> {job.title ?? "Vaga sem título"}</> : "Carregando vaga..."}</h1>
					{job && (job.company || process) && (
						<p className="page-subtitle job-header-subtitle">
							{job.company}
							{process && <StageBadge stage={process.stage} />}
							{process && <StageAge process={process} />}
						</p>
					)}
				</div>
				<div className="page-header-actions">
					<Link to={`/jobs/${jobId}/edit`} className="page-back" aria-label="Editar vaga" title="Editar vaga">
						<PencilIcon />
					</Link>
					<BackLink fallback="/jobs" />
				</div>
			</header>
			<nav className="page-tabs job-header-nav" aria-label="Seções da vaga">
				{SECTIONS.map((section) => (
					<NavLink key={section.path} to={`/jobs/${jobId}/${section.path}`} state={state} className="page-tab">
						{section.label}
					</NavLink>
				))}
			</nav>
		</div>
	);
}
