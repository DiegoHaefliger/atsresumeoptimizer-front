import { useState } from "react";
import { AboutLinksTab } from "../components/about/AboutLinksTab";
import { AboutVersionTab } from "../components/about/AboutVersionTab";
import { PageTabs } from "../components/PageTabs";

type AboutTab = "version" | "links";

const TAB_OPTIONS: { value: AboutTab; label: string }[] = [
	{ value: "version", label: "Versão" },
	{ value: "links", label: "Links" },
];

export function AboutPage() {
	const [tab, setTab] = useState<AboutTab>("version");

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
			{tab === "version" ? <AboutVersionTab /> : <AboutLinksTab />}
		</div>
	);
}
