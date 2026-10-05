import { BriefcaseIcon, ClipboardCheckIcon } from "./icons";

export type AnalysisKind = "job" | "general";

const OPTIONS: { value: AnalysisKind; title: string; description: string }[] = [
	{
		value: "job",
		title: "Para uma vaga",
		description: "Compara o currículo com a vaga: palavras-chave, requisitos e senioridade, além das checagens de ATS.",
	},
	{
		value: "general",
		title: "Avaliação geral, sem vaga",
		description: "Avalia só o currículo: leitura por ATS, estrutura, contato, qualidade dos tópicos e português.",
	},
];

type AnalysisModeChoiceProps = {
	value: AnalysisKind;
	onChange: (kind: AnalysisKind) => void;
};

export function AnalysisModeChoice({ value, onChange }: AnalysisModeChoiceProps) {
	return (
		<div className="mode-grid" role="radiogroup" aria-label="Tipo de análise">
			{OPTIONS.map((option) => {
				const selected = value === option.value;
				const Icon = option.value === "job" ? BriefcaseIcon : ClipboardCheckIcon;
				return (
					<label key={option.value} className={`mode-card${selected ? " mode-card-selected" : ""}`}>
						<input
							type="radio"
							name="analysis-kind"
							value={option.value}
							checked={selected}
							onChange={() => onChange(option.value)}
						/>
						<span className="mode-card-head">
							<Icon className="mode-card-icon" />
							<span className="mode-card-title">{option.title}</span>
						</span>
						<span className="mode-card-desc">{option.description}</span>
					</label>
				);
			})}
		</div>
	);
}
