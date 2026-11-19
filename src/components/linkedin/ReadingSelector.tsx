import { formatCapturedAt } from "../../lib/linkedinLabels";
import type { Reading } from "./useReadings";

const TITLES = { EXTENSION: "Leitura pela extensão", PDF: "PDF do perfil", TEXT: "Texto colado" } as const;
const NOTES = {
	EXTENSION: "Ao analisar, o perfil é lido de novo pela extensão.",
	PDF: "Sem foto, banner, recomendações, destaques e atividade recente.",
	TEXT: "",
} as const;

type ReadingSelectorProps = {
	readings: Reading[];
	selectedId: string | null;
	onSelect: (id: string) => void;
	onImportPdf: () => void;
	disabled: boolean;
};

export function ReadingSelector({ readings, selectedId, onSelect, onImportPdf, disabled }: ReadingSelectorProps) {
	if (readings.length === 0) {
		return null;
	}
	return (
		<fieldset className="panel panel-body reading-selector" disabled={disabled}>
			<legend>Leitura usada na análise</legend>
			{readings.map((reading, index) => (
				<label key={reading.id} className={`reading-option${reading.id === selectedId ? " reading-option-selected" : ""}`}>
					<input
						type="radio"
						name="linkedin-reading"
						value={reading.id}
						checked={reading.id === selectedId}
						onChange={() => onSelect(reading.id)}
					/>
					<span>
						<strong>{TITLES[reading.source]}</strong> · {formatCapturedAt(reading.capturedAt)}
						{index === 0 && readings.length > 1 && " · mais recente"}
						<br />
						<span className="field-hint">{NOTES[reading.source]}</span>
					</span>
				</label>
			))}
			<p className="field-hint">
				<button type="button" className="link" onClick={onImportPdf}>
					Importar outro PDF
				</button>
			</p>
		</fieldset>
	);
}
