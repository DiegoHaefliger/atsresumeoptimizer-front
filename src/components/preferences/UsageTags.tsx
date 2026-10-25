export type Usage = "search" | "score";

const USAGE_TAGS: Record<Usage, { label: string; className: string; title: string }> = {
	search: { label: "Busca", className: "badge badge-info", title: "Define o que é procurado nos sites" },
	score: { label: "Nota", className: "badge badge-success", title: "Entra no cálculo da nota de aderência" },
};

export function UsageTags({ uses }: { uses: Usage[] }) {
	return (
		<span className="usage-tags">
			{uses.map((use) => (
				<span key={use} className={USAGE_TAGS[use].className} title={USAGE_TAGS[use].title}>
					{USAGE_TAGS[use].label}
				</span>
			))}
		</span>
	);
}
