import type { ReadinessCheck, ReadinessStatus } from "./diagnosticsApi";

export function worstReadiness(checks: ReadinessCheck[]): ReadinessStatus {
	if (checks.some((check) => check.status === "FAILURE")) {
		return "FAILURE";
	}
	return checks.some((check) => check.status === "WARNING") ? "WARNING" : "OK";
}
