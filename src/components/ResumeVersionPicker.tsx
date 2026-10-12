import type { ResumeVersionOption } from "../lib/resumeVersionOptions";

type ResumeVersionPickerProps = {
	options: ResumeVersionOption[];
	value: string;
	onChange: (versionId: string) => void;
};

export function ResumeVersionPicker({ options, value, onChange }: ResumeVersionPickerProps) {
	if (options.length === 0) {
		return (
			<p className="field-hint">
				Nenhum currículo foi adaptado para esta vaga ainda. As perguntas técnicas saem só dos requisitos da vaga; para a
				apresentação, adapte um currículo a partir de uma análise dela.
			</p>
		);
	}
	if (options.length === 1) {
		return (
			<p className="assistant-resume-single">
				Currículo usado: <strong>{options[0].label}</strong>
			</p>
		);
	}
	return (
		<label>
			Currículo usado pela IA
			<select value={value} onChange={(event) => onChange(event.target.value)}>
				{options.map((option) => (
					<option key={option.versionId} value={option.versionId}>
						{option.label}
					</option>
				))}
			</select>
		</label>
	);
}
