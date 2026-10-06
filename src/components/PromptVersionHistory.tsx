import type { PromptTemplateSummary } from "../api/types";

type PromptVersionHistoryProps = {
	versions: PromptTemplateSummary[];
	latestVersion: number | null;
	viewing: number | null;
	onSelect: (version: number) => void;
};

const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

export function PromptVersionHistory({ versions, latestVersion, viewing, onSelect }: PromptVersionHistoryProps) {
	return (
		<ul className="prompt-versions">
			{versions.map((item) => (
				<li key={item.version}>
					<button
						type="button"
						className={`prompt-version${item.version === viewing ? " is-selected" : ""}`}
						onClick={() => onSelect(item.version ?? 0)}
					>
						<span className="prompt-version-number">v{item.version}</span>
						{item.version === latestVersion && <span className="badge badge-success">em uso</span>}
						<span className="prompt-version-date">
							{item.createdAt ? DATE_FORMAT.format(new Date(item.createdAt)) : ""}
						</span>
					</button>
				</li>
			))}
		</ul>
	);
}
