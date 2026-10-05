type SegmentedTabsProps<T extends string> = {
	label: string;
	options: { value: T; label: string }[];
	value: T;
	onChange: (value: NoInfer<T>) => void;
	spaced?: boolean;
};

export function SegmentedTabs<T extends string>({ label, options, value, onChange, spaced = false }: SegmentedTabsProps<T>) {
	return (
		<div className={`segmented${spaced ? " segmented-spaced" : ""}`} role="tablist" aria-label={label}>
			{options.map((option) => (
				<button
					key={option.value}
					type="button"
					role="tab"
					aria-selected={value === option.value}
					className={value === option.value ? "segmented-active" : undefined}
					onClick={() => onChange(option.value)}
				>
					{option.label}
				</button>
			))}
		</div>
	);
}
