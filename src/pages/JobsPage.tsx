import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog } from "../components/Dialog";
import { JobPreview } from "../components/JobPreview";
import { JobsTable } from "../components/JobsTable";
import { StateMessage } from "../components/StateMessage";
import { useJobs, type Job } from "../lib/useJobs";

export function JobsPage() {
	const { jobs, failed, reload, remove } = useJobs();
	const [previewing, setPreviewing] = useState<Job | null>(null);
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
					onEdit={(job) => navigate(`/jobs/${job.id}/edit`)}
				/>
			)}
			<Dialog
				open={previewing !== null}
				title={previewing?.title ?? "Vaga sem título"}
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
