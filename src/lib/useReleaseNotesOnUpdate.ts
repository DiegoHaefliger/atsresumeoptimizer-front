import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { lastSeenVersion, markVersionSeen } from "./lastSeenVersion";
import { useAppVersion } from "./useAppVersion";

export const RELEASE_NOTES_PATH = "/about";

export function useReleaseNotesOnUpdate() {
	const current = useAppVersion()?.current;
	const navigate = useNavigate();

	useEffect(() => {
		if (!current || current === lastSeenVersion()) {
			return;
		}
		markVersionSeen(current);
		navigate(RELEASE_NOTES_PATH, { replace: true });
	}, [current, navigate]);
}
