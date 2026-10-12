import { useState } from "react";
import { apiPostJson, errorMessage } from "../api/client";
import type { CandidateQuestionSet } from "../api/types";
import { candidateQuestionsPath } from "../lib/jobAssistantPaths";
import { useApiResource } from "../lib/useApiResource";
import { BusyLabel } from "./BusyLabel";
import { CandidateQuestionSetItem } from "./CandidateQuestionSetItem";
import { LoadFailed } from "./LoadFailed";
import { StateMessage } from "./StateMessage";

type CandidateQuestionsHistoryProps = {
	jobId: string;
};

export function CandidateQuestionsHistory({ jobId }: CandidateQuestionsHistoryProps) {
	const path = candidateQuestionsPath(jobId);
	const { data: sets, setData, failed, reload } = useApiResource<CandidateQuestionSet[]>(path);
	const [generating, setGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function generate() {
		setGenerating(true);
		setError(null);
		try {
			const created = await apiPostJson<CandidateQuestionSet>(path, {});
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
					<h2>Perguntas para fazer no fim da entrevista</h2>
					<p className="field-hint">
						Até 7 perguntas para o momento em que o recrutador abre espaço para dúvidas, pensadas a partir da descrição e
						dos benefícios da vaga, sem as perguntas óbvias.
					</p>
				</div>
				<button type="button" onClick={generate} disabled={generating} aria-busy={generating}>
					<BusyLabel busy={generating} busyText="Pensando nas perguntas...">
						Gerar perguntas
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
						<CandidateQuestionSetItem key={set.id} set={set} open={index === 0} />
					))}
				</div>
			)}
		</section>
	);
}
