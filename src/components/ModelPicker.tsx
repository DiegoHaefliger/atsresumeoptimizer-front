import { useState } from "react";

const CUSTOM_OPTION = "__custom__";

type ModelPickerProps = {
	label: string;
	models: string[];
	value: string;
	onChange: (value: string) => void;
	emptyLabel?: string;
};

export function ModelPicker({ label, models, value, onChange, emptyLabel }: ModelPickerProps) {
	const [typing, setTyping] = useState(false);
	const custom = typing || (value !== "" && !models.includes(value));

	return (
		<label>
			{label}
			<select
				value={custom ? CUSTOM_OPTION : value}
				onChange={(event) => {
					const selected = event.target.value;
					setTyping(selected === CUSTOM_OPTION);
					if (selected !== CUSTOM_OPTION) {
						onChange(selected);
					}
				}}
			>
				{emptyLabel && <option value="">{emptyLabel}</option>}
				{!emptyLabel && value === "" && <option value="">Escolha um modelo</option>}
				{models.map((model) => (
					<option key={model} value={model}>
						{model}
					</option>
				))}
				<option value={CUSTOM_OPTION}>Outro (digitar o nome)</option>
			</select>
			{custom && (
				<input
					value={value}
					onChange={(event) => onChange(event.target.value)}
					placeholder="Nome exato do modelo"
					aria-label={`${label} (nome digitado)`}
				/>
			)}
		</label>
	);
}
