import type { RunPhase } from "./useAnalysisRun";

export function busyText(phase: RunPhase): string {
	if (phase.kind === "analyzing") {
		return "Analisando... pode levar um minuto";
	}
	if (phase.kind === "capturing" && phase.progress) {
		return `Lendo o seu perfil no LinkedIn (${phase.progress.step} de ${phase.progress.total})...`;
	}
	return "Abrindo o LinkedIn...";
}

type WaitingForCaptureProps = { reason: string; onGoTo: () => void; onCancel: () => void };

export function WaitingForCapture({ reason, onGoTo, onCancel }: WaitingForCaptureProps) {
	return (
		<section className="panel" aria-live="polite">
			<div className="panel-header">
				<h2>Falta ler o seu perfil de novo</h2>
				<p>{reason}</p>
			</div>
			<div className="panel-body">
				<p>
					Toda análise parte de uma leitura nova do seu perfil. Leia o perfil pela extensão ou cole o texto em Dados do LinkedIn. A análise começa
					sozinha assim que a leitura chegar.
				</p>
				<div className="linkedin-actions">
					<button type="button" onClick={onGoTo}>
						Ver como ler o perfil
					</button>
					<button type="button" className="btn-secondary" onClick={onCancel}>
						Cancelar
					</button>
				</div>
			</div>
		</section>
	);
}
