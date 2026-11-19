import { useEffect, useState } from "react";
import { fetchAvailableVersion, probeExtension, type ExtensionProbe } from "../../lib/linkedinExtension";

const RECHECK_MS = 3000;

export type ExtensionState = (ExtensionProbe & { availableVersion: string | null }) | null;

export function useExtensionStatus(): ExtensionState {
	const [probe, setProbe] = useState<ExtensionState>(null);

	useEffect(() => {
		let active = true;
		async function check() {
			const [next, availableVersion] = await Promise.all([probeExtension(), fetchAvailableVersion()]);
			if (active) {
				setProbe({ ...next, availableVersion });
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
