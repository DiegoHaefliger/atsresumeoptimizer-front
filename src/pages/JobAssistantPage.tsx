import { useMemo, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import type { ResumeSummary } from "../api/types";
import { CandidateQuestionsHistory } from "../components/CandidateQuestionsHistory";
import { CoverLetterHistory } from "../components/CoverLetterHistory";
import { InterviewQuestionsHistory } from "../components/InterviewQuestionsHistory";
import { JobHeader } from "../components/JobHeader";
import { ResumeVersionPicker } from "../components/ResumeVersionPicker";
import { PageTabs } from "../components/PageTabs";
import { Skeleton } from "../components/Skeleton";
import { StateMessage } from "../components/StateMessage";
import { assistantTabFromParam, jobResumesPath, type AssistantTab } from "../lib/jobAssistantPaths";
import { resumeVersionOptions } from "../lib/resumeVersionOptions";
import { useApiResource } from "../lib/useApiResource";
import { useJobs } from "../lib/useJobs";

const TABS: { value: AssistantTab; label: string }[] = [
	{ value: "cover-letter", label: "Apresentação" },
	{ value: "questions", label: "Perguntas técnicas" },
	{ value: "doubts", label: "Dúvidas para a entrevista" },
];

export function JobAssistantPage() {
	const { jobId = "" } = useParams<{ jobId: string }>();
	const { jobs, failed: jobsFailed } = useJobs();
	const { data: resumes, failed: resumesFailed } = useApiResource<ResumeSummary[]>(jobResumesPath(jobId));
	const [searchParams, setSearchParams] = useSearchParams();
	const { state } = useLocation();
	const tab = assistantTabFromParam(searchParams.get("tab"));
	const [pickedVersionId, setPickedVersionId] = useState<string | null>(null);
	const job = jobs?.find((candidate) => candidate.id === jobId) ?? null;
	const options = useMemo(() => resumeVersionOptions(resumes ?? []), [resumes]);
	const resumeVersionId = pickedVersionId ?? options[0]?.versionId ?? "";

	function selectTab(next: AssistantTab) {
		setSearchParams({ tab: next }, { replace: true, state });
	}

	return (
		<div className="page">
			<JobHeader jobId={jobId} job={job} />

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
					<PageTabs label="O que gerar" options={TABS} value={tab} onChange={selectTab} />
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
