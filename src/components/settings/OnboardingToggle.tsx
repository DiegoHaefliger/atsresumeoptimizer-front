import { setOnboardingDismissed, useOnboardingDismissed } from "../../lib/onboardingDismissed";

export function OnboardingToggle() {
	const dismissed = useOnboardingDismissed();

	if (!dismissed) {
		return null;
	}

	return (
		<p className="onboarding-toggle">
			<button type="button" className="btn-secondary btn-small" onClick={() => setOnboardingDismissed(false)}>
				Mostrar o guia de primeiros passos
			</button>
		</p>
	);
}
