import type { PreferenceForm } from "../../lib/preferenceForm";
import type { SectionProps } from "./sectionProps";

export function PaySection({ form, onChange }: SectionProps<PreferenceForm>) {
	return (
		<section className="panel">
			<div className="panel-header">
				<h2>Remuneração</h2>
				<p>Valor mensal bruto. A vaga que paga o desejado atende; entre o mínimo e o desejado, atende em parte.</p>
			</div>
			<div className="panel-body">
				<div className="form-row">
					<label>
						Salário mínimo mensal (R$)
						<input
							type="number"
							inputMode="numeric"
							min={0}
							step={100}
							value={form.minSalary}
							onChange={(event) => onChange("minSalary", event.target.value)}
							placeholder="Ex.: 8000"
						/>
					</label>
					<label>
						Salário desejado mensal (R$)
						<input
							type="number"
							inputMode="numeric"
							min={0}
							step={100}
							value={form.desiredSalary}
							onChange={(event) => onChange("desiredSalary", event.target.value)}
							placeholder="Ex.: 10000"
						/>
					</label>
				</div>
			</div>
		</section>
	);
}
