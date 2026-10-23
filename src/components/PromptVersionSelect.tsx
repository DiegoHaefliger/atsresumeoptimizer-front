import type { PromptTemplateSummary } from "../api/types";

type PromptVersionSelectProps = {
	versions: PromptTemplateSummary[];
	latestVersion: number | null;
	viewing: number | null;
	onSelect: (version: number) => void;
};

const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

export function PromptVersionSelect({ versions, latestVersion, viewing, onSelect }: PromptVersionSelectProps) {
	return (
		<label className="prompt-version-select">
			Versão
			<select value={viewing ?? ""} onChange={(event) => onSelect(Number(event.target.value))}>
				{versions.map((item) => (
					<option key={item.version} value={item.version}>
						v{item.version}
						{item.version === latestVersion ? " (em uso)" : ""}
						{item.createdAt ? ` · ${DATE_FORMAT.format(new Date(item.createdAt))}` : ""}
					</option>
				))}
			</select>
		</label>
	);
}
