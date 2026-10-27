import { BusyLabel } from "./BusyLabel";

export type BulkAction = "promote" | "discard";

type SuggestionBulkBarProps = {
	visible: number;
	selected: number;
	busy: BulkAction | null;
	onToggleAll: (checked: boolean) => void;
	onPromote: () => void;
	onDiscard: () => void;
};

export function SuggestionBulkBar({ visible, selected, busy, onToggleAll, onPromote, onDiscard }: SuggestionBulkBarProps) {
	const allSelected = visible > 0 && selected === visible;

	return (
		<div className="suggestion-bulk-bar" role="group" aria-label="Ações em várias vagas">
			<label className="checkbox-row">
				<input
					type="checkbox"
					checked={allSelected}
					disabled={busy !== null || visible === 0}
					onChange={(event) => onToggleAll(event.target.checked)}
				/>
				<span>{selected > 0 ? `${selected} ${selected === 1 ? "selecionada" : "selecionadas"}` : "Selecionar todas"}</span>
			</label>
			<div className="suggestion-buttons">
				<button type="button" className="btn-small btn-secondary" disabled={selected === 0 || busy !== null} aria-busy={busy === "discard"} onClick={onDiscard}>
					<BusyLabel busy={busy === "discard"} busyText="Descartando...">Descartar selecionadas</BusyLabel>
				</button>
				<button type="button" className="btn-small" disabled={selected === 0 || busy !== null} aria-busy={busy === "promote"} onClick={onPromote}>
					<BusyLabel busy={busy === "promote"} busyText="Promovendo...">Promover selecionadas</BusyLabel>
				</button>
			</div>
		</div>
	);
}
