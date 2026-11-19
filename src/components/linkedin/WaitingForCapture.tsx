import { SpinnerIcon } from "../icons";
import { ExtensionInstallSteps, ExtensionUpdateSteps } from "./ExtensionInstallSteps";
import { PdfImport } from "./PdfImport";
import { isMissingExtension, OUTDATED_EXTENSION_CODE, type RunPhase } from "./useAnalysisRun";

const LINKEDIN_OWN_PROFILE = "https://www.linkedin.com/in/me/";
const OPEN_LINKEDIN_CODES = new Set(["login-required", "no-profile"]);

const PAGE_ACTIONS: Record<string, string> = {
	profile: "Lendo o título, o Sobre, os destaques e a atividade",
	experience: "Lendo as experiências",
	education: "Lendo a formação",
	skills: "Lendo as competências",
	certifications: "Procurando certificações",
	languages: "Procurando idiomas",
	projects: "Lendo os projetos",
	publications: "Procurando publicações",
	recommendations: "Lendo as recomendações",
	recheck: "Conferindo uma seção que não carregou",
};

export function busyText(phase: RunPhase): string {
	if (phase.kind === "importing") {
		return "Lendo o PDF do seu perfil...";
	}
	if (phase.kind === "analyzing") {
		return "Analisando... pode levar um minuto";
	}
	if (phase.kind === "capturing" && phase.progress) {
		const action = phase.progress.page ? PAGE_ACTIONS[phase.progress.page] : undefined;
		return action ? `${action}...` : "Lendo o seu perfil no LinkedIn...";
	}
	return "Abrindo o LinkedIn...";
}

type WaitingForCaptureProps = {
	reason: string;
	code: string;
	onRetry: () => void;
	onImportPdf: (file: File) => void;
	onPaste: () => void;
	onCancel: () => void;
};

function title(code: string): string {
	if (code === OUTDATED_EXTENSION_CODE) {
		return "Atualize a extensão para ler o seu perfil";
	}
	return isMissingExtension(code) ? "Instale a extensão para ler o seu perfil sozinho" : "Não consegui ler o seu perfil";
}

function subtitle(code: string): string {
	return code === OUTDATED_EXTENSION_CODE
		? "A versão instalada lê o perfil incompleto. Depois de atualizar, a análise começa sozinha."
		: "Ela abre o seu perfil em segundo plano a cada análise. Instala uma vez só.";
}

function openLinkedIn() {
	window.open(LINKEDIN_OWN_PROFILE, "_blank", "noopener");
}

export function WaitingForCapture({ reason, code, onRetry, onImportPdf, onPaste, onCancel }: WaitingForCaptureProps) {
	const missingExtension = isMissingExtension(code);
	return (
		<section className="panel" aria-live="polite">
			<div className="panel-header">
				<h2>{title(code)}</h2>
				<p>{missingExtension ? subtitle(code) : reason}</p>
			</div>
			<div className="panel-body">
				{missingExtension ? (
					<>
						{code === OUTDATED_EXTENSION_CODE ? <ExtensionUpdateSteps /> : <ExtensionInstallSteps />}
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
				{missingExtension && (
					<>
						<h3>Ou, sem instalar nada: importe o PDF do seu perfil</h3>
						<PdfImport onImport={onImportPdf} busy={false} />
					</>
				)}
				<p className="field-hint">
					Também dá para{" "}
					<button type="button" className="link" onClick={onPaste}>
						colar o texto do seu perfil
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
