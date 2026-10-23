import { useLocation } from "react-router-dom";

export type BackState = { from?: string };

export function useBackTarget(fallback?: string): string | undefined {
	const { state } = useLocation();
	return (state as BackState | null)?.from ?? fallback;
}

export function useFromHere(): BackState {
	return { from: useLocation().pathname };
}
