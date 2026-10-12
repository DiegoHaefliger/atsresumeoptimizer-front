import { useState } from "react";
import { apiPostJson, errorMessage } from "../api/client";
import type { CoverLetter } from "../api/types";
import { coverLettersPath } from "../lib/jobAssistantPaths";
import { resumeLabelOf, type ResumeVersionOption } from "../lib/resumeVersionOptions";
import { useApiResource } from "../lib/useApiResource";
import { BusyLabel } from "./BusyLabel";
import { CoverLetterItem } from "./CoverLetterItem";
import { LoadFailed } from "./LoadFailed";
import { StateMessage } from "./StateMessage";

type CoverLetterHistoryProps = {
	jobId: string;
	resumeVersionId: string;
	resumeOptions: ResumeVersionOption[];
};

export function CoverLetterHistory({ jobId, resumeVersionId, resumeOptions }: CoverLetterHistoryProps) {
	const path = coverLettersPath(jobId);
	const { data: letters, setData, failed, reload } = useApiResource<CoverLetter[]>(path);
	const [generating, setGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function generate() {
		setGenerating(true);
		setError(null);
		try {
			const created = await apiPostJson<CoverLetter>(path, { resumeVersionId });
			setData((current) => [created, ...(current ?? [])]);
		} catch (err) {
			setError(errorMessage(err, "Não deu pra gerar a apresentação agora."));
		} finally {
			setGenerating(false);
		}
	}

	function replace(saved: CoverLetter) {
		setData((current) => (current ?? []).map((letter) => (letter.id === saved.id ? saved : letter)));
	}

	return (
		<section className="assistant-section">
			<div className="assistant-section-header">
				<div>
					<h2>Apresentação para a vaga</h2>
					<p className="field-hint">
						Para candidaturas que pedem uma carta ou um "fale sobre você": a IA liga o que a vaga pede às experiências do
						currículo escolhido, sem inventar nada. Cada geração fica no histórico.
					</p>
				</div>
				<button type="button" onClick={generate} disabled={generating || !resumeVersionId} aria-busy={generating}>
					<BusyLabel busy={generating} busyText="Escrevendo...">
						Gerar apresentação
					</BusyLabel>
				</button>
			</div>
			{error && <StateMessage variant="error" layout="inline" message={error} />}
			{failed ? (
				<LoadFailed message="Não deu pra carregar as apresentações." onRetry={reload} />
			) : letters === null ? null : letters.length === 0 ? (
				<p className="assistant-empty">Nenhuma apresentação gerada para esta vaga ainda.</p>
			) : (
				<div className="assistant-history">
					{letters.map((letter, index) => (
						<CoverLetterItem
							key={letter.id}
							path={path}
							letter={letter}
							resumeLabel={resumeLabelOf(resumeOptions, letter.resumeVersionId)}
							open={index === 0}
							onSaved={replace}
						/>
					))}
				</div>
			)}
		</section>
	);
}
