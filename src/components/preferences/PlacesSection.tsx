import type { PreferenceForm } from "../../lib/preferenceForm";
import { TagInput } from "../TagInput";
import { UsageTags, type Usage } from "./UsageTags";
import type { SectionProps } from "./sectionProps";

type TagFieldName = "locations" | "preferredCompanies" | "avoidedCompanies";

const FIELDS: { name: TagFieldName; label: string; placeholder: string; uses: Usage[] }[] = [
	{ name: "locations", label: "Cidades aceitas (vagas híbridas ou presenciais)", placeholder: "Ex.: Curitiba, São Paulo", uses: ["search", "score"] },
	{ name: "preferredCompanies", label: "Empresas preferidas", placeholder: "Ex.: Nubank, Itaú", uses: ["score"] },
	{ name: "avoidedCompanies", label: "Empresas que você quer evitar", placeholder: "Ex.: Acme", uses: ["score"] },
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
						tags={<UsageTags uses={field.uses} />}
						placeholder={field.placeholder}
						values={form[field.name]}
						onChange={(values) => onChange(field.name, values)}
					/>
				))}
			</div>
		</section>
	);
}
