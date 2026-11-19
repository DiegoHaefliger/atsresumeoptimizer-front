import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiPostJson, errorMessage } from "../api/client";
import type { LinkedInCaptureResponse } from "../api/linkedinTypes";
import { BusyLabel } from "../components/BusyLabel";
import { StateMessage } from "../components/StateMessage";
import {
	capturedSections,
	detailUrl,
	DRAFT_SECTION_LABELS,
	loadDraft,
	mergeCapture,
	missingSections,
	parseFragment,
	saveDraft,
	type LinkedInDraft,
} from "../lib/linkedinDraft";
import { SECTION_LABELS } from "../lib/linkedinLabels";

const BOOKMARKLET_PATH = "/api/v1/linkedin/snapshots/bookmarklet";

export function LinkedInReceivePage() {
	const [draft, setDraft] = useState<LinkedInDraft>(() => loadDraft());
	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState<LinkedInCaptureResponse | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const capture = parseFragment(window.location.hash);
		if (capture) {
			const merged = mergeCapture(loadDraft(), capture);
			saveDraft(merged);
			setDraft(merged);
			window.history.replaceState(null, "", window.location.pathname);
		}
	}, []);

	async function send() {
		setSending(true);
		setError(null);
		try {
			setSent(await apiPostJson<LinkedInCaptureResponse>(BOOKMARKLET_PATH, { profile: draft.profile }));
			saveDraft(null);
		} catch (err) {
			setError(errorMessage(err, "Não deu pra enviar o perfil. Tenta de novo."));
		} finally {
			setSending(false);
		}
	}

	function clear() {
		saveDraft(null);
		setDraft(loadDraft());
	}

	const captured = capturedSections(draft);
	const missing = missingSections(draft);

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">LinkedIn</span>
					<h1>Leitura do seu perfil</h1>
					<p className="page-subtitle">O favorito leu a página do LinkedIn que estava aberta. Confira o que veio e envie para o app.</p>
				</div>
			</header>
			<div className="settings-main">
				{sent ? (
					<SentMessage sent={sent} />
				) : captured.length === 0 ? (
					<StateMessage variant="empty" message="Nenhuma leitura recebida ainda. Abra o seu perfil no LinkedIn e clique no favorito “Ler meu LinkedIn”." />
				) : (
					<section className="panel">
						<div className="panel-header">
							<h2>O que foi lido</h2>
						</div>
						<div className="panel-body">
							<div className="keyword-pills">
								{captured.map((key) => (
									<span key={key} className="keyword-pill keyword-pill-found">
										{DRAFT_SECTION_LABELS[key]}
									</span>
								))}
							</div>
							{missing.length > 0 && (
								<>
									<p className="field-hint">Ainda não lido (abra a página no LinkedIn e clique no favorito de novo):</p>
									<div className="keyword-pills">
										{missing.map((key) => (
											<MissingSection key={key} label={DRAFT_SECTION_LABELS[key]} href={detailUrl(draft.profile.profileUrl, key)} />
										))}
									</div>
								</>
							)}
							{error && <StateMessage variant="error" message={error} />}
							<div className="linkedin-actions">
								<button type="button" onClick={() => void send()} disabled={sending} aria-busy={sending}>
									<BusyLabel busy={sending} busyText="Enviando...">
										Enviar e analisar
									</BusyLabel>
								</button>
								<button type="button" className="btn-secondary" onClick={clear} disabled={sending}>
									Limpar leitura
								</button>
							</div>
						</div>
					</section>
				)}
			</div>
		</div>
	);
}

function MissingSection({ label, href }: { label: string; href: string | null }) {
	if (!href) {
		return <span className="keyword-pill keyword-pill-missing">{label}</span>;
	}
	return (
		<a className="keyword-pill keyword-pill-missing" href={href} target="_blank" rel="noopener noreferrer">
			{label}
		</a>
	);
}

function SentMessage({ sent }: { sent: LinkedInCaptureResponse }) {
	const changed = sent.changedSections.map((section) => SECTION_LABELS[section]).join(", ");
	return (
		<>
			<StateMessage
				variant="empty"
				message={
					sent.unchanged
						? "Perfil enviado. Nada mudou desde a última leitura."
						: `Perfil enviado.${changed ? ` Mudou: ${changed}.` : ""}`
				}
			/>
			<p>
				A análise começa sozinha na tela do LinkedIn que estiver esperando. Se não houver nenhuma aberta,{" "}
				<Link to="/linkedin">vá para a análise</Link> e clique em Analisar: ela usa uma leitura feita nos últimos 10 minutos.
			</p>
		</>
	);
}
