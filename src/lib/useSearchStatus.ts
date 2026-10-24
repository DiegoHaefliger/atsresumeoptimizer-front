import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, apiGet, apiPostJson } from "../api/client";
import type { SearchStatus } from "../api/types";

const STATUS_PATH = "/api/v1/job-search";
const POLL_MS = 3000;
const CONFLICT = 409;

export function useSearchStatus(onFinished: () => void) {
	const [status, setStatus] = useState<SearchStatus | null>(null);
	const wasRunning = useRef(false);
	const finished = useRef(onFinished);

	useEffect(() => {
		finished.current = onFinished;
	});

	const load = useCallback(() => {
		apiGet<SearchStatus>(`${STATUS_PATH}/status`)
			.then((loaded) => {
				if (wasRunning.current && !loaded.running) {
					finished.current();
				}
				wasRunning.current = Boolean(loaded.running);
				setStatus(loaded);
			})
			.catch(() => undefined);
	}, []);

	useEffect(load, [load]);

	useEffect(() => {
		if (!status?.running) {
			return;
		}
		const timer = window.setInterval(load, POLL_MS);
		return () => window.clearInterval(timer);
	}, [status?.running, load]);

	const [starting, setStarting] = useState(false);

	const start = useCallback(async () => {
		setStarting(true);
		try {
			await apiPostJson<void>(`${STATUS_PATH}/run`, {});
		} catch (err) {
			const alreadyRunning =
				err instanceof ApiError && err.status === CONFLICT && (await apiGet<SearchStatus>(`${STATUS_PATH}/status`)).running;
			if (!alreadyRunning) {
				throw err;
			}
		} finally {
			setStarting(false);
		}
		wasRunning.current = true;
		setStatus((current) => ({ ...current, running: true }));
	}, []);

	return { status, start, busy: starting || Boolean(status?.running) };
}
