import { useEffect, useState } from "react";

const STORAGE_KEY = "ats-onboarding-dismissed";
const CHANGE_EVENT = "ats-onboarding-dismissed-change";

function read(): boolean {
	try {
		return localStorage.getItem(STORAGE_KEY) === "true";
	} catch {
		return false;
	}
}

export function setOnboardingDismissed(dismissed: boolean) {
	try {
		if (dismissed) {
			localStorage.setItem(STORAGE_KEY, "true");
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	} catch {
		return;
	} finally {
		window.dispatchEvent(new Event(CHANGE_EVENT));
	}
}

export function useOnboardingDismissed(): boolean {
	const [dismissed, setDismissed] = useState(read);
	useEffect(() => {
		const sync = () => setDismissed(read());
		window.addEventListener(CHANGE_EVENT, sync);
		return () => window.removeEventListener(CHANGE_EVENT, sync);
	}, []);
	return dismissed;
}
