import { useCallback, useEffect, useState } from "react";
import { apiGet } from "../api/client";
import type { CareerProfileResponse, LinkedInSnapshotResponse } from "../api/linkedinTypes";
import { AnalysisPanel } from "../components/linkedin/AnalysisPanel";
import { CareerProfileForm } from "../components/linkedin/CareerProfileForm";
import { LinkedInDataPanel } from "../components/linkedin/LinkedInDataPanel";
import { PageTabs } from "../components/PageTabs";

type Tab = "analysis" | "career" | "data";

const TABS: { value: Tab; label: string }[] = [
	{ value: "analysis", label: "Análise" },
	{ value: "career", label: "Perfil de carreira" },
	{ value: "data", label: "Dados do LinkedIn" },
];

export function LinkedInPage() {
	const [tab, setTab] = useState<Tab>("analysis");
	const [hasProfile, setHasProfile] = useState(false);
	const [hasSnapshot, setHasSnapshot] = useState(false);

	useEffect(() => {
		apiGet<CareerProfileResponse>("/api/v1/career-profile")
			.then(() => setHasProfile(true))
			.catch(() => setHasProfile(false));
		apiGet<LinkedInSnapshotResponse>("/api/v1/linkedin/snapshots/latest")
			.then(() => setHasSnapshot(true))
			.catch(() => setHasSnapshot(false));
	}, []);

	const handleSnapshot = useCallback((snapshot: LinkedInSnapshotResponse | null) => setHasSnapshot(snapshot !== null), []);

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">LinkedIn</span>
					<h1>Análise do seu perfil</h1>
					<p className="page-subtitle">
						Uma IA que age como especialista em carreira, recrutamento e LinkedIn avalia cada seção do seu perfil frente
						ao cargo que você quer alcançar e diz o que mudar.
					</p>
				</div>
			</header>
			<PageTabs label="Seções do LinkedIn" options={TABS} value={tab} onChange={setTab} />
			{tab === "analysis" && <AnalysisPanel hasProfile={hasProfile} hasSnapshot={hasSnapshot} onGoTo={setTab} />}
			{tab === "career" && <CareerProfileForm onSaved={() => setHasProfile(true)} />}
			{tab === "data" && <LinkedInDataPanel onSnapshotLoaded={handleSnapshot} />}
		</div>
	);
}
