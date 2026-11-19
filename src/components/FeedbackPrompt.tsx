import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
	FEEDBACK_PATH_PAGE,
	PROMPT_DELAY_MS,
	readPromptState,
	shouldPrompt,
	snoozePrompt,
	VALUE_EVENT,
} from "../lib/feedbackPrompt";
import { useAppVersion } from "../lib/useAppVersion";
import { StarIcon } from "./icons";
import { StarRating } from "./StarRating";

export function FeedbackPrompt() {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const appVersion = useAppVersion()?.current ?? null;
	const versionRef = useRef(appVersion);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		versionRef.current = appVersion;
	}, [appVersion]);

	useEffect(() => {
		let timer: number | undefined;
		function onValue() {
			window.clearTimeout(timer);
			timer = window.setTimeout(() => {
				if (shouldPrompt(readPromptState(versionRef.current))) {
					setVisible(true);
				}
			}, PROMPT_DELAY_MS);
		}
		window.addEventListener(VALUE_EVENT, onValue);
		return () => {
			window.removeEventListener(VALUE_EVENT, onValue);
			window.clearTimeout(timer);
		};
	}, []);

	if (!visible || pathname === FEEDBACK_PATH_PAGE) {
		return null;
	}

	function dismiss() {
		snoozePrompt();
		setVisible(false);
	}

	function rate(rating: number) {
		setVisible(false);
		navigate(`${FEEDBACK_PATH_PAGE}?rating=${rating}`);
	}

	return (
		<div className="update-banner" role="status">
			<StarIcon className="update-banner-icon" />
			<p className="update-banner-text">
				<strong>Gostou do resultado?</strong> Dê uma nota, conte como foi ou envie um print do que pode melhorar. Leva menos de um minuto.
			</p>
			<div className="update-banner-actions">
				<StarRating value={0} onChange={rate} />
				<button type="button" className="btn-secondary btn-small" onClick={dismiss}>
					Agora não
				</button>
			</div>
		</div>
	);
}
