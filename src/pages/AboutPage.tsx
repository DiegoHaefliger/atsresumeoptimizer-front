import { useSearchParams } from "react-router-dom";
import { AboutDiagnosticsTab } from "../components/about/AboutDiagnosticsTab";
import { AboutFeedbackTab } from "../components/about/AboutFeedbackTab";
import { AboutLinksTab } from "../components/about/AboutLinksTab";
import { AboutVersionTab } from "../components/about/AboutVersionTab";
import { PageTabs } from "../components/PageTabs";

type AboutTab = "links" | "version" | "diagnostics" | "feedback";

const TAB_OPTIONS: { value: AboutTab; label: string }[] = [
	{ value: "links", label: "Links" },
	{ value: "version", label: "Versão" },
	{ value: "diagnostics", label: "Diagnóstico" },
	{ value: "feedback", label: "Avaliar" },
];

const TAB_PARAM = "tab";

function isAboutTab(value: string | null): value is AboutTab {
	return TAB_OPTIONS.some((option) => option.value === value);
}

export function AboutPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const requested = searchParams.get(TAB_PARAM);
	const tab: AboutTab = isAboutTab(requested) ? requested : "links";
	const setTab = (next: AboutTab) => setSearchParams({ [TAB_PARAM]: next }, { replace: true });

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
			<PageTabs label="Seções do Sobre" options={TAB_OPTIONS} value={tab} onChange={setTab} />
			{tab === "links" && <AboutLinksTab />}
			{tab === "version" && <AboutVersionTab />}
			{tab === "diagnostics" && <AboutDiagnosticsTab />}
			{tab === "feedback" && <AboutFeedbackTab />}
		</div>
	);
}
