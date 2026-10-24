import { criteriaSummary, type PreferenceForm, type PreferenceSection } from "../../lib/preferenceForm";

type CriteriaSummaryProps = {
	form: PreferenceForm;
	onSelect: (section: PreferenceSection) => void;
};

export function CriteriaSummary({ form, onSelect }: CriteriaSummaryProps) {
	const criteria = criteriaSummary(form);
	const active = criteria.filter((criterion) => criterion.active).length;
	return (
		<div className="panel">
			<div className="panel-header">
				<h2>Critérios da nota</h2>
				<p>
					{active} de {criteria.length} critérios na nota. Só os preenchidos entram no cálculo.
				</p>
			</div>
			<div className="panel-body">
				<ul className="criteria-summary">
					{criteria.map((criterion) => (
						<li key={criterion.label}>
							<button type="button" className="criteria-summary-link" onClick={() => onSelect(criterion.section)}>
								{criterion.label}
							</button>
							<span className={`criteria-summary-state${criterion.active ? " criteria-summary-state-active" : ""}`}>
								{criterion.active ? "Na nota" : "Fora da nota"}
							</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
