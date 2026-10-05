import { useEffect, useState, type FormEvent } from "react";
import { apiGet, apiPutJson, errorMessage } from "../api/client";
import type { ContractType, JobPreferenceRequest, JobPreferenceResponse, WorkModel } from "../api/types";
import { ChoiceGroup } from "../components/ChoiceGroup";
import { SettingsLayoutSkeleton } from "../components/Skeleton";
import { BusyLabel } from "../components/BusyLabel";
import { StateMessage } from "../components/StateMessage";
import { BENEFIT_OPTIONS, CONTRACT_TYPE_LABELS, matchingOption, SENIORITY_OPTIONS, WORK_MODEL_LABELS } from "../lib/jobLabels";
import { formatList, parseList } from "../lib/listText";

type ListFieldName = "otherBenefits" | "locations" | "preferredCompanies" | "avoidedCompanies";

type FormState = {
	workModels: WorkModel[];
	contractTypes: ContractType[];
	minSalary: string;
	desiredSalary: string;
	seniorities: string[];
	benefits: string[];
} & Record<ListFieldName, string>;

const SENIORITY_CHOICES = toChoices(SENIORITY_OPTIONS);
const BENEFIT_CHOICES = toChoices(BENEFIT_OPTIONS);

function toChoices(options: readonly string[]): Record<string, string> {
	return Object.fromEntries(options.map((option) => [option, option]));
}

type ListFieldConfig = { name: ListFieldName; label: string; placeholder: string };

const OTHER_BENEFITS_FIELD: ListFieldConfig = {
	name: "otherBenefits",
	label: "Outros benefícios",
	placeholder: "Ex.: auxílio academia, bolsa de estudos",
};

const PLACE_FIELDS: ListFieldConfig[] = [
	{ name: "locations", label: "Cidades aceitas (vagas híbridas ou presenciais)", placeholder: "Ex.: Curitiba, São Paulo" },
	{ name: "preferredCompanies", label: "Empresas preferidas", placeholder: "Ex.: Nubank, Itaú" },
	{ name: "avoidedCompanies", label: "Empresas que você quer evitar", placeholder: "Ex.: Acme" },
];

function toForm(preference: JobPreferenceResponse): FormState {
	return {
		workModels: preference.workModels ?? [],
		contractTypes: preference.contractTypes ?? [],
		minSalary: preference.minSalary?.toString() ?? "",
		desiredSalary: preference.desiredSalary?.toString() ?? "",
		seniorities: (preference.seniorities ?? []).map((value) => matchingOption(SENIORITY_OPTIONS, value) ?? value),
		benefits: (preference.benefits ?? []).flatMap((value) => matchingOption(BENEFIT_OPTIONS, value) ?? []),
		otherBenefits: formatList((preference.benefits ?? []).filter((value) => !matchingOption(BENEFIT_OPTIONS, value))),
		locations: formatList(preference.locations),
		preferredCompanies: formatList(preference.preferredCompanies),
		avoidedCompanies: formatList(preference.avoidedCompanies),
	};
}

function toRequest(form: FormState): JobPreferenceRequest {
	return {
		workModels: form.workModels,
		contractTypes: form.contractTypes,
		minSalary: form.minSalary ? Number(form.minSalary) : undefined,
		desiredSalary: form.desiredSalary ? Number(form.desiredSalary) : undefined,
		benefits: [...form.benefits, ...parseList(form.otherBenefits)],
		seniorities: form.seniorities,
		locations: parseList(form.locations),
		preferredCompanies: parseList(form.preferredCompanies),
		avoidedCompanies: parseList(form.avoidedCompanies),
	};
}

export function PreferencesPage() {
	const [form, setForm] = useState<FormState | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		apiGet<JobPreferenceResponse>("/api/v1/job-preference")
			.then((preference) => setForm(toForm(preference)))
			.catch((err) => setLoadError(errorMessage(err, "Não deu pra carregar suas preferências.")));
	}, []);

	function update<K extends keyof FormState>(field: K, value: FormState[K]) {
		setForm((current) => (current ? { ...current, [field]: value } : current));
		setSaved(false);
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		if (!form) {
			return;
		}
		setError(null);
		setSaving(true);
		try {
			const stored = await apiPutJson<JobPreferenceResponse>("/api/v1/job-preference", toRequest(form));
			setForm(toForm(stored));
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
				<StateMessage variant="error" layout="page" message={loadError} action={{ label: "Voltar", to: "/upload" }} />
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
						<section className="panel">
							<div className="panel-header">
								<h2>Formato da vaga</h2>
								<p>Como e em que nível você quer trabalhar. Pode marcar mais de uma opção.</p>
							</div>
							<div className="panel-body">
								<ChoiceGroup
									legend="Modelos de trabalho aceitos"
									options={WORK_MODEL_LABELS}
									selected={form.workModels}
									onChange={(value) => update("workModels", value)}
								/>
								<ChoiceGroup
									legend="Tipos de contrato aceitos"
									options={CONTRACT_TYPE_LABELS}
									selected={form.contractTypes}
									onChange={(value) => update("contractTypes", value)}
								/>
								<ChoiceGroup
									legend="Senioridade"
									options={SENIORITY_CHOICES}
									selected={form.seniorities}
									onChange={(value) => update("seniorities", value)}
								/>
							</div>
						</section>

						<section className="panel">
							<div className="panel-header">
								<h2>Remuneração</h2>
								<p>Valor mensal bruto. A vaga que paga o desejado atende; entre o mínimo e o desejado, atende em parte.</p>
							</div>
							<div className="panel-body">
								<div className="form-row">
									<label>
										Salário mínimo mensal (R$)
										<input
											type="number"
											inputMode="numeric"
											min={0}
											step={100}
											value={form.minSalary}
											onChange={(event) => update("minSalary", event.target.value)}
											placeholder="Ex.: 8000"
										/>
									</label>
									<label>
										Salário desejado mensal (R$)
										<input
											type="number"
											inputMode="numeric"
											min={0}
											step={100}
											value={form.desiredSalary}
											onChange={(event) => update("desiredSalary", event.target.value)}
											placeholder="Ex.: 10000"
										/>
									</label>
								</div>
							</div>
						</section>

						<section className="panel">
							<div className="panel-header">
								<h2>Benefícios</h2>
								<p>Procuramos cada benefício na lista extraída da vaga e no texto dela.</p>
							</div>
							<div className="panel-body">
								<ChoiceGroup
									legend="Benefícios que você quer"
									options={BENEFIT_CHOICES}
									selected={form.benefits}
									onChange={(value) => update("benefits", value)}
								/>
								<ListField field={OTHER_BENEFITS_FIELD} value={form.otherBenefits} onChange={update} />
							</div>
						</section>

						<section className="panel">
							<div className="panel-header">
								<h2>Local e empresas</h2>
								<p>A cidade só conta pra vagas híbridas ou presenciais.</p>
							</div>
							<div className="panel-body">
								{PLACE_FIELDS.map((field) => (
									<ListField key={field.name} field={field} value={form[field.name]} onChange={update} />
								))}
							</div>
						</section>
					</div>

					<aside className="settings-aside">
						<div className="panel">
							<div className="panel-header">
								<h2>Critérios da nota</h2>
								<p>Só os critérios preenchidos entram no cálculo.</p>
							</div>
							<div className="panel-body">
								<ul className="criteria-summary">
									{criteriaSummary(form).map((criterion) => (
										<li key={criterion.label}>
											<span>{criterion.label}</span>
											<span
												className={`criteria-summary-state${criterion.active ? " criteria-summary-state-active" : ""}`}
											>
												{criterion.active ? "Na nota" : "Fora da nota"}
											</span>
										</li>
									))}
								</ul>
								<div className="settings-actions">
									{error && <StateMessage variant="error" layout="inline" message={error} />}
									{saved && (
										<p className="form-success" role="status">
											Preferências salvas.
										</p>
									)}
									<button type="submit" disabled={saving} className="btn-block" aria-busy={saving}>
										<BusyLabel busy={saving} busyText="Salvando...">Salvar preferências</BusyLabel>
									</button>
								</div>
							</div>
						</div>
					</aside>
				</form>
			)}
		</div>
	);
}

type ListFieldProps = {
	field: ListFieldConfig;
	value: string;
	onChange: (name: ListFieldName, value: string) => void;
};

function ListField({ field, value, onChange }: ListFieldProps) {
	return (
		<label>
			{field.label}
			<input value={value} onChange={(event) => onChange(field.name, event.target.value)} placeholder={field.placeholder} />
			<span className="field-hint">Separe por vírgula</span>
		</label>
	);
}

function criteriaSummary(form: FormState): { label: string; active: boolean }[] {
	return [
		{ label: "Modelo de trabalho", active: form.workModels.length > 0 },
		{ label: "Remuneração", active: Boolean(form.minSalary || form.desiredSalary) },
		{ label: "Tipo de contrato", active: form.contractTypes.length > 0 },
		{ label: "Benefícios", active: form.benefits.length > 0 || parseList(form.otherBenefits).length > 0 },
		{
			label: "Empresa",
			active: parseList(form.preferredCompanies).length > 0 || parseList(form.avoidedCompanies).length > 0,
		},
		{ label: "Senioridade", active: form.seniorities.length > 0 },
		{ label: "Localização", active: parseList(form.locations).length > 0 },
	];
}
