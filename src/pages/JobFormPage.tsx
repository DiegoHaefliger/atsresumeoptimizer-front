import { Link, useNavigate } from "react-router-dom";
import { apiPostJson } from "../api/client";
import { ArrowLeftIcon } from "../components/icons";
import { JobForm } from "../components/JobForm";
import { EMPTY_JOB, jobRequest, type JobDraft } from "../lib/jobDraft";

export function JobFormPage() {
	const navigate = useNavigate();

	async function save(draft: JobDraft) {
		await apiPostJson("/api/v1/jobs", jobRequest(draft));
		navigate("/jobs");
	}

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Vagas</span>
					<h1>Cadastrar vaga</h1>
					<p className="page-subtitle">
						Cole o anúncio completo. A IA extrai título, requisitos e condições pra usar nas análises.
					</p>
				</div>
				<Link to="/jobs" className="page-back">
					<ArrowLeftIcon /> Voltar
				</Link>
			</header>
			<JobForm initial={EMPTY_JOB} submitLabel="Cadastrar vaga" onSave={save} />
		</div>
	);
}
