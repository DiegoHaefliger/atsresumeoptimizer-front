import { useState, type FormEvent } from "react";
import { apiPutJson, errorMessage } from "../api/client";
import type { KeywordsPanelView } from "../api/types";
import { BusyLabel } from "./BusyLabel";
import { ConfirmDialog } from "./ConfirmDialog";
import { StateMessage } from "./StateMessage";
import { XIcon } from "./icons";

type KeywordsEditorProps = {
	analysisId: string;
	keywords: KeywordsPanelView;
	onSaved: () => void;
};

type Tone = "found" | "missing" | "semantic" | "pending";

const MAX_MAIN_KEYWORDS = 10;

function toneOf(term: string, keywords: KeywordsPanelView): Tone {
	if (keywords.found?.includes(term)) {
		return "found";
	}
	if (keywords.semanticOnly?.includes(term)) {
		return "semantic";
	}
	return keywords.missing?.includes(term) ? "missing" : "pending";
}

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((item, index) => item === b[index]);

export function KeywordsEditor({ analysisId, keywords, onSaved }: KeywordsEditorProps) {
	const initialTerms = keywords.terms ?? [];
	const initialSelected = keywords.selected ?? [];
	const [terms, setTerms] = useState(initialTerms);
	const [selected, setSelected] = useState(initialSelected);
	const [draft, setDraft] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [confirmingDiscard, setConfirmingDiscard] = useState(false);

	const dirty = !sameList(terms, initialTerms) || !sameList(selected, initialSelected);
	const main = terms.filter((term) => selected.includes(term));
	const others = terms.filter((term) => !selected.includes(term));
	const mainFull = main.length >= MAX_MAIN_KEYWORDS;

	function toggle(term: string) {
		setSelected((current) => {
			if (current.includes(term)) {
				return current.filter((item) => item !== term);
			}
			return current.length < MAX_MAIN_KEYWORDS ? [...current, term] : current;
		});
	}

	function remove(term: string) {
		setTerms((current) => current.filter((item) => item !== term));
		setSelected((current) => current.filter((item) => item !== term));
	}

	function add(event: FormEvent) {
		event.preventDefault();
		const term = draft.trim();
		if (term && !terms.some((item) => item.toLowerCase() === term.toLowerCase())) {
			setTerms((current) => [...current, term]);
		}
		setDraft("");
	}

	async function save() {
		setSaving(true);
		setError(null);
		try {
			await apiPutJson(`/api/v1/analyses/${analysisId}/keywords`, { keywords: terms, selected });
			onSaved();
		} catch (err) {
			setError(errorMessage(err, "Não deu pra salvar as palavras-chave."));
		} finally {
			setSaving(false);
		}
	}

	function renderGroup(label: string, hint: string, items: string[], isMain: boolean) {
		return (
			<div>
				<span className="keyword-group-label">{label}</span>
				<p className="field-hint">{hint}</p>
				<div className="keyword-pills">
					{items.length > 0 ? (
						items.map((term) => (
							<span className={`keyword-pill keyword-pill-${toneOf(term, keywords)} keyword-pill-editable`} key={term}>
								<button
									type="button"
									className="keyword-pill-label"
									onClick={() => toggle(term)}
									disabled={!isMain && mainFull}
									title={isMain ? "Mover para Outras" : mainFull ? `Limite de ${MAX_MAIN_KEYWORDS} principais` : "Tornar principal"}
								>
									{term}
								</button>
								<button
									type="button"
									className="keyword-pill-remove"
									onClick={() => (isMain ? toggle(term) : remove(term))}
									aria-label={isMain ? `Mover ${term} para Outras` : `Remover ${term}`}
									title={isMain ? "Mover para Outras" : "Remover da lista"}
								>
									<XIcon />
								</button>
							</span>
						))
					) : (
						<span className="keyword-empty">Nenhuma</span>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="keyword-groups">
			{renderGroup(
				`Principais (${main.length}/${MAX_MAIN_KEYWORDS})`,
				`Estas guiam a adaptação do currículo; escolha até ${MAX_MAIN_KEYWORDS}. O × move a palavra para Outras, sem apagá-la.`,
				main,
				true,
			)}
			{renderGroup("Outras", "Entram na nota da análise, mas não são destacadas nos cargos. Clique na palavra para torná-la principal; o × apaga da lista.", others, false)}
			<form className="keyword-add" onSubmit={add}>
				<input
					value={draft}
					onChange={(event) => setDraft(event.target.value)}
					placeholder="Adicionar palavra-chave"
					aria-label="Nova palavra-chave"
					maxLength={100}
				/>
				<button type="submit" className="btn-secondary btn-small" disabled={!draft.trim()}>
					Adicionar
				</button>
			</form>
			{error && <StateMessage variant="error" message={error} />}
			{dirty && (
				<div className="form-actions">
					<button type="button" onClick={save} disabled={saving}>
						<BusyLabel busy={saving} busyText="Reavaliando...">
							Salvar e reavaliar
						</BusyLabel>
					</button>
					<button
						type="button"
						className="btn-secondary"
						onClick={() => setConfirmingDiscard(true)}
						disabled={saving}
					>
						Descartar
					</button>
				</div>
			)}
			<ConfirmDialog
				open={confirmingDiscard}
				title="Descartar alterações?"
				confirmLabel="Descartar"
				onConfirm={() => {
					setTerms(initialTerms);
					setSelected(initialSelected);
					setConfirmingDiscard(false);
				}}
				onCancel={() => setConfirmingDiscard(false)}
			>
				<p>As mudanças nas palavras-chave que você ainda não salvou serão perdidas.</p>
			</ConfirmDialog>
		</div>
	);
}
