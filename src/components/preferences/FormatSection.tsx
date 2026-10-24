import { CONTRACT_TYPE_LABELS, SENIORITY_OPTIONS, WORK_MODEL_LABELS } from "../../lib/jobLabels";
import type { PreferenceForm } from "../../lib/preferenceForm";
import { ChoiceGroup } from "../ChoiceGroup";
import type { SectionProps } from "./sectionProps";

const SENIORITY_CHOICES = Object.fromEntries(SENIORITY_OPTIONS.map((option) => [option, option]));

export function FormatSection({ form, onChange }: SectionProps<PreferenceForm>) {
	return (
		<section className="panel">
			<div className="panel-header">
				<h2>Formato da vaga</h2>
				<p>Como e em que nível você quer trabalhar. Pode marcar mais de uma opção.</p>
			</div>
			<div className="panel-body">
				<ChoiceGroup
					legend="Modelos de trabalho aceitos"
					options={WORK_MODEL_LABELS}
					selected={form.workModels}
					onChange={(value) => onChange("workModels", value)}
				/>
				<ChoiceGroup
					legend="Tipos de contrato aceitos"
					options={CONTRACT_TYPE_LABELS}
					selected={form.contractTypes}
					onChange={(value) => onChange("contractTypes", value)}
				/>
				<ChoiceGroup
					legend="Senioridade"
					options={SENIORITY_CHOICES}
					selected={form.seniorities}
					onChange={(value) => onChange("seniorities", value)}
				/>
			</div>
		</section>
	);
}
