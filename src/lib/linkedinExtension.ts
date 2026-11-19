import type { LinkedInCaptureResponse } from "../api/linkedinTypes";

const APP = "ats-app";
const EXTENSION = "ats-extension";
const PING_TIMEOUT_MS = 1200;
const CAPTURE_TIMEOUT_MS = 180_000;

export const MIN_EXTENSION_VERSION = "0.2.2";

export type ExtensionStatus = "missing" | "outdated" | "current";

export type CaptureProgress = { step: number; total: number };

export class CaptureFailedError extends Error {
	readonly code: string;

	constructor(message: string, code: string) {
		super(message);
		this.code = code;
	}
}

type ExtensionMessage = {
	source: typeof EXTENSION;
	id?: string;
	type: string;
	step?: number;
	total?: number;
	snapshot?: LinkedInCaptureResponse;
	code?: string;
	message?: string;
	version?: string;
};

let counter = 0;

function nextId(): string {
	counter += 1;
	return `${Date.now()}-${counter}`;
}

function post(message: Record<string, unknown>) {
	window.postMessage({ source: APP, ...message }, window.location.origin);
}

function listen(id: string, handler: (message: ExtensionMessage) => boolean): () => void {
	function onMessage(event: MessageEvent) {
		const message = event.data as ExtensionMessage | null;
		if (event.source !== window || !message || message.source !== EXTENSION || message.id !== id) {
			return;
		}
		if (handler(message)) {
			window.removeEventListener("message", onMessage);
		}
	}
	window.addEventListener("message", onMessage);
	return () => window.removeEventListener("message", onMessage);
}

function versionParts(version: string): number[] {
	return version.split(".").map((part) => Number.parseInt(part, 10) || 0);
}

export function isOlderVersion(version: string | undefined, minimum: string = MIN_EXTENSION_VERSION): boolean {
	if (!version) {
		return true;
	}
	const found = versionParts(version);
	const required = versionParts(minimum);
	for (let index = 0; index < Math.max(found.length, required.length); index++) {
		const difference = (found[index] ?? 0) - (required[index] ?? 0);
		if (difference !== 0) {
			return difference < 0;
		}
	}
	return false;
}

export type ExtensionProbe = { status: ExtensionStatus; version: string | null };

export function probeExtension(timeoutMs = PING_TIMEOUT_MS): Promise<ExtensionProbe> {
	return new Promise((resolve) => {
		const id = nextId();
		const stop = listen(id, (message) => {
			if (message.type !== "pong") {
				return false;
			}
			window.clearTimeout(timer);
			resolve({ status: isOlderVersion(message.version) ? "outdated" : "current", version: message.version ?? null });
			return true;
		});
		const timer = window.setTimeout(() => {
			stop();
			resolve({ status: "missing", version: null });
		}, timeoutMs);
		post({ type: "ping", id });
	});
}

export async function checkExtension(timeoutMs = PING_TIMEOUT_MS): Promise<ExtensionStatus> {
	return (await probeExtension(timeoutMs)).status;
}

export function captureWithExtension(options: {
	profileUrl?: string | null;
	onProgress?: (progress: CaptureProgress) => void;
}): Promise<LinkedInCaptureResponse> {
	return new Promise((resolve, reject) => {
		const id = nextId();
		const finish = (settle: () => void) => {
			window.clearTimeout(timer);
			settle();
			return true;
		};
		const stop = listen(id, (message) => {
			if (message.type === "progress" && message.step && message.total) {
				options.onProgress?.({ step: message.step, total: message.total });
				return false;
			}
			if (message.type === "result" && message.snapshot) {
				const snapshot = message.snapshot;
				return finish(() => resolve(snapshot));
			}
			if (message.type === "error") {
				return finish(() => reject(new CaptureFailedError(message.message ?? "A leitura do perfil falhou.", message.code ?? "failed")));
			}
			if (message.type === "disconnected") {
				return finish(() => reject(new CaptureFailedError("A leitura do perfil foi interrompida.", "disconnected")));
			}
			return false;
		});
		const timer = window.setTimeout(() => {
			stop();
			reject(new CaptureFailedError("A leitura do perfil demorou demais.", "timeout"));
		}, CAPTURE_TIMEOUT_MS);
		post({ type: "capture", id, profileUrl: options.profileUrl ?? null });
	});
}
