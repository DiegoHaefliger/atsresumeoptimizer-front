import { ApiError } from "../api/client";
import { sendClientError } from "./diagnosticsApi";
import { recordRecentError } from "./recentErrors";

const MAX_MESSAGE = 2000;
const MAX_STACK = 20000;
const RATE_WINDOW_MS = 60_000;
const MAX_REPORTS_PER_WINDOW = 10;
const IGNORED_MESSAGES = [/ResizeObserver loop/, /^Script error\.?$/];

let recentSends: number[] = [];
let lastMessage: string | null = null;

function describe(error: unknown): { message: string; stack: string | null } {
	if (error instanceof Error) {
		return { message: `${error.name}: ${error.message}`, stack: error.stack ?? null };
	}
	return { message: String(error), stack: null };
}

function allowed(message: string): boolean {
	const now = Date.now();
	recentSends = recentSends.filter((sentAt) => now - sentAt < RATE_WINDOW_MS);
	if (message === lastMessage || recentSends.length >= MAX_REPORTS_PER_WINDOW) {
		return false;
	}
	recentSends.push(now);
	lastMessage = message;
	return true;
}

export async function reportClientError(error: unknown, componentStack?: string | null): Promise<string | null> {
	const { message, stack } = describe(error);
	const page = window.location.pathname;
	if (IGNORED_MESSAGES.some((pattern) => pattern.test(message)) || !allowed(message)) {
		return null;
	}
	let errorId: string | null = null;
	try {
		({ errorId } = await sendClientError({
			message: message.slice(0, MAX_MESSAGE),
			stack: stack?.slice(0, MAX_STACK) ?? null,
			componentStack: componentStack?.slice(0, MAX_STACK) ?? null,
			page,
		}));
	} catch {
		errorId = null;
	}
	recordRecentError({ message, errorId, page, source: "screen" });
	return errorId;
}

function isExpectedRejection(reason: unknown): boolean {
	return reason instanceof ApiError || (reason instanceof DOMException && reason.name === "AbortError");
}

export function installGlobalErrorReporting(): void {
	window.addEventListener("error", (event) => {
		void reportClientError(event.error ?? event.message);
	});
	window.addEventListener("unhandledrejection", (event) => {
		if (!isExpectedRejection(event.reason)) {
			void reportClientError(event.reason);
		}
	});
}
