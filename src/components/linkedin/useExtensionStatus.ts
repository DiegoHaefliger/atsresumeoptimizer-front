import { useEffect, useState } from "react";
import { checkExtension, type ExtensionStatus } from "../../lib/linkedinExtension";

const RECHECK_MS = 3000;

export function useExtensionStatus(): ExtensionStatus | null {
	const [status, setStatus] = useState<ExtensionStatus | null>(null);

	useEffect(() => {
		let active = true;
		async function probe() {
			const next = await checkExtension();
			if (active) {
				setStatus(next);
			}
		}
		void probe();
		const timer = window.setInterval(() => {
			if (document.visibilityState === "visible") {
				void probe();
			}
		}, RECHECK_MS);
		return () => {
			active = false;
			window.clearInterval(timer);
		};
	}, []);

	return status;
}
