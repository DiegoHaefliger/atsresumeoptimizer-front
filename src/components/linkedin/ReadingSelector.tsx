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
	const current = readings.find((reading) => reading.id === selectedId);
	return (
		<fieldset className="reading-selector" disabled={disabled}>
			<legend>Leitura usada na análise</legend>
			<div className="reading-options">
				{readings.map((reading, index) => (
					<label
						key={reading.id}
						className={`reading-option${reading.id === selectedId ? " reading-option-selected" : ""}`}
					>
						<input
							type="radio"
							name="linkedin-reading"
							value={reading.id}
							checked={reading.id === selectedId}
							onChange={() => onSelect(reading.id)}
						/>
						<span>
							<strong>{TITLES[reading.source]}</strong>
							<span className="reading-option-date">
								{formatCapturedAt(reading.capturedAt)}
								{index === 0 && readings.length > 1 && " · mais recente"}
							</span>
						</span>
					</label>
				))}
			</div>
			<p className="field-hint">
				{current && NOTES[current.source]}{" "}
				<button type="button" className="link" onClick={onImportPdf}>
					Importar outro PDF
				</button>
			</p>
		</fieldset>
	);
}
