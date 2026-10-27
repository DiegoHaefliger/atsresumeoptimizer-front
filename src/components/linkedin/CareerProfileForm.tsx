import { useEffect, useState, type FormEvent } from "react";
import { apiGet, apiPutJson, ApiError, errorMessage } from "../../api/client";
import type { CareerProfileResponse, ProfileTone } from "../../api/linkedinTypes";
import {
	EMPTY_CAREER_FORM,
	isSameCareerForm,
	missingCareerFields,
	PROFILE_LANGUAGE_LABELS,
	TIMEFRAME_OPTIONS,
	toCareerForm,
	toCareerRequest,
	TONE_LABELS,
	type CareerForm,
} from "../../lib/careerForm";
import { SENIORITY_OPTIONS } from "../../lib/jobLabels";
import { useUnsavedWarning } from "../../lib/useUnsavedWarning";
import { SaveBar } from "../SaveBar";
import { SettingsLayoutSkeleton } from "../Skeleton";
import { StateMessage } from "../StateMessage";
import { TagInput } from "../TagInput";

export function CareerProfileForm({ onSaved }: { onSaved: () => void }) {
	const [form, setForm] = useState<CareerForm | null>(null);
	const [stored, setStored] = useState<CareerForm>(EMPTY_CAREER_FORM);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);
	const [saving, setSaving] = useState(false);
	const dirty = form !== null && !isSameCareerForm(form, stored);

	useUnsavedWarning(dirty);

	useEffect(() => {
		apiGet<CareerProfileResponse>("/api/v1/career-profile")
			.then((profile) => {
				const loaded = toCareerForm(profile);
				setForm(loaded);
				setStored(loaded);
			})
			.catch((err) => {
				if (err instanceof ApiError && err.status === 404) {
					setForm(EMPTY_CAREER_FORM);
					return;
				}
				setLoadError(errorMessage(err, "Não deu pra carregar seu perfil de carreira."));
			});
	}, []);

	function update<K extends keyof CareerForm>(field: K, value: CareerForm[K]) {
		setForm((current) => (current ? { ...current, [field]: value } : current));
		setSaved(false);
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		if (!form) {
			return;
		}
		const missing = missingCareerFields(form);
		if (missing.length > 0) {
			setError(`Preencha: ${missing.join(" e ")}.`);
			return;
		}
		setError(null);
		setSaving(true);
		try {
			const response = await apiPutJson<CareerProfileResponse>("/api/v1/career-profile", toCareerRequest(form));
			const next = toCareerForm(response);
			setForm(next);
			setStored(next);
			setSaved(true);
			onSaved();
		} catch (err) {
			setError(errorMessage(err, "Não deu pra salvar. Tenta de novo."));
		} finally {
			setSaving(false);
		}
	}

	if (loadError) {
		return <StateMessage variant="error" layout="page" message={loadError} />;
	}
	if (!form) {
		return <SettingsLayoutSkeleton label="Carregando perfil de carreira..." asideHeight={240} />;
	}

	return (
		<form onSubmit={handleSubmit} className="settings-main">
			<section className="panel">
				<div className="panel-header">
					<h2>Onde você está e onde quer chegar</h2>
					<p>A IA mede o seu LinkedIn contra o cargo que você quer alcançar, não contra o que você faz hoje.</p>
				</div>
				<div className="panel-body form">
					<label>
						Área de atuação
						<input
							value={form.areaOfExpertise}
							onChange={(event) => update("areaOfExpertise", event.target.value)}
							placeholder="Ex.: Engenharia de software, Dados, Marketing digital"
							maxLength={150}
						/>
					</label>
					<div className="form-row">
						<label>
							Cargo atual
							<input
								value={form.currentJobTitle}
								onChange={(event) => update("currentJobTitle", event.target.value)}
								placeholder="Ex.: Desenvolvedor Java"
								maxLength={150}
							/>
						</label>
						<label>
							Senioridade atual
							<SenioritySelect value={form.currentSeniority} onChange={(value) => update("currentSeniority", value)} />
						</label>
					</div>
					<div className="form-row">
						<label>
							Próximo cargo que você quer alcançar
							<input
								value={form.targetJobTitle}
								onChange={(event) => update("targetJobTitle", event.target.value)}
								placeholder="Ex.: Tech Lead, Arquiteto de software"
								maxLength={150}
							/>
						</label>
						<label>
							Senioridade desejada
							<SenioritySelect value={form.targetSeniority} onChange={(value) => update("targetSeniority", value)} />
						</label>
					</div>
					<label>
						Em quanto tempo quer chegar lá
						<select value={form.targetTimeframe} onChange={(event) => update("targetTimeframe", event.target.value)}>
							<option value="">Não informado</option>
							{TIMEFRAME_OPTIONS.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</label>
				</div>
			</section>

			<section className="panel">
				<div className="panel-header">
					<h2>Mercado e diferenciais</h2>
					<p>Quanto mais a IA souber, mais certeiras ficam as sugestões. Tudo aqui é opcional.</p>
				</div>
				<div className="panel-body form">
					<TagInput
						label="Setores que te interessam"
						placeholder="Ex.: Fintech, Saúde, Varejo"
						values={form.targetIndustries}
						onChange={(values) => update("targetIndustries", values)}
					/>
					<TagInput
						label="Empresas-alvo"
						placeholder="Ex.: Nubank, Itaú"
						values={form.targetCompanies}
						onChange={(values) => update("targetCompanies", values)}
					/>
					<TagInput
						label="Principais pontos fortes"
						placeholder="Ex.: Arquitetura, Liderança técnica, Kafka"
						values={form.strengths}
						onChange={(values) => update("strengths", values)}
					/>
					<TagInput
						label="Idiomas"
						placeholder="Ex.: Inglês avançado"
						values={form.languages}
						onChange={(values) => update("languages", values)}
					/>
					<label>
						Localização
						<input
							value={form.location}
							onChange={(event) => update("location", event.target.value)}
							placeholder="Ex.: Curitiba, PR (aceita remoto)"
							maxLength={150}
						/>
					</label>
					<label>
						O que te diferencia
						<textarea
							value={form.differentiators}
							onChange={(event) => update("differentiators", event.target.value)}
							rows={4}
							maxLength={2000}
							placeholder="Conquistas, projetos marcantes, experiências raras. A IA só usa o que você escrever aqui e no perfil."
						/>
					</label>
				</div>
			</section>

			<section className="panel">
				<div className="panel-header">
					<h2>Como o perfil deve soar</h2>
				</div>
				<div className="panel-body form">
					<div className="form-row">
						<label>
							Tom do perfil
							<select value={form.tone} onChange={(event) => update("tone", event.target.value as ProfileTone)}>
								{(Object.keys(TONE_LABELS) as ProfileTone[]).map((tone) => (
									<option key={tone} value={tone}>
										{TONE_LABELS[tone]}
									</option>
								))}
							</select>
						</label>
						<label>
							Idioma do perfil
							<select value={form.profileLanguage} onChange={(event) => update("profileLanguage", event.target.value)}>
								{Object.entries(PROFILE_LANGUAGE_LABELS).map(([code, label]) => (
									<option key={code} value={code}>
										{label}
									</option>
								))}
							</select>
						</label>
					</div>
					<label>
						Observações pra IA
						<textarea
							value={form.notes}
							onChange={(event) => update("notes", event.target.value)}
							rows={3}
							maxLength={2000}
							placeholder="Ex.: estou em transição de carreira, não quero parecer generalista."
						/>
					</label>
				</div>
			</section>

			<SaveBar
				label="Salvar perfil de carreira"
				saveText="Salvar perfil"
				savedText="Perfil de carreira salvo."
				dirty={dirty}
				saving={saving}
				saved={saved}
				error={error}
				onDiscard={() => {
					setForm(stored);
					setError(null);
				}}
			/>
		</form>
	);
}

function SenioritySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
	return (
		<select value={value} onChange={(event) => onChange(event.target.value)}>
			<option value="">Não informado</option>
			{SENIORITY_OPTIONS.map((option) => (
				<option key={option} value={option}>
					{option}
				</option>
			))}
		</select>
	);
}
