import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { ResumeSummary } from "../api/types";
import { CandidateQuestionsHistory } from "../components/CandidateQuestionsHistory";
import { CoverLetterHistory } from "../components/CoverLetterHistory";
import { InterviewQuestionsHistory } from "../components/InterviewQuestionsHistory";
import { JobCode } from "../components/JobCode";
import { ResumeVersionPicker } from "../components/ResumeVersionPicker";
import { PageTabs } from "../components/PageTabs";
import { Skeleton } from "../components/Skeleton";
import { StateMessage } from "../components/StateMessage";
import { ArrowLeftIcon } from "../components/icons";
import { jobResumesPath } from "../lib/jobAssistantPaths";
import { resumeVersionOptions } from "../lib/resumeVersionOptions";
import { useApiResource } from "../lib/useApiResource";
import { useJobs } from "../lib/useJobs";

type AssistantTab = "questions" | "cover-letter" | "doubts";

const TABS: { value: AssistantTab; label: string }[] = [
	{ value: "questions", label: "Perguntas técnicas" },
	{ value: "cover-letter", label: "Apresentação" },
	{ value: "doubts", label: "Perguntas Entrevista - Dúvidas" },
];

export function JobAssistantPage() {
	const { jobId = "" } = useParams<{ jobId: string }>();
	const { jobs, failed: jobsFailed } = useJobs();
	const { data: resumes, failed: resumesFailed } = useApiResource<ResumeSummary[]>(jobResumesPath(jobId));
	const [tab, setTab] = useState<AssistantTab>("questions");
	const [pickedVersionId, setPickedVersionId] = useState<string | null>(null);
	const job = jobs?.find((candidate) => candidate.id === jobId) ?? null;
	const options = useMemo(() => resumeVersionOptions(resumes ?? []), [resumes]);
	const resumeVersionId = pickedVersionId ?? options[0]?.versionId ?? "";

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Assistente da vaga</span>
					<h1>{job ? <><JobCode code={job.code} /> {job.title ?? "Vaga sem título"}</> : "Assistente da vaga"}</h1>
					{job?.company && <p className="page-subtitle">{job.company}</p>}
				</div>
				<Link to="/jobs" className="page-back">
					<ArrowLeftIcon /> Voltar
				</Link>
			</header>

			{jobsFailed || resumesFailed || (jobs !== null && !job) ? (
				<StateMessage
					variant="error"
					layout="page"
					message="Não deu pra carregar essa vaga."
					action={{ label: "Voltar pras vagas", to: "/jobs" }}
				/>
			) : !job || resumes === null ? (
				<div className="form" role="status" aria-busy="true">
					<span className="sr-only">Carregando vaga...</span>
					<Skeleton width="100%" height={240} radius="var(--radius-lg)" />
				</div>
			) : (
				<section className="panel panel-body assistant">
					{tab !== "doubts" && (
						<ResumeVersionPicker options={options} value={resumeVersionId} onChange={setPickedVersionId} />
					)}
					<PageTabs label="O que gerar" options={TABS} value={tab} onChange={setTab} />
					{tab === "questions" ? (
						<InterviewQuestionsHistory jobId={job.id} resumeVersionId={resumeVersionId} resumeOptions={options} />
					) : tab === "doubts" ? (
						<CandidateQuestionsHistory jobId={job.id} />
					) : (
						<CoverLetterHistory jobId={job.id} resumeVersionId={resumeVersionId} resumeOptions={options} />
					)}
				</section>
			)}
		</div>
	);
}
