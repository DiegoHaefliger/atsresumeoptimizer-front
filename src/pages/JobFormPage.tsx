import { Link, useNavigate } from "react-router-dom";
import { apiPostJson } from "../api/client";
import type { JobCreatedResponse } from "../api/types";
import { ArrowLeftIcon } from "../components/icons";
import { JobForm } from "../components/JobForm";
import { EMPTY_JOB, jobRequest, type JobDraft } from "../lib/jobDraft";
import type { JobsPageState } from "./JobsPage";

export function JobFormPage() {
	const navigate = useNavigate();

	async function save(draft: JobDraft) {
		const created = await apiPostJson<JobCreatedResponse>("/api/v1/jobs", jobRequest(draft));
		const state: JobsPageState = { analyzeJobId: created.id };
		navigate("/jobs", { state });
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
