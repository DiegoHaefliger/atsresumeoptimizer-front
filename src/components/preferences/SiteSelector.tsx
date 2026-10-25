import type { SearchSite } from "../../api/types";
import { SEARCH_SITE_LABELS } from "../../lib/jobLabels";
import { ALL_SEARCH_SITES } from "../../lib/preferenceForm";
import { UsageTags } from "./UsageTags";

const SITE_HINTS: Record<SearchSite, string> = {
	LINKEDIN: "Vagas do LinkedIn. Respeita cidade, modelo, senioridade e período.",
	GUPY: "Portal de grandes empresas. Traz até 12 vagas por busca.",
	PROGRAMATHOR: "Foco em tecnologia. Busca pela tecnologia da palavra-chave.",
	INFOJOBS: "Vagas de todas as áreas, com descrição completa. Até 20 por página.",
	VAGAS: "Vagas de todas as áreas. Traz poucas vagas por busca.",
	REMOTAR: "Só vagas 100% remotas ou híbridas, de várias áreas. Até 50 por página.",
};

type SiteSelectorProps = {
	selected: SearchSite[];
	onChange: (selected: SearchSite[]) => void;
};

export function SiteSelector({ selected, onChange }: SiteSelectorProps) {
	function toggle(site: SearchSite) {
		onChange(selected.includes(site) ? selected.filter((item) => item !== site) : [...selected, site]);
	}

	return (
		<fieldset className="site-selector">
			<legend>
				Sites da busca
				<UsageTags uses={["search"]} />
			</legend>
			<div className="site-selector-head">
				<p className="site-selector-count">
					{selected.length === 0
						? "Nenhum site ativo. Ative ao menos um para poder buscar."
						: `${selected.length} de ${ALL_SEARCH_SITES.length} sites ativos`}
				</p>
				<div className="site-selector-actions">
					<button type="button" className="btn-small btn-secondary" onClick={() => onChange(ALL_SEARCH_SITES)}>
						Ativar todos
					</button>
					<button type="button" className="btn-small btn-secondary" onClick={() => onChange([])}>
						Desativar todos
					</button>
				</div>
			</div>
			<div className="site-selector-list">
				{ALL_SEARCH_SITES.map((site) => (
					<label key={site} className="toggle-option">
						<input type="checkbox" role="switch" checked={selected.includes(site)} onChange={() => toggle(site)} />
						<span className="toggle-switch" aria-hidden="true" />
						<span className="toggle-option-text">
							<span className="toggle-option-title">{SEARCH_SITE_LABELS[site]}</span>
							<span className="toggle-option-desc">{SITE_HINTS[site]}</span>
						</span>
					</label>
				))}
			</div>
		</fieldset>
	);
}
