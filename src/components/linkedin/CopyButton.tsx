import { useState } from "react";
import { CheckCircleIcon, CopyIcon } from "../icons";

const FEEDBACK_MS = 2000;

export function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
	const [copied, setCopied] = useState(false);

	async function copy() {
		await navigator.clipboard.writeText(text);
		setCopied(true);
		window.setTimeout(() => setCopied(false), FEEDBACK_MS);
	}

	return (
		<button type="button" className="btn-secondary btn-small" onClick={copy}>
			{copied ? <CheckCircleIcon /> : <CopyIcon />} {copied ? "Copiado" : label}
		</button>
	);
}
