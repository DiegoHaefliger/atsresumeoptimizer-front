import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet } from "../api/client";
import type { ResumeSummary } from "../api/types";
import { jobLabel } from "../lib/jobCode";
import type { Job } from "../lib/useJobs";
import { Dialog } from "./Dialog";
import { ResumeLibrary } from "./ResumeLibrary";

type JobResumesDialogProps = {
	job: Job | null;
	onClose: () => void;
};

export function JobResumesDialog({ job, onClose }: JobResumesDialogProps) {
	return (
		<Dialog open={job !== null} title={`Currículos gerados · ${job ? jobLabel(job.code, job.title, null) : ""}`} onClose={onClose} size="large">
			<div className="dialog-content">{job && <JobResumes key={job.id} jobId={job.id} />}</div>
		</Dialog>
	);
}

function JobResumes({ jobId }: { jobId: string }) {
	const [resumes, setResumes] = useState<ResumeSummary[] | null>(null);
	const [failed, setFailed] = useState(false);

	const load = useCallback(() => {
		apiGet<ResumeSummary[]>(`/api/v1/jobs/${jobId}/resumes`)
			.then((loaded) => {
				setFailed(false);
				setResumes(loaded);
			})
			.catch(() => setFailed(true));
	}, [jobId]);

	useEffect(load, [load]);

	async function deleteResume(resumeId: string) {
		await apiDelete(`/api/v1/resumes/${resumeId}`);
		load();
	}

	async function deleteVersion(resumeId: string, versionId: string) {
		await apiDelete(`/api/v1/resumes/${resumeId}/versions/${versionId}`);
		load();
	}

	return (
		<ResumeLibrary
			resumes={resumes}
			failed={failed}
			onRetry={load}
			onDelete={deleteResume}
			onDeleteVersion={deleteVersion}
			editable={false}
			emptyMessage="Nenhum currículo foi gerado para esta vaga ainda. Adapte um currículo a partir de uma análise dela."
		/>
	);
}
