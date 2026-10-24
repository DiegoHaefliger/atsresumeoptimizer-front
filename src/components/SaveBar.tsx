import { BusyLabel } from "./BusyLabel";
import { StateMessage } from "./StateMessage";

type SaveBarProps = {
	label: string;
	saveText: string;
	savedText: string;
	dirty: boolean;
	saving: boolean;
	saved: boolean;
	error: string | null;
	onDiscard: () => void;
};

export function SaveBar({ label, saveText, savedText, dirty, saving, saved, error, onDiscard }: SaveBarProps) {
	return (
		<div className="save-bar" role="region" aria-label={label}>
			<div className="save-bar-status">
				{error && <StateMessage variant="error" layout="inline" message={error} />}
				{!error && dirty && <p className="save-bar-dirty">Você tem alterações não salvas.</p>}
				{!error && !dirty && saved && (
					<p className="form-success" role="status">
						{savedText}
					</p>
				)}
			</div>
			<div className="save-bar-actions">
				<button type="button" className="btn-secondary" disabled={!dirty || saving} onClick={onDiscard}>
					Descartar
				</button>
				<button type="submit" disabled={!dirty || saving} aria-busy={saving}>
					<BusyLabel busy={saving} busyText="Salvando...">{saveText}</BusyLabel>
				</button>
			</div>
		</div>
	);
}
