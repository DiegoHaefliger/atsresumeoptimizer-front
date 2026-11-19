import { useEffect, useState } from "react";
import { probeExtension, type ExtensionProbe } from "../../lib/linkedinExtension";

const RECHECK_MS = 3000;

export function useExtensionStatus(): ExtensionProbe | null {
	const [probe, setProbe] = useState<ExtensionProbe | null>(null);

	useEffect(() => {
		let active = true;
		async function check() {
			const next = await probeExtension();
			if (active) {
				setProbe(next);
			}
		}
		void check();
		const timer = window.setInterval(() => {
			if (document.visibilityState === "visible") {
				void check();
			}
		}, RECHECK_MS);
		return () => {
			active = false;
			window.clearInterval(timer);
		};
	}, []);

	return probe;
}
