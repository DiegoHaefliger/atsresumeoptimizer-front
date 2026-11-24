import { useState } from "react";
import type { KeyGuide } from "../../lib/apiKeyGuides";
import { Badge } from "../Badge";

type ApiKeyGuideProps = {
	guide: KeyGuide;
	providerLabel: string;
	open: boolean;
};

export function ApiKeyGuide({ guide, providerLabel, open }: ApiKeyGuideProps) {
	const [copied, setCopied] = useState(false);

	async function copyCommand(command: string) {
		await navigator.clipboard.writeText(command);
		setCopied(true);
	}

	return (
		<details className="key-guide" open={open}>
			<summary>
				Como conseguir o acesso ao {providerLabel}
				<Badge tone={guide.costTone}>{guide.cost}</Badge>
			</summary>
			<a href={guide.keyUrl} target="_blank" rel="noopener noreferrer" className="key-guide-open">
				{guide.keyUrlLabel} ↗
			</a>
			<ol className="key-guide-steps">
				{guide.steps.map((step, index) => (
					<li key={step}>
						{step}
						{guide.command?.afterStep === index && (
							<span className="google-guide-copy">
								<code>{guide.command.text}</code>
								<button type="button" className="btn-secondary btn-small" onClick={() => copyCommand(guide.command?.text ?? "")}>
									{copied ? "Copiado" : "Copiar"}
								</button>
							</span>
						)}
					</li>
				))}
			</ol>
			{guide.keyPrefix && (
				<p className="field-hint">
					A chave certa começa com <code>{guide.keyPrefix}</code>. Trate-a como senha: não compartilhe com ninguém.
				</p>
			)}
			{guide.note && <p className="field-hint">{guide.note}</p>}
		</details>
	);
}
