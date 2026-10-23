import type { PromptTemplateSummary } from "../api/types";
import { groupPrompts, promptLabel } from "../lib/promptInfo";

type PromptKeyListProps = {
	templates: PromptTemplateSummary[];
	selectedKey: string | null;
	onSelect: (key: string) => void;
};

export function PromptKeyList({ templates, selectedKey, onSelect }: PromptKeyListProps) {
	return (
		<div className="prompt-groups">
			{groupPrompts(templates).map((group) => (
				<section key={group.title} aria-label={group.title}>
					<h3 className="prompt-group-title">{group.title}</h3>
					<ul className="prompt-keys">
						{group.items.map((item) => (
							<li key={item.key}>
								<button
									type="button"
									className={`prompt-key${item.key === selectedKey ? " is-selected" : ""}`}
									aria-current={item.key === selectedKey}
									onClick={() => onSelect(item.key ?? "")}
								>
									<span>{promptLabel(item.key ?? "")}</span>
									<span className="prompt-key-version">v{item.version}</span>
								</button>
							</li>
						))}
					</ul>
				</section>
			))}
		</div>
	);
}
