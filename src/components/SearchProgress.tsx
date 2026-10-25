import type { SearchProgressCounts } from "../api/types";

type Props = { progress?: SearchProgressCounts };

export function SearchProgress({ progress }: Props) {
	const counts = [
		{ label: "Processadas", value: progress?.read ?? 0 },
		{ label: "Em Sugeridas", value: progress?.added ?? 0 },
		{ label: "Abaixo da aderência", value: progress?.belowAdherence ?? 0 },
	];
	return (
		<div className="search-progress" role="status" aria-live="polite">
			<div className="progress-bar" aria-hidden="true">
				<div className="progress-bar-fill" />
			</div>
			<p className="search-progress-text">
				Buscando nos sites selecionados
				<span className="search-progress-dots" aria-hidden="true">
					<span />
					<span />
					<span />
				</span>
			</p>
			<ul className="search-progress-counts">
				{counts.map((count) => (
					<li key={count.label}>
						<span className="search-progress-count">{count.value}</span>
						<span className="search-progress-count-label">{count.label}</span>
					</li>
				))}
			</ul>
			<p className="search-progress-hint">As vagas aparecem aqui conforme forem encontradas.</p>
		</div>
	);
}
