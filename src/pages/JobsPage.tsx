import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog } from "../components/Dialog";
import { JobResumesDialog } from "../components/JobResumesDialog";
import { JobPreview } from "../components/JobPreview";
import { JobsTable } from "../components/JobsTable";
import { StateMessage } from "../components/StateMessage";
import { jobLabel } from "../lib/jobCode";
import { useJobs, type Job } from "../lib/useJobs";

export function JobsPage() {
	const { jobs, failed, reload, remove } = useJobs();
	const [previewing, setPreviewing] = useState<Job | null>(null);
	const [viewingResumes, setViewingResumes] = useState<Job | null>(null);
	const navigate = useNavigate();

	return (
		<div className="page jobs-page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Vagas</span>
					<h1>Vagas cadastradas</h1>
					<p className="page-subtitle">
						Cadastre as vagas que te interessam. Elas ficam disponíveis pra analisar qualquer currículo e são
						cruzadas com suas preferências.
					</p>
				</div>
				<Link to="/jobs/new" className="button-link">
					Cadastrar vaga
				</Link>
			</header>

			{jobs !== null && jobs.length === 0 && !failed ? (
				<StateMessage
					variant="empty"
					layout="page"
					message="Nenhuma vaga cadastrada ainda."
					action={{ label: "Cadastrar a primeira vaga", to: "/jobs/new" }}
				/>
			) : (
				<JobsTable
					jobs={jobs}
					failed={failed}
					onRetry={reload}
					onRemove={remove}
					onPreview={setPreviewing}
					onResumes={setViewingResumes}
					onEdit={(job) => navigate(`/jobs/${job.id}/edit`)}
				/>
			)}
			<JobResumesDialog job={viewingResumes} onClose={() => setViewingResumes(null)} />
			<Dialog
				open={previewing !== null}
				title={previewing ? jobLabel(previewing.code, previewing.title, null) : ""}
				onClose={() => setPreviewing(null)}
				size="large"
			>
				<div className="dialog-content">
					<JobPreview job={previewing} />
				</div>
			</Dialog>
		</div>
	);
}
