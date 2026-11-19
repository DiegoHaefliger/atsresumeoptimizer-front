import { SpinnerIcon } from "../icons";
import { ExtensionInstallSteps } from "./ExtensionInstallSteps";
import { isMissingExtension, OUTDATED_EXTENSION_CODE, type RunPhase } from "./useAnalysisRun";

const LINKEDIN_OWN_PROFILE = "https://www.linkedin.com/in/me/";
const OPEN_LINKEDIN_CODES = new Set(["login-required", "no-profile"]);

export function busyText(phase: RunPhase): string {
	if (phase.kind === "analyzing") {
		return "Analisando... pode levar um minuto";
	}
	if (phase.kind === "capturing" && phase.progress) {
		return `Lendo o seu perfil no LinkedIn (${phase.progress.step} de ${phase.progress.total})...`;
	}
	return "Abrindo o LinkedIn...";
}

type WaitingForCaptureProps = {
	reason: string;
	code: string;
	onRetry: () => void;
	onPaste: () => void;
	onCancel: () => void;
};

function title(code: string): string {
	if (code === OUTDATED_EXTENSION_CODE) {
		return "Atualize a extensão para ler o seu perfil sozinho";
	}
	return isMissingExtension(code) ? "Instale a extensão para ler o seu perfil sozinho" : "Não consegui ler o seu perfil";
}

function subtitle(outdated: boolean): string {
	return outdated
		? "A versão instalada só lê a página que você abre. A nova abre o seu perfil em segundo plano a cada análise."
		: "Ela abre o seu perfil em segundo plano a cada análise. Instala uma vez só.";
}

function openLinkedIn() {
	window.open(LINKEDIN_OWN_PROFILE, "_blank", "noopener");
}

export function WaitingForCapture({ reason, code, onRetry, onPaste, onCancel }: WaitingForCaptureProps) {
	const missingExtension = isMissingExtension(code);
	const outdated = code === OUTDATED_EXTENSION_CODE;
	return (
		<section className="panel" aria-live="polite">
			<div className="panel-header">
				<h2>{title(code)}</h2>
				<p>{missingExtension ? subtitle(outdated) : reason}</p>
			</div>
			<div className="panel-body">
				{missingExtension ? (
					<>
						<ExtensionInstallSteps update={outdated} />
						<p className="field-hint">
							<SpinnerIcon /> Procurando a extensão. Assim que ela estiver pronta, a análise começa sozinha, sem precisar recarregar esta página.
						</p>
					</>
				) : (
					<>
						{OPEN_LINKEDIN_CODES.has(code) && (
							<p>Abra o LinkedIn, entre na sua conta e volte para esta aba. A leitura recomeça sozinha quando você voltar.</p>
						)}
						<div className="linkedin-actions">
							{OPEN_LINKEDIN_CODES.has(code) && (
								<button type="button" onClick={openLinkedIn}>
									Abrir o LinkedIn
								</button>
							)}
							<button type="button" className={OPEN_LINKEDIN_CODES.has(code) ? "btn-secondary" : undefined} onClick={onRetry}>
								Tentar de novo
							</button>
						</div>
					</>
				)}
				<p className="field-hint">
					Prefere não instalar nada?{" "}
					<button type="button" className="link" onClick={onPaste}>
						Cole o texto do seu perfil
					</button>
					. A análise começa quando a leitura chegar.{" "}
					<button type="button" className="link" onClick={onCancel}>
						Cancelar
					</button>
				</p>
			</div>
		</section>
	);
}
