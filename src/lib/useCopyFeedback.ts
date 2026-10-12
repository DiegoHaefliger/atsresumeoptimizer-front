import { useEffect, useState } from "react";

const COPIED_FEEDBACK_MS = 2000;

export function useCopyFeedback() {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) {
			return;
		}
		const timer = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
		return () => clearTimeout(timer);
	}, [copied]);

	async function copy(text: string) {
		await navigator.clipboard.writeText(text);
		setCopied(true);
	}

	return { copied, copy };
}
