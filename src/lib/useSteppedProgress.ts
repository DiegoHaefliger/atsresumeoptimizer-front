import { useEffect, useRef, useState } from "react";

export function useSteppedProgress(
	targetIndex: number,
	minStepMs: number,
	onStep?: (shownIndex: number) => void,
): number {
	const [shownIndex, setShownIndex] = useState(0);
	const onStepRef = useRef(onStep);

	useEffect(() => {
		onStepRef.current = onStep;
	});

	useEffect(() => {
		if (shownIndex >= targetIndex) {
			return;
		}
		const timer = setTimeout(() => {
			setShownIndex(shownIndex + 1);
			onStepRef.current?.(shownIndex + 1);
		}, minStepMs);
		return () => clearTimeout(timer);
	}, [shownIndex, targetIndex, minStepMs]);

	return Math.min(shownIndex, targetIndex);
}
