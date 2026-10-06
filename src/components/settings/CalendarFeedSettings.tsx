import { useState } from "react";
import { apiUrl, errorMessage } from "../../api/client";
import { useCalendarFeed } from "../../lib/useCalendarFeed";
import { ConfirmDialog } from "../ConfirmDialog";
import { StateMessage } from "../StateMessage";

type PendingAction = "regenerate" | "disable";

export function CalendarFeedSettings() {
	const { info, failed, reload, regenerate, disable } = useCalendarFeed();
	const [pending, setPending] = useState<PendingAction | null>(null);
	const [busy, setBusy] = useState(false);
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function run(action: () => Promise<void>, failure: string) {
		setError(null);
		setBusy(true);
		setCopied(false);
		try {
			await action();
			setPending(null);
		} catch (err) {
			setError(errorMessage(err, failure));
		} finally {
			setBusy(false);
		}
	}

	async function copy(url: string) {
		await navigator.clipboard.writeText(url);
		setCopied(true);
	}

	if (failed) {
		return (
			<fieldset className="job-details">
				<legend>Assinar a agenda</legend>
				<StateMessage variant="error" layout="inline" message="Não deu pra carregar o link da agenda." />
				<button type="button" className="btn-secondary btn-small" onClick={reload}>
					Tentar de novo
				</button>
			</fieldset>
		);
	}
	const feedUrl = info?.enabled && info.path ? apiUrl(info.path) : null;

	return (
		<fieldset className="job-details" disabled={busy || !info}>
			<legend>Assinar a agenda</legend>
			<p className="field-hint">
				Gere um link e cole no Google Agenda (Outras agendas, Por URL), no Outlook ou no Apple Calendar para ver seus
				agendamentos lá. O serviço de agenda precisa conseguir acessar este servidor pela internet. Quem tiver o link vê
				seus agendamentos, então não compartilhe.
			</p>
			{feedUrl && (
				<div className="feed-url">
					<input readOnly value={feedUrl} aria-label="Link da agenda" onFocus={(event) => event.target.select()} />
					<button type="button" className="btn-secondary" onClick={() => copy(feedUrl)}>
						{copied ? "Link copiado" : "Copiar link"}
					</button>
				</div>
			)}
			{error && <StateMessage variant="error" layout="inline" message={error} />}
			<div className="process-history-actions">
				{feedUrl ? (
					<>
						<button type="button" className="btn-secondary" onClick={() => setPending("regenerate")}>
							Gerar novo link
						</button>
						<button type="button" className="btn-secondary" onClick={() => setPending("disable")}>
							Desativar
						</button>
					</>
				) : (
					<button
						type="button"
						onClick={() => run(regenerate, "Não deu pra gerar o link. Tenta de novo.")}
						aria-busy={busy}
					>
						Gerar link
					</button>
				)}
			</div>
			<ConfirmDialog
				open={pending !== null}
				title={pending === "disable" ? "Desativar o link da agenda?" : "Gerar um novo link?"}
				confirmLabel={pending === "disable" ? "Desativar" : "Gerar novo link"}
				busy={busy}
				onConfirm={() =>
					pending === "disable"
						? run(disable, "Não deu pra desativar o link. Tenta de novo.")
						: run(regenerate, "Não deu pra gerar o link. Tenta de novo.")
				}
				onCancel={() => setPending(null)}
			>
				<p>
					O link atual para de funcionar. Agendas que já assinaram com ele deixam de atualizar
					{pending === "regenerate" ? " até você assinar de novo com o link novo." : "."}
				</p>
			</ConfirmDialog>
		</fieldset>
	);
}
