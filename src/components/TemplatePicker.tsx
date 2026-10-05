import type { ResumeTemplate } from "../api/types";

const TEMPLATE_OPTIONS: { value: ResumeTemplate; label: string; description: string }[] = [
	{ value: "CLASSIC", label: "Clássico", description: "Layout tradicional, direto ao ponto." },
	{ value: "MODERN_BLUE", label: "Modern Blue", description: "Visual mais moderno, com destaque em azul." },
];

type TemplatePickerProps = {
	value: ResumeTemplate;
	onChange: (template: ResumeTemplate) => void;
};

export function TemplatePicker({ value, onChange }: TemplatePickerProps) {
	return (
		<div className="template-grid">
			{TEMPLATE_OPTIONS.map((option) => {
				const selected = value === option.value;
				return (
					<label key={option.value} className={`template-card${selected ? " template-card-selected" : ""}`}>
						<input
							type="radio"
							name="template"
							value={option.value}
							checked={selected}
							onChange={() => onChange(option.value)}
						/>
						<div className={`template-swatch template-swatch-${option.value.toLowerCase()}`} />
						<span className="template-card-title">{option.label}</span>
						<span className="template-card-desc">{option.description}</span>
					</label>
				);
			})}
		</div>
	);
}
