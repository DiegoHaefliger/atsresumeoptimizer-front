import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiGet } from "../api/client";
import type { AiSettingsView, JobPreferenceResponse, RecentJobView, ResumeSummary } from "../api/types";
import { onboardingSteps, type OnboardingStep } from "./onboardingSteps";

export function useOnboarding(enabled: boolean): OnboardingStep[] | null {
	const { pathname } = useLocation();
	const [steps, setSteps] = useState<OnboardingStep[] | null>(null);

	useEffect(() => {
		if (!enabled) {
			return;
		}
		let current = true;
		Promise.all([
			apiGet<AiSettingsView>("/api/v1/ai-settings"),
			apiGet<ResumeSummary[]>("/api/v1/resumes"),
			apiGet<RecentJobView[]>("/api/v1/analyses/recent-jobs"),
			apiGet<JobPreferenceResponse>("/api/v1/job-preference"),
		])
			.then(([aiSettings, resumes, jobs, preferences]) => {
				if (current) {
					setSteps(onboardingSteps({ aiSettings, resumes, jobs, preferences }));
				}
			})
			.catch(() => undefined);
		return () => {
			current = false;
		};
	}, [enabled, pathname]);

	return enabled ? steps : null;
}
