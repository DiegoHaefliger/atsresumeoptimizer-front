import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { errorMessage } from "../api/client";
import { FeedbackAttachments } from "../components/FeedbackAttachments";
import { CheckCircleIcon, LockIcon, SpinnerIcon } from "../components/icons";
import { StarRating } from "../components/StarRating";
import { submitFeedback, type FeedbackReceipt } from "../lib/feedbackApi";
import { canSubmit, EMPTY_DRAFT, MAX_MESSAGE, MESSAGE_PLACEHOLDER, toRequest, type FeedbackDraft } from "../lib/feedbackForm";
import { markRated } from "../lib/feedbackPrompt";
import { useAppVersion } from "../lib/useAppVersion";

export function FeedbackPage() {
	const navigate = useNavigate();
	const appVersion = useAppVersion()?.current ?? null;
	const [draft, setDraft] = useState<FeedbackDraft>(EMPTY_DRAFT);
	const [files, setFiles] = useState<File[]>([]);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [receipt, setReceipt] = useState<FeedbackReceipt | null>(null);
	const message = draft.message;

	async function submit(event: FormEvent) {
		event.preventDefault();
		if (!canSubmit(draft) || busy) {
			return;
		}
		setBusy(true);
		setError(null);
		try {
			setReceipt(await submitFeedback(toRequest(draft, appVersion), files));
			markRated(appVersion);
		} catch (failure) {
			setError(errorMessage(failure, "Não foi possível enviar agora. Tente de novo."));
		} finally {
			setBusy(false);
		}
	}

	function restart() {
		setDraft(EMPTY_DRAFT);
		setFiles([]);
		setReceipt(null);
	}

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Avaliar</span>
					<h1>Avalie o ATS Resume Optimizer</h1>
					<p className="page-subtitle">
						Sua opinião vai direto para quem desenvolve o app. Leva menos de um minuto e ajuda a decidir o que melhorar
						primeiro.
					</p>
				</div>
			</header>

			{receipt ? (
				<section className="panel feedback-done">
					<CheckCircleIcon className="feedback-done-icon" />
					<h2>{receipt.delivered ? "Obrigado pela sua avaliação!" : "Avaliação salva neste computador"}</h2>
					<p>
						{receipt.delivered
							? "Ela já chegou ao desenvolvedor."
							: "Não deu para enviar agora, mas o app tenta de novo na próxima avaliação."}
					</p>
					<div className="form-actions">
						<button type="button" onClick={() => navigate("/jobs")}>
							Voltar ao app
						</button>
						<button type="button" className="btn-secondary" onClick={restart}>
							Enviar outra avaliação
						</button>
					</div>
				</section>
			) : (
				<form className="settings-layout" onSubmit={submit}>
					<div className="settings-main">
						<section className="panel">
							<div className="panel-header">
								<h2>Como foi sua experiência?</h2>
								<p>Dê uma nota de 1 a 5 estrelas.</p>
							</div>
							<div className="panel-body">
								<StarRating value={draft.rating} onChange={(rating) => setDraft({ ...draft, rating })} disabled={busy} />
							</div>
						</section>

						<section className="panel">
							<div className="panel-header">
								<h2>Comentários</h2>
								<p>Opcional. Elogio, crítica, sugestão ou relato de uso: tudo ajuda.</p>
							</div>
							<div className="panel-body">
								<div className="form-field">
									<textarea
										rows={7}
										maxLength={MAX_MESSAGE}
										value={message}
										placeholder={MESSAGE_PLACEHOLDER}
										aria-label="Comentários (opcional)"
										disabled={busy}
										onChange={(event) => setDraft({ ...draft, message: event.target.value })}
									/>
									<span className="feedback-counter">
										{message.length}/{MAX_MESSAGE}
									</span>
								</div>
								<label className="checkbox-row">
									<input
										type="checkbox"
										checked={draft.allowPublish}
										disabled={busy || message.trim() === ""}
										onChange={(event) => setDraft({ ...draft, allowPublish: event.target.checked })}
									/>
									Autorizo divulgar este comentário no projeto
								</label>
							</div>
						</section>

						<section className="panel">
							<div className="panel-header">
								<h2>Prints da tela</h2>
								<p>Opcional. Ajudam a entender um problema ou uma sugestão.</p>
							</div>
							<div className="panel-body">
								<FeedbackAttachments files={files} onChange={setFiles} disabled={busy} />
							</div>
						</section>

						<section className="panel">
							<div className="panel-header">
								<h2>Quer receber uma resposta?</h2>
								<p>Opcional. Só usamos o e-mail para responder a esta avaliação.</p>
							</div>
							<div className="panel-body">
								<input
									type="email"
									value={draft.contact}
									maxLength={200}
									placeholder="seu@email.com"
									aria-label="E-mail para resposta"
									disabled={busy}
									onChange={(event) => setDraft({ ...draft, contact: event.target.value })}
								/>
							</div>
						</section>
					</div>

					<aside className="settings-aside">
						<div className="panel">
							<div className="panel-header">
								<h2>Enviar</h2>
								<p>{draft.rating === 0 ? "Escolha uma nota para enviar." : "Tudo pronto para enviar."}</p>
							</div>
							<div className="panel-body">
								<p className="feedback-privacy">
									<LockIcon />
									<span>
										Enviamos só a nota, o texto, os prints, a versão do app e o e-mail, se preenchido. Nenhum
										currículo, vaga ou chave de IA sai do seu computador.
									</span>
								</p>
								{error && (
									<p className="field-error" role="alert">
										{error}
									</p>
								)}
								<div className="settings-actions">
									<button type="submit" disabled={!canSubmit(draft) || busy} aria-busy={busy}>
										{busy && <SpinnerIcon />} Enviar avaliação
									</button>
								</div>
							</div>
						</div>
					</aside>
				</form>
			)}
		</div>
	);
}
