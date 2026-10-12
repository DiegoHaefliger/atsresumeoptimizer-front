import { apiGet } from "../api/client";

const POLL_INTERVAL_MS = 1000;
const FIRST_POLL_DELAY_MS = 2500;
const GIVE_UP_AFTER_MS = 120_000;

// Aba em segundo plano tem timer atrasado pelo navegador; voltar para ela acorda a espera na hora.
function delay(ms: number) {
	return new Promise<void>((resolve) => {
		const wake = () => {
			if (document.visibilityState === "visible") {
				done();
			}
		};
		const done = () => {
			clearTimeout(timer);
			document.removeEventListener("visibilitychange", wake);
			resolve();
		};
		const timer = setTimeout(done, ms);
		document.addEventListener("visibilitychange", wake);
	});
}

export async function waitForRestart(): Promise<boolean> {
	await delay(FIRST_POLL_DELAY_MS);
	const deadline = Date.now() + GIVE_UP_AFTER_MS;
	while (Date.now() < deadline) {
		try {
			await apiGet("/api/v1/app/version");
			return true;
		} catch {
			await delay(POLL_INTERVAL_MS);
		}
	}
	return false;
}
