import { useState } from "react";
import { apiPostJson, errorMessage } from "../api/client";
import type { InterviewQuestionSet } from "../api/types";
import { interviewQuestionsPath } from "../lib/jobAssistantPaths";
import { resumeLabelOf, type ResumeVersionOption } from "../lib/resumeVersionOptions";
import { useApiResource } from "../lib/useApiResource";
import { BusyLabel } from "./BusyLabel";
import { InterviewQuestionSetItem } from "./InterviewQuestionSetItem";
import { LoadFailed } from "./LoadFailed";
import { StateMessage } from "./StateMessage";

type InterviewQuestionsHistoryProps = {
	jobId: string;
	resumeVersionId: string;
	resumeOptions: ResumeVersionOption[];
};

export function InterviewQuestionsHistory({ jobId, resumeVersionId, resumeOptions }: InterviewQuestionsHistoryProps) {
	const path = interviewQuestionsPath(jobId);
	const { data: sets, setData, failed, reload } = useApiResource<InterviewQuestionSet[]>(path);
	const [generating, setGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function generate() {
		setGenerating(true);
		setError(null);
		try {
			const created = await apiPostJson<InterviewQuestionSet>(path, { resumeVersionId: resumeVersionId || undefined });
			setData((current) => [created, ...(current ?? [])]);
		} catch (err) {
			setError(errorMessage(err, "Não deu pra gerar as perguntas agora."));
		} finally {
			setGenerating(false);
		}
	}

	return (
		<section className="assistant-section">
			<div className="assistant-section-header">
				<div>
					<h2>Perguntas técnicas para a vaga</h2>
					<p className="field-hint">
						As 10 perguntas com mais chance de cair na entrevista, tiradas dos requisitos da vaga. Quando há currículo, a
						dica de resposta aponta qual experiência sua usar.
					</p>
				</div>
				<button type="button" onClick={generate} disabled={generating} aria-busy={generating}>
					<BusyLabel busy={generating} busyText="Pensando nas perguntas...">
						Gerar perguntas técnicas
					</BusyLabel>
				</button>
			</div>
			{error && <StateMessage variant="error" layout="inline" message={error} />}
			{failed ? (
				<LoadFailed message="Não deu pra carregar as perguntas." onRetry={reload} />
			) : sets === null ? null : sets.length === 0 ? (
				<p className="assistant-empty">Nenhuma pergunta gerada para esta vaga ainda.</p>
			) : (
				<div className="assistant-history">
					{sets.map((set, index) => (
						<InterviewQuestionSetItem
							key={set.id}
							set={set}
							resumeLabel={resumeLabelOf(resumeOptions, set.resumeVersionId)}
							open={index === 0}
						/>
					))}
				</div>
			)}
		</section>
	);
}
