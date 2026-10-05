import type { ReactNode } from "react";
import { SpinnerIcon } from "./icons";

export function BusyLabel({ busy, busyText, children }: { busy: boolean; busyText: string; children: ReactNode }) {
	if (!busy) {
		return <>{children}</>;
	}
	return (
		<>
			<SpinnerIcon /> {busyText}
		</>
	);
}
