type ChoiceGroupProps<T extends string> = {
	legend: string;
	options: Record<T, string>;
	selected: T[];
	onChange: (selected: T[]) => void;
};

export function ChoiceGroup<T extends string>({ legend, options, selected, onChange }: ChoiceGroupProps<T>) {
	function toggle(value: T) {
		onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
	}

	return (
		<fieldset className="choice-group">
			<legend>{legend}</legend>
			<div className="choice-group-options">
				{(Object.keys(options) as T[]).map((value) => (
					<label key={value} className={`choice-chip${selected.includes(value) ? " choice-chip-selected" : ""}`}>
						<input type="checkbox" checked={selected.includes(value)} onChange={() => toggle(value)} />
						{options[value]}
					</label>
				))}
			</div>
		</fieldset>
	);
}
