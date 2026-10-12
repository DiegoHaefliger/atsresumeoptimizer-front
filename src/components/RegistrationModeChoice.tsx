import { PencilIcon, UploadCloudIcon } from "./icons";

export type RegistrationMode = "upload" | "compose";

const OPTIONS: { value: RegistrationMode; title: string; description: string }[] = [
	{
		value: "upload",
		title: "Enviar arquivo",
		description: "Já tem o currículo pronto? Envie o PDF, DOCX ou ODT e o sistema extrai o conteúdo.",
	},
	{
		value: "compose",
		title: "Criar no sistema",
		description: "Monte o currículo aqui, seção por seção, escolhendo o modelo visual.",
	},
];

type RegistrationModeChoiceProps = {
	value: RegistrationMode;
	onChange: (mode: RegistrationMode) => void;
};

export function RegistrationModeChoice({ value, onChange }: RegistrationModeChoiceProps) {
	return (
		<div className="mode-grid" role="radiogroup" aria-label="Como cadastrar">
			{OPTIONS.map((option) => {
				const selected = value === option.value;
				const Icon = option.value === "upload" ? UploadCloudIcon : PencilIcon;
				return (
					<label key={option.value} className={`mode-card${selected ? " mode-card-selected" : ""}`}>
						<input
							type="radio"
							name="registration-mode"
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
