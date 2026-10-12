import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { errorMessage } from "../api/client";
import { startAnalysis } from "../lib/analysisApi";
import { BusyLabel } from "./BusyLabel";
import { Dialog } from "./Dialog";
import type { SavedResumeSelection } from "./SavedResumePicker";
import { StateMessage } from "./StateMessage";

export type ResumeToAnalyze = SavedResumeSelection & { title: string; version: number };

type AnalyzeResumeDialogProps = {
	resume: ResumeToAnalyze | null;
	onClose: () => void;
};

export function AnalyzeResumeDialog({ resume, onClose }: AnalyzeResumeDialogProps) {
	return (
		<Dialog
			open={resume !== null}
			title={resume ? `Analisar · ${resume.title} (versão ${resume.version})` : ""}
			onClose={onClose}
			size="medium"
		>
			{resume && <AnalyzeResume key={resume.versionId} resume={resume} />}
		</Dialog>
	);
}

function AnalyzeResume({ resume }: { resume: ResumeToAnalyze }) {
	const [targetRole, setTargetRole] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	async function analyze() {
		setError(null);
		setSubmitting(true);
		try {
			navigate(`/analyses/${await startAnalysis(resume, { targetRole: targetRole.trim() || undefined })}`);
		} catch (err) {
			setError(errorMessage(err, "Não deu pra iniciar a análise. Tenta de novo."));
			setSubmitting(false);
		}
	}

	return (
		<div className="dialog-content analyze-dialog">
			<section className="analyze-dialog-section" aria-labelledby="analyze-resume-target">
				<h3 id="analyze-resume-target" className="analyze-dialog-title">
					Avaliação geral, sem vaga
				</h3>
				<p className="field-hint">
					Avalia só o currículo: leitura por ATS, estrutura, contato, qualidade dos tópicos e português.
				</p>
				<label>
					<span>Cargo-alvo (opcional)</span>
					<input
						value={targetRole}
						onChange={(event) => setTargetRole(event.target.value)}
						placeholder="Ex.: Desenvolvedor Backend Java"
					/>
					<span className="field-hint">
						Usado pra montar um perfil típico do cargo e orientar a reescrita depois. A nota continua sendo a da
						avaliação geral.
					</span>
				</label>
				{error && <StateMessage variant="error" layout="inline" message={error} />}
				<div className="form-actions">
					<button type="button" onClick={analyze} disabled={submitting} aria-busy={submitting}>
						<BusyLabel busy={submitting} busyText="Iniciando...">
							Fazer avaliação geral
						</BusyLabel>
					</button>
				</div>
			</section>
		</div>
	);
}
