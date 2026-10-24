import type { PreferenceForm } from "../../lib/preferenceForm";
import { TagInput } from "../TagInput";
import type { SectionProps } from "./sectionProps";

type TagFieldName = "locations" | "preferredCompanies" | "avoidedCompanies";

const FIELDS: { name: TagFieldName; label: string; placeholder: string }[] = [
	{ name: "locations", label: "Cidades aceitas (vagas híbridas ou presenciais)", placeholder: "Ex.: Curitiba, São Paulo" },
	{ name: "preferredCompanies", label: "Empresas preferidas", placeholder: "Ex.: Nubank, Itaú" },
	{ name: "avoidedCompanies", label: "Empresas que você quer evitar", placeholder: "Ex.: Acme" },
];

export function PlacesSection({ form, onChange }: SectionProps<PreferenceForm>) {
	return (
		<section className="panel">
			<div className="panel-header">
				<h2>Local e empresas</h2>
				<p>A cidade só conta pra vagas híbridas ou presenciais.</p>
			</div>
			<div className="panel-body">
				{FIELDS.map((field) => (
					<TagInput
						key={field.name}
						label={field.label}
						placeholder={field.placeholder}
						values={form[field.name]}
						onChange={(values) => onChange(field.name, values)}
					/>
				))}
			</div>
		</section>
	);
}
