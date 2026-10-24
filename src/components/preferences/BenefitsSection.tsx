import { BENEFIT_OPTIONS } from "../../lib/jobLabels";
import type { PreferenceForm } from "../../lib/preferenceForm";
import { AddOptionField } from "../AddOptionField";
import { ChoiceGroup } from "../ChoiceGroup";
import type { SectionProps } from "./sectionProps";

const BENEFIT_CHOICES = toChoices(BENEFIT_OPTIONS);

function toChoices(options: readonly string[]): Record<string, string> {
	return Object.fromEntries(options.map((option) => [option, option]));
}

type BenefitsSectionProps = SectionProps<PreferenceForm> & { onAddBenefit: (value: string) => void };

export function BenefitsSection({ form, onChange, onAddBenefit }: BenefitsSectionProps) {
	return (
		<section className="panel">
			<div className="panel-header">
				<h2>Benefícios</h2>
				<p>Procuramos cada benefício na lista extraída da vaga e no texto dela.</p>
			</div>
			<div className="panel-body">
				<ChoiceGroup
					legend="Benefícios que você quer"
					options={{ ...BENEFIT_CHOICES, ...toChoices(form.customBenefits) }}
					selected={form.benefits}
					onChange={(value) => onChange("benefits", value)}
				/>
				<AddOptionField label="Adicionar outro benefício" placeholder="Ex.: auxílio academia" onAdd={onAddBenefit} />
			</div>
		</section>
	);
}
