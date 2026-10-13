import { useState, type FormEvent } from "react";
import { errorMessage } from "../../api/client";
import { StateMessage } from "../StateMessage";

type GoogleCredentialsFormProps = {
	clientId: string | null;
	onSave: (clientId: string, clientSecret: string) => Promise<void>;
	onClear: () => Promise<void>;
};

export function GoogleCredentialsForm({ clientId, onSave, onClear }: GoogleCredentialsFormProps) {
	const [id, setId] = useState(clientId ?? "");
	const [secret, setSecret] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function run(action: () => Promise<void>, failure: string) {
		setError(null);
		setBusy(true);
		try {
			await action();
			setSecret("");
		} catch (err) {
			setError(errorMessage(err, failure));
		} finally {
			setBusy(false);
		}
	}

	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		run(() => onSave(id.trim(), secret.trim()), "Não deu pra salvar as credenciais. Tenta de novo.");
	}

	return (
		<form className="form google-credentials" onSubmit={handleSubmit}>
			<label>
				ID do cliente
				<input value={id} onChange={(event) => setId(event.target.value)} maxLength={255} autoComplete="off" required />
			</label>
			<label>
				Chave secreta
				<input
					type="password"
					value={secret}
					onChange={(event) => setSecret(event.target.value)}
					maxLength={512}
					autoComplete="off"
					placeholder={clientId ? "Já salva. Digite para trocar" : "Cole a chave aqui"}
					required
				/>
			</label>
			{error && <StateMessage variant="error" layout="inline" message={error} />}
			<div className="process-history-actions">
				<button type="submit" disabled={busy || !id.trim() || !secret.trim()} aria-busy={busy}>
					Salvar credenciais
				</button>
				{clientId && (
					<button
						type="button"
						className="btn-secondary"
						disabled={busy}
						onClick={() => run(onClear, "Não deu pra remover as credenciais. Tenta de novo.")}
					>
						Remover
					</button>
				)}
			</div>
		</form>
	);
}
