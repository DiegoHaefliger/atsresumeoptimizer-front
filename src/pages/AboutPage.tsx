import { Navigate, useSearchParams } from "react-router-dom";
import { AboutLinks } from "../components/about/AboutLinks";
import { AboutReleaseNotes } from "../components/about/AboutReleaseNotes";
import { AboutVersion } from "../components/about/AboutVersion";
import { helpPath, isHelpTab } from "../lib/helpTabs";

const LEGACY_TAB_PARAM = "tab";

export function AboutPage() {
	const [searchParams] = useSearchParams();
	const legacyTab = searchParams.get(LEGACY_TAB_PARAM);
	if (legacyTab !== "support" && isHelpTab(legacyTab)) {
		const rating = searchParams.get("rating");
		return <Navigate to={`${helpPath(legacyTab)}${rating ? `&rating=${rating}` : ""}`} replace />;
	}

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Sobre</span>
					<h1>ATS Resume Optimizer</h1>
					<p className="page-subtitle">
						Analisa e adapta currículos para passar pelos filtros ATS e acompanha cada processo seletivo.
					</p>
				</div>
			</header>
			<div className="about-page">
				<AboutVersion />
				<AboutLinks />
				<section aria-labelledby="release-notes-title">
					<h2 id="release-notes-title" className="about-section-title">
						Novidades por versão
					</h2>
					<AboutReleaseNotes />
				</section>
			</div>
		</div>
	);
}
