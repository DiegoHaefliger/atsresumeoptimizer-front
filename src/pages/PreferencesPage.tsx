import { useEffect, useState, type FormEvent } from "react";
import { apiGet, apiPutJson, errorMessage } from "../api/client";
import type { JobPreferenceResponse } from "../api/types";
import { PageTabs } from "../components/PageTabs";
import { SearchSection } from "../components/preferences/SearchSection";
import { SaveBar } from "../components/SaveBar";
import { BenefitsSection } from "../components/preferences/BenefitsSection";
import { CriteriaSummary } from "../components/preferences/CriteriaSummary";
import { FormatSection } from "../components/preferences/FormatSection";
import { PaySection } from "../components/preferences/PaySection";
import { PlacesSection } from "../components/preferences/PlacesSection";
import { SettingsLayoutSkeleton } from "../components/Skeleton";
import { StateMessage } from "../components/StateMessage";
import {
	addBenefit,
	isSameForm,
	searchMaxResultsValue,
	SECTION_TITLES,
	toForm,
	toRequest,
	type PreferenceForm,
	type PreferenceSection,
} from "../lib/preferenceForm";
import { useUnsavedWarning } from "../lib/useUnsavedWarning";

const SECTIONS = Object.keys(SECTION_TITLES) as PreferenceSection[];

export function PreferencesPage() {
	const [form, setForm] = useState<PreferenceForm | null>(null);
	const [stored, setStored] = useState<PreferenceForm | null>(null);
	const [section, setSection] = useState<PreferenceSection>("format");
	const [loadError, setLoadError] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);
	const [saving, setSaving] = useState(false);
	const dirty = form !== null && stored !== null && !isSameForm(form, stored);

	useUnsavedWarning(dirty);

	useEffect(() => {
		apiGet<JobPreferenceResponse>("/api/v1/job-preference")
			.then((preference) => {
				const loaded = toForm(preference);
				setForm(loaded);
				setStored(loaded);
			})
			.catch((err) => setLoadError(errorMessage(err, "Não deu pra carregar suas preferências.")));
	}, []);

	function update<K extends keyof PreferenceForm>(field: K, value: PreferenceForm[K]) {
		setForm((current) => (current ? { ...current, [field]: value } : current));
		setSaved(false);
	}

	function handleAddBenefit(value: string) {
		setForm((current) => (current ? addBenefit(current, value) : current));
		setSaved(false);
	}

	function handleDiscard() {
		setForm(stored);
		setError(null);
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		if (!form) {
			return;
		}
		if (searchMaxResultsValue(form) === null) {
			setError("Informe um máximo de vagas por busca entre 1 e 100.");
			return;
		}
		setError(null);
		setSaving(true);
		try {
			const response = await apiPutJson<JobPreferenceResponse>("/api/v1/job-preference", toRequest(form));
			const next = toForm(response);
			setForm(next);
			setStored(next);
			setSaved(true);
		} catch (err) {
			setError(errorMessage(err, "Não deu pra salvar. Tenta de novo."));
		} finally {
			setSaving(false);
		}
	}

	if (loadError) {
		return (
			<div className="page">
				<StateMessage variant="error" layout="page" message={loadError} action={{ label: "Voltar", to: "/jobs" }} />
			</div>
		);
	}

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Preferências</span>
					<h1>O que você espera de uma vaga</h1>
					<p className="page-subtitle">
						Usamos isso pra dar uma nota de aderência a cada vaga analisada. Deixe em branco o que não importa pra
						você: critério em branco não entra na nota.
					</p>
				</div>
			</header>

			{!form ? (
				<SettingsLayoutSkeleton label="Carregando preferências..." asideHeight={320} />
			) : (
				<form onSubmit={handleSubmit} className="settings-layout">
					<div className="settings-main">
						<PageTabs
							label="Seções de preferências"
							options={SECTIONS.map((value) => ({ value, label: SECTION_TITLES[value] }))}
							value={section}
							onChange={setSection}
						/>
						{section === "format" && <FormatSection form={form} onChange={update} />}
						{section === "pay" && <PaySection form={form} onChange={update} />}
						{section === "benefits" && (
							<BenefitsSection form={form} onChange={update} onAddBenefit={handleAddBenefit} />
						)}
						{section === "places" && <PlacesSection form={form} onChange={update} />}
						{section === "search" && <SearchSection form={form} onChange={update} />}
						<SaveBar
							label="Salvar preferências"
							saveText="Salvar preferências"
							savedText="Preferências salvas."
							dirty={dirty} saving={saving} saved={saved}
							error={error}
							onDiscard={handleDiscard}
						/>
					</div>

					<aside className="settings-aside">
						<CriteriaSummary form={form} onSelect={setSection} />
					</aside>
				</form>
			)}
		</div>
	);
}
