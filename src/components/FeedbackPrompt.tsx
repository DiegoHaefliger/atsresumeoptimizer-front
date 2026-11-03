import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FEEDBACK_PATH_PAGE, PROMPT_DELAY_MS, ratedVersion, shouldPrompt } from "../lib/feedbackPrompt";
import { useAppVersion } from "../lib/useAppVersion";
import { StarIcon } from "./icons";

export function FeedbackPrompt() {
	const { pathname } = useLocation();
	const appVersion = useAppVersion()?.current ?? null;
	const versionRef = useRef(appVersion);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		versionRef.current = appVersion;
	}, [appVersion]);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (shouldPrompt(versionRef.current, ratedVersion(), false)) {
				setVisible(true);
			}
		}, PROMPT_DELAY_MS);
		return () => clearTimeout(timer);
	}, []);

	if (!visible || pathname === FEEDBACK_PATH_PAGE) {
		return null;
	}

	return (
		<div className="update-banner" role="status">
			<StarIcon className="update-banner-icon" />
			<p className="update-banner-text">
				<strong>Está gostando do app?</strong> Avalie em menos de um minuto e ajude a melhorá-lo.
			</p>
			<div className="update-banner-actions">
				<Link className="update-banner-download" to={FEEDBACK_PATH_PAGE} onClick={() => setVisible(false)}>
					Avaliar
				</Link>
				<button type="button" className="btn-secondary btn-small" onClick={() => setVisible(false)}>
					Agora não
				</button>
			</div>
		</div>
	);
}
