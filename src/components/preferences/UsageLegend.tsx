import { UsageTags } from "./UsageTags";

export function UsageLegend() {
	return (
		<div className="usage-legend">
			<p className="usage-legend-item">
				<UsageTags uses={["search"]} />
				<span>Define o que é procurado nos sites, como cargo, cidade e período.</span>
			</p>
			<p className="usage-legend-item">
				<UsageTags uses={["score"]} />
				<span>Entra no cálculo da aderência, que decide se a vaga aparece em Sugeridas ou em Abaixo da aderência.</span>
			</p>
		</div>
	);
}
