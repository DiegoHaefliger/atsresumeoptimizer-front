type PageTabsProps<T extends string> = {
	label: string;
	options: { value: T; label: string }[];
	value: T;
	onChange: (value: NoInfer<T>) => void;
};

export function PageTabs<T extends string>({ label, options, value, onChange }: PageTabsProps<T>) {
	return (
		<div className="page-tabs" role="tablist" aria-label={label}>
			{options.map((option) => (
				<button
					key={option.value}
					type="button"
					role="tab"
					aria-selected={value === option.value}
					className="page-tab"
					onClick={() => onChange(option.value)}
				>
					{option.label}
				</button>
			))}
		</div>
	);
}
