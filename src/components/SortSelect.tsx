type SortSelectProps<T extends string> = {
	value: T;
	options: readonly { value: T; label: string }[];
	onChange: (value: T) => void;
};

export function SortSelect<T extends string>({ value, options, onChange }: SortSelectProps<T>) {
	return (
		<label>
			<span className="job-filters-label">Ordenar por</span>
			<select value={value} onChange={(event) => onChange(event.target.value as T)}>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</label>
	);
}
